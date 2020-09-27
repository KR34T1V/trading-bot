import {SymbolPrices} from '../binance/binance'
import {mockPurchase} from '../db/entity/Purchase.mock'
import {InvestmentCandidate} from './findInvestmentCandidates'
import {
  calculatePriceSwing,
  computeAverage,
  detectDescendingTrend,
  excludeNonBTCSymbols,
  excludeSymbolsIfLatestPriceIsNotLowest,
  excludeSymbolsWithTooLowPriceSwing,
  latestNPricesWithIndex,
  prioritizeWhatCoinsToBuy
} from './helper'

describe(excludeNonBTCSymbols.name, function () {
  it('removes non-BTC symbols', function () {
    const symbols = ['SKYETH', 'WTCBTC']
    expect(excludeNonBTCSymbols(symbols)).toEqual(['WTCBTC'])
  })
})

describe(excludeSymbolsIfLatestPriceIsNotLowest.name, function () {
  it('returns only symbols where latest price is lowest', function () {
    const symbolPrices: SymbolPrices[] = [
      {symbol: 'SKYETH2', prices: [1, 2, 3]},
      {symbol: 'SKYETH', prices: [3, 2, 1]},
      {symbol: 'WTCBTC', prices: [1, 2, 1]}
    ]
    expect(excludeSymbolsIfLatestPriceIsNotLowest(symbolPrices)).toEqual(symbolPrices.slice(-2))
  })
})

describe(excludeSymbolsWithTooLowPriceSwing, function () {
  it('filters out symbols with a too low price drop', function () {
    const ip = [{
      symbol: 'XVGBTC',
      prices: [
        5.7e-7, 5.9e-7,
        5.7e-7, 5.6e-7,
        5.3e-7, 5.2e-7,
        4.8e-7, 5.1e-7,
        4.6e-7, 4.6e-7
      ],
      maxPrice: 5.9e-7,
      minPrice: 4.6e-7,
      slope: -1.4848484848484848e-8,
      priceSwing: -11.033898305084744,
      trendDirection: 1.141304347826087
    },
      {
        symbol: 'DENTBTC',
        prices: [
          5e-8, 5e-8, 5e-8,
          4e-8, 4e-8, 4e-8,
          4e-8, 5e-8, 4e-8,
          4e-8
        ],
        maxPrice: 5e-8,
        minPrice: 4e-8,
        slope: -9.696969696969645e-10,
        priceSwing: -9.999999999999996,
        trendDirection: 1.0999999999999996
      }]
    expect(excludeSymbolsWithTooLowPriceSwing(ip, -10)).toEqual([ip[0]])
  })
})

describe(detectDescendingTrend, function () {
  const prices = [
    0.00001302, 0.00001313, 0.0000133,
    0.00001282, 0.0000123, 0.00001195,
    0.00001212, 0.00001157, 0.00001371,
    0.00001238, 0.00001208, 0.00001181,
    0.00001176, 0.0000116, 0.00001187,
    0.00001201, 0.00001201, 0.00001229,
    0.00001212, 0.00001204, 0.00001206,
    0.00001189, 0.00000815, 0.00000607,
    0.00000567, 0.00000688, 0.00000574,
    0.00000559, 0.00000479, 0.00000457
  ]
  it('detects descending trend', function () {
    expect(detectDescendingTrend(prices)).toEqual(prices.slice(-20))
  })
})

describe('calculatePriceFluctuation', function () {
  it('returns positive value on price increase', function () {
    const prices = [2, 4, 6]
    expect(calculatePriceSwing(prices, 0)).toBe(200)
  })
  it('returns negative value on price decrease', function () {
    const prices = [6, 4, 2]
    expect(calculatePriceSwing(prices, 1.1)).toBe(-66.66666666666666)
  })
  it('returns zero when price is not changing', function () {
    const prices = [2, 2, 2, 2]
    expect(calculatePriceSwing(prices, 0)).toBe(0)
  })
  it('returns 0 when only one price', function () {
    const prices = [1]
    expect(calculatePriceSwing(prices, 0)).toBe(0)
  })
  it('should not fail with empty arr', function () {
    const prices: number[] = []
    expect(calculatePriceSwing(prices, 0)).toBe(NaN)
  })
})

describe('latestNPricesWithIndex', function () {
  it('returns n latest values', function () {
    const arr = [1, 2, 3]
    expect(latestNPricesWithIndex(arr, 2)).toEqual([[0, 2], [1, 3]])
  })
  it('returns all elements when n is missing', function () {
    const arr = [1, 2]
    expect(latestNPricesWithIndex(arr)).toEqual([[0, 1], [1, 2]])
  })
})

describe('computeAverage', function () {
  it('returns average', function () {
    expect(computeAverage([1, 2, 3])).toBe(2)
  })
  it('returns the number provided when there is only one number', function () {
    expect(computeAverage([3])).toBe(3)
  })
  it('returns 0 when no values given', function () {
    expect(computeAverage([])).toBe(0)
  })
})

describe(prioritizeWhatCoinsToBuy, function () {
  it('prioritizes coins unbought and with biggest price swing', () => {
    const ic = [
      mockInvestementCandidate({symbol: 'BTCETH1', priceSwing: -2}),
      mockInvestementCandidate({symbol: 'BTCETH2', priceSwing: -1}),
      mockInvestementCandidate({symbol: 'BTCETH3', priceSwing: -10}),
      mockInvestementCandidate({symbol: 'BTCETH4', priceSwing: -5})
    ]
    const unsoldCoins = [
      mockPurchase({symbol: 'BTCETH3', buyPrice: 1})
    ]
    expect(prioritizeWhatCoinsToBuy(ic, unsoldCoins)).toEqual([
      mockInvestementCandidate({symbol: 'BTCETH4', priceSwing: -5}),
      mockInvestementCandidate({symbol: 'BTCETH1', priceSwing: -2}),
      mockInvestementCandidate({symbol: 'BTCETH2', priceSwing: -1}),
      mockInvestementCandidate({symbol: 'BTCETH3', priceSwing: -10})
    ])
  })
})

function mockInvestementCandidate(init: Partial<InvestmentCandidate>): InvestmentCandidate {
  return Object.assign({
    symbol: 'BTCETH',
    prices: [],
    priceSwing: -10,
    minPrice: 2,
    maxPrice: 4,
    slope: 0,
    trendDirection: 0
  }, init)
}
