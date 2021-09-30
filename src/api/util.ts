//This file contains useful utilities


import { Address4 , Address6 } from 'ip-address';


/** 
 * A static internal method that generates writes a pair of keys to the specified wallet URI.
 * @param nodeAddress A string that is the nodeAddress to be validated.
 * @throws SyntaxError("Poorly formatted") if the string is poorly formatted
**/

export const validateIP = (nodeAddress : string ) => {
    const [address, port] = nodeAddress.split(':')
    if 
    ( 

    ! (Address4.isValid(address) || Address6.isValid(address) || address == 'localhost') 
    || 
    ! (Number.parseInt(port) >= 0 && Number.parseInt(port) <=  65535) 

    ) 
    throw new SyntaxError("Poorly formatted"); 
}