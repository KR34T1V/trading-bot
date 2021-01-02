import {of, throwError} from 'rxjs'
import {marbles} from 'rxjs-marbles'
import {mockHistoricPrices, mockSymbols} from '../binance/binance.mock'
import {findInvestmentCandidates, InvestmentCandidate} from './findInvestmentCandidates'

jest.mock('../binance/binance', () => ({
    getAllSymbols: jest.fn()
      .mockImplementationOnce(() => of(mockSymbols))
      .mockImplementationOnce(() => throwError('some error')),
    getHistoricPricesForSymbols: jest.fn(() => of(mockHistoricPrices))
  })
)

describe(findInvestmentCandidates, function () {
  it('returns coins to buy', marbles(m => {
    const mockInvestmentCandidate: InvestmentCandidate = {
      symbol: 'ETHBTC',
      prices: [
        0.034282, 0.034767,
        0.036626, 0.037235,
        0.039875, 0.0386,
        0.037616, 0.036882,
        0.032961, 0.034398,
        0.034086, 0.033312,
        0.034332, 0.021
      ],
      maxPrice: 0.039875,
      minPrice: 0.021,
      slope: -0.0006029802197802229,
      priceSwing: -47.33542319749216,
      trendDirection: 1.6529659863945578
    }
    m.expect(findInvestmentCandidates(of([]))).toBeObservable('(a|)', {
      a: [mockInvestmentCandidate]
    })
  }))

  it('returns empty array on error', marbles(m => {
    // @ts-ignore hide the error message
    global.console = {error: jest.fn()}
    m.expect(findInvestmentCandidates(of([]))).toBeObservable('(a|)', {
      a: []
    })
  }))
})
