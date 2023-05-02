# Ethereum Statements

## How to start developing
```bash
    npm run install
    npm run dev
```

It will auto-restart on code changes.

<br/>

## API
> Note that some supposedly GET requests use POST method to allow efficient argument passing, use JSON as request body

### Internal
1. `POST /transactions` <br/>
    **Input** <br/>
    Ethereum or EVM-compatible account address<br/>
    ```json
    {
    "accounts": ["0x67B62fF2cA9A9d7D98626B31FB2585E03d176422","0x5C806047CCb7E0c4288FADC4f10A5C6454985623"]
    }
    ```

    **Output** <br/>
    Un-paginated list of recent transactions
    ```json
    [
        {
            "transactions": {
                "USDC": [
                    {
                        "timestamp": "1665109584",
                        "tokenSymbol": "SOLBYEX",
                        "tokenAddress": "0x27ae34dac069b3701e395aa0c3f837cdb5bd36d3",
                        "tokenDecimal": "18",
                        "recipient": "0x5c806047ccb7e0c4288fadc4f10a5c6454985623",
                        "amount": "1e-14",
                        "direction": "OUT"
                    },
                    {
                        "timestamp": "1664960340",
                        "tokenSymbol": "SOLBYEX",
                        "tokenAddress": "0x27ae34dac069b3701e395aa0c3f837cdb5bd36d3",
                        "tokenDecimal": "18",
                        "recipient": "0x67b62ff2ca9a9d7d98626b31fb2585e03d176422",
                        "amount": "1e-13",
                        "direction": "IN"
                    }
                ],
                "USDT": [
                    {
                        "timestamp": "1665080040",
                        "tokenSymbol": "USDT",
                        "tokenAddress": "0xe0beaedda01a532d31c12af3533961d8213f1380",
                        "tokenDecimal": "18",
                        "recipient": "0x67b62ff2ca9a9d7d98626b31fb2585e03d176422",
                        "amount": "1.23321e-13",
                        "direction": "IN"
                    }
                ]
            },
            "account": "0x67B62fF2cA9A9d7D98626B31FB2585E03d176422"
        },
        {
            "transactions": {
                "USDC": [
                    {
                        "timestamp": "1665109584",
                        "tokenSymbol": "SOLBYEX",
                        "tokenAddress": "0x27ae34dac069b3701e395aa0c3f837cdb5bd36d3",
                        "tokenDecimal": "18",
                        "recipient": "0x5c806047ccb7e0c4288fadc4f10a5c6454985623",
                        "amount": "1e-14",
                        "direction": "IN"
                    },
                    {
                        "timestamp": "1664960412",
                        "tokenSymbol": "SOLBYEX",
                        "tokenAddress": "0x27ae34dac069b3701e395aa0c3f837cdb5bd36d3",
                        "tokenDecimal": "18",
                        "recipient": "0x5c806047ccb7e0c4288fadc4f10a5c6454985623",
                        "amount": "2e-11",
                        "direction": "IN"
                    }
                ],
                "USDT": []
            },
            "account": "0x5C806047CCb7E0c4288FADC4f10A5C6454985623"
        }
    ]
    ```
    
2. `POST /balances` <br/>
    **Input** <br/>
    Ethereum or EVM-compatible account address <br/>
    ```json
    {
    "accounts": ["0x67B62fF2cA9A9d7D98626B31FB2585E03d176422","0x5C806047CCb7E0c4288FADC4f10A5C6454985623"]
    }
    ```
    **Output** <br/>
    Un-paginated list of token balances (USDC, USDT, DAI, BTC)
    ```json
    [
        {
            "balances": {
                "USDC": {
                    "timestamp": 1665156126,
                    "tokenAddress": "0x27Ae34dac069B3701E395aA0c3F837cDb5BD36D3",
                    "tokenDecimal": 18,
                    "tokenBalance": "90000",
                    "tokenBalanceParsed": "9e-14",
                    "tokenSymbol": "USDC"
                },
                "USDT": {
                    "timestamp": 1665156127,
                    "tokenAddress": "0xE0BEAeDdA01a532d31C12af3533961d8213F1380",
                    "tokenDecimal": 18,
                    "tokenBalance": "123321",
                    "tokenBalanceParsed": "1.23321e-13",
                    "tokenSymbol": "USDT"
                }
            },
            "account": "0x67B62fF2cA9A9d7D98626B31FB2585E03d176422"
        },
        {
            "balances": {
                "USDC": {
                    "timestamp": 1665156126,
                    "tokenAddress": "0x27Ae34dac069B3701E395aA0c3F837cDb5BD36D3",
                    "tokenDecimal": 18,
                    "tokenBalance": "20010000",
                    "tokenBalanceParsed": "2.001e-11",
                    "tokenSymbol": "USDC"
                },
                "USDT": {
                    "timestamp": 1665156127,
                    "tokenAddress": "0xE0BEAeDdA01a532d31C12af3533961d8213F1380",
                    "tokenDecimal": 18,
                    "tokenBalance": "0",
                    "tokenBalanceParsed": "0",
                    "tokenSymbol": "USDT"
                }
            },
            "account": "0x5C806047CCb7E0c4288FADC4f10A5C6454985623"
        }
    ]
    ```
    
3. `GET /tokens` <br/>
    **Input** <br/>
    None <br/>
    **Output** <br/>
    A list of pre-configured ERC20 tokens that will be checked upon calling `/balances` or `/transactions` or `/generate`.
    ```json
    {
        "supportedTokens": [
            {
                "address": "0x27Ae34dac069B3701E395aA0c3F837cDb5BD36D3",
                "decimal": 18,
                "symbol": "USDC"
            },
            {
                "address": "0xE0BEAeDdA01a532d31C12af3533961d8213F1380",
                "decimal": 18,
                "symbol": "USDT"
            }
        ]
    }
    ```

4. `GET /price`
    **Input** <br/>
    Query param: `tokenAddress`, e.g. `/price?tokenAddress=0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63`
    **Output** <br/>
    ```json
    {
        "token": "0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63",
        "usd": 5.32
    }
    ```


### External
1. `POST /generate` <br/>
    Input: Ethereum or EVM-compatible account address <br/>
    ```json
    {
    "account": "0x67B62fF2cA9A9d7D98626B31FB2585E03d176422"
    }
    ```
    Output: CID that points to a PDF statement file stored on IPFS
    ```json
    {
    "nft.storage cid:": "bafyreiggnhnvcxjphiqyyhhw7qeg4hcosuoufroxbkc7jas3do5xlsyski",
    "web3.storage cid:": "bafybeicw5brv5rrmg4smvr7khxf4uzm5szrmpdjnlxzwr2nzujgel7teia"
    }
    ```

<br/>

## Implementation
### PDF programmatic generation
1. PDFKit
2. PDFKit-table

### IPFS upload
1. NFT.storage
2. web3.storage (backup)

### On chain data retrieval
1. Etherscan

### USD price
1. Coingecko