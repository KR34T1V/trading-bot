import {linearRegression} from 'simple-statistics'
import {SymbolPrices} from '../binance/binance'
import {config} from '../config/config'
import {InvestmentCandidate} from './findCoins'

export function excludeNonBTCSymbols(symbols: Array<string>): Array<string> {
  return symbols.filter(symbol => symbol.endsWith(config.baseCurrency))
}

export function sortInvestPossibilityByPriceAscending(ip: InvestmentCandidate[]) {
  return ip.sort((a, b) => (
    a.priceSwing > b.priceSwing)
    ? 1
    : -1
  )
}

export function excludeSymbolsIfLatestPriceIsNotLowest(sp: SymbolPrices[]) {
  return sp.filter(e => e.prices[e.prices.length - 1] === Math.min(...e.prices))
}

export function excludeSymbolsWithTooLowPriceSwing(ip: InvestmentCandidate[], priceSwing: number) {
  return ip.filter(e => e.priceSwing < priceSwing)
}

export function buildInvestmentPossibilities(s: SymbolPrices): InvestmentCandidate {
  let prices = detectDescendingTrend(s.prices)

  const td = calculateTrendDirection(prices)
  return {
    symbol: s.symbol,
    prices: prices,
    maxPrice: Math.max(...prices),
    minPrice: Math.min(...prices),
    slope: linearRegression(latestNPricesWithIndex(prices)).m,
    priceSwing: calculatePriceFluctuation(prices, td),
    trendDirection: td
  }
}

export function detectDescendingTrend(prices: number[]) {
  let lr1, lr2, i = Math.min(prices.length, config.descendingTrendSliceSize)
  do {
    lr1 = linearRegression(latestNPricesWithIndex(prices, i))
    lr2 = linearRegression(latestNPricesWithIndex(prices, i + i))
    i = Math.min(prices.length, i + i)
  } while (lr2.m > lr1.m)
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

export function calculatePriceFluctuation(prices: number[], trendDirection: number) {
  const currentPrice = prices[prices.length - 1]
  const previousPrice = trendDirection < 1 ? Math.min(...prices) : Math.max(...prices)

  return (currentPrice - previousPrice) / previousPrice * 100
}

export function computeAverage(arr: number[]) {
  if (arr.length === 0) return 0
  return arr.reduce((p, c) => p + c) / arr.length
}
