import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

// TODO change this to whatever chain you need! Coingecko has FFA (free for all) API
// list of available chains: 
/**
 
curl -X 'GET' \
  'https://api.coingecko.com/api/v3/asset_platforms' \
  -H 'accept: application/json'

*/
const COINGECKO_BASE_URL = process.env.COINGECKO_BASE_URL!;

async function fetchTokenPriceBsc(tokenAddress: string): Promise<{ token: string; usd: number; }> {
    const queryParams = {
        contract_addresses: tokenAddress,
        vs_currencies: 'usd'
    }
    const url = `${COINGECKO_BASE_URL}?${new URLSearchParams(queryParams).toString()}`
    console.log(`url: ${url}`);
    
    let result: any = await (await fetch(url)).json()
    return {token: tokenAddress, ...(Object.values(result)[0] as any)}
}

export {
    fetchTokenPriceBsc
}