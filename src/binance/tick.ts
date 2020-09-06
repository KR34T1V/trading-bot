import {Tick} from 'node-binance-api'
import {linearRegression} from 'simple-statistics'
import {config} from '../config/config'
import {InvestmentCandidate} from '../find-coins/findCoins'
import {SymbolPrices} from './binance'

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
  let lr1, lr2, i = Math.min(prices.length, config.descendingTrendBatchSize)
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

export function getTicksPrices(ticks: Tick[]): number[] {
  return ticks.map((e) => Number(e[4]))
}

export function computeAverage(arr: number[]) {
  if (arr.length === 0) return 0
  return arr.reduce((p, c) => p + c) / arr.length
}
