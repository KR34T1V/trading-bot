import {CoinOrder, CoinPrices, SymbolInfo} from 'node-binance-api'
import {from, Observable, zip} from 'rxjs'
import {concatMap, map, mergeMap, tap} from 'rxjs/operators'
import {buyAtMarketPrice, getBalanceForCoin, getExchangeInfo, getSymbolsWithPrices, roundStep} from '../binance/binance'
import {config} from '../config/config'
import {dbSave} from '../db/dbSave'
import {Purchase} from '../db/entity/Purchase'
import {InvestmentCandidate} from '../find-coins/findInvestmentCandidates'

export function buyCoins(investmentCandidates: InvestmentCandidate[]) {
  return zip(
    getFundsToInvest(config.percentToInvest),
    getSymbolsWithPrices(),
    getExchangeInfo()
  ).pipe(
    tap(it => {console.log('funds to invest: ', it[0])}),
    concatMap(([fundsToInvest, coinPrices, exchangeInfo]) =>
      from(calculateHowManyOfEachCoinsToBuy({
        fundsToInvest,
        minOrderPrice: config.minOrderAmount,
        coinsToBuy: investmentCandidates.map(e => e.symbol),
        exchangeInfo,
        coinPrices
      }))
    ),
    mergeMap(it => buyAtMarketPrice(it.symbol, it.quantity)),
    concatMap(it => storePurchase(it, investmentCandidates))
  )
}

type Coin = {
  symbol: string
  quantity: number
}

export function calculateHowManyOfEachCoinsToBuy(args: {
  fundsToInvest: number,
  minOrderPrice: number,
  coinsToBuy: string[],
  exchangeInfo: SymbolInfo[],
  coinPrices: CoinPrices
}): Array<Coin> {
  return args.coinsToBuy.map((symbol) => {
    const coinPrice = args.coinPrices[symbol]
    const quantity = args.minOrderPrice / coinPrice

    return {
      symbol,
      quantity: roundStep(symbol, quantity, args.exchangeInfo)
    }
  }).slice(0, Math.floor(args.fundsToInvest / args.minOrderPrice))
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
  purchase.buyTime = new Date()
  return dbSave(purchase)
}
