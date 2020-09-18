import {createConnection} from 'typeorm'

export function dbConnect() {
  return createConnection()
}
