import {catchError, map, switchMap} from 'rxjs/operators'
import {getAllSymbols, getHistoricPricesForSymbols} from '../binance/binance'
import {config} from '../config/config'
import {
  buildInvestmentPossibilities,
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
    switchMap(getHistoricPricesForSymbols),
    map(excludeSymbolsIfLatestPriceIsNotLowest),
    map(it => it.map(buildInvestmentPossibilities)),
    map(it => excludeSymbolsWithTooLowPriceSwing(it, config.priceSwing)),
    map(sortInvestPossibilityByPriceAscending),
    // tap(it => console.log(it, 'findCoinsToBuy'))
  )
}
