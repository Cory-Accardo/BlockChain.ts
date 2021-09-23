import sha256 from 'crypto-js/sha256';
import { Transaction } from './interfaces'
import { LEDGER_DB } from './__DATABASE__';

enum Difficulty {
    Ten = "0000000000",
    Nine = "000000000",
    Eight = "00000000",
    Seven = "0000000",
    Six = "000000",
    Five = "00000",
    Four = "0000",
    Three = "000",
    Two = "00",
    One = "0"
}

const currentDifficulty = Difficulty.Four;



export class Block{
    
    /**A unique identifier for this block*/
    public blockid : number; 
    /**Date block was created*/
    public timeStamp : string;
    /**A hash associated with this block*/
    public prevhash : string; 
    /**A transaction object that describes the transaction*/
    public transaction : Transaction; 
    /**The hashed information of this block*/
    public blockhash : string;
    /**The guess that was used to validate this block*/
    public guess : number


    constructor(blockid : number, prevhash : string,  guess: number, transaction : Transaction){
        
        this.blockid = blockid;
        this.timeStamp = (new Date(Date.now())).toUTCString();
        this.prevhash = prevhash;
        this.guess = guess;
        this.transaction = transaction; 
        this.blockhash = this.getHash
    }


    /**
     * @param block ({Block}) the block to be hashed
     * A static method that returns a hashed string representation of a given block
     **/
    public static hash(block : Block){
        return sha256(block.blockid + block.timeStamp + block.prevhash + block.transaction).toString();
    }

    public static hashWithGuess(block: Block){
        return sha256(block.blockid + block.timeStamp + block.prevhash + block.transaction + block.guess).toString();
    }

    public get getHash(){
        return sha256(this.blockid + this.timeStamp + this.prevhash + this.transaction).toString();
    }

    public get getHashWithGuess(){
        return sha256(this.blockid + this.timeStamp + this.prevhash + this.transaction + this.guess).toString();

    }

}

export class BlockChain {


    /**
     * Simplifies the formation of transactions via this static method.
     @param sender({string}) Denotes the author of the block
     @param receiver({string}) Denotes the receiving party of the block
     @param amount({number}) Denotes the number of coints to send
     @example const newTransaction : Transaction = BlockChain.makeTransaction("Bob", "Sue", 400);
     **/

    public static makeTransaction(sender : string, receiver : string, amount : number){
        const transaction : Transaction = {
            sender : sender,
            receiver : receiver,
            amount : amount,
        }
        return transaction;
    }



    /**
     * An function that returns a promise for a virtual Block[] representation of the current ledger
     * on this node.
     * @returns Promise
     * @example Blockchain.get().then( (ledger : Array<Block>) => console.log(ledger));
     **/
    public static get(){
        const ledger : Array<Block> = new Array<Block>();
        return new Promise <Array<Block>>( (resolve, reject) =>{
            LEDGER_DB.createReadStream()
            .on('data', ( {value} ) => ledger.push(JSON.parse(value)))
            .on('error', () => reject(false))
            .on('end', () => resolve(ledger))
        })
    }

    /**
     * A public static method that returns a boolean true / false of whether proof of work was validated
     * according to the current requirements of this blockchain.
     * @param block({Block}) The block that will be verified.
     * @returns Boolean true / false
     * @example const isGuessCorrect : boolean = BlockChain.verifyGuess(block); 
     **/
    
    public static clear(){
        return LEDGER_DB.clear();
    }


    public static verifyGuess(block : Block){
        return Block.hashWithGuess(block).endsWith(currentDifficulty);
    }

    /**
     * A public static method that promises to add a block to the blockchain after performing two validations:
     * 1. That the block's guess is correct.
     * 2. That the block's id isn't <= the most recent block's id. All block ids must be sequential.
     * @param block({Block}) The block that will be verified.
     * @returns Boolean true / false
     * @example const isGuessCorrect : boolean = BlockChain.verifyGuess(block); 
     **/


     public static addBlock(block : Block){
        return new Promise( (resolve, reject) =>{
            if(!BlockChain.verifyGuess(block)) reject(EvalError("Block's guess is invalid"));
            BlockChain.getLastBlock().then( (lastBlock : Block) =>{
                if(block.blockid <= lastBlock.blockid) reject (RangeError("Non-sequential block."));
                else BlockChain.append(block).then( ()=> resolve(true)).catch( () => reject(true))
            })
        })
    }


    /**
     * A public static method that returns a true / false as to whether every block in the blockchain was validated.
     * It does this by confirming 3 things for every block:
     * 1. That rehashing the block results in the same hash as the block's blockhash property.
     * 2. That rehashing the previous block results in the same has as the block's prevhash property.
     * 3. That the block's guess is valid.
     * @param block({Block}) The block that will be verified.
     * @returns Boolean true / false
     * @example const isGuessCorrect : boolean = BlockChain.verifyGuess(block); 
     **/

    public static verify(ledger : Array<Block>){
        return ledger.every( (ele : Block, index : number) => {
            if(index == 0) return true; //Skips Genesis block
            return ( 
            Block.hash(ele) ==  ele.blockhash 
            && 
            Block.hash(ledger[ele.blockid-1]) == ele.prevhash 
            &&
            Block.hashWithGuess(ele).includes(currentDifficulty)
            ) 
        })
    }

    /**
     * A public static method that returns a promise for the last block of the blockchain
     * @returns Promise<Block>
     * @example const getLastBlock().then( (lastBlock : Block) => console.log(lastBlock) );   
     **/

    public static getLastBlock(){
        return new Promise <Block>( (resolve, reject) =>{
            LEDGER_DB.createReadStream({reverse: true, limit: 1})
            .on('data', ( {value} ) => resolve(JSON.parse(value)))
            .on('error', () => reject(false))
        })
    }

    /**
     *  @internal
     * This adds a block directly to the ledger, but does NOT check if it is valid.
     * @param block ({Block}) the block to be added to the ledger
     *  
     **/
    public static append(block : Block){
        return LEDGER_DB.put(block.blockid, JSON.stringify(block));
    }

}

