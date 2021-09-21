import { Ledger } from './blockchain';
import Heap from 'heap';
import axios from 'axios';
import fs from 'fs'
import { validateIP } from './util';
import { NodeAddress } from './interfaces';
import { INTRA, INTER } from './routes/__ROUTE__DEF__';

export class Network {

    private nodesAsciiDelim = '»';

    /** This is a set of JSON strings that reprsent various network nodes
     * For those curious, this was done because javaScript sets are by default
     * shallow sets, and implementing a deepSet would create enormous performance costs.
     * Considering that these network node gossips could be happening constantly I
     * believe that the loss of simplicity is worth it.
     **/
    public nodeSet : Set<string>
    /** This contains the URI to the list of available nodes on the network**/
    private nodeListURI : string;
    /** This ledger reprsents this networks derived consensus **/
    private consensus : Ledger | null;
    /** This represents the pool of ledgers from the network **/
    public ledgerPool : Heap <Ledger>;

    constructor(nodeListURI : string = __dirname + '.network'){
        this.nodeListURI = nodeListURI;
        this.nodeSet = new Set<string>();
        this.readNodeList();
        this.consensus = this.getConsensus;
        this.ledgerPool = new Heap <Ledger> ( (a : Ledger, b : Ledger) =>  b.length - a.length )
    }

    private readNodeList(){
        fs.readFileSync(this.nodeListURI, {encoding: 'utf-8', flag: 'a+'})
            .split(this.nodesAsciiDelim)
            .slice(0, -1)
            .forEach( (str) => {
                const [address , port] = str.split(':');
                this.nodeSet.add( JSON.stringify({address: address, port: Number.parseInt(port)}) );
            })
    }

    /**
     * This is a address creation static helper function to help you make node addresses
     * that are guranteed to be valid for network use.
     * @throws If the address is imporperly formatted, it will throw a SyntaxError
     * @param address{(string)} The ip address of the new node on the network.
     * @param port {(number)} The port of the server
     * @example Network.makeNodeAddress('70.184.64.15, 80');
     **/

    public static makeNodeAddress(address : string, port : number){
        validateIP(address, port);
        return {address: address, port: port};
    }

    /**
     * This will append the network node list with the following network address and port.
     * Will do nothing if the network already exists.
     * @throws If the address is imporperly formatted, it will throw a SyntaxError
     * @param nodeAddress{(NodeAddress)} A valid nodeAddress object
     * @example appendNodeList(nodeAddress : NodeAddress);
     **/

    public appendNodeList(nodeAddress : NodeAddress){
        this.readNodeList();
        if(this.nodeSet.has(JSON.stringify(nodeAddress))) return; // If it is already within the set, no need to add it
        const { address, port } = nodeAddress;
        validateIP(address, port);
        fs.writeFileSync(this.nodeListURI, address + ":" + port + this.nodesAsciiDelim, {flag: 'a+'});
    }

    /**
     * This will delete the network node list with the following network address and port.
     * @throws If the address is imporperly formatted, it will throw a SyntaxError
     * @param nodeAddress{(NodeAddress)} A valid nodeAddress object
     * @example deleteNodeList(nodeAddress : NodeAddress);
     **/

    public deleteNodeList(nodeAddress : NodeAddress){
        const { address, port } = nodeAddress;
        validateIP(address, port);
        const file = fs.readFileSync(this.nodeListURI, 'utf-8');
        fs.writeFileSync(this.nodeListURI, file.replace(address + ":" + port + this.nodesAsciiDelim, ''));
    }

    /**
     * This asks for this node to communicate with the network and aquire a consnsesus on the true
     * ledger. It does this by returning a ledger with the following two traits:
     * 1. It is the longest ledger (hence the use of a maxHeap)
     * 2. The ledger is valid
     **/

    public get getConsensus(){
        if(!this.ledgerPool) return null;
        while( !this.ledgerPool.empty() ){
            const ledger : Ledger = this.ledgerPool.top();
            if (Ledger.verify(ledger)){
                return ledger;
            }
            this.ledgerPool.pop();
        }
        return null;
    }

    
    /**
     * Scans the consensus ledger and totals the amount of currency the given user has
     * @param user {(string)}) The user to check the wallet of
     **/

    public getWalletAmount(user : string){
        if(this.consensus == null) return 0;
        return this.consensus.getWalletAmount(user);
    }



    /**
     * propogates the intranet with a get request to the given url and alerts peers if
     * node server was functional. Also dynamically handles data returns
     * @param route {(string)}) The route that will propogated
     **/

    public propogateGet(route : string){
        this.nodeSet.forEach( (nodeAddress) =>{
            const { address, port } = JSON.parse(nodeAddress);
            axios.get('http://' + address + ":" + port + route).then((res)=> {
                this.propogationSideEffect(route, res.data);
                this.propogatePost('/intranet' + INTRA.ADD_NODE, JSON.parse(nodeAddress)) //If this node properly responds, alert network peers.
            }).catch((e)=> {
                console.log(e.message)
                console.log(address + ":" + port + route);
            });
        })
    }


    /**
     * propogates the network with a post request to the given url and data
     * @param route {(string)}) The route that will propogated
     * @param data {(Object)} an object whose data specifications will typically be interfaces.
     **/

    public propogatePost(route : string, data : any){
        this.nodeSet.forEach( (nodeAddress, index) =>{
            const { address, port } = JSON.parse(nodeAddress);
            axios.post('http://' + address + ":" + port + route, data).then(()=> {
                console.log("Successfuly posted");
            }).catch((e)=>console.log(e.message));
        });
    }

    /**
     * Manages potential side effects of function calls based on the route that was called
     * @param route {(string)}) The route that was called
     * @param data {(Object)} an object whose data specifications will typically be interfaces.
     **/

    private propogationSideEffect(route : string, data : any){
        if(route.includes(INTRA.LEDGER)){ //Then we received a Ledger object, which we must add to the ledger pool
            const ledger : Ledger = data;
            this.ledgerPool.push(ledger);
        }
    }
    

}
