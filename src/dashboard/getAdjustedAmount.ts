import _ from 'lodash'
import {AccountBalance, CoinPrices} from 'node-binance-api'
import {Observable, zip} from 'rxjs'
import {map} from 'rxjs/operators'
import {config} from '../config/config'

export function getAdjustedPrices(
  symbolPrices: Observable<CoinPrices>,
  accountBalance: Observable<AccountBalance>
): Observable<number> {
  return zip(symbolPrices, accountBalance).pipe(
    map(([prices, accountBalance]) => {
      let adjusted = Number(accountBalance[config.baseCurrency].available)
      delete accountBalance[config.baseCurrency]

      _.forOwn(accountBalance, (value, key) => {
        const coinBalance = Number(value.available)
        const adjustedBalance = prices[`${key}${config.baseCurrency}`]
        if (coinBalance && adjustedBalance) {
          adjusted += coinBalance * adjustedBalance
        }
      })
      return adjusted
    })
  )
}
