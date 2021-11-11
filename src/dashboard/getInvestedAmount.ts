import {map} from 'rxjs/operators'
import {getUnsoldCoins} from '../db/fetcher/getUnsoldCoins'

export function getInvestedAmount() {
  return getUnsoldCoins().pipe(
    map(it => it.map(e => e.buyPrice)
      .reduce((a, b) => a + b, 0)
    )
  )
}
