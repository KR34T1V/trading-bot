import Binance, {CoinOrder, CoinPrices, Tick} from 'node-binance-api'
import {from, Observable, of} from 'rxjs'
import {catchError, filter, first, map, tap} from 'rxjs/operators'
import {config} from '../config/config'

export const binance = new Binance().options(config.binance)

export function getAllSymbols(): Observable<Array<string>> {
  return from(binance.exchangeInfo()).pipe(
    first(),
    map(it => it.symbols.filter(e => e.isSpotTradingAllowed && e.status === 'TRADING')),
    map(it => it.map(e => e.symbol))
  )
}

export type SymbolPrices = {symbol: string, prices: Array<number>}

export function getHistoricPricesForSymbols(symbols: Array<string>): Observable<SymbolPrices[]> {
  return from(
    Promise.all(
      symbols.map((s: string) => {
        const {interval, limit} = config.binance.historicData
        return binance.candlesticks(s, interval, false, {limit})
          .then((t: Tick[]) => ({
            symbol: s,
            prices: getTicksPrices(t)
          }))
      })
    )
  ).pipe(first())
}

export function getTicksPrices(ticks: Tick[]): number[] {
  return ticks.map((e) => Number(e[4]))
}

export function getBalanceForCoin(symbol: string): Observable<number> {
  return from(binance.balance()).pipe(
    first(),
    map(it => Number(it[config.baseCurrency].available))
  )
}

export function buyAtMarketPrice(symbol: string, quantity: number): Observable<CoinOrder | undefined> {
  return from(binance.marketBuy(symbol, quantity)).pipe(
    first(),
    catchError(err => {
      console.error(`Could not buy coin: ${symbol} - ${quantity}`, err)
      return of(undefined)
    })
  )
}

export function sellAtMarketPrice(symbol: string, quantity: number): Observable<CoinOrder> {
  return from(binance.marketSell(symbol, quantity)).pipe(first())
}

export function getSymbolsWithPrices(): Observable<CoinPrices> {
  return from(binance.prices()).pipe(first())
}
