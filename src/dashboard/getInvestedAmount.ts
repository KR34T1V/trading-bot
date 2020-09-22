import {map} from 'rxjs/operators'
import {getBoughtCoins} from '../db/fetcher/getBoughtCoins'

export function getInvestedAmount() {
  return getBoughtCoins().pipe(
    map(it => it.map(e => e.buyPrice)
      .reduce((a, b) => a + b, 0)
    )
  )
}
