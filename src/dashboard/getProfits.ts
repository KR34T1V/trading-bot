import {Observable} from 'rxjs'
import {map} from 'rxjs/operators'
import {getSoldCoins} from '../db/fetcher/getSoldCoins'

export function getProfits(): Observable<number> {
  return getSoldCoins().pipe(
    map(it => it.reduce((acc, v) => acc += v.sell.sellPrice - v.buyPrice, 0))
  )
}
