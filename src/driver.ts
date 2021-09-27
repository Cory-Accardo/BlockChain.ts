import { Network } from './network/network'
import { Block, BlockChain } from './api/blockchain'
import { Miner } from './api/miner'
import {Wallet} from './not_finished/wallet'
import fs from 'fs'
import { verify } from 'crypto';

const CorysWallet = new Wallet('C:/Users/corym/Desktop/Blockchain/src/not_finished.wallet');

CorysWallet.addTransaction({
    Raj: "good"
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

