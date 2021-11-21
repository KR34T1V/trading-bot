import {dbClear} from '../db/dbClear'
import {dbSave} from '../db/dbSave'
import {mockPurchase} from '../db/entity/Purchase.mock'
import {mockSell} from '../db/entity/Sell.mock'
import {getSoldAmount} from './getSoldAmount'

describe(getSoldAmount, function () {
  beforeEach(async () => {
    await dbClear()
  })

  it('returns invested amount', async () => {
    await dbSave(mockPurchase({
      buyTime: new Date,
      buyPrice: 0.1,
      quantity: 1,
      symbol: 'ETHBTC',
      sell: mockSell({
        sellTime: new Date(),
        sellPrice: 0.22
      })
    })).toPromise()
    await dbSave(mockPurchase({
      buyTime: new Date,
      buyPrice: 0.2,
      quantity: 2,
      symbol: 'ETHBTC2',
      sell: mockSell({
        sellTime: new Date(),
        sellPrice: 0.41
      })
    })).toPromise()
    await dbSave(mockPurchase({
      buyTime: new Date,
      buyPrice: 0.2,
      quantity: 2,
      symbol: 'ETHBTC3',
    })).toPromise()

    return getSoldAmount()
    .toPromise()
    .then(it => {
      expect(it).toBe(0.22 + 0.41)
    })
    .finally(() => expect.assertions(1))

  })

})
