import express, { Router } from 'express';
import { Network } from '../network';
import { INTRA, INTER } from './__ROUTE__DEF__';
import { Block } from '../blockchain'

const network = new Network();
export const internet : Router = express.Router();

/**
 PUBLIC
 **/

/**
 Requests that this node propogates through the network to form a consensus of the true ledger.
 **/

 internet.get(INTER.FORM_CONSENSUS, ( req , res ) => {
    network.propogateGet('/intranet' + INTRA.GET_LEDGER); //This network will propogate that it wants an updated ledger.
    res.status(200).json("forming consensus...")
})

/**
 Asks the node to get the total coins of the given user.
 **/
internet.get(INTER.GET_WALLET_AMOUNT, ( req , res) => {
    const user : string = req.query.user as string;
    const amount = network.getWalletAmount(user);
    res.status(200).json(amount);
})

/**
 Asks the node to give the ledger agreed upon by consensus.
 **/
internet.get(INTER.GET_CONSENSUS, ( req, res ) => {

    Network.getConsensus().then( (ledger : Array<Block> ) => res.status(200).json(ledger))
    .catch( () => res.status(200).json("Network unable to come to a consensus..."));
})
