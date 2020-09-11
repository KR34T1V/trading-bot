declare module 'node-binance-api' {
  export default class Binance {
    options(binance: {APIKEY?: string; APISECRET?: string}): Binance

    candlesticks(symbol: string, interval: string, callback: any, options: Options): Promise<Tick[]>

    account(): Promise<Account>
    balances(): Promise<CoinPrices>

    prices(): Promise<CoinPrices>
    marketBuy(symbol: string, quantity: number): BuyResult
  }

  export type BuyResult = {
    orderId: string
    symbol: string
    price: string
  }

  export type Options = {
    limit?: number
  }

  export type CoinPrices = {[k: string] : number}

  export type Balance = {
    asset: string
    free: string
  }

  export type Account = {
    balances: Balance[]
  }

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
