import {of} from 'rxjs'
import {concatMap, mergeMap} from 'rxjs/operators'
import {dbClear} from './dbClear'
import {dbSave} from './dbSave'
import {mockPurchase} from './entity/Purchase.mock'
import {getBoughtCoins} from './fetcher/getBoughtCoins'

describe(dbSave, () => {
  beforeEach(async () => {
    await dbClear()
  })

  it('saves multiple entries at once', async () => {
    const mockPurchase1 = mockPurchase({
      buyTime: new Date,
      buyPrice: 0.1,
      quantity: 1,
      symbol: 'ETHBTC',
    })
    const mockPurchase2 = mockPurchase({
      buyTime: new Date,
      buyPrice: 0.1,
      quantity: 1,
      symbol: 'ETHBTC',
    })
    const mockPurchase3 = mockPurchase({
      buyTime: new Date,
      buyPrice: 0.1,
      quantity: 1,
      symbol: 'ETHBTC',
    })
    await of(mockPurchase1, mockPurchase2, mockPurchase3).pipe(
      concatMap(it => dbSave(it))
    ).toPromise()

    return getBoughtCoins()
    .toPromise()
    .then(it => expect(it.length).toBe(3))
    .finally(() => expect.assertions(1))
  })
})
