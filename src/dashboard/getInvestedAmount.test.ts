import {dbClear} from '../db/dbClear'
import {dbSave} from '../db/dbSave'
import {mockPurchase} from '../db/entity/Purchase.mock'
import {getInvestedAmount} from './getInvestedAmount'

describe(getInvestedAmount, function () {
  beforeEach(async () => {
    await dbClear()
  })

  it('returns invested amount', async done => {
    await dbSave(mockPurchase({
      buyTime: new Date,
      buyPrice: 0.1,
      quantity: 1,
      symbol: 'ETHBTC',
      sellPrice: 0.2
    })).toPromise()
    await dbSave(mockPurchase({
      buyTime: new Date,
      buyPrice: 0.2,
      quantity: 2,
      symbol: 'ETHBTC2',
      sellPrice: 0.4
    })).toPromise()

    getInvestedAmount().subscribe({
      next: it => {
        expect(it).toBe(0.5)
      },
      complete: () => done()
    })
    expect.assertions(1)
  })

})
