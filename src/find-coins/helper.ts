import {orderBy} from 'lodash'
import {Observable} from 'rxjs'
import {map} from 'rxjs/operators'
import {linearRegression} from 'simple-statistics'
import {SymbolPrices} from '../binance/binance'
import {config} from '../config/config'
import {Purchase} from '../db/entity/Purchase'
import {InvestmentCandidate} from './findInvestmentCandidates'

export function excludeNonBTCSymbols(symbols: Array<string>): Array<string> {
  return symbols.filter(symbol => symbol.endsWith(config.baseCurrency))
}

type InvestmentCandidateWithBoughtAmount = InvestmentCandidate & {
  boughtAmount: number
}

export function prioritizeWhatCoinsToBuy(
  investmentCandidates: InvestmentCandidate[],
  unsoldCoins: Observable<Purchase[]>
): Observable<InvestmentCandidate[]> {
  return unsoldCoins.pipe(
    map(it => {
      const investmentCandidatesWithAmount = investmentCandidates.map(ic => ({
          ...ic,
          boughtAmount: it.reduce((a, e) => ic.symbol === e.symbol ? a + e.buyPrice : a, 0)
        } as InvestmentCandidateWithBoughtAmount)
      )

      return orderBy(investmentCandidatesWithAmount, ['priceSwing', 'boughtAmount'], ['asc', 'desc'])
        .map(e => {
          // @ts-ignore
          delete e.boughtAmount
          return e
        })
    })
  )
}

export function excludeSymbolsWithTooLowPriceSwing(
  ip: InvestmentCandidate[],
  priceSwing: number
): InvestmentCandidate[] {
  return ip.filter(e => e.priceSwing < priceSwing)
}

export function buildInvestmentCandidates(s: SymbolPrices): InvestmentCandidate {
  let prices = detectDescendingTrend(s.prices)

  const td = calculateTrendDirection(prices)
  return {
    symbol: s.symbol,
    prices: prices,
    maxPrice: Math.max(...prices),
    minPrice: Math.min(...prices),
    slope: linearRegression(latestNPricesWithIndex(prices)).m,
    priceSwing: calculatePriceSwing(prices, td),
    trendDirection: td
  }
}

export function detectDescendingTrend(prices: number[]) {
  let td1, td2, step = Math.min(prices.length, config.detectDescendingSize)

  for (let i = prices.length - 1; i > 0; i -= step * 2) {
    td1 = computeAverage(prices.slice(i - step, i))
    td2 = computeAverage(prices.slice(i - (step * 3), i - (step * 2)))
    i = Math.min(prices.length, i + step)
    if(td2 - td1 < 0) return prices.slice(i - (step * 2), prices.length)
  }
  return prices
}

function calculateTrendDirection(prices: number[]) {
  return computeAverage(prices) / prices[prices.length - 1]
}

export function latestNPricesWithIndex(prices: number[], n?: number) {
  return prices
    .slice(n ? -n : 0)
    .map((e, i) => [i, e])
}

export function calculatePriceSwing(prices: number[], trendDirection: number) {
  const currentPrice = prices[prices.length - 1]
  const previousPrice = trendDirection < 1 ? Math.min(...prices) : Math.max(...prices)

  return (currentPrice - previousPrice) / previousPrice * 100
}

export function computeAverage(arr: number[]) {
  if (arr.length === 0) return 0
  return arr.reduce((p, c) => p + c) / arr.length
}
