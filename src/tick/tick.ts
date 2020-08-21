export function latestNPricesWithIndex(ticks, n?: number) {
  return getTicksPrices(ticks)
    .slice(-n)
    .map((e, i) => [i, e])
}

export function getTicksPrices(ticks) {
  return ticks.map((e) => Number(e[4]))
}
