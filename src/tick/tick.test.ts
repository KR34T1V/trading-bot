import {calculatePriceFluctuation} from './tick'

describe('calculatePriceDecreaseForTicks', function () {
  it('should return positive value on price increase', function () {
    const prices = [2, 4, 6]
    expect(calculatePriceFluctuation(prices)).toBe(200)
  })
  it('should return negative value on price decrease', function () {
    const prices = [6, 4, 2]
    expect(calculatePriceFluctuation(prices)).toBe(-66.66666666666666)
  })
  it('should return zero when price is not changing', function () {
    const prices = [2,2,2,2]
    expect(calculatePriceFluctuation(prices)).toBe(0)
  })
  it('should not fail with empty arr', function () {
    const prices: number[] = []
    expect(calculatePriceFluctuation(prices)).toBe(NaN)
  })
})
