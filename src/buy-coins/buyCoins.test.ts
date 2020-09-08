import {calculateHowManyOfEachCoinsToBuy} from './buyCoins'

describe(calculateHowManyOfEachCoinsToBuy, function () {
  it('returns how much to buy', function () {
    const symbolsToBuy = ['a', 'b']
    const coinPrices = {
      'a': 1,
      'b': 2,
      'c': 3
    }
    expect(calculateHowManyOfEachCoinsToBuy(6, symbolsToBuy, coinPrices))
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
    expect(calculateHowManyOfEachCoinsToBuy(1, symbolsToBuy, coinPrices))
      .toEqual({})
  })
  it('returns empty object if there are no symbols to buy', function () {
    const symbolsToBuy: any = []
    const coinPrices = {
      'a': 2,
      'b': 2,
      'c': 1
    }
    expect(calculateHowManyOfEachCoinsToBuy(1, symbolsToBuy, coinPrices))
      .toEqual({})
  })
})
