import Heap from 'heap';
import axios, { AxiosRequestConfig, AxiosResponse, Method } from 'axios';
import { Block, BlockChain } from '../api/blockchain'
import { validateIP } from '../api/util';
import { NODE_DB, CONSENSUS_CACHE } from '../database/__DATABASE__';
import { INTRA, INTER } from './__ROUTE__DEF__';
import { debug } from 'console';
import { NetworkRequest } from '../api/interfaces';

export class Network {


     /**
     * This is a public static method that reads the Redis consensus cache and
     * uses a MaxHeap to sort the ledger from best to worst. Does NOT check if ledgers are valid, merely
     * virtualizes them in a heap.
     * @returns Promise for a MaxHeap of Ledgers
     **/

    public static readConsensusCache(){
        debug("Reading Consensus Cache...");
        const ledgerPool = new Heap <Array<Block>> ( (a : Array<Block>, b : Array<Block>) =>  b.length - a.length );
        return new Promise<Heap<Array<Block>>>( (resolve, reject) => {
            CONSENSUS_CACHE.hvals("consensus", (err, data) =>{
            if(data){
                data.forEach(ledger => ledgerPool.push(JSON.parse(ledger)))
                resolve(ledgerPool);
            }
            if(err) reject(err);
        })
    })
    }

    /**
     * This is a public static method that writes to the Redis Consensus cache and returns a promise
     * that the write was complete and there were no errors.
     * @returns A boolean true if the data was written successfully.
     **/

    public static writeConsensusCache(networkAddress : string, ledger : Array<Block>){
        debug("Writing to Consensus Cache...");
        return new Promise<boolean>( (resolve, reject) =>{
            CONSENSUS_CACHE.hset("consensus", networkAddress, JSON.stringify(ledger), (err, reply) =>{
                if(err) reject(err);
                else resolve(true);
            })
        })
    }


    /**
     * This is a public static method that reads the current node list and returns a promise for a set of strings.
     * @returns Promise for a set of strings that contain node addresses
     **/

     public static readNodeList(){
        debug("Reading node list...");
        const nodeSet = new Set<string>();
        return new Promise <Set<string>> ( (resolve, reject) =>{
            NODE_DB.createReadStream()
            .on('data', ({ key } ) => nodeSet.add(key))
            .on('error', () => reject(false))
            .on('end', () => resolve(nodeSet))
        })
    }


    /**
     * This will append the network node list with the following network address and port.
     * @returns Promise
     * @throws If the address is improperly formatted, it will throw a SyntaxError
     * @param nodeAddress a properly formatted node address.
     * @example appendNode("127.0.0.1:80");
     **/

    public static appendNode(nodeAddress : string) : Promise<any> {
        debug("Appending node...");
        validateIP(nodeAddress);
        return NODE_DB.put(nodeAddress, true);
    }

    /**
     * This will return a Promise to delete the node with the following network address and port.
     * @throws If the address is imporperly formatted, it will throw a SyntaxError
     * @param nodeAddress{(string)} A string with an ip and port
     * @example deleteNode("127.0.0.1:80");
     **/

    public static deleteNode(nodeAddress : string) : Promise<unknown>{
        debug("Deleting node...")
        validateIP(nodeAddress);
        return NODE_DB.del('nodeAddress');
    }


    /**
     * Asks the network to respond with ledgers, so that the consensusCache can be updated.
     * @returns A promise (boolean) for the consensus cache to be completely updated with the 
     * entire network's collection of ledgers
     **/

    private static formConsensus() {
        debug("Network forming consensus...");
        return new Promise<boolean> ( async (resolve, reject) =>{
            const config : NetworkRequest = {route: INTRA.GET_LEDGER, method: 'get'}
            const resMap : Map<string, AxiosResponse>  = await Network.request(config);
            if(resMap.size == 0) reject("Received zero valid ledger responses");
             // @ts-ignore
            for(const [ nodeAddress, response ] of resMap){
                const { ledger } = response.data;
                await Network.writeConsensusCache(nodeAddress, ledger);
                resMap.delete(nodeAddress);
                if(resMap.size == 0) resolve(true); //indicates every node has been written into the ledger
            }
        })
    }

    /**
     * This asks for this node to pull from the consensus cache and form a single consensus ledger.
     * It does this by returning a ledger with the following two traits:
     * 1. It is the longest ledger (hence the use of a maxHeap)
     * 2. The ledger is valid
     * @returns a Promise for the best ledger, a Block[], currently in the Network Cache 
     **/

    public static getConsensus(){
        debug("Pulling from Consensus Cache...")
        return new Promise<Array<Block>>( (resolve, reject) => {Network.readConsensusCache().then( (ledgerPool) => {
            if(!ledgerPool) reject("No ledgers were read from cache")
            while( !ledgerPool.empty() ){
                const ledger : Array<Block> = ledgerPool.top();
                if (BlockChain.verify(ledger)){
                    debug("Network has come to a consensus...");
                    resolve(ledger);
                }
                ledgerPool.pop();
            }
            debug("Network was not able to reach a consensus...")
            reject("Network was unable to find a valid ledger");
        })
    })}
    
    
    /**
     * Asks the network to promise to synchronzie the current node with the consensus of the network.
     * @returns A promise to ask the network for an update from all nodes, discern the best ledger, and write the consensus
     * to this node's ledger
     **/

    public static async synchronizeNode(){
        debug("Synchronizing Node...");
        await Network.formConsensus();
        return await BlockChain.replaceLedger(await Network.getConsensus());
    }



    /**
     * propogates the intranet with a request to the given url with the given method and data
     * will NOT return an error if no responses are found. That logic is left to the implementation.
     * @returns A promise (Map<string, AxiosResponse>) for a complete map of responses from the entire network. The key is the origin node and value is an Axios response.
     * @param config {(AxiosRequestConfig)}) The axios request configuration that will be propogated to every node.
     * 
     **/

    public static request  = async ( { route, method, data } : NetworkRequest) =>{
        debug("Sending a propogated request throughout network intranet...");
        const resMap = new  Map< string , AxiosResponse>(); //A map with a the origin node as the key and the response as the value.
        const nodeSet : Set<string> = await Network.readNodeList(); //A set of node addresses, as stored on the local node database 
        return new Promise<Map<string, AxiosResponse>> ( (resolve ) => {
            nodeSet.forEach( async (nodeAddress) =>{
                const config : AxiosRequestConfig = { method: method, url: `http://${nodeAddress}${route}`, data: data}
                try{resMap.set(nodeAddress, await axios.request(config)); debug(`SUCCESSFUL REQUEST: http://${nodeAddress}${route} `);} catch(e){debug(`FAILED REQUEST: http://${nodeAddress}${route} `);}
                nodeSet.delete(nodeAddress);
                if(nodeSet.size == 0) resolve(resMap); //inidcates every node has been called.
            })
        })
    }


    

}
