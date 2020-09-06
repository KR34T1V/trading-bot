import {getAllSymbols, getHistoricPricesForSymbols} from './src/binance/binance'
import {buildInvestmentPossibilities} from './src/binance/tick'
import {
  excludeNonBTCSymbols, excludeSymbolsIfLatestPriceIsNotLowest,
  sortInvestPossibilityByPriceAscending
} from './src/investment-posibility/InvestmentPossibility'


function getPrices() {
  return getAllSymbols()
    .then(excludeNonBTCSymbols)
    // .then(it => it.slice(0, 30))
    .then(getHistoricPricesForSymbols)
    .then(excludeSymbolsIfLatestPriceIsNotLowest)
    // .then((it: any) => saveToFile(it, 'test.json'))
    // .then((it: any) => {console.log(it, 'before');return it})
    .then(it => it.map(buildInvestmentPossibilities))
    .then(sortInvestPossibilityByPriceAscending)
    .then(it => console.log(it, 'end'))
}

getPrices()
