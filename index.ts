import {map, tap} from 'rxjs/operators'
import {buyCoins} from './src/buy-coins/buyCoins'
import {findInvestmentCandidates} from './src/find-coins/findInvestmentCandidates'

findInvestmentCandidates().pipe(
  map(it => buyCoins(it)),
  tap(it => {console.log(it)})
)
//   .subscribe()
