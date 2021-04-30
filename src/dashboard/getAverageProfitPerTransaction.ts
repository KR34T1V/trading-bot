import {Observable} from 'rxjs'
import {map} from 'rxjs/operators'
import {getSoldCoins} from '../db/fetcher/getSoldCoins'
import {computePercentIncrease} from '../plugins/math/computePercentIncrease'

export function getAverageProfitPerTransaction(): Observable<number> {
  return getSoldCoins().pipe(
    map(it => {
      const items = it.filter(e => e.sell.sellPrice > 0)
        .map(e => computePercentIncrease(e.buyPrice, e.sell.sellPrice))
        .filter(e => isFinite(e))
      const avgSum = items.reduce((acc, e) => acc + e, 0)

      return avgSum / items.length
    })
  )
}
