import sha256 from 'crypto-js/sha256';
import fs from 'fs'

import { Transaction } from './interfaces'

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


export class Ledger{

    private ledger : Block[];
    private ledgerAsciiDelim = '»';
    private ledgerURI : string;

    constructor(ledgerURI : string =  __dirname + '.ledger'){


        this.ledgerURI = ledgerURI;
        this.ledger = this.readLedger();
        if(this.length == 0){
            const genesisBlock = new Block(0, "", BlockChain.makeTransaction("Jehova", "Adam", 42));
            this.addBlock(genesisBlock);
        }

    }

    /**
     @return Returns number length of ledger
     **/

    public get length(){
        return this.ledger.length;
    }

    /**
     @return Returns the last Block in the ledger.
     **/
    public get getLastBlock(){
        return this.ledger[this.length - 1];
    }

    private readLedger(){
        return fs.readFileSync(this.ledgerURI, {encoding: 'utf-8', flag: 'a+'})
        .split(this.ledgerAsciiDelim)
        .slice(0, -1)
        .map((ele : string) => JSON.parse(ele));
    }

    /**
     *  @internal
     * This checks the contents of this particular ledger to determine the user's wallet amount.
     * If you wish to see the consensus wallet amount, use the Network class instead.
     * @param user ({string}) the unique userID used to identify user.
     * 
     **/

    public getWalletAmount(user : string){
        let total = 0;
        this.ledger.forEach( (ele : Block ) =>{
            const {sender, receiver, amount } = ele.transaction;
            if(sender.includes(user)) total -= amount;
            if(receiver.includes(user)) total += amount;
        })
        return total;
    }

    /**
     * A simple getter that returns a freshly read version of the ledger.
    **/

    public get getLedger(){
        this.readLedger();
        return this;
    }

    /**
    * This will verify the integrity of the ledger by checking two things for every block:
    * 1. The hash of the current block is equal to the current block's blockhash property.
    * 2. The hash of the previous block is equivalent to the current block's prevhash property.
    @return Returns a boolean response to the question: is the blockchain valid?
    **/
    public verify(){
        return this.ledger.every( (ele : Block, index : number, array : Block[] ) => {
            if(index == 0) return true; //Skips Genesis block
            return ( Block.hash(ele) ==  ele.blockhash && Block.hash(array[ele.blockid-1]) == ele.prevhash ) 
        })
    }

    /**
     * This is a static alternative to the instance version of the verify() method. 
     * @param ledgerObj({Ledger}) this is an instance of a Ledger object.
     * This will verify the integrity of the ledger by checking two things for every block:
     * 1. The hash of the current block is equal to the current block's blockhash property.
     * 2. The hash of the previous block is equivalent to the current block's prevhash property.
     @return Returns a boolean response to the question: is the blockchain valid?
     **/

    public static verify(ledgerObj : Ledger){
        return ledgerObj.ledger.every( (ele : Block, index : number, array : Block[] ) => {
            if(index == 0) return true; //Skips Genesis block
            return ( Block.hash(ele) ==  ele.blockhash && Block.hash(array[ele.blockid-1]) == ele.prevhash ) 
        })
    }

    /**
     *  @internal
     * This adds a block directly to the ledger, but does NOT check if it is valid.
     * @param block ({Block}) the block to be added to the ledger
     * 
     **/
    public addBlock(block : Block){
        fs.writeFileSync(this.ledgerURI, JSON.stringify(block), { flag: 'a+'});
        fs.writeFileSync(this.ledgerURI, this.ledgerAsciiDelim, { flag: 'a+'});
        this.ledger = this.readLedger();
    }
    
}


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

    constructor(blockid : number, prevhash : string, transaction : Transaction){
        this.blockid = blockid;
        this.timeStamp = (new Date(Date.now())).toUTCString();
        this.prevhash = prevhash;
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

    public get getHash(){
        return sha256(this.blockid + this.timeStamp + this.prevhash + this.transaction).toString();
    }

}

export class BlockChain {



     public ledger : Ledger;

    /**
     * Constructor if user does not pass a ledger URI
     **/
    constructor(){
        this.ledger = new Ledger();
    }

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

    public makeBlock(transaction : Transaction){
        return new Block(this.ledger.getLastBlock.blockid + 1, this.ledger.getLastBlock.blockhash, transaction);
    }

     /**
     * A public static method that returns a boolean true / false of whether proof of work was validated
     * according to the current requirements of this blockchain.
     * @param block({Block}) The block that will be verified.
     * @param guess({number}) The guess that the miner provides
     * @example const isGuessCorrect : boolean = BlockChain.verifyGuess(block, 1683); 
     **/
    public static verifyGuess(block : Block, guess: number){
        return sha256(block.getHash + guess.toString()).toString().endsWith(Difficulty.Four);
    }

    /**
     * This will perform a proof of work validation. This is the correct way to add a block to the blockchain.
     @param block{(Transaction)} The block to be added to the blockchain
     @param guess{(number)} A string generated by the miner who discovered a valid hash.
     @error Will throw EvalError if block fails to be validated.
     **/

    public addBlock(block : Block, guess : number){
        const isValid : boolean = BlockChain.verifyGuess(block, guess);
        if(isValid) this.ledger.addBlock(block);
        else throw EvalError("Miner provided a bad guess");
    }



}

