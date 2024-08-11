const { Web3 } = require('web3');
const web3 = new Web3('http://127.0.0.1:7545')

const account1 = '0xcA2142c7520070BC03fadC3C845c0b94510f1BE3'
const account2 = '0x12FA5D43a429953CDAd60e60A175FDFb96Bf10Db'

web3.eth.sendTransaction({
  from: account1,
  to: account2,
  value: web3.utils.toWei('10','ether')
})