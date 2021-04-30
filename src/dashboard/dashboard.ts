import {CoinPrices} from 'node-binance-api'
import {forkJoin} from 'rxjs'
import {map} from 'rxjs/operators'
import {getAccountBalance, getBalanceForCoin, getSymbolsWithPrices} from '../binance/binance'
import {config} from '../config/config'
import {getAdjustedPrices} from './getAdjustedAmount'
import {getAverageProfitPerTransaction} from './getAverageProfitPerTransaction'
import {getInvestedAmount} from './getInvestedAmount'
import {getProfits} from './getProfits'

export function printReport() {
  return forkJoin([
    getBalanceForCoin(config.baseCurrency),
    getInvestedAmount(),
    getAdjustedPrices(getSymbolsWithPrices(), getAccountBalance()),
    getProfits(),
    getAverageProfitPerTransaction(),
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
  averageProfitPerTransaction: number,
  coinPrices: CoinPrices
) {
  const btcPrice = coinPrices['BTCUSDT']
  return `
B + I:    ${convertToUSD(balance + invested, btcPrice)}
Balance:  ${convertToUSD(balance, btcPrice)}
Invested: ${convertToUSD(invested, btcPrice)}
Adjusted: ${convertToUSD(adjusted, btcPrice)}
Profits:  ${convertToUSD(profits, btcPrice)}
Avg Sell%:${averageProfitPerTransaction}
`
}

function convertToUSD(amount: number, btcPrice: number) {
  return `${amount.toFixed(5)}  ${(amount * btcPrice).toFixed(1)}$`
}
