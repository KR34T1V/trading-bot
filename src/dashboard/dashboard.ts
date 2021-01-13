import {forkJoin} from 'rxjs'
import {map} from 'rxjs/operators'
import {getBalanceForCoin} from '../binance/binance'
import {config} from '../config/config'
import {getInvestedAmount} from './getInvestedAmount'
import {getProfits} from './getProfits'

export function printReport() {
  return forkJoin([
    getBalanceForCoin(config.baseCurrency),
    getInvestedAmount(),
    getProfits()
  ]).pipe(
    map(it => getDashBoard(...it))
  )
}

function getDashBoard(
  balance: number,
  invested: number,
  profits: number
) {
  return `
B + I:    ${balance + invested}
Balance:  ${balance}
Invested: ${invested}
Profits:  ${profits}
`
}
