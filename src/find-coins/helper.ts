import {Symbols} from 'node-binance-api'
import {SymbolPrices} from '../binance/binance'
import {config} from '../config/config'
import {InvestmentCandidate} from './findCoins'

export function excludeNonBTCSymbols(symbols: Symbols): Symbols {
  return symbols.filter(symbol => symbol.endsWith(config.baseCurrency))
}

export function sortInvestPossibilityByPriceAscending(ip: InvestmentCandidate[]) {
  return ip.sort((a, b) => (
    a.priceSwing > b.priceSwing)
    ? 1
    : -1
  )
}

export function excludeSymbolsIfLatestPriceIsNotLowest(sp: SymbolPrices[]) {
  return sp.filter(e => e.prices[e.prices.length - 1] === Math.min(...e.prices))
}

export function excludeSymbolsWithTooLowPriceSwing(ip: InvestmentCandidate[], priceSwing: number) {
  return ip.filter(e => e.priceSwing < priceSwing)
}
