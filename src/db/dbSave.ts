import {from, of} from 'rxjs'
import {catchError, first, mergeMap} from 'rxjs/operators'
import {getConnection} from 'typeorm'

export function dbSave<T>(data: T) {
  return from(getConnection().manager.save(data)).pipe(
    first()
  )
}
