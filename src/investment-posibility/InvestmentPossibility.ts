import {Symbols} from 'node-binance-api'
import {getBalanceForCoin, SymbolPrices} from '../binance/binance'
import {config} from '../config/config'

export type InvestmentPossibility = {
  symbol: string
  prices: Array<number>
  minPrice: number
  maxPrice: number
  slope: number
  trendDirection: number
  priceSwing: number
}

export function excludeNonBTCSymbols(symbols: Symbols): Symbols {
  return symbols.filter(symbol => symbol.endsWith(config.baseCurrency))
}

export function sortInvestPossibilityByPriceAscending(ip: InvestmentPossibility[]) {
  return ip.sort((a, b) => (
    a.priceSwing > b.priceSwing)
    ? 1
    : -1
  )
}

export function calculateAvailableFundsToInvest() {
  return getBalanceForCoin(config.baseCurrency)
}

export function excludeSymbolsIfLatestPriceIsNotLowest(sp: SymbolPrices[]) {
  return sp.filter(e => e.prices[e.prices.length - 1] === Math.min(...e.prices))
}
