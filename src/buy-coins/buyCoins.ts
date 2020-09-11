import {CoinPrices} from 'node-binance-api'
import {from, Observable, zip} from 'rxjs'
import {map} from 'rxjs/operators'
import {getConnection} from 'typeorm'
import {binance, getBalanceForCoin} from '../binance/binance'
import {config} from '../config/config'
import {Purchase} from '../entity/Purchase'
import {findInvestmentCandidates, InvestmentCandidate} from '../find-coins/findCoins'

export function calculateHowManyOfEachCoinsToBuy(args: {
  fundsToInvest: number,
  coinsToBuy: string[],
  coinPrices: CoinPrices
}): CoinPrices {
  let fundsLeft = args.fundsToInvest
  let coinsToBuy: {[k: string]: any} = {}

  while (true) {
    let boughtCoins = 0
    args.coinsToBuy.forEach((symbol) => {
      if (fundsLeft - args.coinPrices[symbol] > 0) {
        coinsToBuy[symbol] = coinsToBuy[symbol] ? coinsToBuy[symbol] += 1 : 1
        fundsLeft -= args.coinPrices[symbol]
        boughtCoins += 1
      }
    })
    if (boughtCoins === 0) break
  }
  // console.log('coinsToBuy', coinsToBuy)
  return coinsToBuy
}

export function findCoinsToBuy(): Observable<CoinPrices> {
  return zip(getFundsToInvest(), findInvestmentCandidates(), getSymbolsWithPrices()).pipe(
    map(([fundsToInvest, investmentCandidates, coinPrices]) => {
      const coinsToBuy = investmentCandidates.map(e => e.symbol)
      return calculateHowManyOfEachCoinsToBuy({fundsToInvest, coinsToBuy, coinPrices})
    })
  )
}

export function getFundsToInvest(): Observable<number> {
  return getBalanceForCoin(config.baseCurrency).pipe(
    map(it => it * config.percentToInvest)
  )
}

export function getSymbolsWithPrices(): Observable<CoinPrices> {
  return from(binance.prices())
}

export function buyCoins(
  symbolsToBuy: CoinPrices,
  investmentCandidates: InvestmentCandidate[]
) {

  Object.entries(symbolsToBuy).forEach(([symbol, quantity]) => {
    getConnection().transaction(async entityManager => {
      const investmentCandidate = investmentCandidates.find((e) => e.symbol === symbol)
      if (!investmentCandidate) throw 'Could not find InvestmentCandidate'

      // const response = binance.marketBuy(symbol, quantity)
      const response = {price: 100}
      let purchase = new Purchase()
      purchase.quantity = quantity
      purchase.buy_price = Number(response.price)
      purchase.buy_time = new Date()
      purchase.symbol = symbol
      purchase.sell_price = (investmentCandidate.maxPrice + investmentCandidate.minPrice) / 2
      console.log(purchase, '########')
      // entityManager.save(purchase)
    })
  })
}
