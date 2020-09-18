import {dbClear} from '../db/dbClear'
import {dbSave} from '../db/dbSave'
import {mockPurchase} from '../db/entity/Purchase.mock'
import {mockSell} from '../db/entity/Sell.mock'
import {getSoldAmount} from './getSoldAmount'

describe(getSoldAmount, function () {
  beforeEach(async () => {
    await dbClear()
  })

  it('returns invested amount', async done => {
    await dbSave(mockPurchase({
      buyTime: new Date,
      buyPrice: 0.1,
      quantity: 1,
      symbol: 'ETHBTC',
      sellPrice: 0.2,
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
      sellPrice: 0.4,
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
      sellPrice: 0.4
    })).toPromise()

    getSoldAmount().subscribe({
      next: it => {
        expect(it).toBe(0.22 + 0.82)
      },
      complete: () => done()
    })
    expect.assertions(1)
  })

})
