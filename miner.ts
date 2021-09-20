import sha256 from 'crypto-js/sha256';
import { Block, BlockChain } from './blockchain'

export class Miner {

    /**
     * A static method that synchronously returns a valid guess for a given block.
     * @example const guess : string = Miner.validateBlockSync(block : Block);
     * @param block The block that the miner will validate
     **/
    public static validateBlockSync(block : Block){
        let guess = 0;
        while(!BlockChain.verifyGuess(block, guess)){
            guess++;
        }
        return guess;
    }

    /**
     * A static method that returns a promise for a valid guess for a given block.
     * @example Miner.validateBlock(block : Block).then(guess => console.log(guess)); // "25"
     * @param block The block that the miner will validate
     **/
    public static validateBlock(block : Block){
        
        return new Promise <number> ( ( resolve ) => {
            let guess = 0;
            while(!BlockChain.verifyGuess(block, guess)){
                guess++;
            }
            resolve(guess);
        })
    }
}

