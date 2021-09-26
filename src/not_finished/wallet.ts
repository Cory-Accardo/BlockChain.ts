//This is a work in progress and is not currently functional.



import { sign, generateKeyPairSync, KeyObject } from 'crypto'
import { Transaction } from '../api/interfaces';
import fs from 'fs'

enum Key {
    privateKey = 0,
    publicKey  = 1,
}

class Wallet{

    private walletURI : string;
    private walletAsciiDelim = '»';
    private keys : KeyObject[] // [ publicKey, privateKey ]

    constructor(walletURI : string = __dirname + '.wallet'){
        this.walletURI = walletURI;
        this.keys = this.readKeys();
    }
    
    private readKeys(){
        const [ publicKey, privateKey ] = fs.readFileSync(this.walletURI, {encoding: 'utf-8', flag: 'a+'}).split(this.walletAsciiDelim);
        if( !publicKey || !privateKey)

        console.log(publicKey);
        return [ KeyObject.from(publicKey), KeyObject.from(privateKey)];
    }

    private writeKeys(publicKey : string, privateKey : string){
        fs.unlinkSync(this.walletURI);
        fs.writeFileSync(this.walletURI, publicKey + this.walletAsciiDelim + privateKey, {flag: 'a+'});
    }

    public generateKeys(){
        const {publicKey, privateKey} = generateKeyPairSync('rsa', {modulusLength : 2048,})
          this.keys = [ publicKey, privateKey ]
          const exportPublicKey : string = this.keys[Key.publicKey].export({type: "pkcs1", format: "pem"}).toString();
          const exportPrivateKey : string = this.keys[Key.privateKey].export({type: "pkcs1", format: "pem"}).toString();
          this.writeKeys(exportPublicKey, exportPrivateKey);
    }

    public signTransaction(transaction : Transaction){
        const buff = Buffer.from(JSON.stringify(transaction));
        const [ publicKey, privateKey ] = this.keys;
        return sign("sha256", buff, privateKey);
    }

}
