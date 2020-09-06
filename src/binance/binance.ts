import Binance, {Symbols, Tick} from 'node-binance-api'
import {config} from '../config/config'
import {getTicksPrices} from './tick'

export const binance = new Binance().options(config.binance)

export function getAllSymbols(): Promise<Array<string>> {
  return binance.prices()
    .then((symbols: {}) => Object.keys(symbols))
}

export type SymbolPrices = {symbol: string, prices: Array<number>}

export function getHistoricPricesForSymbols(symbols: Symbols): Promise<SymbolPrices[]> {
  return Promise.all(symbols.map((s: string) => {
    const {interval, limit} = config.binance.historicData
    return binance.candlesticks(s, interval, false, {limit})
      .then((t: Tick[]) => ({
        symbol: s,
        prices: getTicksPrices(t)
      }))
  }))
}

export function getBalanceForCoin(coin: string): Promise<any> {
  return binance.account()
    // .then((it: Account) => it.balances.find(b => b.asset === coin))
    // .then((it: Balance | undefined) => it?.free)
}
