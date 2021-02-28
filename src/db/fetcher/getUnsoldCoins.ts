import {from} from 'rxjs'
import {first} from 'rxjs/operators'
import {getRepository, IsNull} from 'typeorm'
import {FindConditions} from 'typeorm/find-options/FindConditions'
import {Purchase} from '../entity/Purchase'

export function getUnsoldCoins(findConditions?: FindConditions<Purchase>) {
  return from(
    getRepository(Purchase).find({
      where: {
        sell: IsNull(),
        ...findConditions
      }
    })
  ).pipe(first())
}
