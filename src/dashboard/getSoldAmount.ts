import {map, tap} from 'rxjs/operators'
import {getSoldCoins} from '../db/fetcher/getSoldCoins'

export function getSoldAmount() {
  return getSoldCoins().pipe(
    map(it => it.map(e => e.sell.sellPrice)
      .reduce((a, b) => a + b, 0)
    )
  )
}
