import { Network } from './network/network'
import { Block, BlockChain } from './api/blockchain'
import { Miner } from './api/miner'
import {Wallet} from './api/wallet'
import fs from 'fs'
import { verify } from 'crypto';

// Wallet.generateNewKeys();
const CorysWallet = new Wallet('C:/Users/corym/Desktop/Blockchain/src/api.wallet');

CorysWallet.addTransaction({
    Mom: "good",
    Epa: "old"
}).then ( () => {
    BlockChain.get().then( ledger => {
        console.log(BlockChain.verify(ledger))
        console.log(ledger);
    })
})

// BlockChain.get().then( ledger => {
//     console.log(ledger);
//     console.log(BlockChain.verify(ledger))
// })

