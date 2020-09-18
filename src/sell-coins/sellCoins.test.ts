import {CoinPrices} from 'node-binance-api'
import {of} from 'rxjs'
import {getSymbolsWithPrices} from '../binance/binance'
import {dbClear} from '../db/dbClear'
import {dbSave} from '../db/dbSave'
import {Purchase} from '../db/entity/Purchase'
import {getBoughtCoins} from '../db/fetcher/getBoughtCoins'
import {findCoinsToSell, sellCoins} from './sellCoins'

let purchase = new Purchase({
  buyTime: new Date,
  buyPrice: 0.1,
  quantity: 2,
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
    purchase = await dbSave(purchase).toPromise()

    sellCoins(getBoughtCoins(), getSymbolsWithPrices()).subscribe(
      {
        next: (it) => {
          expect(it[0].sell.sellPrice).toBe(coinPrices['ETHBTC'])
        },
        complete: () => done()
      }
    )
  })
})
