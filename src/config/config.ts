export const config = {
  baseCurrency: 'BTC',
  binance: {
    APIKEY: process.env.BINANCE_API_KEY,
    APISECRET: process.env.BINANCE_API_SECRET,
    historicData: { // fetch candlesticks data
      interval: '1d',
      limit: 30
    }
  },
  priceSwing: -10, // only buy if the price dropped low enough (in percent)
  percentToInvest: 0.5, // how many percent to invest
  descendingTrendBatchSize: 5 // based on how many ticks to detect the descending trend
}
