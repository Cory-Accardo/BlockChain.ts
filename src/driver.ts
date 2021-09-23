import { Network } from './network'
import { Block, BlockChain } from './blockchain'
import { Miner } from './miner'


const trans = BlockChain.makeTransaction("GOOBO" , "Auditore", 5);

Miner.addTransaction(trans).then( () => BlockChain.get().then ( (data) => console.log(data)));

