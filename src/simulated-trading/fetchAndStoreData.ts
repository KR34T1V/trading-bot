import {removeSync, writeJSONSync} from 'fs-extra'
import path from 'path'
import {from} from 'rxjs'
import {map, mergeMap} from 'rxjs/operators'
import {binance, getAllSymbols, getHistoricPricesForSymbols} from '../binance/binance'
import {excludeNonBTCSymbols} from '../find-coins/helper'

export const TOTAL_DAYS = 365
export const pricesFileName = path.join(__dirname, 'historic-prices.json')
export const exchangeInfoFileName = path.join(__dirname, 'exchange-info.json')

export function fetchAndStorePrices() {
  removeSync(pricesFileName)
  return getAllSymbols().pipe(
    map(excludeNonBTCSymbols),
    mergeMap(it => getHistoricPricesForSymbols(it, {interval: '1d', limit: TOTAL_DAYS})),
    map(it => writeJSONSync(pricesFileName, it))
  )
}

export function fetchAndStoreExchangeInfo() {
  removeSync(exchangeInfoFileName)
  return from(binance.exchangeInfo()).pipe(
    map(it => writeJSONSync(exchangeInfoFileName, it))
  )
}
