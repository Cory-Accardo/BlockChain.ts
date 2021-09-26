import express, { Router } from 'express';
import { Network } from './network';
import { INTRA, INTER, GET_CONSENSUS, JOIN_NETWORK, GET_NODES } from './__ROUTE__DEF__';
import { Block } from '../api/blockchain'
import { validateIP } from '../api/util';
import { debug } from 'console';

/**
 PUBLIC
 **/

 export const internet : Router = express.Router();


/**
 Asks the node to give the ledger agreed upon by consensus.
 **/
internet.get(GET_CONSENSUS,  ( req, res ) => {
    debug("ACK GET_CONSENSUS");
    Network.getConsensus().then( (ledger : Array<Block> ) => res.status(200).json(ledger))
    .catch( () => res.status(200).json("Network unable to come to a consensus..."));
})

internet.post(JOIN_NETWORK, (req , res) =>{
    debug("ACK-JOIN_NETWORK");
    const { nodeAddress } = req.body;
    validateIP(nodeAddress,);
    Network.request({route: INTRA.ADD_NODE, method: 'post', data: {nodeAddress: nodeAddress} })
    return res.status(200).json("Notifying network of your addition to the network.")
})

internet.get(GET_NODES , async (req, res) =>{
    debug("ACK GET_NODES");
    const exportArray = new Array<string>();
    await Network.readNodeList().then( (nodeSet) => nodeSet.forEach (ele => exportArray.push(ele)));
    res.status(200).json(exportArray);
})
