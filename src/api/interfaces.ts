import { Method } from 'axios';
import { Block } from './blockchain'
import { NetworkRoute } from '../network/__ROUTE__DEF__';
import { KeyObject } from 'crypto';


export type Transaction = any //A transaction on the ledger can be any arbitrary piece of data.

export type TransactionBuffer = Buffer;

export interface NetworkRequest{
    route : NetworkRoute //One of the routes defined in __ROUTE__DEF__
    method : Method //A method that will be used by axios to make a request. I.e 'get
    data? : NodeTransport  //The data sent in the request if needed.

}

export interface NodeTransport{
    nodeAddress: string //The nodeAddress of the node that would be added to the system.
}

export interface WalletKeyPair{
    publicKey: KeyObject, //The public key
    privateKey: KeyObject //The private key
}
