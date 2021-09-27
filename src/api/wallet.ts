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

    public static generateNewKeys(walletURI : string = __dirname + '.wallet'){
        console.log(walletURI)
        if (fs.existsSync(walletURI)) fs.unlinkSync(walletURI);
        const {publicKey, privateKey} = generateKeyPairSync('rsa', {modulusLength : 2048})
        Wallet.writeKeys( walletURI, {publicKey, privateKey});
    }

    private static writeKeys(walletURI : string, keys : WalletKeyPair){
        const { publicKey, privateKey } = keys;
        fs.writeFileSync(walletURI, 
         publicKey.export({type: "pkcs1", format: "pem"}).toString()
         +
         privateKey.export({type: "pkcs1", format: "pem"}).toString(),
         {flag: 'a+'});
    }
    
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

    private signTransaction(transaction :Transaction){
        return sign("sha256", Buffer.from(JSON.stringify(transaction)), this.keys.privateKey);
    }

    public addTransaction(transaction : Transaction){
        const signedTransaction = this.signTransaction(transaction);
        return Miner.addTransaction(transaction, this.keys.publicKey.export({type: "pkcs1", format: "pem"}).toString(), signedTransaction)
    }

}
