import {CoinOrder, CoinPrices, PreviousDayResult, SymbolInfo} from 'node-binance-api'
import {forkJoin, Observable, of} from 'rxjs'
import {mergeMap} from 'rxjs/operators'
import {roundStep, sellAtMarketPrice} from '../binance/binance'
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
  previousDayTradeStatus: PreviousDayResult[],
  latestCoinPrices: CoinPrices
) {
  return boughtCoins.filter(e => {
    const latestPrice = latestCoinPrices[e.symbol]
    const buyPrice = e.buyPrice / e.quantity
    const priceGrowth = (latestPrice - buyPrice) / buyPrice
    const prevDayStatus = previousDayTradeStatus.find(a => a.symbol === e.symbol)
    if (!prevDayStatus) throw Error('Could not find symbol with prices')

    return Number(prevDayStatus.priceChangePercent) > 25
      ? priceGrowth > 0.30
      : priceGrowth > config.sellPercent
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
