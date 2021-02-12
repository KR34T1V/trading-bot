import {Observable, of} from 'rxjs'
import {catchError, map, mergeMap, withLatestFrom} from 'rxjs/operators'
import {getAllSymbols, getHistoricPricesForSymbols, SymbolPrices} from '../binance/binance'
import {config} from '../config/config'
import {Purchase} from '../db/entity/Purchase'
import {
  buildInvestmentCandidates,
  excludeNonBTCSymbols,
  excludeSymbolsWithTooLowPriceSwing,
  prioritizeWhatCoinsToBuy
} from './helper'

export type InvestmentCandidate = {
  symbol: string
  prices: Array<number>
  minPrice: number
  maxPrice: number
  slope: number
  trendDirection: number
  priceSwing: number
}

export function findInvestmentCandidates(unsoldCoins: Observable<Purchase[]>) {
  return getAllSymbols().pipe(
    map(excludeNonBTCSymbols),
    mergeMap(it => getHistoricPricesForSymbols(it, config.historicData)),
    map(excludeSymbolsWithLowPrices),
    map(it => it.map(buildInvestmentCandidates)),
    map(it => excludeSymbolsWithTooLowPriceSwing(it, config.priceSwing)),
    withLatestFrom(unsoldCoins),
    map(it => prioritizeWhatCoinsToBuy(...it)),
    catchError(err => {
      console.error('Could not find coins', err)
      return of([])
    })
  )
}

export function excludeSymbolsWithLowPrices(sp: SymbolPrices[]) {
  return sp.filter(e => e.prices[e.prices.length - 1] > 0.00000013)
}
