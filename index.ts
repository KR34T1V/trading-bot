import * as fs from 'fs-extra'
import {binance} from './src/binance'
import {calculatePriceDecreaseForTicks, getDescendingTicks} from './src/tick/tick'

const config = {
  minVolume: 10000, // remove symbols with lower volume
  baseCurrency: 'BTC',
  conversionRate: '' // 0 || Date.bought - Date.sold / profit
}


getDescendingTicks('ETHBTC', '1d', {limit: 30})
  .then(ticks => {console.log(`ETHBTC: ${calculatePriceDecreaseForTicks(ticks).toFixed(2)}%`); return ticks})

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
