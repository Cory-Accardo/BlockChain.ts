// This page will be used to store routes used by the network
//These variables are meant to help reduce the liklihood of error as the network routes grow.



/**
 * Internet Routes
 **/

 export const INTERNET = '/internet'
 export const JOIN_NETWORK : NetworkRoute = '/join_network'
 export const GET_NODES  : NetworkRoute = '/get_nodes'
 export const FORM_CONSENSUS : NetworkRoute = '/form_consensus'
 export const GET_CONSENSUS: NetworkRoute  ='/get_consensus'
 export const GET_WALLET_AMOUNT: NetworkRoute  = '/get_wallet_amount'

 export const INTER ={
    JOIN_NETWORK : (INTERNET + JOIN_NETWORK) as NetworkRoute,
    GET_NODES : (INTERNET + GET_NODES) as NetworkRoute,
    FORM_CONSENSUS : (INTERNET + FORM_CONSENSUS) as NetworkRoute,
    GET_CONSENSUS: (INTERNET + GET_CONSENSUS) as NetworkRoute,
    GET_WALLET_AMOUNT : (INTERNET + GET_WALLET_AMOUNT) as NetworkRoute,
}

/**
 * Intranet Routes
 **/

 export const INTRANET = '/intranet'
 export const ADD_NODE : NetworkRoute  =  '/add_node'
 export const GET_LEDGER : NetworkRoute  = '/get_ledger'
 export const ADD_LEDGER : NetworkRoute  = '/add_ledger'
 
 export const INTRA = {
    ADD_NODE : (INTRANET + ADD_NODE) as NetworkRoute,
    GET_LEDGER : (INTRANET + GET_LEDGER) as NetworkRoute,
    ADD_LEDGER : (INTRANET + ADD_LEDGER) as NetworkRoute
}

//Ensures that any NetworkRoute object is one of these strings.

export type NetworkRoute =

  //INTERNET
  | '/join_network' | '/get_nodes'
  | '/form_consensus' | '/get_consensus'
  | '/get_wallet_amount'

  | 'internet/join_network' | 'internet/get_nodes'
  | 'internet/form_consensus' | 'internet/get_consensus'
  | 'internet/get_wallet_amount'

  //INTRANET
  
  | '/add_node' | '/get_ledger'
  | '/add_ledger'

  | 'intranet/add_node' | 'intranet/get_ledger'
  | 'intranet/add_ledger'

