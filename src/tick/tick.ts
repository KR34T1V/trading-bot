import {linearRegression} from 'simple-statistics'
import {binance} from '../binance'

export function latestNPricesWithIndex(ticks, n?: number) {
  return getTicksPrices(ticks)
    .slice(-n)
    .map((e, i) => [i, e])
}

export function getTicksPrices(ticks) {
  return ticks.map((e) => Number(e[4]))
}

// https://simplestatistics.org/docs/#linearregression
export function getDescendingTicks(symbol: string, duration: string = '1d', options?: object) {
  return binance.candlesticks(symbol, duration, false, options)
    .then(ticks => {
      for (let i = 5; i <= 25; i += 5) {
        console.log('prices', latestNPricesWithIndex(ticks))
        console.log('prices', latestNPricesWithIndex(ticks, i))
        let s1 = linearRegression(latestNPricesWithIndex(ticks, i))
        let s2 = linearRegression(latestNPricesWithIndex(ticks, i + 5))
        console.log(s1, s2, 'slope')
        if (s1.m < s2.m) return ticks.slice(-i)
      }
      return ticks
    })
}

export function calculatePriceDecreaseForTicks(ticks: Array<Array<any>>) {
  const prices = getTicksPrices(ticks)
  console.log('prices', prices)
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)
  console.log(minPrice, maxPrice, 'min - max')
  return (minPrice - maxPrice) / maxPrice * 100
}
