import _ from 'lodash'
import {PreviousDayResult} from 'node-binance-api'
import {Observable} from 'rxjs'
import {map, mergeMap} from 'rxjs/operators'
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

export function findInvestmentCandidates(
  unsoldCoins: Observable<Purchase[]>,
  previousDayTrades: Observable<PreviousDayResult[]>
): Observable<InvestmentCandidate[]> {
  return getAllSymbols().pipe(
    map(excludeNonBTCSymbols),
    mergeMap(it => getHistoricPricesForSymbols(it, config.historicData)),
    map(excludeSymbolsWithLowPrices),
    map(excludeNewlyAddedCoins),
    mergeMap(it => excludeSymbolsIfPriceHasNotDroppedSinceLastPurchase(it, unsoldCoins)),
    mergeMap(it => excludeSymbolsIfPriceStillDropping(it, previousDayTrades)),
    map(it => it.map(buildInvestmentCandidates)),
    map(it => excludeSymbolsWithTooLowPriceSwing(it, config.priceSwing)),
    mergeMap(it => prioritizeWhatCoinsToBuy(it, unsoldCoins))
  )
}

export function excludeNewlyAddedCoins(sp: SymbolPrices[]): SymbolPrices[] {
  return sp.filter(e => e.prices.length >= config.historicData.limit)
}

export function excludeSymbolsWithLowPrices(sp: SymbolPrices[]): SymbolPrices[] {
  return sp.filter(e => e.prices[e.prices.length - 1] > 0.0000009)
}

export function excludeSymbolsIfPriceHasNotDroppedSinceLastPurchase(
  historicPrices: SymbolPrices[],
  unsoldCoins: Observable<Purchase[]>
): Observable<SymbolPrices[]> {
  return unsoldCoins.pipe(
    map(it => {
      return historicPrices.filter(e => {
        const latestPrice = e.prices[e.prices.length - 1]
        const latestUnsold = it.reverse().find(c => c.symbol === e.symbol)
        const previousBuyPrice = latestUnsold
          ? latestUnsold.buyPrice / latestUnsold.quantity
          : 999999

        return latestPrice < previousBuyPrice * 0.85
      })
    })
  )
}

export function excludeSymbolsIfPriceStillDropping(
  historicPrices: SymbolPrices[],
  previousDayTradeStatus: Observable<PreviousDayResult[]>
): Observable<SymbolPrices[]> {
  return previousDayTradeStatus.pipe(
    map(it => {
      return historicPrices.filter(hp => {
        const prevDayStatus = _.find(it, ['symbol', hp.symbol])
        if (!prevDayStatus) return false

        const priceChange = Number(prevDayStatus.priceChangePercent)
        return priceChange > -4
          && priceChange < 3
      })
    })
  )
}
