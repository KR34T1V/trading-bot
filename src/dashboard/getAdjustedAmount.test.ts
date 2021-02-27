import {AccountBalance, CoinPrices} from 'node-binance-api'
import {of} from 'rxjs'
import {marbles} from 'rxjs-marbles'
import {getAccountBalance, getSymbolsWithPrices, SymbolPrices} from '../binance/binance'
import {getAdjustedPrices} from './getAdjustedAmount'

describe(getAdjustedPrices, function () {
  it('converts all coins to BTC', marbles(m => {
    const symbolPrices = of({
      'ETHBTC': 2,
    } as CoinPrices)
    const accountBalance = of({
      'BTC': {available: '10', onOrder: '0'},
      'ETH': {available: '10', onOrder: '0'},
      'NONE': {available: '10', onOrder: '0'}
    } as AccountBalance)
    m.expect(getAdjustedPrices(symbolPrices, accountBalance)).toBeObservable('(a|)',{
      a: 30
    })
  }))
})
