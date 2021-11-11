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
  sellPercent: 0.10,
  fee: 0.99,
  minOrderAmount: 0.00012, // min 0.000125
  priceSwing: -9, // only buy if the price dropped low enough (in percent)
  percentToInvest: 0.2, // how many percent to invest each run
  detectDescendingSize: 10 // based on how many ticks to detect the descending trend
}
