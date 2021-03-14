import {zip} from 'rxjs'
import {mergeMap, tap} from 'rxjs/operators'
import yargs from 'yargs'
import {getAllBTCSymbols, getExchangeInfo, getHistoricPricesForSymbols} from './src/binance/binance'
import {config} from './src/config/config'
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
    getUnsoldCoins(),
    getAllBTCSymbols().pipe(
      mergeMap(it => getHistoricPricesForSymbols(it, config.historicData))
    ),
    getExchangeInfo()
  ).pipe(
    mergeMap(([unsoldCoins, historicPrices, exchangeInfo]) => {
      const coinsToSell = findCoinsToSell(unsoldCoins, historicPrices)

      return args.dryRun
        ? coinsToSell
        : sellCoins(coinsToSell, exchangeInfo)
    }),
    tap(it => console.log(it))
  ).subscribe({
    complete: () => console.log('done - selling')
  })
})
