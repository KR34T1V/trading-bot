export function computePercentIncrease(originalNumber: number, newNumber: number) {
  // 0.00010235, 0.00014919
  return (newNumber - originalNumber) / originalNumber
}
