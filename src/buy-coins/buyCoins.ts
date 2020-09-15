import {BoughtCoin, CoinPrices} from 'node-binance-api'
import {Observable, zip} from 'rxjs'
import {map, mergeMap, tap} from 'rxjs/operators'
import {getBalanceForCoin, getSymbolsWithPrices, marketBuy} from '../binance/binance'
import {config} from '../config/config'
import {Purchase} from '../db/entity/Purchase'
import {save} from '../db/save'
import {InvestmentCandidate} from '../find-coins/findInvestmentCandidates'

type CoinPurchase = {
  symbol: string
  amount: number
  buyPrice: number
  sellPrice: number
}

export function buyCoins(investmentCandidates: InvestmentCandidate[]) {
  return zip(getFundsToInvest(), getSymbolsWithPrices()).pipe(
    map(([fundsToInvest, coinPrices]) =>
      calculateHowManyOfEachCoinsToBuy({
        fundsToInvest,
        coinsToBuy: investmentCandidates.map(e => e.symbol),
        coinPrices
      })
    ),
    mergeMap(it => zip(
      Object.entries(it)
        .map(([symbol, quantity]) => marketBuy(symbol, quantity)))
    ),
    map(it => it.map(bc => storePurchase(bc, investmentCandidates)))
  )
}

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
  return coinsToBuy
}

export function getFundsToInvest(): Observable<number> {
  return getBalanceForCoin(config.baseCurrency).pipe(
    map(it => it * config.percentToInvest)
  )
}

function storePurchase(boughtCoin: BoughtCoin, investmentCandidates: InvestmentCandidate[]) {
  const investmentCandidate = investmentCandidates.find((e) => e.symbol === boughtCoin.symbol)
  if (!investmentCandidate) throw 'Could not find InvestmentCandidate'

  let purchase = new Purchase()
  purchase.symbol = boughtCoin.symbol
  purchase.quantity = Number(boughtCoin.executedQty)
  purchase.buyPrice = Number(boughtCoin.price)
  purchase.sellPrice = (investmentCandidate.maxPrice + investmentCandidate.minPrice) / 2
  purchase.buyTime = new Date()
  return save(purchase)
}
