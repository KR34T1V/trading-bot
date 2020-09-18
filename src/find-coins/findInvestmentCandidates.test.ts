import {of} from 'rxjs'
import {marbles} from 'rxjs-marbles'
import {mockHistoricPrices, mockSymbols} from '../binance/binance.mock'
import {findInvestmentCandidates, InvestmentCandidate} from './findInvestmentCandidates'

const coinPrices = {
  'ETHBTC': 0.3
}

jest.mock('../binance/binance', () => ({
    getAllSymbols: jest.fn(() => of(mockSymbols)),
    getHistoricPricesForSymbols: jest.fn(() => of(mockHistoricPrices))
  })
)

describe(findInvestmentCandidates, function () {
  it('returns coins to buy', marbles(m => {
    const mockInvestmentCandidate: InvestmentCandidate = {
      symbol: 'ETHBTC',
      prices: [
        0.036626, 0.037235,
        0.039875, 0.0386,
        0.037616, 0.036882,
        0.032961, 0.034398,
        0.034086, 0.033312,
        0.034332, 0.031
      ],
      maxPrice: 0.039875,
      minPrice: 0.031,
      slope: -0.0005947517482517498,
      priceSwing: -22.257053291536053,
      trendDirection: 1.1476424731182797
    }
    m.expect(findInvestmentCandidates()).toBeObservable('(a|)', {
      a: [mockInvestmentCandidate]
    })
  }))
})
