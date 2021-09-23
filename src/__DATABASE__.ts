import level from 'level';
import redis  from 'redis';
import { Block, BlockChain } from './blockchain';
const redisClient = redis.createClient();



export const NODE_DB = level( __dirname + '/network_db', () =>{
    
    console.log("BlockChain.ts Intranet Database Initialized...");
})

export const LEDGER_DB = level(__dirname + '/ledger_db', () =>{
    let count = 0;
    LEDGER_DB.createReadStream({limit:1})
    .on('data', () => count++)
    .on('end', ()=> {
        if (count == 0) {
            console.log("This is a first boot... spawning origin block");
            BlockChain.append(new Block(0, "0", 0, {sender : "God", receiver: "Adam", amount:42})).then( () => console.log("BlockChain.ts Ledger Database Initialized..."))
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



