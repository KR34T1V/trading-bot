import {from, Observable} from 'rxjs'
import {map} from 'rxjs/operators'
import {ConnectionOptions, createConnection, getRepository} from 'typeorm'
import {ormConfig} from './ormconfig'

export function load<T>(entity: Partial<T>): Observable<T | undefined> {
  return from(createConnection(ormConfig as ConnectionOptions)).pipe(
    map(it => getRepository(typeof entity)),
    map(it => it.findOne(entity) as unknown as T)
  )
}

