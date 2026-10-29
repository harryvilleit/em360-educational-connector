import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"

import { getTeacherTimetableRangeApi } from "@/api/timetable.api"

import type { TimetableSlotI } from "@/api/timetable.api/types"

import { queryKeys } from "@/utils/queryKeys"

import type { ClassSessionStatus, LiveClassSession } from "@/types/elearning"

/**
 * TimetableType.Class
 */
const TIMETABLE_TYPE_CLASS = 1

/**
 * ClassMode:
 *
 * 2 = Online
 * 3 = Hybrid
 */
const VIRTUAL_CLASS_MODES = new Set<string | number>([2, 3, "Online", "Hybrid"])

export interface UseTimetableClassSessionsParams {
  schoolId: string

  sessionId?: string

  termId?: string

  startDate: string

  endDate: string

  teacherId?: string

  teacherName?: string

  /** Selected class id, or undefined for "all classes". */
  schoolClassId?: string
}

/**
 * Determine whether the class is:
 *
 * upcoming
 * live
 * ended
 */
function deriveStatus(
  date: string,
  startTime?: string,
  endTime?: string,
  now: Date = new Date()
): ClassSessionStatus {
  if (!date) {
    return "upcoming"
  }

  const safeStartTime = startTime || "00:00"

  const safeEndTime = endTime || startTime || "00:00"

  const start = new Date(`${date}T${safeStartTime.padStart(5, "0")}:00`)

  const end = new Date(`${date}T${safeEndTime.padStart(5, "0")}:00`)

  if (Number.isNaN(start.getTime())) {
    return "upcoming"
  }

  if (now < start) {
    return "upcoming"
  }

  if (!Number.isNaN(end.getTime()) && now > end) {
    return "ended"
  }

  return "live"
}

/**
 * Convert a timetable slot into the common
 * E-Learning LiveClassSession model.
 *
 * Physical timetable periods are ignored.
 */
export function mapVirtualSlotToSession(
  slot: TimetableSlotI,
  teacher: {
    id?: string
    name?: string
  },
  now: Date = new Date()
): LiveClassSession | null {
  /**
   * Only Online and Hybrid timetable periods
   * belong on the E-Learning Classes page.
   */
  if (slot.classMode == null || !VIRTUAL_CLASS_MODES.has(slot.classMode)) {
    return null
  }

  /**
   * Prefer the API's formatted date.
   *
   * Fall back to Date because your Timetables
   * table stores the concrete class date.
   */
  const date = slot.formattedDate || (slot.date ? slot.date.slice(0, 10) : "")

  if (!date) {
    return null
  }

  const startTime = slot.formattedStartTime

  const endTime = slot.formattedEndTime || slot.formattedStartTime

  return {
    /**
     * Synthetic ID.
     *
     * There is no liveclasses row yet.
     */
    id: `slot:${slot.id}:${date}`,

    title: slot.subjectName || "Class",

    subject: slot.subjectName || undefined,

    className: slot.schoolClassName || undefined,

    classId: slot.schoolClassId,

    courseId: slot.subjectId || undefined,

    timetableSlotId: slot.id,

    teacherName: teacher.name || "Teacher",

    teacherId: teacher.id,

    scheduledDate: date,

    startTime,

    endTime,

    status: deriveStatus(date, startTime, endTime, now),

    participantCount: 0,

    maxParticipants: 0,

    agoraChannelId: "",
  }
}

/**
 * Determines whether a session came from
 * the Timetables table rather than LiveClasses.
 */
export function isTimetableDerived(
  session: Pick<LiveClassSession, "id">
): boolean {
  return session.id.startsWith("slot:")
}

/**
 * Loads all Online/Hybrid timetable periods
 * for the teacher using ONE range request.
 */
export function useTimetableClassSessions({
  schoolId,
  sessionId,
  termId,
  startDate,
  endDate,
  teacherId,
  teacherName,
  schoolClassId,
}: UseTimetableClassSessionsParams): {
  sessions: LiveClassSession[]
  isLoading: boolean
  isFetching: boolean
  isError: boolean
  error: unknown
} {
  /**
   * Do not call the API until all required
   * information is available.
   */
  const enabled = Boolean(
    schoolId && sessionId && termId && startDate && endDate
  )

  /**
   * ONE request for the entire date range.
   */
  const { data, isPending, isFetching, isError, error } = useQuery({
    queryKey: [
      queryKeys.timetable,

      "teacher-range",

      schoolId,

      sessionId ?? null,

      termId ?? null,

      startDate,

      endDate,

      schoolClassId ?? null,
    ],

    queryFn: () =>
      getTeacherTimetableRangeApi({
        schoolId,

        schoolSessionId: sessionId!,

        schoolSessionTermId: termId!,

        timetableType: TIMETABLE_TYPE_CLASS,

        startDate,

        endDate,

        schoolClassId,
      }),

    enabled,

    /**
     * Successful result stays fresh for
     * five minutes.
     */
    staleTime: 5 * 60 * 1000,

    /**
     * Keep cache for ten minutes.
     */
    gcTime: 10 * 60 * 1000,

    /**
     * IMPORTANT:
     *
     * A 405/500/etc should NOT cause repeated
     * automatic requests.
     */
    retry: false,

    refetchOnWindowFocus: false,

    refetchOnReconnect: false,

    refetchOnMount: false,
  })

  /**
   * Convert API timetable slots into
   * LiveClassSession objects.
   */
  const sessions = useMemo(() => {
    if (!data?.value?.slots) {
      return []
    }

    const now = new Date()

    const output: LiveClassSession[] = []

    const seen = new Set<string>()

    for (const slot of data.value.slots) {
      const mapped = mapVirtualSlotToSession(
        slot,
        {
          id: teacherId,
          name: teacherName,
        },
        now
      )

      /**
       * Physical timetable slot.
       */
      if (!mapped) {
        continue
      }

      /**
       * Extra client-side safety.
       */
      if (mapped.scheduledDate < startDate) {
        continue
      }

      if (mapped.scheduledDate > endDate) {
        continue
      }

      /**
       * Prevent duplicates.
       */
      if (seen.has(mapped.id)) {
        continue
      }

      seen.add(mapped.id)

      output.push(mapped)
    }

    return output
  }, [data, teacherId, teacherName, startDate, endDate])

  return {
    sessions,

    isLoading: enabled && isPending,

    isFetching,

    isError,

    error,
  }
}
