import * as fs from 'fs-extra'
import {linearRegression, max} from 'simple-statistics'
import {getTicksPrices, latestNPricesWithIndex} from './src/tick/tick'

const Binance = require('node-binance-api')
const binance = new Binance().options({
  APIKEY: 'Gvp1asgJcxL5U4ZJKRFaEeTY0D5xmdsl9WCFTHrDU7Y6MIWmmkChEmeU01bmNHpF',
  APISECRET: 'HgqsIGFLTxioxWwns3BCcXuF81mFS7drmq33nlwLfUadumlar2BYi057p9NIe2V0'
})

const config = {
  minVolume: 10000, // remove symbols with lower volume
  baseCurrency: 'BTC',
  conversionRate: '' // 0 || Date.bought - Date.sold / profit
}


// https://simplestatistics.org/docs/#linearregression
function getDescendingTicks(symbol: string, duration: string = '1d', options?: object) {
  return binance.candlesticks(symbol, duration, false, options)
    .then(ticks => {
      for (let i = 5; i<=25; i+=5) {
        console.log('prices', latestNPricesWithIndex(ticks))
        console.log('prices', latestNPricesWithIndex(ticks, i))
        let s1 = linearRegression(latestNPricesWithIndex(ticks, i))
        let s2 = linearRegression(latestNPricesWithIndex(ticks, i+5))
        console.log(s1, s2, 'slope')
        if (s1.m < s2.m) return ticks.slice(-i)
      }
      return ticks
    })
}

getDescendingTicks('ETHBTC', '1d', {limit: 30})
  .then(ticks => {console.log(`ETHBTC: ${calculatePriceDecreaseForTicks(ticks).toFixed(2)}%`); return ticks})

function calculatePriceDecreaseForTicks(ticks: Array<Array<any>>) {
  const prices = getTicksPrices(ticks)
  console.log('prices', prices)
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)
  console.log(minPrice, maxPrice, 'min - max')
  return (minPrice - maxPrice) / maxPrice * 100
}

// binance.prices()
//   .then(excludeNonBTCSymbols)
//   .then(response => {console.log(response); return response})
//   .then(it => saveToFile(it, 'test.json'))
//   .then()

function excludeNonBTCSymbols(prices: Object) {
  return Object.keys(prices)
    .filter(key => key.endsWith(config.baseCurrency))
    .reduce((obj, key) => {
      obj[key] = prices[key];
      return obj;
    }, {})
}

function saveToFile(data: Object, fileName: string) {
  fs.writeJson(fileName, data, err => {
    if (err) return console.error(err)
    console.log('success!')
  })
  return data
}


async function getPrices() {
  let deltas = []
  let prices = await binance.prices()
  for (let [symbol, currentPrice] of Object.entries(prices)) {
    // console.log(symbol + ':' + price);
    await binance.candlesticks(symbol, '1d', (error, ticks, symbol) => {
      // console.info("candlesticks()", ticks);
      let oldestTick = ticks[0]
      let [time, open, high, low, close, volume, closeTime, assetVolume, trades, buyBaseVolume, buyAssetVolume, ignored] = oldestTick
      let delta = ((Number(currentPrice) / close)).toString()
      console.info(symbol + ': ' + delta)
      deltas.push({symbol, delta, volume})
    }, {limit: 90})
  }
  console.log('end get')
}

// getPrices()

type Symbol = {
  symbol: string
  delta: number
  volume: number
}
//
// fs.readJSON('delta.json').then((prices) => {
//   const deltas = Object.values(prices)
//     .sort((a: Symbol, b: Symbol) => (a.delta > b.delta) ? 1 : -1)
//     // .filter((s: Symbol) => s.volume > config.minVolume)
//   fs.writeJson('./sort-delta.json', deltas, err => {
//     if (err) return console.error(err)
//     // console.log('success!')
//   })
// })
//
