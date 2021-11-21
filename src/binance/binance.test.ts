import {of, throwError} from 'rxjs'
import {marbles} from 'rxjs-marbles'
import {buyAtMarketPrice} from './binance'


jest.mock('node-binance-api', () => jest.fn(() => ({
  marketBuy: jest.fn(() => throwError('not good'))
})))

describe(buyAtMarketPrice, () => {
  it('does not fail on exceptions', marbles(m => {
    const subject = buyAtMarketPrice('NNNBTC', 10)
    m.expect(subject).toBeObservable('|')
  }))
})
