export const config = {
  baseCurrency: 'BTC',
  binance: {
    APIKEY: process.env.BINANCE_API_KEY,
    APISECRET: process.env.BINANCE_API_SECRET,
    recvWindow: 60000,
  },
  historicData: { // fetch candlesticks data
    interval: '8h',
    limit: 90
  },
  sellPercent: 0.08,
  fee: 0.99,
  minOrderAmount: 0.00018,
  priceSwing: -10, // only buy if the price dropped low enough (in percent)
  percentToInvest: 0.2, // how many percent to invest each run
  detectDescendingSize: 5 // based on how many ticks to detect the descending trend
}
