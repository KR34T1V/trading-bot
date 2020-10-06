import {Observable, of} from 'rxjs'
import {catchError, map, mergeMap, tap, withLatestFrom} from 'rxjs/operators'
import {getAllSymbols, getHistoricPricesForSymbols} from '../binance/binance'
import {config} from '../config/config'
import {Purchase} from '../db/entity/Purchase'
import {
  buildInvestmentCandidates,
  excludeNonBTCSymbols,
  excludeSymbolsIfLatestPriceIsNotLowest,
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

export function findInvestmentCandidates(args: {unsoldCoins: Observable<Purchase[]>}) {
  return getAllSymbols().pipe(
    map(excludeNonBTCSymbols),
    mergeMap(it => getHistoricPricesForSymbols(it, config.historicData)),
    map(excludeSymbolsIfLatestPriceIsNotLowest),
    map(it => it.map(buildInvestmentCandidates)),
    map(it => excludeSymbolsWithTooLowPriceSwing(it, config.priceSwing)),
    withLatestFrom(args.unsoldCoins),
    map(it => prioritizeWhatCoinsToBuy(...it)),
    catchError(err => {
      console.error('Could not find coins', err)
      return of([])
    })
  )
}
