import {orderBy} from 'lodash'
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
  unsoldCoins: Purchase[]
): InvestmentCandidate[] {
  const investmentCandidatesWithAmount = investmentCandidates.map(ic => ({
      ...ic,
      boughtAmount: unsoldCoins.reduce((a, e) => ic.symbol === e.symbol ? a + e.buyPrice : a, 0)
    } as InvestmentCandidateWithBoughtAmount)
  )

  return orderBy(investmentCandidatesWithAmount, ['boughtAmount', 'priceSwing'], ['desc', 'desc'])
    .map(e => {
      delete e.boughtAmount
      return e
    })
}

export function excludeSymbolsIfLatestPriceIsNotLowest(sp: SymbolPrices[]) {
  return sp.filter(e => e.prices[e.prices.length - 1] === Math.min(...e.prices))
}

export function excludeSymbolsWithTooLowPriceSwing(ip: InvestmentCandidate[], priceSwing: number) {
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
  let td1, td2, i = Math.min(prices.length, config.detectDescendingSize)
  let step = i
  do {
    td1 = computeAverage(prices.slice(-i, -i * 2))
    td2 = computeAverage(prices.slice(-i * 2, -i * 3))
    i = Math.min(prices.length, i + step)
  } while (td2 - td1 > 0)
  return prices.slice(-i)
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
