import {CoinOrder, SymbolInfo, CoinPrices} from 'node-binance-api'
import {forkJoin, Observable, zip} from 'rxjs'
import {mergeMap} from 'rxjs/operators'
import {PreviousDayResult} from 'node-binance-api'
import {roundStep, sellAtMarketPrice} from '../binance/binance'
import {config} from '../config/config'
import {dbSave} from '../db/dbSave'
import {Purchase} from '../db/entity/Purchase'
import {Sell} from '../db/entity/Sell'

export function sellCoins(coinsToSell: Purchase[], exchangeInfo: SymbolInfo[]) {
  return forkJoin(coinsToSell.map(c => {
    const amount = roundStep(c.symbol, c.quantity, exchangeInfo)
    return sellAtMarketPrice(c.symbol, amount)
  })).pipe(
    mergeMap(soldCoins => zip(...markCoinAsSold(coinsToSell, soldCoins)))
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

    if( Number(prevDayStatus.priceChangePercent) > 12) {
      return priceGrowth > 0.32
    } else {
      return priceGrowth > config.sellPercent
    }
  })
}

export function markCoinAsSold(boughtCoins: Purchase[], soldCoins: CoinOrder[]): Observable<Purchase>[] {
  return boughtCoins.map((boughtCoin, i) => {
    const soldCoin = soldCoins[i]
    const sell = new Sell()

    sell.sellPrice = soldCoin.fills.reduce((acc, v) =>
        acc += Number(v.price) * Number(v.qty)
      , 0)
    sell.sellTime = new Date
    boughtCoin.sell = sell
    return dbSave(boughtCoin)
  })
}
