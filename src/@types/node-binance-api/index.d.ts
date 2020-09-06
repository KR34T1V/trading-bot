declare module 'node-binance-api' {
  export default class Binance {
    options(binance: {APIKEY?: string; APISECRET?: string})

    candlesticks(symbol: string, interval: string, callback: any, options: Options): Promise<Tick[]>

    account(): Promise<Account>

    prices(): Promise<Object>
  }

  export type Options = {
    limit?: number
  }

  export type Symbols = Array<string>

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
