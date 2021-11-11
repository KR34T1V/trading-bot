import {computePercentIncrease} from './computePercentIncrease'

describe(computePercentIncrease, function () {
  it('calculates percent increase', () => {
    expect(computePercentIncrease(2,3))
      .toBe(0.5)
    expect(computePercentIncrease(0.00010235,0.00014919))
      .toBe(0.45764533463605284)
    expect(computePercentIncrease(0.00014919, 0.00010235))
      .toBe(-0.3139620618003888)
  })
})
