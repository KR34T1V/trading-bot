export const config = {
  baseCurrency: 'BTC',
  binance: {
    APIKEY: process.env.BINANCE_API_KEY,
    APISECRET: process.env.BINANCE_API_SECRET,
    recvWindow: 60000,
  },
  historicData: { // fetch candlesticks data
    interval: '3d',
    limit: 30
  },
  sellPercent: 0.15,
  fee: 0.999,
  minOrderAmount: 0.00015,
  priceSwing: -20, // only buy if the price dropped low enough (in percent)
  percentToInvest: 0.07, // how many percent to invest each run
  detectDescendingSize: 4 // based on how many ticks to detect the descending trend
}
