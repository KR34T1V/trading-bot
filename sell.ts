import {zip} from 'rxjs'
import {map, mergeMap, tap} from 'rxjs/operators'
import yargs from 'yargs'
import {getExchangeInfo, getPreviousDayTradeStatus, getSymbolsWithPrices} from './src/binance/binance'
import {dbConnect} from './src/db/dbConnect'
import {getUnsoldCoins} from './src/db/fetcher/getUnsoldCoins'
import {findCoinsToSell, sellCoins} from './src/sell-coins/sellCoins'

const args = yargs
  .usage('Usage: $0 --dryRun')
  .options({
    dryRun: {
      type: 'boolean',
      description: 'Do not buy or sell, only find.',
      alias: 'd'
    }
  })
  .help('help').alias('help', 'h')
  .argv

dbConnect().then(_ => {

  zip(
    zip(
      getUnsoldCoins(),
      getSymbolsWithPrices()
    ).pipe(
      map(([unsoldCoins, symbolPrices]) => {
        return unsoldCoins
          .filter(e => {
            const latestPrice = symbolPrices[e.symbol]
            return e.quantity * latestPrice > 0.0001
          })
      })
    ),
    getPreviousDayTradeStatus(),
    getExchangeInfo(),
    getSymbolsWithPrices()
  ).pipe(
    mergeMap(([unsoldCoins, previousDayTradeStatus, exchangeInfo, latestPrices]) => {
      const coinsToSell = findCoinsToSell(unsoldCoins, previousDayTradeStatus, latestPrices)

      return args.dryRun
        ? coinsToSell
        : sellCoins(coinsToSell, exchangeInfo)
    }),
    tap(it => console.log(it))
  ).subscribe({
    complete: () => console.log('done - selling')
  })
})
