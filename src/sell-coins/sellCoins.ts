import {CoinOrder, SymbolInfo} from 'node-binance-api'
import {forkJoin, Observable, of} from 'rxjs'
import {mergeMap} from 'rxjs/operators'
import {roundStep, sellAtMarketPrice, SymbolPrices} from '../binance/binance'
import {config} from '../config/config'
import {dbSave} from '../db/dbSave'
import {Purchase} from '../db/entity/Purchase'
import {Sell} from '../db/entity/Sell'

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
  boughtCoins: Purchase[],
  historicPrices: SymbolPrices[]
) {
  return boughtCoins.filter(e => {
    const historicSymbolPrices = historicPrices.find(a => a.symbol === e.symbol)?.prices
    if (!historicSymbolPrices) return false

    const latestPrice = historicSymbolPrices[historicSymbolPrices.length - 1]
    const previousPrice = historicSymbolPrices[historicSymbolPrices.length - 2]
    const buyPrice = e.buyPrice / e.quantity
    const priceGrowth = (latestPrice - buyPrice) / buyPrice
    const priceChange = (latestPrice - previousPrice) / previousPrice

    return priceGrowth > config.sellPercent
      && priceChange < -0.015
  })
}

export function markCoinAsSold(boughtCoin: Purchase, soldCoin: CoinOrder): Observable<Purchase> {
  const sell = new Sell()
  sell.sellPrice = soldCoin.fills.reduce((acc, v) =>
      acc += Number(v.price) * Number(v.qty)
    , 0)
  sell.sellTime = new Date
  boughtCoin.sell = sell

  return dbSave(boughtCoin)
}
