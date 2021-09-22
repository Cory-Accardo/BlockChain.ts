import { Ledger } from './blockchain';
import Heap from 'heap';
import axios from 'axios';
import fs from 'fs'
import { validateIP , validateJson } from './util';
import { INTRA, INTER } from './routes/__ROUTE__DEF__';

export class Network {

    private nodesAsciiDelim = '»';

    /** 
     * This is a set of ips and ports to intranet blockchain nodes.
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
            .forEach( str => this.nodeSet.add(str))
    }


    /**
     * This will append the network node list with the following network address and port.
     * Will do nothing if the network already exists.
     * @throws If the address is imporperly formatted, it will throw a SyntaxError
     * @param nodeAddress{(NodeAddress)} A valid nodeAddress object
     * @example appendNodeList(nodeAddress : NodeAddress);
     **/

    public appendNodeList(nodeAddress : string){
        validateIP(nodeAddress);
        this.readNodeList();
        if(this.nodeSet.has(nodeAddress)) return; // If it is already within the set, no need to add it
        fs.writeFileSync(this.nodeListURI, nodeAddress + this.nodesAsciiDelim, {flag: 'a+'});
    }

    /**
     * This will delete the network node list with the following network address and port.
     * @throws If the address is imporperly formatted, it will throw a SyntaxError
     * @param nodeAddress{(string)} A string with an ip and port
     * @example deleteNodeList(nodeAddress : NodeAddress);
     **/

    public deleteNodeList(nodeAddress : string){
        validateIP(nodeAddress);
        this.nodeSet.delete(nodeAddress);
        const file = fs.readFileSync(this.nodeListURI, 'utf-8');
        fs.writeFileSync(this.nodeListURI, file.replace(nodeAddress + this.nodesAsciiDelim, ''));
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
                console.log("Network has come to a consensus!");
                return ledger;
            }
            this.ledgerPool.pop();
        }
        console.log("Network was not able to reach a consensus...")
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
        this.readNodeList();
        this.nodeSet.forEach( (nodeAddress) =>{
            axios.get('http://' + nodeAddress + route).then((res)=> {
                console.log("GET: " + nodeAddress + route);
                this.propogationSideEffect(route, res.data);
                this.propogatePost('/intranet' + INTRA.ADD_NODE, {nodeAddress: nodeAddress} ) //If this node properly responds, alert network peers.
            }).catch((e)=> console.log(e.message));
        })
    }




    /**
     * propogates the network with a post request to the given url and data
     * @param route {(string)}) The route that will propogated
     * @param data {(Object)} An object that follows JSON format. This is essential for body parser to work.
     * @example this.propogatePost( '/intranet + INTRA.ADD_NODE, {nodeAddress: "127.0.0.1:200"} )
     **/

    public propogatePost(route : string, data : Object){
        validateJson(data);
        this.nodeSet.forEach( (nodeAddress) =>{
            axios.post('http://' + nodeAddress + route, data).then(()=> {
                console.log("POST: " + nodeAddress + route);
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
