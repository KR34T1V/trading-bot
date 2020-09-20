import {of} from 'rxjs'
import {catchError, map, mergeMap, take, tap} from 'rxjs/operators'
import {getAllSymbols, getHistoricPricesForSymbols} from '../binance/binance'
import {config} from '../config/config'
import {
  buildInvestmentCandidates,
  excludeNonBTCSymbols,
  excludeSymbolsIfLatestPriceIsNotLowest,
  excludeSymbolsWithTooLowPriceSwing,
  sortInvestPossibilityByPriceAscending
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

export function findInvestmentCandidates() {
  return getAllSymbols().pipe(
    map(excludeNonBTCSymbols),
    mergeMap(getHistoricPricesForSymbols),
    map(excludeSymbolsIfLatestPriceIsNotLowest),
    map(it => it.map(buildInvestmentCandidates)),
    map(it => excludeSymbolsWithTooLowPriceSwing(it, config.priceSwing)),
    map(sortInvestPossibilityByPriceAscending),
    catchError(err => {
      console.error('Could not find coins', err)
      return of([])
    })
  )
}
