import {exec} from 'child_process'
import {zip} from 'rxjs'
import {mergeMap, retry, tap} from 'rxjs/operators'
import yargs from 'yargs'
import {getAllBTCSymbols, getExchangeInfo, getHistoricPricesForSymbols} from './src/binance/binance'
import {config} from './src/config/config'
import {getAverageProfitPerTransaction} from './src/dashboard/getAverageProfitPerTransaction'
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
    findCoinsToSell(
      getUnsoldCoins(),
      getAllBTCSymbols().pipe(
        mergeMap(it => getHistoricPricesForSymbols(it, config.historicData))
      )
    ),
    getExchangeInfo()
  ).pipe(
    mergeMap(([coinsToSell, exchangeInfo]) => {
      return args.dryRun
        ? coinsToSell
        : sellCoins(coinsToSell, exchangeInfo)
    }),
    tap(it => console.log(it))
  ).subscribe()
})
