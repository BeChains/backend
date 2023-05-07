import dotenv from 'dotenv';
import fetch from 'node-fetch';
import { getTimestamp } from "./utils"
import { supportedTokens } from "./constants"
import BigNumber from "bignumber.js";
import { Token } from "./types"
import { awaitAndFilter, mergeListIntoDictionary } from "./utils"
import { fetchTokenPriceBsc } from "./coingecko"

dotenv.config();

const BASE_URL = process.env.ETHERSCAN_BASE_URL!;
const apikey: string = process.env.ETHERSCAN_APIKEY!;

async function fetchTokenBalance(token:Token, account: string) {
    const queryParams = {
        module: 'account',
        action: 'tokenbalance',
        address: account,
        contractaddress: token.address,
        tag: "latest",
        apikey
    }
    
    let response: any = await fetch(`${BASE_URL}?${new URLSearchParams(queryParams).toString()}`)
    response = await response.json() // await required
    
    let tokenPrice = token.address ? (await fetchTokenPriceBsc(token.address))['usd'] : -1
    return {
        timestamp: getTimestamp(),
        'tokenAddress': token.address,
        'tokenDecimal': token.decimal,
        'tokenBalance': response.result,
        'tokenBalanceParsed': ((new BigNumber(response.result)).shiftedBy(-1 * token.decimal)).toString(),
        'tokenSymbol': token.symbol,
        'tokenUSDPrice': tokenPrice ?? 'No USD address provided' // uncomment this when it's ready
    }
}

async function fetchAllTokenBalance(account: string) {
    let requests:any[] = []
    for (let token of supportedTokens) {
        requests.push(fetchTokenBalance(token, account))
    }
    let result = await awaitAndFilter(requests)
    result = result.map((tokenBalance, index) => {
        return {
            [supportedTokens[index].symbol]: tokenBalance
        }
    })
    
    return result
}

async function fetchTokenTransactions(token:Token, account: string, action: string = 'tokentx'): Promise<any[]> {
    const queryParams = {
        module: 'account',
        action,
        address: account,
        contractaddress: token.address,
        tag: "latest",
        apikey
    }
    console.log(`${BASE_URL}?${new URLSearchParams(queryParams).toString()}`);
    
    let response: any = await fetch(`${BASE_URL}?${new URLSearchParams(queryParams).toString()}`)
    response = await response.json()
    const txs = response.result

    let mapped: any[] = txs.map( (tx: any) => { 
        return  {
                timestamp: tx.timeStamp,
                'tokenSymbol': tx.tokenSymbol,
                'tokenAddress': tx.contractAddress,
                'tokenDecimal': tx.tokenDecimal,
                'recipient': tx.to,
                'amount': ((new BigNumber(tx.value)).shiftedBy(-1 * tx.tokenDecimal)).toString(),
                'direction': (tx.from as string).toUpperCase() === account.toUpperCase() ? 'OUT' : 'IN'
            }
        }
    )

    return mapped
}

async function fetchAllTokenTransactions(account: string) {
    let requests:any[] = []
    for (let token of supportedTokens) {
        requests.push(fetchTokenTransactions(token, account, 'tokentx')) // erc20 transactions
        // requests.push(fetchTokenTransactions(token, account, 'tokennfttx')) // erc721 transactions
    }
    let result = await awaitAndFilter(requests)
    for(let i=0 ; i<result.length ; i++) {
        result[i] = result[i].sort((a: any, b: any) => b.timestamp - a.timestamp)
    }
    
    return result.map((res, index) => {
        return {
           [supportedTokens[index].symbol] : res
        }
    })
}

async function fetchAllTokenBalancesForAllAccounts(accounts: string[]): Promise<any[]> {
    let requests = []
    for(let account of accounts) {
      requests.push(fetchAllTokenBalance(account))
    }
    let result = await awaitAndFilter(requests)
    let flattened = []
    for (let accountBalance of result) {
      flattened.push(mergeListIntoDictionary(accountBalance))
    }
    result = flattened.map((res, index) => { return {balances: res, account: accounts[index]}})
    return result
  }
  
  async function fetchAllTokenTransactionsForAllAccounts(accounts: string[]): Promise<any[]> {
    let requests = []
    for(let account of accounts) {
      requests.push(fetchAllTokenTransactions(account))
    }
    
    let result = await awaitAndFilter(requests)
  
    let flattened = []
    for (let accountTxs of result) {
      flattened.push(mergeListIntoDictionary(accountTxs))
    }
    
    result = flattened.map((res, index) => { return {transactions: res, account: accounts[index]}})
  
    return result
  }

export {
    fetchAllTokenBalance,
    fetchAllTokenTransactions,
    fetchAllTokenBalancesForAllAccounts,
    fetchAllTokenTransactionsForAllAccounts
}