import { Token } from "./types"

const supportedTokens: Token[] = [
    {
      address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", // USDT eth mainnet
      decimal: 6,
      symbol: 'USDT'
    },
    {
      address: "0x6B175474E89094C44Da98b954EedeAC495271d0F", // DAI eth mainnet
      decimal: 18,
      symbol: 'DAI'
    },
    {
      address: "0x6B175474E89094C44Da98b954EedeAC495271d0F", // USDC eth mainnet
      decimal: 6,
      symbol: 'USDC'
    }
  ]


const symbolToAddress:any = {}
for(const token of supportedTokens) {
  // TODO change this usdPriceAddress to address!
  symbolToAddress[token.symbol] = token.address
}

export {
    supportedTokens,
    symbolToAddress
}