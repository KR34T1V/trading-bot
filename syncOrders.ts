import {readJSONSync} from 'fs-extra'
import _ from 'lodash'
import {from, Observable, zip} from 'rxjs'
import {first, map, mergeMap, tap} from 'rxjs/operators'
import {
  binance,
  buyAtMarketPrice, getAllBTCSymbols,
  getExchangeInfo, getOrderStatus,
  getSymbolsWithPrices, roundStep,
  sellAtMarketPrice
} from './src/binance/binance'
import {dbConnect} from './src/db/dbConnect'
import {dbSave} from './src/db/dbSave'
import {Purchase} from './src/db/entity/Purchase'
import {Sell} from './src/db/entity/Sell'
import {getSoldCoins} from './src/db/fetcher/getSoldCoins'
import {getUnsoldCoins} from './src/db/fetcher/getUnsoldCoins'
import {computePercentIncrease} from './src/plugins/math/computePercentIncrease'

type AllOrderResult = {
  side: 'BUY' | 'SELL'
  executedQty: string
  time: number
  cummulativeQuoteQty: string
}

export function getAllOrders(symbol: string): Observable<AllOrderResult[]> {
  let time = new Date().setHours(18, 1, 0)
  // @ts-ignore
  return from(binance.allOrders(symbol, undefined, {
    limit: 500,
    startTime: time
  })).pipe(first())
}

dbConnect().then(conn => {
  //
  // getSymbolsWithPrices()
  // zip(getUnsoldCoins(), getExchangeInfo()).pipe(
  //   map(([unsoldCoins, exchangeInfo]) => {
  //     const uniqueUnsold = _.uniq(unsoldCoins.map(e => e.symbol))
  //     return exchangeInfo
  //       .filter(e => uniqueUnsold.includes(e.symbol))
  //       .filter(e => e.status != 'TRADING')
  //   })
  // ).subscribe(
  //   it => console.log(it)
  // )


//   [
//     'HARDBTC',
//     'DNTBTC',
//     'RSRBTC',
//     'RIFBTC',
//     'SNXBTC',
//     'BZRXBTC',
//     'DATABTC',
//     'NULSBTC',
//     'FLMBTC',
//     'SKLBTC',
//     'PERLBTC',
//     'SANDBTC',
//     'ALPHABTC',
//     'ONEBTC',
//     'POABTC',
//     'DUSKBTC',
//     'NASBTC',
//     'ROSEBTC'
//   ].forEach(symbol => {
//   zip(
//     getUnsoldCoins({symbol: symbol}),
//     getAllOrders(symbol).pipe(
//       map(it => it.filter(e => e.side == 'SELL'))
//     )
//   ).pipe(
//     mergeMap(([unsoldCoins, soldOrders]) => {
//       return unsoldCoins.map((boughtCoin, i) => {
//         const sell = new Sell()
//         const soldCoin = soldOrders.find(e => {
//           return Math.round(Number(e.executedQty)) == Math.floor(Number(boughtCoin.quantity))
//         })
//
//         if (!soldCoin) return undefined
//
//         sell.sellPrice = Number(soldCoin.cummulativeQuoteQty)
//         sell.sellTime = new Date(soldCoin.time)
//         boughtCoin.sell = sell
//
//         // console.log(soldCoin, boughtCoin)
//         return dbSave(boughtCoin)
//       })
//     }),
//   ).subscribe(
//     it => {console.log(it)}
//   )
// })

  // getAllBTCSymbols().pipe(
  //   map(it => {
  //
  //   })
  // )
  // getAllOrders('PHBBTC').pipe(
  //   // map(it => it.filter(e => e.side == 'SELL')),
  //   tap(it => {
  //     // console.log(it, '####')
  //     console.log(it.filter(e => e.side == 'BUY').map(e => [e.executedQty, new Date(e.time), e.cummulativeQuoteQty]), 'BUY')
  //     console.log(it.filter(e => e.side == 'SELL').map(e => [e.executedQty, new Date(e.time), e.cummulativeQuoteQty]), 'SELL')
  //   })
  // ).subscribe()

  // sellAtMarketPrice('PSGBTC', 0).subscribe(
  //   it => {console.log('####', it)}
  // )



  // zip(getUnsoldCoins(), from(binance.balance()).pipe(first())).pipe(
  //     map(([unsold, balance]) => {
  //       const unsoldCoins: Array<any> = []
  //       _.uniq(unsold.map(e => e.symbol)).forEach(e => {
  //         const binance = Number(balance[e.slice(0, -3)]?.available ?? 0)
  //         const db = unsold.filter(a => a.symbol === e)
  //           .reduce((a,e) => a + e.quantity, 0)
  //         // @ts-ignore
  //         unsoldCoins.push(`${e.slice(0, -3)}: binance: ${binance} db: ${db} diff: ${binance - db}`)
  //         // unsoldCoins.push({
  //         //   symbol: e.slice(0, -3),
  //         //   balance: binance,
  //         //   db,
  //         //   diff:  binance - db
  //         // })
  //       })
  //       return unsoldCoins
  //     }),
  //   ).subscribe(
  //     it => process.stdout.write(it.join('\n'))
  //   )
  //
  // zip(
  //   from(binance.balance()).pipe(first()),
  //   getExchangeInfo(),
  //   getSymbolsWithPrices()
  // ).pipe(
  //   map(([it, exchangeInfo, symbolPrices]) => {
  //     delete it['BTC']
  //     console.log(symbolPrices)
  //     for (let [symbol, {available}] of Object.entries(it)) {
  //       const sp = symbolPrices[symbol+'BNB']
  //       const amount = roundStep(symbol, Number(available), exchangeInfo)
  //       console.log(symbol + ':' + available, amount > 0, amount, sp, amount * sp > 0.00011);
  //       if (amount > 0 && amount * sp > 0.0001) {
  //         try {
  //           sellAtMarketPrice(symbol + 'BNB', amount)
  //             .subscribe()
  //         } catch (e) {
  //           console.log(`failed: ${symbol} - ${available}`)
  //         }
  //       }
  //     }
  //   }),
  //   // tap(it => {console.log('###', it)})
  // ).subscribe()


  // sellAtMarketPrice('UNFIBTC', 0.3).subscribe(
  //   it => console.log(it)
  // )

  // buyAtMarketPrice('DUSKBTC', 30).subscribe(
  //   it => console.log(it)
  // )

  // getUnsoldCoins({symbol: 'FLMBTC'}).pipe(
  //   mergeMap(it => {
  //     return it.map(e => {
  //       const soldCoin = e
  //       const sell = new Sell()
  //
  //       sell.sellPrice = 0
  //       sell.sellTime = new Date
  //       e.sell = sell
  //       return dbSave(e)
  //     })
  //   })
  // ).subscribe(
  //   it => console.log(it)
  // )


  // getExchangeInfo().subscribe(
  //   it => {
  //     it.forEach(e => {
  //       console.log(e.symbol, e.filters.find(e => e.filterType === 'LOT_SIZE')?.stepSize ?? '')
  //     })
  //     // const c = it.find(e => e.symbol === 'WINGBTC')
  //     // const c2 = it.find(e => e.symbol === 'ANTBTC')
  //     // console.log(c)
  //     // console.log(c2)
  //   }
  // )


  // // average profit per transaction
  // getSoldCoins().subscribe(
  //   it => {
  //     const avg = it.filter(e => e.sell.sellPrice > 0)
  //       .map(e => computePercentIncrease(e.buyPrice, e.sell.sellPrice))
  //       .filter(e => isFinite(e))
  //       .reduce((acc, e) => acc + e, 0)
  //
  //     console.log(`avg: ${avg}`)
  //   }
  // )

})

// TODO: sell 16 XRP

import { exec } from 'child_process'
import { SimpleIntervalJob, Task, ToadScheduler } from "toad-scheduler"

function execWithStdout(cmd: string) {
  const p = exec(cmd)
  p.stdout?.pipe(process.stdout)
  p.stderr?.pipe(process.stdout)
}

const task = new Task('simple-task', () => {
  console.log(new Date())
  execWithStdout('yarn dashboard')
})

const job = new SimpleIntervalJob({ minutes: 15 }, task)
new ToadScheduler()
  .addSimpleIntervalJob(job)
