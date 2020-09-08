import {calculatePriceFluctuation, computeAverage, detectDescendingTrend, latestNPricesWithIndex} from './tick'

jest.unmock('./tick')

describe(detectDescendingTrend.name, function () {
  const prices = [
    0.00001302, 0.00001313,  0.0000133,
    0.00001282,  0.0000123, 0.00001195,
    0.00001212, 0.00001157, 0.00001371,
    0.00001238, 0.00001208, 0.00001181,
    0.00001176,  0.0000116, 0.00001187,
    0.00001201, 0.00001201, 0.00001229,
    0.00001212, 0.00001204, 0.00001206,
    0.00001189, 0.00000815, 0.00000607,
    0.00000567, 0.00000688, 0.00000574,
    0.00000559, 0.00000479, 0.00000457
  ]
  it('detects descending trend', function () {
    expect(detectDescendingTrend(prices)).toMatchSnapshot()
  })
})

describe('calculatePriceFluctuation', function () {
  it('returns positive value on price increase', function () {
    const prices = [2, 4, 6]
    expect(calculatePriceFluctuation(prices, 0)).toBe(200)
  })
  it('returns negative value on price decrease', function () {
    const prices = [6, 4, 2]
    expect(calculatePriceFluctuation(prices, 1.1)).toBe(-66.66666666666666)
  })
  it('returns zero when price is not changing', function () {
    const prices = [2, 2, 2, 2]
    expect(calculatePriceFluctuation(prices, 0)).toBe(0)
  })
  it('returns 0 when only one price', function () {
    const prices = [1]
    expect(calculatePriceFluctuation(prices, 0)).toBe(0)
  })
  it('should not fail with empty arr', function () {
    const prices: number[] = []
    expect(calculatePriceFluctuation(prices, 0)).toBe(NaN)
  })
})

describe('latestNPricesWithIndex', function () {
  it('returns n latest values', function () {
    const arr = [1,2,3]
    expect(latestNPricesWithIndex(arr, 2)).toEqual([[0,2], [1,3]])
  })
  it('returns all elements when n is missing', function () {
    const arr = [1,2]
    expect(latestNPricesWithIndex(arr)).toEqual([[0,1], [1,2]])
  })
})

describe('computeAverage', function () {
  it('returns average', function () {
    expect(computeAverage([1,2,3])).toBe(2)
  })
  it('returns the number provided when there is only one number', function () {
    expect(computeAverage([3])).toBe(3)
  })
  it('returns 0 when no values given', function () {
    expect(computeAverage([])).toBe(0)
  })
})