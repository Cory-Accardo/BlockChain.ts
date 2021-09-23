import { Block, BlockChain } from './blockchain'
import { Transaction } from './interfaces';


export class Miner {

    /**
     * A static method that returns a promise to add a transaction to the blockchain as soon as it is validated
     * @param transaction A transaction object
     * @example Miner.validateTransaction(transaction : Transaction).then(block => blockChain.addBlock(block)); "
     * @return returns a validated block
     **/
    public static addTransaction(transaction : Transaction){
        
        return new Promise ( ( resolve ) => {
            let guess = 0;
            BlockChain.getLastBlock()
            .then( (lastBlock : Block) =>{
                    while(true){
                        const newBlock = new Block(lastBlock.blockid + 1, lastBlock.blockhash, guess, transaction);
                        if(BlockChain.verifyGuess(newBlock)){
                            console.log("Verified");
                            BlockChain.addBlock(newBlock).then( () => resolve(true));
                            break;
                        }
                        else guess++;
                    }
                })
            })
    }
}

