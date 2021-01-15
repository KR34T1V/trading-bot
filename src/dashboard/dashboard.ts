import {CoinPrices} from 'node-binance-api'
import {forkJoin} from 'rxjs'
import {map} from 'rxjs/operators'
import {getBalanceForCoin, getSymbolsWithPrices, SymbolPrices} from '../binance/binance'
import {config} from '../config/config'
import {getAdjustedPrices} from './getAdjustedAmount'
import {getInvestedAmount} from './getInvestedAmount'
import {getProfits} from './getProfits'

export function printReport() {
  return forkJoin([
    getBalanceForCoin(config.baseCurrency),
    getInvestedAmount(),
    getAdjustedPrices(),
    getProfits(),
    getSymbolsWithPrices()
  ]).pipe(
    map(it => getDashBoard(...it))
  )
}

function getDashBoard(
  balance: number,
  invested: number,
  adjusted: number,
  profits: number,
  coinPrices: CoinPrices
) {
  const btcPrice = coinPrices['BTCUSDT']
  return `
B + I:    ${convertToUSD(balance + invested, btcPrice)}
Balance:  ${convertToUSD(balance, btcPrice)}
Invested: ${convertToUSD(invested, btcPrice)}
Adjusted: ${convertToUSD(balance + adjusted, btcPrice)}
Profits:  ${convertToUSD(profits, btcPrice)}
`
}

function convertToUSD(amount: number, btcPrice: number) {
  return amount * btcPrice
}