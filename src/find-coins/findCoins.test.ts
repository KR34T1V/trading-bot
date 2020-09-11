import {marbles} from 'rxjs-marbles'
import {findInvestmentCandidates, InvestmentCandidate} from './findCoins'

jest.unmock('./findCoins')
jest.unmock('./helper')

describe(findInvestmentCandidates, function () {
  it('returns coins to buy', marbles(m => {
    const investmentCandidate: InvestmentCandidate = {
      symbol: 'ETHBTC',
      prices: [
        0.039875, 0.0386,
        0.037616, 0.036882,
        0.032961, 0.034398,
        0.034086, 0.033312,
        0.034332, 0.031
      ],
      maxPrice: 0.039875,
      minPrice: 0.031,
      slope: -0.0008377090909090931,
      priceSwing: -22.257053291536053,
      trendDirection: 1.1389096774193548
    }
    m.expect(findInvestmentCandidates()).toBeObservable('(a|)', {
      a: [investmentCandidate]
    })
  }))
})
