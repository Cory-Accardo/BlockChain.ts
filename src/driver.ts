import { Network } from './network/network'
import { Block, BlockChain } from './api/blockchain'
import { Miner } from './api/miner'


Miner.addTransaction({sender: "cory", receiver: "funtimes", amount: 42069}).then( (d)=> console.log(d))
.then( ()=> BlockChain.get().then((data) => console.log(data)))