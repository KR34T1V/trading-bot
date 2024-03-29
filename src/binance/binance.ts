import Binance, {AccountBalance, CoinOrder, CoinPrices, ExchangeInfo, PreviousDayResult, SymbolInfo, Tick} from 'node-binance-api'
import {EMPTY, from, Observable, of} from 'rxjs'
import {catchError, first, map, share} from 'rxjs/operators'
import {config} from '../config/config'

export const binance = new Binance(config.binance)

export function getExchangeInfo(): Observable<SymbolInfo[]> {
  return from(binance.exchangeInfo()).pipe(
    first(),
    map(it => it.symbols),
    share()
  )
}

export function roundStep(symbol: string, quantity: number, exchangeInfo: SymbolInfo[]): number {
  const symbolInfo = exchangeInfo.find(e => e.symbol === symbol)
  const stepSize = symbolInfo?.filters.find(e => e.filterType === 'LOT_SIZE')?.stepSize ?? ''
  return binance.roundStep(quantity, stepSize)
}

export function getAllSymbols(): Observable<Array<string>> {
  return from(binance.exchangeInfo()).pipe(
    first<ExchangeInfo>(),
    map(it => it.symbols.filter(e => e.isSpotTradingAllowed && e.status === 'TRADING')),
    map(it => it.map(e => e.symbol))
  )
}

export function getAllBTCSymbols(): Observable<Array<string>> {
  return from(binance.exchangeInfo()).pipe(
    first<ExchangeInfo>(),
    map(it => it.symbols.filter(e => e.isSpotTradingAllowed && e.status === 'TRADING')),
    map(it => it.map(e => e.symbol)),
    map(it => it.filter(e => e.endsWith(config.baseCurrency)))
  )
}

export type SymbolPrices = {symbol: string, prices: Array<number>}

export function getHistoricPricesForSymbols(
  symbols: Array<string>,
  historicData: typeof config.historicData
): Observable<SymbolPrices[]> {
  return from(
    Promise.all(
      symbols.map((s: string) => {
        return binance.candlesticks(s, historicData.interval, false, {limit: historicData.limit})
          .then((t: Tick[]) => ({
            symbol: s,
            prices: getClosePrices(t)
          }))
      })
    )
  ).pipe(first())
}

export function getClosePrices(ticks: Tick[]): number[] {
  return ticks.map((e) => Number(e[4]))
}

export function getBalanceForCoin(symbol: string): Observable<number> {
  return from(binance.balance()).pipe(
    first(),
    map(it => Number(it[symbol].available))
  )
}

export function getAccountBalance(): Observable<AccountBalance> {
  return from(binance.balance()).pipe(
    first()
  )
}

export function buyAtMarketPrice(symbol: string, quantity: number): Observable<CoinOrder> {
  return from(binance.marketBuy(symbol, quantity)).pipe(
    first(),
    catchError(err => {
      console.error(`Could not buy coin: ${symbol} - ${quantity}`, err)
      return EMPTY
    })
  )
}

export function sellAtMarketPrice(symbol: string, quantity: number): Observable<CoinOrder | undefined> {
  return from(binance.marketSell(symbol, quantity)).pipe(
    first(),
    catchError(err => {
      console.error(`Could not sell coin: ${symbol} - ${quantity}`)
      return of(undefined)
    })
  )
}

export function getSymbolsWithPrices(): Observable<CoinPrices> {
  return from(binance.prices()).pipe(first())
}

export function getPreviousDayTradeStatus(): Observable<PreviousDayResult[]> {
  // @ts-ignore
  return from(binance.prevDay()).pipe(first())
}

export function getOrderStatus(symbol: string, orderId: number): Observable<PreviousDayResult[]> {
  // @ts-ignore
  return from(binance.orderStatus(symbol, orderId)).pipe(first())
}
