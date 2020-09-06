import {calculateAvailableFundsToInvest, excludeNonBTCSymbols} from './InvestmentPossibility'

jest.unmock('./InvestmentPossibility')

describe(excludeNonBTCSymbols.name, function () {
  it('removes non-BTC symbols', function () {
    const symbols = ['SKYETH', 'WTCBTC']
    expect(excludeNonBTCSymbols(symbols)).toEqual(['WTCBTC'])
  })
})
