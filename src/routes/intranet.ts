import express, { Router } from 'express';
import { Block, BlockChain } from '../blockchain';
import { Network } from '../network';
import { INTRA } from './__ROUTE__DEF__';


/**
 INTERNAL
 **/

export const intranet : Router = express.Router();


 /**
 This is an intranetwork handler that responds with the current node's ledger
 **/

intranet.get(INTRA.GET_LEDGER, (req, res) =>{
    console.log("ACK - LEDGER");
    BlockChain.get().then( (ledger : Array<Block>)=> res.status(200).json(ledger))
})

 /**
 This is an intranetwork handler that updates its network if a new node was discovered.
 **/
intranet.post(INTRA.ADD_NODE, (req, res) =>{
    console.log("ACK - NODE");
    const { nodeAddress } = req.body;
    Network.readNodeList().then( (nodeSet : Set<string>) => {
        if(!nodeSet.has(nodeAddress)) Network.appendNodeList(nodeAddress).then(() => res.status(200).json("ACK-NODE (Added!)"))
        else res.status(200).json("ACK-NODE (Alrady added)")
    })
})

