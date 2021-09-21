import express, { Router } from 'express';
import { Ledger, BlockChain } from '../blockchain';
import { Network } from '../network';
import { NodeAddress } from '../interfaces';
import { INTRA } from './__ROUTE__DEF__';


/**
 INTERNAL
 **/

const blockchain = new BlockChain();
const network = new Network();
export const intranet : Router = express.Router();


 /**
 This is an intranetwork handler that responds with the current node's ledger
 **/

intranet.get(INTRA.LEDGER, (req, res) =>{
    const ledger : Ledger = blockchain.ledger.getLedger;
    return res.status(200).json(ledger);
})

 /**
 This is an intranetwork handler that updates its network if a new node was discovered.
 **/
intranet.post(INTRA.ADD_NODE, (req, res) =>{
    const nodeAddress : NodeAddress = req.body;
    if(network.nodeSet.has(JSON.stringify(nodeAddress))) return res.status(304);
    network.appendNodeList(nodeAddress)
    return res.status(200).json("ledger");
})

