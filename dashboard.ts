import {zip} from 'rxjs'
import {combineAll, map, mergeMap, tap, withLatestFrom} from 'rxjs/operators'
import yargs from 'yargs'
import {binance, getExchangeInfo, getSymbolsWithPrices} from './src/binance/binance'
import {printReport} from './src/dashboard/dashboard'
import {dbConnect} from './src/db/dbConnect'
import {getUnsoldCoins} from './src/db/fetcher/getUnsoldCoins'
import {findCoinsToSell, sellCoins} from './src/sell-coins/sellCoins'
import { sortBy } from 'lodash'

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

dbConnect().then(conn => {
  printReport().subscribe(
    it => console.log(it)
  )

  zip(getSymbolsWithPrices(), getUnsoldCoins()).pipe(
    map(([prices, coins]) => {
      const sellCandidates = coins.map(c => {
        const buyPrice = c.buyPrice / c.quantity
        return {
          id: c.id,
          symbol: c.symbol,
          buyPrice: buyPrice.toExponential(),
          currentPrice: Number(prices[c.symbol]).toExponential(),
          profit: (prices[c.symbol] - buyPrice) / buyPrice
        }
      })
      return sortBy(sellCandidates, ['profit']).slice(-5)
    }),
    tap(it => it.forEach(e => console.log(e)))
  ).subscribe()
})
