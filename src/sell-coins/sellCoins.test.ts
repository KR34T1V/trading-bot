import {of} from 'rxjs'
import {getSymbolsWithPrices} from '../binance/binance'
import {dbClear} from '../db/dbClear'
import {dbSave} from '../db/dbSave'
import {mockPurchase} from '../db/entity/Purchase.mock'
import {getUnsoldCoins} from '../db/fetcher/getUnsoldCoins'
import {findCoinsToSell, sellCoins} from './sellCoins'

const purchase = mockPurchase({
  buyTime: new Date,
  buyPrice: 0.1,
  quantity: 1,
  symbol: 'ETHBTC',
  sellPrice: 0.2
})

const coinPrices = {
  'ETHBTC': 0.3
}

jest.mock('../binance/binance', () => ({
    sellAtMarketPrice: jest.fn(() => of({
        symbol: purchase.symbol,
        price: 0.3
      })
    ),
    getSymbolsWithPrices: jest.fn(
      () => of(coinPrices)
    )
  })
)

describe(findCoinsToSell, function () {
  it('returns coins where current-price is higher then sell-price', () => {
    expect(findCoinsToSell([purchase], coinPrices))
      .toEqual([purchase])
  })
})

describe(sellCoins, function () {
  beforeEach(async () => {
    await dbClear()
  })

  it('sells coin and stores sell-price', async done => {
    expect.assertions(1)
    await dbSave(purchase).toPromise()

    sellCoins(getUnsoldCoins(), getSymbolsWithPrices()).subscribe(
      {
        next: (it) => {
          expect(it[0].sell.sellPrice).toBe(coinPrices['ETHBTC'])
        },
        complete: () => done()
      }
    )
  })
})
