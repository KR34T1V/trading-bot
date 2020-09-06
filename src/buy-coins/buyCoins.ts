import {getBalanceForCoin} from '../binance/binance'
import {config} from '../config/config'

export function getAvailableFundsToInvest(): number {
  return Number(getBalanceForCoin(config.baseCurrency)) * config.percentToInvest
}
