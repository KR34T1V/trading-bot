import {Sell} from './Sell'

export function mockSell(purchase: Partial<Sell>) {
  return new Sell(purchase)
}
