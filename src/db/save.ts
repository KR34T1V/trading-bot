import {from} from 'rxjs'
import {mapTo, tap} from 'rxjs/operators'
import {ConnectionOptions, createConnection} from 'typeorm'
import {ormConfig} from './ormconfig'

export function save<T>(data: T) {
  return from(createConnection(ormConfig as ConnectionOptions)).pipe(
    tap(it => it.manager.save(data)),
    mapTo(data)
  )
}
