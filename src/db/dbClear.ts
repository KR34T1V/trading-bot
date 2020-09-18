import {getConnection, getRepository} from 'typeorm'

export function dbClear() {
  return getConnection().entityMetadatas.map(e => {
    return getRepository(e.name).query(`DELETE FROM ${e.tableName}`)
  })
}
