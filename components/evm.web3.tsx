import type { IProvider } from '@web3auth/base'
import Web3, { Contract, eth } from 'web3'
import { IPromiseData } from './IPromise';
const contractPromisePayABI = [{ "type": "function", "name": "createPromise", "inputs": [{ "name": "_promiseData", "type": "tuple", "internalType": "struct PromiseInfo", "components": [{ "name": "host", "type": "address", "internalType": "address" }, { "name": "title", "type": "string", "internalType": "string" }, { "name": "periodST", "type": "uint256", "internalType": "uint256" }, { "name": "periodEnd", "type": "uint256", "internalType": "uint256" }, { "name": "promiseType", "type": "uint8", "internalType": "enum PromiseType" }, { "name": "location", "type": "string", "internalType": "string" }, { "name": "depositRequiredAmount", "type": "uint256", "internalType": "uint256" }, { "name": "depositRequired", "type": "bool", "internalType": "bool" }, { "name": "depositReturn", "type": "bool", "internalType": "bool" }, { "name": "rewardIncluded", "type": "bool", "internalType": "bool" }, { "name": "reward", "type": "tuple", "internalType": "struct Reward", "components": [{ "name": "tokenAddress", "type": "address", "internalType": "address" }, { "name": "tokenType", "type": "uint8", "internalType": "enum RewardTokenType" }, { "name": "amount", "type": "uint256", "internalType": "uint256" }, { "name": "distributionType", "type": "uint8", "internalType": "enum RewardDistributionType" }] }] }, { "name": "_worldId", "type": "address", "internalType": "address" }, { "name": "_appId", "type": "string", "internalType": "string" }], "outputs": [], "stateMutability": "nonpayable" }, { "type": "function", "name": "promiseCount", "inputs": [], "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }], "stateMutability": "view" }, { "type": "function", "name": "promises", "inputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }], "outputs": [{ "name": "", "type": "address", "internalType": "address" }], "stateMutability": "view" }, { "type": "event", "name": "PromiseCreated", "inputs": [{ "name": "host", "type": "address", "indexed": true, "internalType": "address" }, { "name": "promiseId", "type": "uint256", "indexed": true, "internalType": "uint256" }, { "name": "promiseAddress", "type": "address", "indexed": false, "internalType": "address" }], "anonymous": false }];
const contractPromiseABI = [{ "type": "constructor", "inputs": [{ "name": "_promiseInfo", "type": "tuple", "internalType": "struct PromiseInfo", "components": [{ "name": "host", "type": "address", "internalType": "address" }, { "name": "title", "type": "string", "internalType": "string" }, { "name": "periodST", "type": "uint256", "internalType": "uint256" }, { "name": "periodEnd", "type": "uint256", "internalType": "uint256" }, { "name": "promiseType", "type": "uint8", "internalType": "enum PromiseType" }, { "name": "location", "type": "string", "internalType": "string" }, { "name": "depositRequiredAmount", "type": "uint256", "internalType": "uint256" }, { "name": "depositRequired", "type": "bool", "internalType": "bool" }, { "name": "depositReturn", "type": "bool", "internalType": "bool" }, { "name": "rewardIncluded", "type": "bool", "internalType": "bool" }, { "name": "reward", "type": "tuple", "internalType": "struct Reward", "components": [{ "name": "tokenAddress", "type": "address", "internalType": "address" }, { "name": "tokenType", "type": "uint8", "internalType": "enum RewardTokenType" }, { "name": "amount", "type": "uint256", "internalType": "uint256" }, { "name": "distributionType", "type": "uint8", "internalType": "enum RewardDistributionType" }] }] }, { "name": "_worldId", "type": "address", "internalType": "address" }, { "name": "_appId", "type": "string", "internalType": "string" }], "stateMutability": "nonpayable" }, { "type": "function", "name": "checkIn", "inputs": [{ "name": "_attendee", "type": "address", "internalType": "address" }, { "name": "root", "type": "uint256", "internalType": "uint256" }, { "name": "nullifierHash", "type": "uint256", "internalType": "uint256" }, { "name": "proof", "type": "uint256[8]", "internalType": "uint256[8]" }], "outputs": [], "stateMutability": "nonpayable" }, { "type": "function", "name": "checkIns", "inputs": [{ "name": "", "type": "address", "internalType": "address" }], "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }], "stateMutability": "view" }, { "type": "function", "name": "claimPromise", "inputs": [{ "name": "root", "type": "uint256", "internalType": "uint256" }, { "name": "nullifierHash", "type": "uint256", "internalType": "uint256" }, { "name": "proof", "type": "uint256[8]", "internalType": "uint256[8]" }], "outputs": [], "stateMutability": "nonpayable" }, { "type": "function", "name": "claimed", "inputs": [{ "name": "", "type": "address", "internalType": "address" }], "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }], "stateMutability": "view" }, { "type": "function", "name": "depositToPromise", "inputs": [{ "name": "root", "type": "uint256", "internalType": "uint256" }, { "name": "nullifierHash", "type": "uint256", "internalType": "uint256" }, { "name": "proof", "type": "uint256[8]", "internalType": "uint256[8]" }], "outputs": [], "stateMutability": "payable" }, { "type": "function", "name": "deposits", "inputs": [{ "name": "", "type": "address", "internalType": "address" }], "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }], "stateMutability": "view" }, { "type": "function", "name": "promiseInfo", "inputs": [], "outputs": [{ "name": "host", "type": "address", "internalType": "address" }, { "name": "title", "type": "string", "internalType": "string" }, { "name": "periodST", "type": "uint256", "internalType": "uint256" }, { "name": "periodEnd", "type": "uint256", "internalType": "uint256" }, { "name": "promiseType", "type": "uint8", "internalType": "enum PromiseType" }, { "name": "location", "type": "string", "internalType": "string" }, { "name": "depositRequiredAmount", "type": "uint256", "internalType": "uint256" }, { "name": "depositRequired", "type": "bool", "internalType": "bool" }, { "name": "depositReturn", "type": "bool", "internalType": "bool" }, { "name": "rewardIncluded", "type": "bool", "internalType": "bool" }, { "name": "reward", "type": "tuple", "internalType": "struct Reward", "components": [{ "name": "tokenAddress", "type": "address", "internalType": "address" }, { "name": "tokenType", "type": "uint8", "internalType": "enum RewardTokenType" }, { "name": "amount", "type": "uint256", "internalType": "uint256" }, { "name": "distributionType", "type": "uint8", "internalType": "enum RewardDistributionType" }] }], "stateMutability": "view" }, { "type": "event", "name": "CheckIn", "inputs": [{ "name": "attendee", "type": "address", "indexed": true, "internalType": "address" }], "anonymous": false }, { "type": "event", "name": "ClaimPromise", "inputs": [{ "name": "claimAddr", "type": "address", "indexed": true, "internalType": "address" }, { "name": "etherVal", "type": "uint256", "indexed": false, "internalType": "uint256" }, { "name": "tokenAddr", "type": "address", "indexed": false, "internalType": "address" }, { "name": "tokenAmount", "type": "uint256", "indexed": false, "internalType": "uint256" }], "anonymous": false }, { "type": "event", "name": "DepositToPromise", "inputs": [{ "name": "depositor", "type": "address", "indexed": true, "internalType": "address" }], "anonymous": false }, { "type": "error", "name": "InvalidNullifier", "inputs": [] }]
const contractAddress = '0x7f860096E408482063b88eCf9CE9342da1a514F1'; // base


export default class EthereumRpc {
  private provider: IProvider
  public web3: Web3
  public contract: any

  constructor(provider: IProvider) {
    this.provider = provider
    this.web3 = new Web3(this.provider as IProvider)
    this.contract = new this.web3.eth.Contract(contractPromisePayABI, contractAddress);
  }
  async getAccounts(): Promise<string[]> {
    try {
      const accounts = await this.web3.eth.getAccounts()
      return accounts
    } catch (error: unknown) {
      return error as string[]
    }
  }

  async getBalance(): Promise<string> {
    try {
      const accounts = await this.web3.eth.getAccounts()
      const balance = await this.web3.eth.getBalance(accounts[0])
      return balance.toString();
    } catch (error) {
      return error as string
    }
  }

  async createPromise(_promiseData: IPromiseData): Promise<any> {

    const accounts = await this.web3.eth.getAccounts();
    console.log(_promiseData)
    const receipt = await this.contract.methods.createPromise(
      _promiseData,
      '0x163b09b4fE21177c455D850BD815B6D583732432',
      'app_staging_48e425187ceaa548d46adb5bdaa1c8b5'
    ).send({
      from: accounts[0],
      gasLimit: 2500000
    });
    console.log(receipt);
    return receipt

  }

  async getPromiseInfo(promiseAddress: string): Promise<any> {
    console.log(promiseAddress)
    const promise = new this.web3.eth.Contract(contractPromiseABI, promiseAddress);
    const promiseInfo = await promise.methods.promiseInfo().call();
    console.log(promiseInfo)
    return promiseInfo
  }


  async getUserPromiseStatus(promiseAddress: string, user: string): Promise<any> {
    const promise = new this.web3.eth.Contract(contractPromiseABI, promiseAddress);
    const deposited = await promise.methods.deposits(user).call();
    const checkedIn = await promise.methods.checkIns(user).call();
    const claimed = await promise.methods.claimed(user).call();

    return {
      deposited,
      checkedIn,
      claimed
    }
  }
  async depositPromise(promiseAddress:string, root: string, nullifierHash: string, proof: string[], value: string): Promise<any> {
    const accounts = await this.web3.eth.getAccounts();
    const promise = new this.web3.eth.Contract(contractPromiseABI, promiseAddress);
    const receipt = await promise.methods.depositToPromise(root, nullifierHash,proof).send({
      from: accounts[0],
      value
    });

    return receipt
  }  
  async checkInPromise(promiseAddress:string, user: string,root: string, nullifierHash: string, proof: string[]): Promise<any> {
    const accounts = await this.web3.eth.getAccounts();
    const promise = new this.web3.eth.Contract(contractPromiseABI, promiseAddress);
    const receipt = await promise.methods.checkIn(user, root, nullifierHash,proof).send({
      from: accounts[0]
    });

    return receipt
  }
  async signMessage(): Promise<string | undefined> {
    try {
      const fromAddress = (await this.web3.eth.getAccounts())[0];
      const message =
        '0x47173285a8d7341e5e972fc677286384f802f8ef42a5ec5f03bbfa254cb01fad';

      // Sign the message
      const signedMessage = await this.web3.eth.personal.sign(
        message,
        fromAddress,
        "test password!" // configure your own password here.
      );

      return signedMessage;
    } catch (error) {
      return error as string
    }
  }

  async signAndSendTransaction(): Promise<string> {
    try {
      const amount = this.web3.utils.toWei("0.001", "ether"); // Convert 1 ether to wei
      // Get user's Ethereum public address
      const fromAddress = (await this.web3.eth.getAccounts())[0];

      let transaction = {
        from: fromAddress,
        to: fromAddress,
        data: "0x",
        value: amount,
      }

      // calculate gas transaction before sending
      transaction = { ...transaction, gas: await this.web3.eth.estimateGas(transaction) } as any;

      // Submit transaction to the blockchain and wait for it to be mined
      const txRes = await this.web3.eth.sendTransaction(transaction);

      return txRes.transactionHash.toString();
    } catch (error) {
      return error as string
    }
  }
}
