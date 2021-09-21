import express from 'express';
import { intranet } from './routes/intranet';
import { internet } from './routes/internet';

const node = express();
node.use(express.json())
let port : number = Number.parseInt(process.argv[2]);


try{node.listen( port, () => console.log("Blockchain node listening on port " + port));}
catch(e){console.error("You entered an invalid port. Try typing something like - yarn server 80")}


/**
 * This is the intranet routes, which are routes designed for nodes to speak to other nodes within the network.
 **/
node.use('/intranet', intranet);
/**
 * This is the internet routes, which are routes designed for public users to interface with the network.
 **/
node.use('/internet', internet);







