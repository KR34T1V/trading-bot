import {zip} from 'rxjs'
import {map} from 'rxjs/operators'
import {getSymbolsWithPrices} from '../binance/binance'
import {getUnsoldCoins} from '../db/fetcher/getUnsoldCoins'

export function getAdjustedPrices() {
  return zip(getSymbolsWithPrices(), getUnsoldCoins()).pipe(
    map(([prices, coins]) => {
      return coins.map(c => {
        const buyPrice = c.buyPrice / c.quantity
        const priceChange = (prices[c.symbol] - buyPrice) / buyPrice
        return (buyPrice + (buyPrice * priceChange)) * c.quantity
      }).reduce((a, e) => a + e)
    })
  )
}
