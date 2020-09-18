import {from} from 'rxjs'
import {first} from 'rxjs/operators'
import {getRepository} from 'typeorm'
import {Purchase} from '../entity/Purchase'

export function getBoughtCoins() {
  return from(
    getRepository(Purchase).find()
  ).pipe(first())
}
