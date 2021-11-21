import {dbClear} from '../db/dbClear'
import {dbSave} from '../db/dbSave'
import {mockPurchase} from '../db/entity/Purchase.mock'
import {getInvestedAmount} from './getInvestedAmount'

describe(getInvestedAmount, function () {
  beforeEach(async () => {
    await dbClear()
  })

  it('returns invested amount', async () => {
    await dbSave(mockPurchase({
      buyTime: new Date,
      buyPrice: 0.1,
      quantity: 1,
      symbol: 'ETHBTC',
    })).toPromise()
    await dbSave(mockPurchase({
      buyTime: new Date,
      buyPrice: 0.4,
      quantity: 2,
      symbol: 'ETHBTC2',
    })).toPromise()

    return getInvestedAmount()
    .toPromise()
    .then(it => {
      expect(it).toBe(0.5)
    })
    .finally(() => expect.assertions(1))
  })

})
