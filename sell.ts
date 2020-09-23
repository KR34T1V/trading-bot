import {zip} from 'rxjs'
import {map, mergeMap, tap} from 'rxjs/operators'
import yargs from 'yargs'
import {getSymbolsWithPrices} from './src/binance/binance'
import {printReport} from './src/dashboard/dashboard'
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

dbConnect().then(conn => {
  printReport().subscribe(
    it => console.log(it)
  )

  zip(getUnsoldCoins(), getSymbolsWithPrices()).pipe(
    map(it => findCoinsToSell(...it)),
    mergeMap(it => args.dryRun
      ? it
      : sellCoins(it)
    ),
    tap(it => console.log(it))
  ).subscribe({
    complete: () => console.log('done - selling')
  })
})
