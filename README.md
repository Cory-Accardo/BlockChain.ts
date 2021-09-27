# BlockChain.ts
This is a low level blockchain implementation written entirely in TypeScript! It is a work in progress. I begun this project on 9/17/2021.


# Features

 1. Fully functional and encrypted block chain on the lightning-fast LevelDB
 2. Network consensus built on the proof of work model, uses Redis to cache ledgers and a maxHeap to derive consensus based on length of valid ledgers.
 3. BlockChain.ts comes out of the box with every API needed to sign and verify data on the blockchain.

# How to use

There are two methods you can interface with BlockChain.ts : as a server or driver.
Running the server will allow you to act as a node in the BlockChain.ts network.

a driver is simply a way for you to interface with BlockChain methods, like mining, signing transactions, etc, without starting a server. It's a playground for you to explore the API, or build any logic you need.

## Server
To start a BlockChain.ts server, simply type **yarn server {port}**

## Driver

To run driver code, type **yarn drive**. It will run all code within the src/driver.ts file. 

