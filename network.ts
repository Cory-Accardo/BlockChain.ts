import { Ledger } from './blockchain';
import Heap from 'heap';
import axios from 'axios';
import fs from 'fs'

export class Network {

    private nodesAsciiDelim = '»';
    private nodeList : string[];
    private nodeListURI : string;
    private consensus : Ledger | null;
    public ledgerPool : Heap <Ledger>;

    constructor(nodeListURI : string = __dirname + "/.network"){
        this.nodeListURI = nodeListURI;
        this.nodeList = this.readNodeList();
        this.consensus = this.getConsensus;
        this.ledgerPool = new Heap <Ledger> ( (a : Ledger, b : Ledger) =>  b.length - a.length )
    }

    private readNodeList(){
        return fs.readFileSync(this.nodeListURI, {encoding: 'utf-8', flag: 'a+'})
        .split(this.nodesAsciiDelim)
        .slice(0, -1)
    }

    public appendNodeList(address : string){
        fs.writeFileSync(this.nodeListURI, address, {flag: 'a+'});
        fs.writeFileSync(this.nodeListURI, this.nodesAsciiDelim, {flag: 'a+'});
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
     * propogates the network with a get request to the given url
     * @param route {(string)}) The route that will propogated
     **/
    public propogateGet(route : string){
        for(const index in this.nodeList){
            axios.get(this.nodeList[index] + route).then((res)=> {
                this.ledgerPool.push(res.data);
            }).catch((e)=>console.log(e.message));
        }
    }

}
