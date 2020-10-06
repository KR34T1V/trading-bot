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
        minOrderAmount: config.minOrderAmount,
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
  minOrderAmount: number,
  coinsToBuy: string[],
  coinPrices: CoinPrices
}): CoinPrices {
  let fundsLeft = args.fundsToInvest
  let coinsToBuy: {[k: string]: any} = {}

  args.coinsToBuy.forEach((symbol) => {
    let quantity = 0
    while (true) {
      if (args.coinPrices[symbol] <= 0) break
      if (fundsLeft - args.coinPrices[symbol] < 0 || quantity * args.coinPrices[symbol] >= args.minOrderAmount) {
        if (quantity * args.coinPrices[symbol] < args.minOrderAmount) break
        coinsToBuy[symbol] = quantity
        break
      }
      quantity += 1
      fundsLeft -= args.coinPrices[symbol]
    }
  })

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
  purchase.quantity = Number(boughtCoin.executedQty) * config.fee
  purchase.buyPrice = Number(boughtCoin.cummulativeQuoteQty)
  purchase.sellPrice = (investmentCandidate.maxPrice * 2) - (investmentCandidate.minPrice * 0.9)
  purchase.buyTime = new Date()
  return dbSave(purchase)
}
