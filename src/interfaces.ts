export interface Transaction {
    sender : string // Who sent the payment
    receiver : string //Who received the payment
    amount : number //How much the payment was
}

export interface NodeAddress {
    address : string // The ip address of node
    port : number // the port of the node
}