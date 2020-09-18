import {dbConnect} from '../../db/dbConnect'

beforeAll(async () => {
  await dbConnect()
})

