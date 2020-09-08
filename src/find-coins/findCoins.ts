import {getAllSymbols, getHistoricPricesForSymbols} from '../binance/binance'
import {buildInvestmentPossibilities} from '../binance/tick'
import {config} from '../config/config'
import {
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

export function findCoinsToBuy() {
  return getAllSymbols()
    .then(excludeNonBTCSymbols)
    .then(getHistoricPricesForSymbols)
    .then(excludeSymbolsIfLatestPriceIsNotLowest)
    .then(it => it.map(buildInvestmentPossibilities))
    .then(it => excludeSymbolsWithTooLowPriceSwing(it, config.priceSwing))
    .then(sortInvestPossibilityByPriceAscending)
    .then(it => {console.log(it, 'end'); return it})
    .then(it => it.map((e => e.symbol)))
}
