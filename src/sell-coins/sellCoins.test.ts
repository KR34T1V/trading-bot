import {CoinOrder, SymbolInfo} from 'node-binance-api'
import {of} from 'rxjs'
import {dbClear} from '../db/dbClear'
import {dbSave} from '../db/dbSave'
import {mockPurchase} from '../db/entity/Purchase.mock'
import {findCoinsToSell, sellCoins} from './sellCoins'

const purchase = mockPurchase({
  buyTime: new Date,
  buyPrice: 0.1,
  quantity: 1,
  symbol: 'ETHBTC',
  sellPrice: 0.3
})

const purchase2 = mockPurchase({
  buyTime: new Date,
  buyPrice: 0.12,
  quantity: 1,
  symbol: 'ETHBTC',
  sellPrice: 0.2
})

const coinPrices = {
  'ETHBTC': 0.3
}

jest.mock('../binance/binance', () => ({
    sellAtMarketPrice: jest.fn()
      .mockImplementationOnce(() => of({
        symbol: purchase.symbol,
        price: 0.3,
        cummulativeQuoteQty: '1',
        fills: [{price: '0.3', qty: '1', commission: '0.1'}],
        executedQty: '1'
      } as CoinOrder))
      .mockImplementationOnce(() => of({
        symbol: purchase.symbol,
        price: 0.2,
        cummulativeQuoteQty: '1',
        fills: [{price: '0.2', qty: '1', commission: '0.1'}],
        executedQty: '1'
      } as CoinOrder)),
    getSymbolsWithPrices: jest.fn(
      () => of(coinPrices)
    ),
    roundStep: jest.fn(() => 1)
  })
)

describe(findCoinsToSell, function () {
  it('returns coins where current-price is higher than sell-price', () => {
    expect(findCoinsToSell([purchase], coinPrices))
      .toEqual([purchase])
  })
})

describe(sellCoins, function () {
  beforeEach(async () => {
    await dbClear()
  })

  it('sells coin and stores sell-price', async done => {
    expect.assertions(2)
    const unsoldPurchase1 = await dbSave(purchase).toPromise()
    const unsoldPurchase2 = await dbSave(purchase2).toPromise()
    const exchangeInfo = {
      symbol: 'ETHBTC',
      filters: [
        {
          stepSize: '1',
          filterType: 'LOT_SIZE'
        }
      ]
    } as SymbolInfo

    sellCoins([unsoldPurchase1, unsoldPurchase2], [exchangeInfo]).subscribe(
      {
        next: (it) => {
          expect(it[0].sell.sellPrice).toBe(0.3)
          expect(it[1].sell.sellPrice).toBe(0.2)
        },
        complete: () => done()
      }
    )
  })
})
