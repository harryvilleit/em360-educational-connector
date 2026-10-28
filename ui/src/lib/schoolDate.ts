export function dateISOInTimeZone(
  timeZone: string | null | undefined,
  date = new Date()
): string {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timeZone || "UTC",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(date)
    const value = Object.fromEntries(
      parts.map((part) => [part.type, part.value])
    )
    return `${value.year}-${value.month}-${value.day}`
  } catch {
    return date.toISOString().slice(0, 10)
  }
}
