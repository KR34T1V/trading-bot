import {Purchase} from './Purchase'

export function mockPurchase(purchase: Partial<Purchase>) {
  return new Purchase(purchase)
}
