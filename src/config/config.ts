export const config = {
  baseCurrency: 'BTC',
  binance: {
    APIKEY: process.env.BINANCE_API_KEY,
    APISECRET: process.env.BINANCE_API_SECRET,
    historicData: { // fetch candlesticks data
      interval: process.env.TRADING_BOT_HISTORIC_DATA_INTERVAL || '1d',
      limit: Number(process.env.TRADING_BOT_HISTORIC_DATA_LIMIT) || 60
    }
  },
  priceSwing: Number(process.env.TRADING_BOT_PRICE_SWING) || -10, // only buy if the price dropped low enough (in
  // percent)
  percentToInvest: Number(process.env.TRADING_BOT_PERCENT_TO_INVEST) || 0.008, // how many percent to invest each run
  detectDescendingSize: Number(process.env.TRADING_BOT_DETECT_DESCENDING_SIZE) || 10 // based on how many
  // ticks to detect the descending trend
}
