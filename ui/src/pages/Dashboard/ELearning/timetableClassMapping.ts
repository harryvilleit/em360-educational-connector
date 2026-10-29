import type { LiveClassSession } from "@/types/elearning"

/**
 * Correlates a timetable-derived virtual session with an actual `liveclasses`
 * row. The LiveClass DTO doesn't expose `TimetableSlotId`, so we match on the
 * natural key a slot and its backing class share: class + subject + date +
 * start time. (Exposing TimetableSlotId on the DTO would let us match by id
 * exactly — a small backend follow-up.)
 */
function sessionKey(s: LiveClassSession): string {
  return `${s.classId ?? ""}|${s.courseId ?? ""}|${s.scheduledDate}|${s.startTime}`
}

/**
 * Merges the teacher's virtual timetable sessions with any real live-class rows.
 *
 *  - Where a real row exists for a slot occurrence, it wins (it carries the real
 *    id, live status, participant count and channel) — so a class that has been
 *    started shows its live state instead of the scheduled placeholder.
 *  - Virtual slots with no backing row yet are shown as scheduled; Join will
 *    find-or-create the row via StartFromSlot.
 *  - Real rows that don't map to any virtual slot (manually scheduled one-offs)
 *    are kept as-is.
 */
export function mergeClassSessions(
  virtualSessions: LiveClassSession[],
  liveClassSessions: LiveClassSession[]
): LiveClassSession[] {
  const realByKey = new Map<string, LiveClassSession>()
  for (const r of liveClassSessions) realByKey.set(sessionKey(r), r)

  const usedKeys = new Set<string>()
  const merged: LiveClassSession[] = []

  for (const v of virtualSessions) {
    const key = sessionKey(v)
    const real = realByKey.get(key)
    if (real) {
      // Keep the slot linkage so Join can still route through StartFromSlot if needed.
      merged.push({ ...real, timetableSlotId: real.timetableSlotId ?? v.timetableSlotId })
      usedKeys.add(key)
    } else {
      merged.push(v)
    }
  }

  for (const r of liveClassSessions) {
    const key = sessionKey(r)
    if (!usedKeys.has(key)) merged.push(r)
  }

  return merged
}
