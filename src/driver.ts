import { Block, BlockChain } from './blockchain'
import { Miner } from './miner';

import { Network } from './network';

const network = new Network();

for(let i = 0; i < 100; i++) network.appendNodeList({address: '127.0.0.1', port: 2000});
console.log(network.nodeSet.forEach( (ele: Object) => console.log(ele)));