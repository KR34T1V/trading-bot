import {of} from 'rxjs'
import {marbles} from 'rxjs-marbles'
import {config} from '../config/config'
import {calculateHowManyOfEachCoinsToBuy, getFundsToInvest} from './buyCoins'

describe(calculateHowManyOfEachCoinsToBuy, function () {
  it('returns how much to buy', function () {
    const symbolsToBuy = ['a', 'b', 'c']
    const coinPrices = {
      'a': 1,
      'b': 3,
      'c': 1,
      'd': 1
    }
    expect(calculateHowManyOfEachCoinsToBuy({
      fundsToInvest: 25,
      minOrderPrice: 12,
      coinsToBuy: symbolsToBuy,
      coinPrices
    }))
      .toEqual({
        a: 12,
        c: 12
      })
  })
  it('does not overbuy', function () {
    const symbolsToBuy = ['a', 'b', 'c', 'd']
    const coinPrices = {
      'a': 1,
      'b': 2,
      'c': 2,
      'd': 1
    }

    expect(calculateHowManyOfEachCoinsToBuy({
      fundsToInvest: 12 + 24 + 4,
      minOrderPrice: 12,
      coinsToBuy: symbolsToBuy,
      coinPrices
    })).toEqual({
      a: 12,
      d: 12
    })
  })
  it('returns empty object if not enough funds', function () {
    const symbolsToBuy = ['a', 'b']
    const coinPrices = {
      'a': 1,
      'b': 3,
      'c': 4
    }
    expect(calculateHowManyOfEachCoinsToBuy({
      fundsToInvest: 2,
      minOrderPrice: 3,
      coinsToBuy: symbolsToBuy,
      coinPrices
    }))
      .toEqual({})
  })
  it('does not fail with unreal prices', function () {
    const symbolsToBuy: any = []
    const coinPrices = {
      'a': 0,
      'b': -1
    }
    expect(calculateHowManyOfEachCoinsToBuy({
      fundsToInvest: 4,
      minOrderPrice: 3,
      coinsToBuy: symbolsToBuy,
      coinPrices
    }))
      .toEqual({})
  })
  it('test with real data', function () {
    const symbolsToBuy = ['SCBTC', 'DOGEBTC', 'XVGBTC', 'PHBBTC']
    const coinPrices = {
      XVGBTC: 3.9e-7,
      PHBBTC: 2.3e-7,
      DOGEBTC: 2.5e-7,
      SCBTC: 2.5e-7
    }
    const expected = {'DOGEBTC': 801, 'SCBTC': 801}
    expect(calculateHowManyOfEachCoinsToBuy({
      fundsToInvest: 0.00057035592,
      minOrderPrice: 0.0002,
      coinsToBuy: symbolsToBuy,
      coinPrices
    }))
      .toEqual(expected)
  })
})

jest.mock('../binance/binance', () => ({
    getBalanceForCoin: jest.fn(() => of(0.5))
  })
)

describe(getFundsToInvest, function () {
  it('returns amount to invest', marbles(m => {
    m.expect(getFundsToInvest(config.percentToInvest)).toBeObservable('(a|)', {
      a: 0.03
    })
  }))
})
