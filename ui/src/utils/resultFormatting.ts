export function ordinal(n: number) {
  const s = ["th", "st", "nd", "rd"]
  const v = n % 100
  return s[(v - 20) % 10] ?? s[v] ?? s[0]
}

export function gradeColor(g: string) {
  switch (g) {
    case "A":
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
    case "B":
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
    case "C":
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
    case "D":
      return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
    default:
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
  }
}

export function barColor(score: number) {
  if (score >= 75) return "bg-green-500"
  if (score >= 65) return "bg-blue-500"
  if (score >= 55) return "bg-yellow-500"
  if (score >= 45) return "bg-orange-500"
  return "bg-red-500"
}

export function scoreDelta(delta: number): { meta?: string; metaType?: "up" | "down" | "neutral" } {
  if (delta === 0) return {}
  return {
    meta: `${delta > 0 ? "+" : ""}${delta} from last term`,
    metaType: delta > 0 ? "up" : "down",
  }
}
