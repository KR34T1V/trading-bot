import {fetchAndStoreExchangeInfo, fetchAndStorePrices} from './src/simulated-trading/fetchAndStoreData'

fetchAndStorePrices().subscribe()
fetchAndStoreExchangeInfo().subscribe()
