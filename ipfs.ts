import { NFTStorage, File } from 'nft.storage'
import { promises as fs } from "fs";
import path from "path"
import dotenv from 'dotenv';
import minimist from 'minimist'
import { Web3Storage, getFilesFromPath } from 'web3.storage'

dotenv.config();

const NFT_STORAGE_KEY: string = process.env.NFT_STORAGE_APIKEY!;
const WEB3_STORAGE_KEY: string = process.env.WEB3_STORAGE_APIKEY!;

async function storeToNFTStorage(
    filepath: any,
    description: string,
    otherDetails: any = {}
  ) {
    
    const ipfs = new NFTStorage({
      token: NFT_STORAGE_KEY,
    })
    const nftMetadata = await ipfs.store({
      image: new File(
        [
          await fs.readFile(filepath)
        ],
        path.basename(filepath),
        { type: 'application/pdf' }
      ),
      name: path.basename(filepath) ? path.basename(filepath) : 'No Name',
      description: description ? description : 'No Description',
      ...otherDetails,
    })
    console.log('nft.storage CID:', nftMetadata.ipnft)
    console.log(`https://ipfs.io/ipfs/${nftMetadata.ipnft}/metadata.json`)
    return nftMetadata.ipnft
  }

async function makeFileObject (filepath: string) {
  // You can create File objects from a Buffer of binary data
  // see: https://nodejs.org/api/buffer.html
  const buffer = await fs.readFile(filepath)

  const files = [
    new File([buffer], path.basename(filepath)),
  ]
  return files
}

async function storeToWeb3Storage(filepath: string) {
  const storage = new Web3Storage({ token: WEB3_STORAGE_KEY })
  const file = await makeFileObject(filepath)
  const cid = await storage.put(file)
  console.log('web3.storage CID:', cid)
  return cid
}

export {
  storeToNFTStorage,
  storeToWeb3Storage
}
  