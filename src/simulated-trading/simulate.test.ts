import {readJSON, readJSONSync} from 'fs-extra'
import {CoinOrder, ExchangeInfo, FillOrder} from 'node-binance-api'
import {from, Observable, of, zip} from 'rxjs'
import {map, mergeMap} from 'rxjs/operators'
import {getExchangeInfo, getPreviousDayTradeStatus, getSymbolsWithPrices, SymbolPrices} from '../binance/binance'
import {buyCoins} from '../buy-coins/buyCoins'
import {config} from '../config/config'
import {printReport} from '../dashboard/dashboard'
import {getUnsoldCoins} from '../db/fetcher/getUnsoldCoins'
import {findInvestmentCandidates} from '../find-coins/findInvestmentCandidates'
import {findCoinsToSell, sellCoins} from '../sell-coins/sellCoins'
import {exchangeInfoFileName, pricesFileName, TOTAL_DAYS} from './fetchAndStoreData'

let BTC_BALANCE = 0.06
export let CURRENT_DAY = 0

jest.mock('../binance/binance', () => {
    const actualBinance = jest.requireActual('../binance/binance')
    return {
      ...actualBinance,
      getAllSymbols: jest.fn(() => {
        return from(readJSON(pricesFileName)).pipe(
          map((it: SymbolPrices[]) => it.map(e => e.symbol))
        )
      }),
      getBalanceForCoin: jest.fn(() => of(BTC_BALANCE)),
      sellAtMarketPrice: jest.fn((symbol: string, quantity: number) => {
          const symbolPrice = (readJSONSync(pricesFileName) as SymbolPrices[])
            .find(e => e.symbol === symbol)
            ?.prices[CURRENT_DAY + config.historicData.limit]
          console.log('sellAtMarketPrice', symbol, Number(symbolPrice), quantity * Number(symbolPrice))
          BTC_BALANCE += quantity * Number(symbolPrice)
          return of({
            fills: [{
              price: symbolPrice ?? '0',
              qty: String(quantity),
              commission: '0'
            } as FillOrder],
            symbol: symbol,
            price: Number(symbolPrice),
            cummulativeQuoteQty: quantity * Number(symbolPrice)
          })
        }
      ),
      getHistoricPricesForSymbols: jest.fn((
        symbols: Array<string>
      ) => {
        return from(readJSON(pricesFileName)).pipe(
          map((it: SymbolPrices[]) => it.reduce((acc, e) => {
            if (symbols.includes(e.symbol)) {
              acc.push({
                symbol: e.symbol,
                prices: e.prices.slice(CURRENT_DAY, CURRENT_DAY + config.historicData.limit)
              })
            }
            return acc
          }, [] as SymbolPrices[]))
        )
      }),
      getSymbolsWithPrices: jest.fn(() => {
        return from(readJSON(pricesFileName)).pipe(
          map((it: SymbolPrices[]) => it.reduce((acc, v) => {
            acc[v.symbol] = v.prices[CURRENT_DAY + config.historicData.limit] ?? 0
            return acc
          }, {} as any))
        )
      }),
      buyAtMarketPrice: jest.fn((symbol: string, quantity: number): Observable<CoinOrder> => {
        const symbolPrice = (readJSONSync(pricesFileName) as SymbolPrices[])
          .find(e => e.symbol === symbol)
          ?.prices[CURRENT_DAY + config.historicData.limit]

        BTC_BALANCE -= (symbolPrice ?? 0) * quantity
        return of({
          fills: [],
          cummulativeQuoteQty: `${(symbolPrice ?? 0) * quantity}`,
          executedQty: `${quantity}`,
          symbol
        })
      }),
      getExchangeInfo: jest.fn(() => {
        return of((readJSONSync(exchangeInfoFileName) as ExchangeInfo).symbols)
      })
    }
  }
)

describe.skip('Simulated trading', function () {
  it('shows results', async done => {
    for (; CURRENT_DAY < TOTAL_DAYS; CURRENT_DAY++) {
      console.log(`CURRENT_DAY: ${CURRENT_DAY} - ${BTC_BALANCE}`)
      await findInvestmentCandidates(
        getUnsoldCoins(),
        getPreviousDayTradeStatus(),
        getSymbolsWithPrices(),
        getExchangeInfo()
      ).pipe(
        // tap(it => {console.log(it, 'done - find')}),
        mergeMap(it => buyCoins(it))
      ).toPromise()

      await zip(getUnsoldCoins(), getSymbolsWithPrices(), getExchangeInfo()).pipe(
        mergeMap(([unsoldCoins, symbolsWithPrices, exchangeInfo]) => {
          const coinsToSell = findCoinsToSell(unsoldCoins, [], symbolsWithPrices)
          // console.log(coinsToSell, 'cts')
          return sellCoins(coinsToSell, exchangeInfo)
        })
      ).toPromise()
    }

    return printReport().toPromise().then(it => {
      console.log(it)
      done()
    })
  }, 600000)
})
