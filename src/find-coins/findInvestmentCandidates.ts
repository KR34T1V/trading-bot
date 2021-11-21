import _ from 'lodash'
import {CoinPrices, SymbolInfo} from 'node-binance-api'
import {Observable, zip} from 'rxjs'
import {map, mergeMap} from 'rxjs/operators'
import {getAllSymbols, getBalanceForCoin, getHistoricPricesForSymbols, SymbolPrices} from '../binance/binance'
import {config} from '../config/config'
import {getInvestedAmount} from '../dashboard/getInvestedAmount'
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
  coinPrices: Observable<CoinPrices>,
  exchangeInfo: Observable<SymbolInfo[]>
): Observable<InvestmentCandidate[]> {
  return getAllSymbols().pipe(
    map(excludeNonBTCSymbols),
    mergeMap(it => getHistoricPricesForSymbols(it, config.historicData)),
    map(excludeSymbolsIfPriceStillDropping),
    mergeMap(it => excludeSymbolsIfPriceHasNotDroppedSinceLastPurchase(it, unsoldCoins, coinPrices)),
    mergeMap(it => excludeExpensiveIndivisibleCoins(it, exchangeInfo, coinPrices)),
    map(it => it.map(buildInvestmentCandidates)),
    map(it => excludeSymbolsWithTooLowPriceSwing(it, config.priceSwing)),
    mergeMap(it => prioritizeWhatCoinsToBuy(it, unsoldCoins))
  )
}

export function excludeSymbolsIfPriceHasNotDroppedSinceLastPurchase(
  historicPrices: SymbolPrices[],
  unsoldCoins: Observable<Purchase[]>,
  coinPrices: Observable<CoinPrices>
): Observable<SymbolPrices[]> {
  return zip(
    unsoldCoins,
    coinPrices,
    getBalanceForCoin(config.baseCurrency),
    getInvestedAmount(),
    ).pipe(
    map(([unsold, latestPrices, availableFunds, investedFunds]) => {
      return historicPrices.filter(e => {
        const latestPrice = latestPrices[e.symbol]
        const latestUnsold = unsold
          .sort((a, b) => a.id > b.id ? -1 : 1)
          .find(c => c.symbol === e.symbol)
        const previousBuyPrice = latestUnsold
          ? latestUnsold.buyPrice / latestUnsold.quantity
          : 999999

        return latestPrice < previousBuyPrice * lerp(0.7, 0.9, availableFunds/investedFunds)
      })
    })
  )
}

// https://www.trysmudford.com/blog/linear-interpolation-functions/
function lerp(a: number, b: number, amount: number): number {
  return (1 - amount) * a + amount * b
}

export function excludeSymbolsIfPriceStillDropping(
  historicPrices: SymbolPrices[]
): SymbolPrices[] {
  return historicPrices.filter(hp => {
    const [currentPrice, previousPrice] = _.takeRight(hp.prices, 2)
    return currentPrice < previousPrice
  })
}

// Indivisible - meaning you can not sell half a coin
export function excludeExpensiveIndivisibleCoins(
  historicPrices: SymbolPrices[],
  exchangeInfo: Observable<SymbolInfo[]>,
  coinPrices: Observable<CoinPrices>,
): Observable<SymbolPrices[]> {
  return zip(exchangeInfo, coinPrices).pipe(
    map(([ei, latestPrices]) => historicPrices.filter(e => {
      const symbolExchangeInfo = ei.find(a => a.symbol === e.symbol)
      const coinPrice = latestPrices[e.symbol]
      if (!symbolExchangeInfo) return false
      const lotSize = symbolExchangeInfo.filters.find(a => a.filterType === 'LOT_SIZE')?.stepSize ?? '1'

      return Number(lotSize) < 1
        || (Number(lotSize) === 1 && coinPrice < config.minOrderAmount / 12)
    }))
  )
}
