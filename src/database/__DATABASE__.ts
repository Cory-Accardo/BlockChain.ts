import { KeyObject } from 'crypto';
import level from 'level';
import redis  from 'redis';
import { Block, BlockChain } from '../api/blockchain';
const redisClient = redis.createClient();



export const NODE_DB = level( __dirname + '/network_db', () =>{
    
    console.log("BlockChain.ts Intranet Database Initialized...");
})

export const LEDGER_DB = level(__dirname + '/ledger_db', () =>{
    let count = 0;
    //The following ensures that a genesis block exists before allowing read/write operations to this ledger
    LEDGER_DB.createReadStream({limit:1})
    .on('data', () => count++)
    .on('end', ()=> {
        if (count == 0) {
            console.log("This is a first boot... spawning origin block");
            const genesisBlock = new Block(0, "0", 0, 0, "", Buffer.from("And the Earth was without form."))
            LEDGER_DB.put(genesisBlock.blockid, JSON.stringify(genesisBlock)).then( () => console.log("BlockChain.ts Ledger Database Initialized..."));
        }
        else console.log("BlockChain.ts Ledger Database Initialized...")

    })

});

export const CONSENSUS_CACHE = redisClient;

redisClient.on('ready', () =>{
    console.log("BlockChain.ts Consensus Cache Initialized...")
})

redisClient.on('error', (err)=>{
    console.error(err);
})



