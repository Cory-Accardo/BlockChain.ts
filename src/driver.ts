import { Block, BlockChain } from './blockchain'
import { Miner } from './miner';

import { Network } from './network';

const network = new Network();

network.appendNodeList('localhost:80');
network.appendNodeList('localhost:100');
network.appendNodeList('localhost:120');
console.log(network.getWalletAmount("Adam"));