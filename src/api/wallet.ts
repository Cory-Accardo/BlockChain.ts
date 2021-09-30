import { sign, generateKeyPairSync, KeyObject, createPrivateKey, createPublicKey } from 'crypto'
import { Transaction, TransactionBuffer, WalletKeyPair } from '../api/interfaces';
import fs from 'fs'
import { Miner } from '../api/miner';


export class Wallet{

    private walletURI : string;
    public keys : WalletKeyPair

    constructor(walletURI : string){
        this.walletURI = walletURI;
        this.keys = this.readKeys();
    }

    /** 
     * A public static method that generates new keys at a specified URI.
     * Otherwise, it will create a new key at __dirname + '.wallet
     * @param walletURI the folder location you want to keep your keys
     **/

    public static generateNewKeys(walletURI : string = __dirname + '.wallet'){
        console.log(walletURI)
        if (fs.existsSync(walletURI)) fs.unlinkSync(walletURI);
        const {publicKey, privateKey} = generateKeyPairSync('rsa', {modulusLength : 2048})
        Wallet.writeKeys( walletURI, {publicKey, privateKey});
    }

    /** 
     * @internal
     * A static internal method that generates writes a pair of keys to the specified wallet URI.
     * @param walletURI the folder location you want to keep your keys
     * @param keys These are keys specified by the WalletKeyPair interface.
     **/

    private static writeKeys(walletURI : string, keys : WalletKeyPair){
        const { publicKey, privateKey } = keys;
        fs.writeFileSync(walletURI, 
         publicKey.export({type: "pkcs1", format: "pem"}).toString()
         +
         privateKey.export({type: "pkcs1", format: "pem"}).toString(),
         {flag: 'a+'});
    }

    /** 
     * @internal
     * An internal method that reads keys from this wallet.
     * @returns an object containg publicKey and privateKey properties that refer to the
     * respective KeyObjects of this wallet.
     **/
    
    private readKeys(){
        const publicKeyString :string = fs.readFileSync(this.walletURI, {encoding: 'utf-8', flag: 'a+'})
        .split('-----BEGIN RSA PRIVATE KEY-----')[0]
        const privateKeyString : string = fs.readFileSync(this.walletURI, {encoding: 'utf-8', flag: 'a+'})
        .split('-----END RSA PUBLIC KEY-----')[1]

        if( !publicKeyString || !privateKeyString) throw Error("No keys detected in file");
        const publicKey = createPublicKey(publicKeyString);
        const privateKey = createPrivateKey(privateKeyString);
        return {publicKey, privateKey}
    }

    /** 
     * @internal
     * An internal method that signs a given transaction from this wallet.
     * @params a transaction, which is the data to be added to the ledger.
     * @returns a Buffer of the signed transaction.
     **/

    private signTransaction(transaction :Transaction){
        return sign("sha256", Buffer.from(JSON.stringify(transaction)), this.keys.privateKey);
    }

    /** 
     * A public method that promises to add a signed transaction to the ledger.
     * @params a transaction, which is the data to be added to the ledger.
     * @returns a Promise<boolean> to add this transaction to the ledger.
     **/

    public addTransaction(transaction : Transaction){
        const signedTransaction = this.signTransaction(transaction);
        return Miner.addTransaction(transaction, this.keys.publicKey.export({type: "pkcs1", format: "pem"}).toString(), signedTransaction)
    }

}
