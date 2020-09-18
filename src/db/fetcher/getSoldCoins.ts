import {from} from 'rxjs'
import {first} from 'rxjs/operators'
import {getRepository, IsNull, Not} from 'typeorm'
import {Purchase} from '../entity/Purchase'

export function getSoldCoins() {
  return from(
    getRepository(Purchase).find({
      where: {
        sell: Not(IsNull())
      }
    })
  ).pipe(first())
}
