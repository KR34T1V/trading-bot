import Binance, {BoughtCoin, CoinPrices, Tick} from 'node-binance-api'
import {from, Observable} from 'rxjs'
import {map} from 'rxjs/operators'
import {config} from '../config/config'

export const binance = new Binance().options(config.binance)

export function getAllSymbols(): Observable<Array<string>> {
  return from(binance.prices()).pipe(
    map(it => Object.keys(it))
  )
}

export type SymbolPrices = {symbol: string, prices: Array<number>}

export function getTicksPrices(ticks: Tick[]): number[] {
  return ticks.map((e) => Number(e[4]))
}

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
  )
}

export function getBalanceForCoin(symbol: string): Observable<number> {
  return from(binance.account()).pipe(
    map(it => Number(it.balances.find(b => b.free === config.baseCurrency)))
  )
}

export function marketBuy(symbol: string, quantity: number): Observable<BoughtCoin> {
  return from(binance.marketBuy(symbol, quantity))
}

export function getSymbolsWithPrices(): Observable<CoinPrices> {
  return from(binance.prices())
}
