import sha256 from 'crypto-js/sha256';
import { Transaction } from './interfaces';
import { LEDGER_DB } from '../database/__DATABASE__';
import { KeyObject, verify } from 'crypto';
import { debug } from 'console';

/**
 * These represent the various difficulties (1-10) that
 * the Blockchain.verifyGuess method will use
 * to determine eligibility to enter the ledger.
 * To easily adjust, simply change the currentDifficulty variable as desired.
 **/


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
    /**A signed buffer of this transaction*/
    public signedTransaction : Buffer; 
    /**The hashed information of this block*/
    public blockhash : string;
    /**The guess that was used to validate this block*/
    public guess : number
    /**The public key of the sender that was used to validate this block*/
    public publicKey: string



    constructor(blockid : number, prevhash : string,  guess: number, transaction : Transaction, publicKey : string, signedTransaction : Buffer){
        this.blockid = blockid;
        this.timeStamp = (new Date(Date.now())).toUTCString();
        this.prevhash = prevhash;
        this.guess = guess;
        this.transaction = transaction; 
        this.publicKey = publicKey;
        this.signedTransaction = signedTransaction
        this.blockhash = this.getHash;
    }

    // A block's Hash is the result of a sha256 on the following properties:
    // 1. Block's index on the ledger (blockid)
    // 2. Block's date of creation (timeStamp)
    // 3. The previous block's hash (prevhash)
    // 4. The transaction that occured (transaction)

    /**
     * A public static method to hash a block. 
     * @param block ({Block}) the block to be hashed
     * @returns The hashed string representation of a given block
     **/
    public static hash(block : Block){
        return sha256(block.blockid + block.timeStamp + block.prevhash + block.transaction + block.publicKey).toString();
    }

    /**
     * A public static method to hash a block along with its guess.
     * @param block ({Block}) the block to be hashed
     * @returns The hashed string representation of a given block + its guess
     **/

    public static hashWithGuess(block: Block){
        return sha256(block.blockid + block.timeStamp + block.prevhash + block.transaction + block.publicKey +  block.guess).toString();
    }

    /**
     * A public member method to hash a block. 
     * @returns The hashed string representation of a given block
     **/

    public get getHash(){
        return sha256(this.blockid + this.timeStamp + this.prevhash + this.transaction + this.publicKey).toString();
    }

    /**
     * A public member method to hash a block with its guess. 
     * @returns The hashed string representation of a given block + its guess
     **/

    public get getHashWithGuess(){
        return sha256(this.blockid + this.timeStamp + this.prevhash + this.transaction + this.publicKey + this.guess).toString();

    }

}

export class BlockChain {



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
    

    public static verifyGuess(block : Block){
        
        return Block.hashWithGuess(block).endsWith(currentDifficulty);
    }

    /**
     * A public static method that promises to add a block to the blockchain after performing two validations:
     * 1. That the block's guess and transaction signature are correct.
     * 2. That the block's id isn't <= the most recent block's id. All block ids must be sequential.
     * @param block({Block}) The block that will be verified.
     * @returns promise
     * @example const isGuessCorrect : boolean = BlockChain.verifyGuess(block); 
     **/

     public static addBlock(block : Block){
        return new Promise( (resolve, reject) =>{
            if(!BlockChain.verifyBlock(block)) reject(EvalError("Block is not authenticated"));
            BlockChain.getLastBlock().then( (lastBlock : Block) =>{
                if(block.blockid <= lastBlock.blockid) reject (RangeError("Non-sequential block."));
                else BlockChain.append(block).then( ()=> resolve(true));
            })
        })
    }

    /**
     * A public static method that returns a true / false as to whether both the signature and the guess
     * are correct for a block.
     **/

    public static verifyBlock(block: Block){
        return ( BlockChain.verifySignature(block) && BlockChain.verifyGuess(block) )
    }

    /**
     * A public static method that returns a true / false as to whether the transaction on the block
     * was authentically created by the public key associated with that block.
     **/

    public static verifySignature(block : Block){
        return verify('sha256', Buffer.from(JSON.stringify(block.transaction)), block.publicKey, Buffer.from(block.signedTransaction)) 
    }

    /**
     * A public static method that replaces the ledger database with a new ledger.
     * @params the ledger({Array of Blocks}) that will replace this current node's ledger_db.
     **/


    public static async replaceLedger(ledger : Array<Block>){
        const batchData = ledger.map( (block : Block) => { return {type: 'put', 'key': block.blockid, 'value': block as Block } })
        // @ts-ignore
        //For whatever reason, the following batch code is causing the TypeScript compiler to throw errors.
        //I've even used code directly from the documentation, indicating to me that this is a @types/level-js bug.
        return await LEDGER_DB.clear().then(()=> LEDGER_DB.batch(batchData))
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
            BlockChain.verifyBlock(ele)
            ) 
        })
    }

    /**
     * A public static method that returns a promise for the last block of the blockchain
     * @returns Promise for a Block
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
     * This private static method adds a block directly to the ledger, but does NOT check if it is valid.
     * Returns a promise to write the block directly on the ledger.
     * @param block ({Block}) the block to be added to the ledger
     *  
     **/
    private static append(block : Block){
        return LEDGER_DB.put(block.blockid, JSON.stringify(block));
    }


}

