import PDFDocument from "pdfkit-table";
import fs from "fs";
import { fetchAllTokenBalancesForAllAccounts, fetchAllTokenTransactionsForAllAccounts } from "./etherscan"
import BigNumber from "bignumber.js";
import { fetchTokenPriceBsc } from "./coingecko"
import { awaitAndFilter } from "./utils"
import { symbolToAddress } from "./constants"

async function saveTablesToPDF(
  tables: any[],
  account: string,
  name : string,
  passNum : string,
  localFilePath: string = "output.pdf"
) {
  // Create a document
  const doc = new PDFDocument({
    bufferPages: true,
  });
  doc.fontSize(20);
  doc.font('Times-Roman')
   .text(`Ethereum statements - ${name} - ID : ${passNum}`, {
    lineGap: 20
   })
   .moveDown(0.5);

   doc.lineCap('butt')
   .moveTo(70, 100)
   .lineTo(400, 100)
   .stroke();

   doc.fontSize(8)

   doc.font('Times-Roman')
   .text(`${name}`, 70, 110, {
    lineGap: 10
   })

   doc.fontSize(14);

  const stream = fs.createWriteStream(localFilePath);
  doc.pipe(stream);

  for (let table of tables) {
    // @ts-ignore
    await doc.table(table);
  }

  //Global Edits to All Pages (Header/Footer, etc)
  let pages = doc.bufferedPageRange();
  for (let i = 0; i < pages.count; i++) {
    doc.switchToPage(i);

    //Footer: Add page number
    let oldBottomMargin = doc.page.margins.bottom;
    doc.page.margins.bottom = 0; //Dumb: Have to remove bottom margin in order to write into it
    doc.text(
      `Page: ${i + 1} of ${pages.count}`,
      0,
      doc.page.height - oldBottomMargin / 2, // Centered vertically in bottom margin
      { align: "center" }
    );
    doc.page.margins.bottom = oldBottomMargin; // ReProtect bottom margin

  }

  doc.end();

  await new Promise<void>((resolve) => {
    stream.on("finish", function () {
      resolve();
    });
  });
}

async function buildBalanceTable(account: string) {
  let accountData: any[] = await fetchAllTokenBalancesForAllAccounts([account])
  let parsed: any[][] = []
  const allTokenBalances: any[] = Object.values(accountData[0].balances)
  for(let i=0 ; i<allTokenBalances.length ; i++) {
    let { tokenSymbol, tokenBalance, tokenDecimal, tokenUSDPrice, tokenBalanceParsed} = allTokenBalances[i]
    const usdValue = BigNumber(tokenBalance).shiftedBy(-1 * tokenDecimal).multipliedBy(tokenUSDPrice).toString()
    parsed.push([tokenSymbol, `${tokenBalanceParsed} ${tokenSymbol} ($${usdValue})`])
  }
  const table = { 
    title: 'Balances',
    headers: ['Token', 'Balance',],
    rows: parsed,
  };

  return table
}
async function buildTransactionTable(account: string) {
  let accountData: any[] = await fetchAllTokenTransactionsForAllAccounts([account])
  let parsed: any[] = []
  const txTokens: any[] = Object.keys(accountData[0].transactions)
  const txTokenAddrs: string[] = txTokens.map(txToken => symbolToAddress[txToken])
  const accountTxs = accountData[0].transactions
  const tokenUSDPrices: any = {}
  const requests = []
  for(let txTokenAddr of txTokenAddrs) {
    requests.push(fetchTokenPriceBsc(txTokenAddr))
  }
  let result = await awaitAndFilter(requests)
  result.forEach(tokenPrice => {
    tokenUSDPrices[(tokenPrice.token as string).toUpperCase()] = tokenPrice.usd
  })
  
  for(let txToken of txTokens) {
    for(let i=0 ; i<accountTxs[txToken].length ; i++) {
      const {recipient, direction, amount, timestamp} = accountTxs[txToken][i]
      const usdPrice = BigNumber(amount).multipliedBy(tokenUSDPrices[symbolToAddress[txToken].toUpperCase()]).toString()
      parsed.push({
        token: i === 0 ? txToken : "", 
        recipient: recipient, 
        direction: direction, 
        amount: `${amount} ($${usdPrice})`, 
        time: new Date(timestamp * 1000).toString()
      })
    }
  }
  
  const table = { 
    title: 'Transactions',
    headers: [
      { label: 'Token', property: 'token', width:100}, 
      { label: 'Direction', property: 'direction', width:100},
      { label: 'Amount', property: 'amount', width:150},
      { label:'Time', property: 'time', width:120}],
      datas: parsed,
  };

  return table
}

export { saveTablesToPDF, buildBalanceTable, buildTransactionTable };
