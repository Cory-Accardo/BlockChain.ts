import express, { Router } from 'express';
import { Block, BlockChain } from '../api/blockchain';
import { Network } from './network';
import { INTRA, GET_LEDGER, ADD_NODE } from './__ROUTE__DEF__';
import { debug } from 'console';


/**
 INTERNAL
 **/

export const intranet : Router = express.Router();


 /**
 This is an intranetwork handler that responds with the current node's ledger
 **/

intranet.get(GET_LEDGER, (req, res) =>{
    debug("ACK - LEDGER");
    BlockChain.get().then( (ledger : Array<Block>)=> res.status(200).json(ledger))
})

 /**
 This is an intranetwork handler that updates its network if a new node was discovered.
 **/
intranet.post(ADD_NODE, (req, res) =>{
    debug("ACK - NODE");
    const { nodeAddress } = req.body;
    Network.readNodeList().then( (nodeSet : Set<string>) => {
        if(!nodeSet.has(nodeAddress)) Network.appendNode(nodeAddress).then(() => res.status(200).json("ACK-NODE (Added!)"))
        else res.status(200).json("ACK-NODE (Already added)")
    })
})

