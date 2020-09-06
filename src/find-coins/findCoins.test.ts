import {excludeNonBTCSymbols, excludeSymbolsWithTooLowPriceSwing} from './helper'

jest.unmock('./findCoins')

describe(excludeNonBTCSymbols.name, function () {
  it('removes non-BTC symbols', function () {
    const symbols = ['SKYETH', 'WTCBTC']
    expect(excludeNonBTCSymbols(symbols)).toEqual(['WTCBTC'])
  })
})

describe(excludeSymbolsWithTooLowPriceSwing, function () {
  it('filters out symbols with a too low price drop', function () {
    const ip = [{
      symbol: 'XVGBTC',
      prices: [
        5.7e-7, 5.9e-7,
        5.7e-7, 5.6e-7,
        5.3e-7, 5.2e-7,
        4.8e-7, 5.1e-7,
        4.6e-7, 4.6e-7
      ],
      maxPrice: 5.9e-7,
      minPrice: 4.6e-7,
      slope: -1.4848484848484848e-8,
      priceSwing: -11.033898305084744,
      trendDirection: 1.141304347826087
    },
      {
        symbol: 'DENTBTC',
        prices: [
          5e-8, 5e-8, 5e-8,
          4e-8, 4e-8, 4e-8,
          4e-8, 5e-8, 4e-8,
          4e-8
        ],
        maxPrice: 5e-8,
        minPrice: 4e-8,
        slope: -9.696969696969645e-10,
        priceSwing: -9.999999999999996,
        trendDirection: 1.0999999999999996
      }]
    expect(excludeSymbolsWithTooLowPriceSwing(ip, -10)).toEqual([ip[0]])
  })
})
