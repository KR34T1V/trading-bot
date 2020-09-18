import {CoinOrder, CoinPrices} from 'node-binance-api'
import {forkJoin, Observable, zip} from 'rxjs'
import {map, mergeMap, tap} from 'rxjs/operators'
import {sellAtMarketPrice} from '../binance/binance'
import {dbSave} from '../db/dbSave'
import {Purchase} from '../db/entity/Purchase'
import {Sell} from '../db/entity/Sell'

export function sellCoins(boughtCoins: Observable<Purchase[]>, latestCoinPrices: Observable<CoinPrices>) {
  return zip(boughtCoins, latestCoinPrices).pipe(
    map(it => findCoinsToSell(...it)),
    mergeMap(it => sellBoughtCoins(it).pipe(
      map(soldCoins => ({boughtCoins: it, soldCoins}))
      )
    ),
    mergeMap((it) => markCoinsAsSold(it.boughtCoins, it.soldCoins))
  )
}

export function findCoinsToSell(boughtCoins: Purchase[], latestCoinPrices: CoinPrices) {
  return boughtCoins.filter(c => latestCoinPrices[c.symbol] > c.sellPrice)
}

export function sellBoughtCoins(boughtCoins: Purchase[]) {
  return forkJoin(boughtCoins.map(c => sellAtMarketPrice(c.symbol, c.quantity)))
}

export function markCoinsAsSold(boughtCoins: Purchase[], soldCoins: CoinOrder[]) {
  return forkJoin(
    boughtCoins.map(bc => {
      const soldCoin = soldCoins.find(sc => sc.symbol === bc.symbol)
      const sell = new Sell()
      sell.sellPrice = Number(soldCoin!.price)
      sell.sellTime = new Date

      bc.sell = sell
      return dbSave(bc)
    })
  )
}
