import { Block, BlockChain } from './blockchain'
import { Miner } from './miner';


const mugCoin = new BlockChain();

// console.log(mugCoin.ledger);

const transaction = BlockChain.makeTransaction("Gogg", "Cory", 50);

const newBlock = mugCoin.makeBlock(transaction);

Miner.validateBlock(newBlock).then( guess => mugCoin.addBlock(newBlock, guess))

console.log(mugCoin.ledger.verify());