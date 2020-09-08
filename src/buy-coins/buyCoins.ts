import {CoinPrices} from 'node-binance-api'
import {binance, getBalanceForCoin} from '../binance/binance'
import {config} from '../config/config'
import {findCoinsToBuy} from '../find-coins/findCoins'

export function getAvailableFundsToInvest(): number {
  return Number(getBalanceForCoin(config.baseCurrency)) * config.percentToInvest
}

function getLatestPrices(): Promise<CoinPrices> {
  return binance.prices()
}

export function buyCoins(symbols: Array<string>) {
  Promise.all([getAvailableFundsToInvest(), findCoinsToBuy(), getLatestPrices()])
    .then(it => calculateHowManyOfEachCoinsToBuy(...it))
}

export function calculateHowManyOfEachCoinsToBuy(
  availableFunds: number,
  symbolsToBuy: string[],
  coinPrices: CoinPrices
): CoinPrices {
  let fundsLeft = availableFunds
  let coinsToBuy: {[k: string] : any} = {}

  while (true) {
    let boughtCoins = 0
    symbolsToBuy.forEach((symbol) => {
      if (fundsLeft - coinPrices[symbol] > 0) {
        coinsToBuy[symbol] = coinsToBuy[symbol] ? coinsToBuy[symbol] += 1 : 1
        fundsLeft -= coinPrices[symbol]
        boughtCoins += 1
      }
    })
    if (boughtCoins === 0) break
  }

  return coinsToBuy
}
