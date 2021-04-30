import {CoinOrder, SymbolInfo} from 'node-binance-api'
import {forkJoin, Observable, of, zip} from 'rxjs'
import {map, mergeMap} from 'rxjs/operators'
import {roundStep, sellAtMarketPrice, SymbolPrices} from '../binance/binance'
import {config} from '../config/config'
import {dbSave} from '../db/dbSave'
import {Purchase} from '../db/entity/Purchase'
import {Sell} from '../db/entity/Sell'
import {computePercentIncrease} from '../plugins/math/computePercentIncrease'

export function sellCoins(coinsToSell: Purchase[], exchangeInfo: SymbolInfo[]) {
  return forkJoin(
    coinsToSell.map(c => {
      const amount = roundStep(c.symbol, c.quantity, exchangeInfo)
      return sellAtMarketPrice(c.symbol, amount).pipe(
        mergeMap((it) => it
          ? markCoinAsSold(c, it)
          : of(undefined)
        )
      )
    })
  )
}

export function findCoinsToSell(
  boughtCoinsObservable: Observable<Purchase[]>,
  historicPricesObservable: Observable<SymbolPrices[]>,
  averageProfitPerTransactionObservable: Observable<number>
) {
  return zip(
    boughtCoinsObservable,
    historicPricesObservable,
    averageProfitPerTransactionObservable,
  ).pipe(
    map(([
      boughtCoins,
      historicPrices,
      averageProfitPerTransaction
    ]) => {
      return boughtCoins.filter(e => {
        const historicSymbolPrices = historicPrices.find(a => a.symbol === e.symbol)?.prices
        if (!historicSymbolPrices ) return false

        const currentPrice = historicSymbolPrices[historicSymbolPrices.length - 1]
        const previousPrice = historicSymbolPrices[historicSymbolPrices.length - 2]
        const buyPrice = e.buyPrice / e.quantity
        const profit = (currentPrice - buyPrice) / buyPrice
        const priceChangeSinceLastTick = computePercentIncrease(previousPrice, currentPrice)

        // console.log(`${e.symbol} - ${profit} - ${priceChangeSinceLastTick}. prevT: ${previousPrice} lastT: ${latestPrice} change%: ${computePercentIncrease(previousPrice, latestPrice)}`)
        // console.log(`${e.symbol} - ${previousDayPriceChangeItem.prevDayPriceChange}`)

        return (profit > config.sellPercent && profit > averageProfitPerTransaction + 0.10)
        || (profit > config.sellPercent && priceChangeSinceLastTick < -0.005)

      })
    })
  )
}

export function markCoinAsSold(boughtCoin: Purchase, soldCoin: CoinOrder): Observable<Purchase> {
  const sell = new Sell()
  sell.sellPrice = soldCoin.fills.reduce(
    (acc, v) => acc + Number(v.price) * Number(v.qty), 0
  )
  sell.sellTime = new Date
  boughtCoin.sell = sell

  return dbSave(boughtCoin)
}
