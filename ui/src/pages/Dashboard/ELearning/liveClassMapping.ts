import type { LiveClassDtoI } from "@/api/liveClass.api/types"
import type { ClassSessionStatus, LiveClassSession } from "@/types/elearning"

/**
 * Bridges the backend LiveClass DTO to the frontend `LiveClassSession` shape the
 * E-Learning components already consume, so nothing downstream has to change.
 *
 * Status rules (per spec):
 *  - A class shows "live" once its scheduled time window has started.
 *  - "upcoming" while the start time is still in the future.
 *  - "ended" once it has finished or its window has passed.
 * The authoritative backend status wins at the edges: an explicitly Live class
 * is always live, and an Ended/Cancelled class is always ended, regardless of
 * where "now" falls relative to the window.
 */

function toDateOnly(iso: string): string {
  // Backend sends ISO datetime (e.g. "2026-08-03T00:00:00"); the UI wants YYYY-MM-DD.
  return (iso ?? "").slice(0, 10)
}

function windowBounds(dto: LiveClassDtoI, now: Date) {
  const date = toDateOnly(dto.scheduledDate)
  const start = new Date(
    `${date}T${(dto.startTime || "00:00").padStart(5, "0")}:00`
  )
  const end = new Date(
    `${date}T${(dto.endTime || "00:00").padStart(5, "0")}:00`
  )
  return { start, end, now }
}

export function deriveSessionStatus(
  dto: LiveClassDtoI,
  now: Date = new Date()
): ClassSessionStatus {
  if (dto.status === "Live") return "live"
  if (dto.status === "Ended" || dto.status === "Cancelled") return "ended"

  // Scheduled → derive purely from the time window.
  const { start, end } = windowBounds(dto, now)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()))
    return "upcoming"
  if (now < start) return "upcoming"
  if (now > end) return "ended"
  return "live"
}

/** True when the class starts within the next `hours` and hasn't started yet. */
export function startsWithin(
  dto: LiveClassDtoI,
  hours = 24,
  now: Date = new Date()
): boolean {
  const { start } = windowBounds(dto, now)
  if (Number.isNaN(start.getTime())) return false
  const diffMs = start.getTime() - now.getTime()
  return diffMs >= 0 && diffMs <= hours * 60 * 60 * 1000
}

export function mapLiveClassToSession(
  dto: LiveClassDtoI,
  now: Date = new Date()
): LiveClassSession {
  return {
    id: dto.id,
    title: dto.title,
    subject: dto.subjectName ?? undefined,
    className: dto.className ?? undefined,
    classId: dto.schoolClassId ?? undefined,
    courseId: dto.subjectId ?? undefined,
    teacherName: dto.teacherName ?? "Teacher",
    teacherId: dto.teacherId,
    canStart: dto.canStart,
    canSpectate: dto.canSpectate,
    yourRole: dto.yourRole === "Host" ? "Host" : "Participant",
    lmsStatus: dto.status,
    scheduledDate: toDateOnly(dto.scheduledDate),
    startTime: dto.startTime,
    endTime: dto.endTime,
    status: deriveSessionStatus(dto, now),
    participantCount: dto.participantCount ?? 0,
    // The card denominator is the current class register, not a room-capacity
    // default stored on the live-class row.
    maxParticipants: dto.enrolledStudentCount ?? 0,
    // Lets an ended class offer playback, and lets a started class be matched
    // back to the timetable period it came from.
    recordingUrl: dto.recordingUrl ?? undefined,
    timetableSlotId: dto.timetableSlotId ?? undefined,
    // Real channel name is issued at Join time; list view doesn't expose it.
    agoraChannelId: "",
  }
}

export function mapLiveClassesToSessions(
  dtos: LiveClassDtoI[],
  now: Date = new Date()
): LiveClassSession[] {
  return dtos.map((d) => mapLiveClassToSession(d, now))
}
