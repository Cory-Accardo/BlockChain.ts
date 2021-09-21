//This file contains useful utilities


import { Address4 , Address6 } from 'ip-address';

export const validateIP = (address: string, port : number) => {
    if ( ! (Address4.isValid(address) || Address6.isValid(address) || address == 'localhost') || ! (port >= 0 && port <=  65535) ) throw new SyntaxError("Poorly formatted"); 
}
