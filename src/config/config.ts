export const config = {
  baseCurrency: 'BTC',
  binance: {
    APIKEY: process.env.BINANCE_API_KEY,
    APISECRET: process.env.BINANCE_API_SECRET,
    recvWindow: 60000,
  },
  historicData: { // fetch candlesticks data
    interval: process.env.TRADING_BOT_HISTORIC_DATA_INTERVAL || '1d',
    limit: Number(process.env.TRADING_BOT_HISTORIC_DATA_LIMIT) || 30
  },
  sellPercent: 0.18,
  fee: 0.999,
  minOrderAmount: 0.000125,
  priceSwing: Number(process.env.TRADING_BOT_PRICE_SWING) || -30, // only buy if the price dropped low enough (in
  // percent)
  percentToInvest: Number(process.env.TRADING_BOT_PERCENT_TO_INVEST) || 0.04, // how many percent to invest each run
  detectDescendingSize: Number(process.env.TRADING_BOT_DETECT_DESCENDING_SIZE) || 7 // based on how many
  // ticks to detect the descending trend
}
