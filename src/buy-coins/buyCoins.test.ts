import * as asciichart from 'asciichart'
import {of} from 'rxjs'
import {marbles} from 'rxjs-marbles'
import {config} from '../config/config'
import {calculateHowManyOfEachCoinsToBuy, getFundsToInvest} from './buyCoins'

describe(calculateHowManyOfEachCoinsToBuy, function () {
  it('returns how much to buy', function () {
    const symbolsToBuy = ['a', 'b', 'c']
    const coinPrices = {
      'a': 1,
      'b': 5,
      'c': 1,
      'd': 1,
    }
    expect(calculateHowManyOfEachCoinsToBuy({
      fundsToInvest: 7,
      minOrderAmount: 3,
      coinsToBuy: symbolsToBuy,
      coinPrices
    }))
      .toEqual({
        a: 3,
        c: 3
      })
  })
  it('does not overbuy', function () {
    const symbolsToBuy = ['a', 'b', 'c']
    const coinPrices = {
      'a': 1,
      'b': 2,
      'c': 3
    }
    expect(calculateHowManyOfEachCoinsToBuy({
      fundsToInvest: 15,
      minOrderAmount: 3,
      coinsToBuy: symbolsToBuy,
      coinPrices
    }))
      .toEqual({
        a: 3,
        b: 2,
        c: 1
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
      minOrderAmount: 3,
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
      minOrderAmount: 3,
      coinsToBuy: symbolsToBuy,
      coinPrices
    }))
      .toEqual({})
  })
  it('test with real data', function () {
    // { 'PHBBTC': 417, 'SCBTC': 401, 'DOGEBTC': 401, 'XVGBTC': 257 }
    const symbolsToBuy = ['SCBTC', 'DOGEBTC', 'XVGBTC', 'PHBBTC']
    const coinPrices = {
      XVGBTC: 3.9e-7,
      PHBBTC: 2.3e-7,
      DOGEBTC: 2.5e-7,
      SCBTC: 2.5e-7
    }
    const expected = { "DOGEBTC": 408, "PHBBTC": 444, "SCBTC": 408, "XVGBTC": 262 }
    // symbolsToBuy.forEach(s => {
    // //  @ts-ignore
      // console.log(s, coinPrices[s] * expected[s])
    // })
    expect(calculateHowManyOfEachCoinsToBuy({
      fundsToInvest: 0.00057035592,
      minOrderAmount: config.minOrderAmount,
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
      a: 0.004
    })
  }))
})

describe('config - buying coins', function () {
  it('make sure the investemts are spread enough', function () {
    let i = 0, amount = 12000, percent = 0.01
    while (true) {
      if (amount < 1000) {
        break
      }
      amount -= amount * percent
      i += 1
    }
    // console.log(i, amount)
    expect(i > 200).toBeTruthy()
  })
})
