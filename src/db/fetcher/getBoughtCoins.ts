import {from} from 'rxjs'
import {first} from 'rxjs/operators'
import {getRepository, IsNull} from 'typeorm'
import {Purchase} from '../entity/Purchase'

export function getBoughtCoins() {
  return from(
    getRepository(Purchase).find({
      where: {
        sell: IsNull()
      }
    })
  ).pipe(
    first()
  )
}
