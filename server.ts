import express from 'express';
import { Network } from './network';
import { Ledger, BlockChain } from './blockchain';
import axios from 'axios';

const node = express();
const port = 2000;
const network = new Network();
const blockchain = new BlockChain();

node.listen( port, () => console.log("Blockchain node listening on port " + port));


/**
 PUBLIC
 **/

/**
 Requests that this node propogates through the network to form a consensus of the true ledger.
 **/

node.get('/form_consensus', ( req , res ) => {
    network.propogateGet('/ledger');
    res.status(200).json("forming consensus...")
})

/**
 Asks the node to get the total coins of the given user.
 **/
node.post('/wallet_amount/user/:user', ( req , res) => {
    const { user } = req.params;
    const amount = network.getWalletAmount(user);
    res.status(200).json(amount);
})

/**
 Asks the node to give the ledger agreed upon by consensus.
 **/
node.get('/consensus', ( req, res ) => {
    const ledger : Ledger | null = network.getConsensus;
    if(ledger == null) return res.status(200).json("Network has obtained no consensus.");

    return res.status(200).json(ledger);
})



/**
 INTERNAL
 **/

 /**
 This is an intranetwork handler used internally for nodes to respond to calls by other nodes
 **/

node.get('/ledger', (req, res) =>{
    const ledger : Ledger = blockchain.ledger.getLedger;
    return res.status(200).json(ledger);
})



