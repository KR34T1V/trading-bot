import {marbles} from 'rxjs-marbles'
import {calculateHowManyOfEachCoinsToBuy, getFundsToInvest} from './buyCoins'

jest.unmock('./buyCoins')

describe(calculateHowManyOfEachCoinsToBuy, function () {
  it('returns how much to buy', function () {
    const symbolsToBuy = ['a', 'b']
    const coinPrices = {
      'a': 1,
      'b': 2,
      'c': 3
    }
    expect(calculateHowManyOfEachCoinsToBuy({
      fundsToInvest: 6,
      coinsToBuy: symbolsToBuy,
      coinPrices
    }))
      .toEqual({
        a: 3,
        b: 1
      })
  })
  it('returns empty object if not enough funds', function () {
    const symbolsToBuy = ['a', 'b']
    const coinPrices = {
      'a': 2,
      'b': 2,
      'c': 1
    }
    expect(calculateHowManyOfEachCoinsToBuy({
      fundsToInvest: 1,
      coinsToBuy: symbolsToBuy,
      coinPrices
    }))
      .toEqual({})
  })
  it('returns empty object if there are no symbols to buy', function () {
    const symbolsToBuy: any = []
    const coinPrices = {
      'a': 2,
      'b': 2,
      'c': 1
    }
    expect(calculateHowManyOfEachCoinsToBuy({
      fundsToInvest: 1,
      coinsToBuy: symbolsToBuy,
      coinPrices
    }))
      .toEqual({})
  })
})

describe(getFundsToInvest, function () {
  it('returns amount to invest', marbles(m => {
    m.expect(getFundsToInvest()).toBeObservable('(a|)', {
      a: 0.25
    })
  }))
})
