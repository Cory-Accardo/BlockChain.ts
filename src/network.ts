import Heap from 'heap';
import axios from 'axios';
import fs from 'fs'
import { Block, BlockChain } from './blockchain'
import { validateIP , validateJson } from './util';
import { INTRA, INTER } from './routes/__ROUTE__DEF__';
import { NODE_DB, CONSENSUS_CACHE } from './__DATABASE__';

export class Network {

    /**
     * This is a public static method that reads the current node list and returns a promise for a set of strings.
     * @returns Promise for a set of strings that contain node addresses
     * @example Network.readNodeList
     **/

    public static readNodeList(){
        const nodeSet = new Set<string>();
        return new Promise <Set<string>> ( (resolve, reject) =>{
            NODE_DB.createReadStream()
            .on('data', ({ key } ) => nodeSet.add(key))
            .on('error', () => reject(false))
            .on('end', () => resolve(nodeSet))
        })
    }

    public static readConsensusCache(){
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

    public static writeConsensusCache(networkAddress : string, ledger : Array<Block>){
        return new Promise<number>( (resolve, reject) =>{
            CONSENSUS_CACHE.hset("consensus", networkAddress, JSON.stringify(ledger), (err, reply) =>{
                if(err) reject(err);
                resolve(reply);
            })
        })
    }


    /**
     * This will append the network node list with the following network address and port.
     * @returns Promise
     * @throws If the address is improperly formatted, it will throw a SyntaxError
     * @param nodeAddress a properly formatted node address.
     * @example appendNodeList("127.0.0.1:80");
     **/

    public static appendNodeList(nodeAddress : string) : Promise<any> {
        validateIP(nodeAddress);
        return NODE_DB.put(nodeAddress, true);
    }

    /**
     * This will return a Promise to delete the node with the following network address and port.
     * @throws If the address is imporperly formatted, it will throw a SyntaxError
     * @param nodeAddress{(string)} A string with an ip and port
     * @example deleteNodeList("127.0.0.1:80");
     **/

    public static deleteNodeList(nodeAddress : string) : Promise<unknown>{
        validateIP(nodeAddress);
        return NODE_DB.del('nodeAddress');
    }

    /**
     * This asks for this node to communicate with the network and aquire a consnsesus on the true
     * ledger. It does this by returning a ledger with the following two traits:
     * 1. It is the longest ledger (hence the use of a maxHeap)
     * 2. The ledger is valid
     **/

    public static getConsensus(){

        return new Promise<Array<Block>>( (resolve, reject) => {Network.readConsensusCache().then( (ledgerPool) => {
            if(!ledgerPool) return null;
            while( !ledgerPool.empty() ){
                const ledger : Array<Block> = ledgerPool.top();
                if (BlockChain.verify(ledger)){
                    console.log("Network has come to a consensus!");
                    resolve(ledger);
                }
                ledgerPool.pop();
            }
            console.log("Network was not able to reach a consensus...")
            reject(null);
        })
    })
    
    }

    
    /**
     * Scans the consensus ledger and totals the amount of currency the given user has
     * @param user {(string)}) The user to check the wallet of
     **/

    public getWalletAmount(user : string){
        // if(this.consensus == null) return 0;
        // return this.consensus.getWalletAmount(user);
    }



    /**
     * propogates the intranet with a get request to the given url and alerts peers if
     * node server was functional. Also dynamically handles data returns
     * @param route {(string)}) The route that will propogated
     **/

    public propogateGet(route : string){
        Network.readNodeList().then( (nodeSet : Set<string> ) => {
            nodeSet.forEach( (nodeAddress) =>{
                axios.get('http://' + nodeAddress + route).then((res)=> {
                    console.log("GET: " + nodeAddress + route);
                    Network.propogatePost('/intranet' + INTRA.ADD_NODE, {nodeAddress: nodeAddress} ) //If this node properly responds, alert network peers.
                }).catch((e)=> console.log(e.message));
            })
        })
    }




    /**
     * propogates the network with a post request to the given url and data
     * @param route {(string)}) The route that will propogated
     * @param data {(Object)} An object that follows JSON format. This is essential for body parser to work.
     * @example this.propogatePost( '/intranet + INTRA.ADD_NODE, {nodeAddress: "127.0.0.1:200"} )
     **/

    public static propogatePost(route : string, data : Object){
        validateJson(data);
        Network.readNodeList().then( (nodeSet : Set<string> )=>{
            nodeSet.forEach( (nodeAddress) =>{
                axios.post('http://' + nodeAddress + route, data).then(()=> {
                    console.log("POST: " + nodeAddress + route);
                }).catch((e)=>console.log(e.message));
            });
        })
    }

    /**
     * Manages potential side effects of function calls based on the route that was called
     * @param route {(string)}) The route that was called
     * @param data {(Object)} an object whose data specifications will typically be interfaces.
     **/

    private static propogationSideEffect(route : string, data : any){


    }
    

}
