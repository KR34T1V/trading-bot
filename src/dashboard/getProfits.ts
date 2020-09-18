import {forkJoin} from 'rxjs'
import {map} from 'rxjs/operators'
import {getInvestedAmount} from './getInvestedAmount'
import {getSoldAmount} from './getSoldAmount'

export function getProfits() {
  return forkJoin([
    getInvestedAmount(),
    getSoldAmount()
  ]).pipe(
    map(([investedAmount, soldAmount]) => soldAmount - investedAmount)
  )
}
