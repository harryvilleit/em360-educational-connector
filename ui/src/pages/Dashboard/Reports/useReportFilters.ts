import { useCallback, useMemo } from "react"
import { useSearchParams } from "react-router"
import { formatDate } from "@/utils"
import type { ReportPeriod } from "./useReportData"

export function useReportFilters() {
  const [searchParams, setSearchParams] = useSearchParams()
  const sessionId = searchParams.get("session") ?? ""
  const termId = searchParams.get("term") ?? ""
  const tab = searchParams.get("tab") ?? ""
  const classId = searchParams.get("class") ?? ""
  const attendanceDate =
    searchParams.get("date") || formatDate(new Date(), "YYYY-MM-DD")

  const period: ReportPeriod = useMemo(
    () => ({
      sessionId: sessionId || undefined,
      termId: termId || undefined,
    }),
    [sessionId, termId]
  )

  const update = useCallback(
    (next: Record<string, string>) => {
      setSearchParams(
        (prev) => {
          const params = new URLSearchParams(prev)
          for (const [key, value] of Object.entries(next)) {
            if (value) params.set(key, value)
            else params.delete(key)
          }
          return params
        },
        { replace: true }
      )
    },
    [setSearchParams]
  )

  return { sessionId, termId, tab, classId, attendanceDate, period, update }
}

export type ReportFilters = ReturnType<typeof useReportFilters>
