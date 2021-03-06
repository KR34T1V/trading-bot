import {SymbolInfo} from 'node-binance-api'
import {of, throwError} from 'rxjs'
import {marbles} from 'rxjs-marbles'
import {SymbolPrices} from '../binance/binance'
import {mockHistoricPrices, mockSymbols} from '../binance/binance.mock'
import {excludeExpensiveIndivisibleCoins, excludeSymbolsWithLowPrices} from './findInvestmentCandidates'

jest.mock('../binance/binance', () => ({
    getAllSymbols: jest.fn()
      .mockImplementationOnce(() => of(mockSymbols))
      .mockImplementationOnce(() => throwError('some error')),
    getHistoricPricesForSymbols: jest.fn(() => of(mockHistoricPrices))
  })
)

const coinPrices = {
  'ETHBTC': 0.00039875,
  'SKYETH': 0.000009,
  'SKYET2': 0.000009,
  'SKYET3': 0.0002
}

describe(excludeSymbolsWithLowPrices, function () {
  // TODO: find out what's wrong with `map` in `findInvestmentCandidates`
  it.skip('excludes symbols if the price is too low', function () {
    const symbolPrices: SymbolPrices[] = [
      {symbol: 'SKYET2', prices: [0.0000010]},
      {symbol: 'SKYETH', prices: [0.0000009]},
      {symbol: 'WTCBTC', prices: [0.0000008]}
    ]
    expect(excludeSymbolsWithLowPrices(symbolPrices)).toEqual([symbolPrices[0]])
  })
})

describe(excludeExpensiveIndivisibleCoins, function () {
  it('excludes expensive indivisible coins', marbles(m => {
    const symbolPrices: SymbolPrices[] = [
      {symbol: 'SKYET2', prices: [0.0000010]},
      {symbol: 'SKYETH', prices: [0.0000009]},
      {symbol: 'WTCBTC', prices: [0.0000008]}
    ]
    const exchangeInfo: SymbolInfo[] = [
      // @ts-ignore
      {
        symbol: 'SKYETH',
        filters: [
          {
            filterType: 'LOT_SIZE',
            stepSize: '0.01',
            maxQty: '1',
            minQty: '1'
          }
        ]
      },
      // @ts-ignore
      {
        symbol: 'SKYET2',
        filters: [
          {
            filterType: 'LOT_SIZE',
            stepSize: '1.000',
            maxQty: '1',
            minQty: '1'
          }
        ]
      },
      // @ts-ignore
      {
        symbol: 'SKYET3',
        filters: [
          {
            filterType: 'LOT_SIZE',
            stepSize: '1.000',
            maxQty: '1',
            minQty: '1'
          }
        ]
      }
    ]
    m.expect(excludeExpensiveIndivisibleCoins(symbolPrices, of(exchangeInfo), of(coinPrices)))
      .toBeObservable('(a|)', {
      a: symbolPrices.slice(0, 2)
    })
  }))
})
