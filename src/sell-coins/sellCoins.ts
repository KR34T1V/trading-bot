import {CoinOrder, CoinPrices, SymbolInfo} from 'node-binance-api'
import {forkJoin} from 'rxjs'
import {map, mergeMap, tap} from 'rxjs/operators'
import {binance, roundStep, sellAtMarketPrice} from '../binance/binance'
import {dbSave} from '../db/dbSave'
import {Purchase} from '../db/entity/Purchase'
import {Sell} from '../db/entity/Sell'

export function sellCoins(coinsToSell: Purchase[], exchangeInfo: SymbolInfo[]) {
  return sellBoughtCoins(coinsToSell, exchangeInfo).pipe(
    map(soldCoins => ({boughtCoins: coinsToSell, soldCoins})),
    mergeMap((it) => markCoinsAsSold(it.boughtCoins, it.soldCoins))
  )
}

export function findCoinsToSell(boughtCoins: Purchase[], latestCoinPrices: CoinPrices) {
  return boughtCoins.filter(c => latestCoinPrices[c.symbol] > c.sellPrice)
}

export function sellBoughtCoins(boughtCoins: Purchase[], exchangeInfo: SymbolInfo[]) {
  return forkJoin(boughtCoins.map(c => {
    const amount = roundStep(c.symbol, c.quantity, exchangeInfo)
    return sellAtMarketPrice(c.symbol, amount)
  }))
}

export function markCoinsAsSold(boughtCoins: Purchase[], soldCoins: CoinOrder[]) {
  return forkJoin(
    boughtCoins.map(bc => {
      const soldCoin = soldCoins.find(sc => sc.symbol === bc.symbol)
      const sell = new Sell()
      sell.sellPrice = soldCoin!.fills.reduce((acc, v) =>
        acc += (Number(v.price) * Number(v.qty)) - Number(v.commission)
        , 0)
      sell.sellTime = new Date

      bc.sell = sell
      return dbSave(bc)
    })
  )
}
