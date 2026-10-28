export function percentOf(part: number, total: number) {
  return total ? `${Math.round((part / total) * 1000) / 10}%` : "0%"
}
