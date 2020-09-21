declare module 'node-binance-api' {
  export default class Binance {
    options(binance: {APIKEY?: string; APISECRET?: string}): Binance

    candlesticks(symbol: string, interval: string, callback: any, options: Options): Promise<Tick[]>

    balance(): Promise<CoinBalances>
    exchangeInfo(): Promise<ExchangeInfo>

    prices(): Promise<CoinPrices>
    marketBuy(symbol: string, quantity: number): Promise<CoinOrder>
    marketSell(symbol: string, quantity: number): Promise<CoinOrder>
  }

  export type ExchangeInfo = {
    symbols: SymbolInfo[]
  }

  export type SymbolInfo = {
    symbol: string
    status: 'TRADING' | 'BREAK'
    isSpotTradingAllowed: boolean
  }

  export type CoinOrder = {
    executedQty: string
    orderId: string
    symbol: string
    price: string
    cummulativeQuoteQty: string
  }

  export type Options = {
    limit?: number
  }

  export type CoinPrices = {[k: string] : number}

  export type Balance = {
    available: string
    onOrder: string
  }

  export type CoinBalances = {[k: string] : Balance}

  export type Tick = [
    number, // Open time
    string, // Open
    string, // High
    string, // Low
    string, // Close
    string, // Volume
    number, // Close time
    string, // Quote asset volume
    number, // Number of trades
    string, // Taker buy base asset volume
    string, // Taker buy quote asset volume
    string, // Ignore.
  ]
}
