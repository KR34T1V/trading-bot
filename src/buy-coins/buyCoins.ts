import {CoinOrder, CoinPrices} from 'node-binance-api'
import {Observable, zip} from 'rxjs'
import {map, mergeMap, tap} from 'rxjs/operators'
import {buyAtMarketPrice, getBalanceForCoin, getSymbolsWithPrices} from '../binance/binance'
import {config} from '../config/config'
import {dbSave} from '../db/dbSave'
import {Purchase} from '../db/entity/Purchase'
import {InvestmentCandidate} from '../find-coins/findInvestmentCandidates'

type CoinPurchase = {
  symbol: string
  amount: number
  buyPrice: number
  sellPrice: number
}

export function buyCoins(investmentCandidates: InvestmentCandidate[]) {
  return zip(getFundsToInvest(config.percentToInvest), getSymbolsWithPrices()).pipe(
    tap(it => {console.log('funds to invest: ', it[0])}),
    map(([fundsToInvest, coinPrices]) =>
      calculateHowManyOfEachCoinsToBuy({
        fundsToInvest,
        coinsToBuy: investmentCandidates.map(e => e.symbol),
        coinPrices
      })
    ),
    mergeMap(it => zip(
      ...Object.entries(it)
        .map(([symbol, quantity]) => buyAtMarketPrice(symbol, quantity))
      )
    ),
    map(it => it.filter((e): e is CoinOrder => e !== undefined)),
    mergeMap(it => zip(...it.map(bc => storePurchase(bc, investmentCandidates))))
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

export function getFundsToInvest(percentToInvest: number): Observable<number> {
  return getBalanceForCoin(config.baseCurrency).pipe(
    map(it => it * percentToInvest)
  )
}

function storePurchase(boughtCoin: CoinOrder, investmentCandidates: InvestmentCandidate[]) {
  const investmentCandidate = investmentCandidates.find((e) => e.symbol === boughtCoin.symbol)
  if (!investmentCandidate) throw 'Could not find InvestmentCandidate'

  let purchase = new Purchase()
  purchase.symbol = boughtCoin.symbol
  purchase.quantity = Number(boughtCoin.executedQty)
  purchase.buyPrice = Number(boughtCoin.cummulativeQuoteQty)
  purchase.sellPrice = (investmentCandidate.maxPrice + investmentCandidate.minPrice) / 2
  purchase.buyTime = new Date()
  return dbSave(purchase)
}
