# BlockChain.ts

This is a low level blockchain implementation written entirely in TypeScript! It is a work in progress. I begun this project on 9/17/2021.


# Features

 1. Fully functional and encrypted block chain 
 2. Network consensus built on the proof of work model
 3. Adjustable levels of mining difficulty
 4. The ability to "send" and "receive" currency on the blockchain. 

# Goals

 1. Completely abstract away from cryptocurrency, and allow for the storage of any data.
 2. Create user signatures and validations to allow for "ownership" or "authorship" of blocks - allowing for the creation of NFTs.
 3. Much more....

# How to use

There are two methods you can interface with BlockChain.ts : as a server or driver.
Running the server will allow you to act as a node in the BlockChain.ts network.

a driver is simply a way for you to interface with BlockChain methods, like mining, without starting a server. It's a playground for you to explore the API, or build any logic you need.

## Server
To start a BlockChain.ts server, simply type **yarn server**

## Driver

To run driver code, type **yarn drive**. 

