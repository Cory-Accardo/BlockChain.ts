//This file contains useful utilities


import { Address4 , Address6 } from 'ip-address';

export const validateIP = (nodeAddress : string ) => {
    console.log(nodeAddress);
    const [address, port] = nodeAddress.split(':')
    if 
    ( 

    ! (Address4.isValid(address) || Address6.isValid(address) || address == 'localhost') 
    || 
    ! (Number.parseInt(port) >= 0 && Number.parseInt(port) <=  65535) 

    ) 
    throw new SyntaxError("Poorly formatted"); 
}

export const validateJson = (data : Object) => {
    if(typeof data != 'object') throw TypeError("Data must be in JSON format");
}