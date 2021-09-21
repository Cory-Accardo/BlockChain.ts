import express, { Router } from 'express';
import { Network } from '../network';
import { Ledger } from '../blockchain';
import { INTRA, INTER } from './__ROUTE__DEF__';

const network = new Network();
export const internet : Router = express.Router();

/**
 PUBLIC
 **/

/**
 Requests that this node propogates through the network to form a consensus of the true ledger.
 **/

 internet.get(INTER.FORM_CONSENSUS, ( req , res ) => {
    network.propogateGet('/intranet' + INTRA.LEDGER);
    res.status(200).json("forming consensus...")
})

/**
 Asks the node to get the total coins of the given user.
 **/
internet.get(INTER.WALLET_AMOUNT, ( req , res) => {
    const user : string = req.query.user as string;
    const amount = network.getWalletAmount(user);
    res.status(200).json(amount);
})

/**
 Asks the node to give the ledger agreed upon by consensus.
 **/
internet.get(INTER.GET_CONSENSUS, ( req, res ) => {
    const ledger : Ledger | null = network.getConsensus;
    if(ledger == null) return res.status(200).json("Network has obtained no consensus.");

    return res.status(200).json(ledger);
})

