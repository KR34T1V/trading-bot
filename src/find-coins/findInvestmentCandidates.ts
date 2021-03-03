import _ from 'lodash'
import {CoinPrices, PreviousDayResult, SymbolInfo} from 'node-binance-api'
import {Observable, zip} from 'rxjs'
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
  previousDayTrades: Observable<PreviousDayResult[]>,
  coinPrices: Observable<CoinPrices>,
  exchangeInfo: Observable<SymbolInfo[]>
): Observable<InvestmentCandidate[]> {
  return getAllSymbols().pipe(
    map(excludeNonBTCSymbols),
    mergeMap(it => getHistoricPricesForSymbols(it, config.historicData)),
    map(excludeSymbolsWithLowPrices),
    // map(excludeNewlyAddedCoins), // one of those things
    mergeMap(it => excludeSymbolsIfPriceHasNotDroppedSinceLastPurchase(it, unsoldCoins, coinPrices)),
    mergeMap(it => excludeSymbolsIfPriceStillDropping(it, previousDayTrades)),
    mergeMap(it => excludeIndivisibleCoins(it, exchangeInfo)),
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
    .filter(e => e.prices.length >= config.historicData.limit)
}

export function excludeSymbolsIfPriceHasNotDroppedSinceLastPurchase(
  historicPrices: SymbolPrices[],
  unsoldCoins: Observable<Purchase[]>,
  coinPrices: Observable<CoinPrices>
): Observable<SymbolPrices[]> {
  return zip(unsoldCoins, coinPrices).pipe(
    map(([unsold, latestPrices]) => {
      return historicPrices.filter(e => {
        const latestPrice = latestPrices[e.symbol]
        const latestUnsold = unsold
          .sort((a, b) => a.id > b.id ? -1 : 1)
          .find(c => c.symbol === e.symbol)
        const previousBuyPrice = latestUnsold
          ? latestUnsold.buyPrice / latestUnsold.quantity
          : 999999

        return latestPrice < previousBuyPrice * 0.9
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

// Indivisible - meaning you can not sell half a coin
export function excludeIndivisibleCoins(
  historicPrices: SymbolPrices[],
  exchangeInfo: Observable<SymbolInfo[]>
): Observable<SymbolPrices[]> {
  return exchangeInfo.pipe(
    map(it => historicPrices.filter(e => {
      const symbolExchangeInfo = it.find(a => a.symbol === e.symbol)
      if (!symbolExchangeInfo) return false
      const lotSize = symbolExchangeInfo.filters.find(a => a.filterType === 'LOT_SIZE')?.stepSize ?? '1'
      return Number(lotSize) < 1
    }))
  )
}
