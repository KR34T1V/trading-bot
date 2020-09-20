import {zip} from 'rxjs'
import {map, mergeMap, tap} from 'rxjs/operators'
import yargs from 'yargs'
import {getSymbolsWithPrices} from './src/binance/binance'
import {buyCoins} from './src/buy-coins/buyCoins'
import {printReport} from './src/dashboard/dashboard'
import {dbConnect} from './src/db/dbConnect'
import {getUnsoldCoins} from './src/db/fetcher/getUnsoldCoins'
import {findInvestmentCandidates} from './src/find-coins/findInvestmentCandidates'
import {findCoinsToSell, sellCoins} from './src/sell-coins/sellCoins'
import * as asciichart from 'asciichart'

const args = yargs
  .usage('Usage: $0 --all')
  .options({
    dryRun: {
      type: 'boolean',
      description: 'Do not buy or sell, only find.'
    }
  })
  .help('help').alias('help', 'h')
  .argv

initApp().then(() => {
  runApp()
})

async function initApp() {
  await dbConnect()
}

function runApp() {
  printReport().subscribe(
    it => console.log(it)
  )

  findInvestmentCandidates().pipe(
    tap(it => {
      if (args.dryRun) {
        it.forEach(({symbol, prices, priceSwing}) => {
          console.log(`${symbol}: ${priceSwing}`)
          console.log(asciichart.plot(prices, {height: 10}))
        })
      } else {
        console.log('bought: ', buyCoins(it))
      }
    })
  ).subscribe({
    complete: () => console.log('done - finding/buying')
  })

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
}
