export const CLASS_MODES: { value: number; label: string }[] = [
  { value: 1, label: "Physical" },
  { value: 2, label: "Virtual" },
]

/** Radix's Select disallows an empty-string item value (it's reserved for
 * "no selection"), so the "leave Class Mode blank" option in the dropdown
 * uses this sentinel instead — translated to/from `undefined` wherever the
 * form's actual classMode value is read or written. */
export const BLANK_CLASS_MODE = "__blank__"

export const CA_TYPES = ["CA 1", "CA 2", "CA 3"] as const

function formatTimeLabel(value: string): string {
  const [hStr, mStr] = value.split(":")
  const hour = Number(hStr)
  if (Number.isNaN(hour)) return value
  return `${String(hour).padStart(2, "0")}:${mStr ?? "00"}`
}

/** Full-day period start/end options in five-minute steps. Both labels and
 * values use an unambiguous 24-hour HH:mm clock, from 00:00 through 23:55. */
export const TIME_OPTIONS: { value: string; label: string }[] = Array.from(
  { length: 24 * 12 },
  (_, i) => {
    const totalMinutes = i * 5
    const value = `${String(Math.floor(totalMinutes / 60)).padStart(2, "0")}:${String(totalMinutes % 60).padStart(2, "0")}`
    return { value, label: formatTimeLabel(value) }
  }
)

/** Guarantees a period's currently stored time is always a selectable
 * option, even if it doesn't land on a 5-minute mark (legacy data) — so
 * editing an existing period never silently blanks the field. */
export function withCurrentTimeOption(currentValue: string) {
  if (!currentValue || TIME_OPTIONS.some((o) => o.value === currentValue)) {
    return TIME_OPTIONS
  }
  return [
    ...TIME_OPTIONS,
    { value: currentValue, label: formatTimeLabel(currentValue) },
  ].sort((a, b) => a.value.localeCompare(b.value))
}
