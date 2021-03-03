import {of, throwError} from 'rxjs'
import {marbles} from 'rxjs-marbles'
import {SymbolPrices} from '../binance/binance'
import {mockHistoricPrices, mockSymbols, stubPreviousDayResult} from '../binance/binance.mock'
import {excludeSymbolsWithLowPrices, findInvestmentCandidates, InvestmentCandidate} from './findInvestmentCandidates'

jest.mock('../binance/binance', () => ({
    getAllSymbols: jest.fn()
      .mockImplementationOnce(() => of(mockSymbols))
      .mockImplementationOnce(() => throwError('some error')),
    getHistoricPricesForSymbols: jest.fn(() => of(mockHistoricPrices))
  })
)

describe(findInvestmentCandidates, function () {
  it('returns coins to buy', marbles(m => {
    const coinPrices = {
      'ETHBTC': 0.039875
    }
    const mockInvestmentCandidate: InvestmentCandidate = {
      'symbol': 'ETHBTC',
      'prices': [
        0.033662, 0.03383,
        0.034282, 0.034767,
        0.036626, 0.037235,
        0.039875, 0.0386,
        0.037616, 0.036882,
        0.032961, 0.034398,
        0.034086, 0.033312,
        0.034332, 0.021
      ],
      'maxPrice': 0.039875,
      'minPrice': 0.021,
      'slope': -0.0003634294117647067,
      'priceSwing': -47.33542319749216,
      'trendDirection': 1.6472142857142857
    }
    const previousDayTrades = of([
      stubPreviousDayResult({symbol: 'ETHBTC', priceChangePercent: '0'})
    ])
    m.expect(findInvestmentCandidates(of([]), previousDayTrades, of(coinPrices))).toBeObservable('(a|)', {
      a: [mockInvestmentCandidate]
    })
  }))
})

describe(excludeSymbolsWithLowPrices, function () {
  it('excludes symbols if the price is too low', function () {
    const symbolPrices: SymbolPrices[] = [
      {symbol: 'SKYET2', prices: [0.0000010]},
      {symbol: 'SKYETH', prices: [0.0000009]},
      {symbol: 'WTCBTC', prices: [0.0000008]}
    ]
    expect(excludeSymbolsWithLowPrices(symbolPrices)).toEqual([symbolPrices[0]])
  })
})
