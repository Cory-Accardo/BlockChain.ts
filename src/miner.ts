import { Block, BlockChain } from './blockchain'
import { Transaction } from './interfaces';

const blockchain = new BlockChain();

export class Miner {

    /**
     * A static method that synchronously returns a validated block for a given transaction.
     * @param transaction A transaction object
     * @example const block : Block = Miner.validateTransactionSync(transaction : Transaction);
     * @returns Returns a validated block
     **/
    public static validateTransactionSync(transaction : Transaction){
        let guess = 0;
        while(true){
            const newBlock = blockchain.makeBlock(transaction, guess);
            if(BlockChain.verifyGuess(newBlock)) return newBlock;
            guess++;
        }
    }

    /**
     * A static method that returns a promise for a validated block for a given transaction.
     * @param transaction A transaction object
     * @example Miner.validateTransaction(transaction : Transaction).then(block => blockChain.addBlock(block)); "
     * @return returns a validated block
     **/
    public static validateTransaction(transaction : Transaction){
        
        return new Promise <Block> ( ( resolve ) => {
            let guess = 0;
            while(true){
                const newBlock = blockchain.makeBlock(transaction, guess);
                if(BlockChain.verifyGuess(newBlock)){resolve(newBlock); break;}
                guess++;
            }
        })
    }
}

