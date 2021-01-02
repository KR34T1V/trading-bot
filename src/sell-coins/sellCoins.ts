import {CoinOrder, CoinPrices, SymbolInfo} from 'node-binance-api'
import {forkJoin, Observable, zip} from 'rxjs'
import {mergeMap, tap} from 'rxjs/operators'
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
    mergeMap(soldCoins => zip(...markCoinAsSold(coinsToSell, soldCoins))),
  )
}

export function findCoinsToSell(boughtCoins: Purchase[], latestCoinPrices: CoinPrices) {
  return boughtCoins.filter(c => {
    const buyPrice = c.buyPrice / c.quantity
    return (latestCoinPrices[c.symbol] - buyPrice) / buyPrice > config.sellPercent
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
