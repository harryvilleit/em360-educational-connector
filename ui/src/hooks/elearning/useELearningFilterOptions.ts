import { useMemo } from "react"
import type { FilterSelectOption } from "@/components/ui/filter-select"
import { useGetAllSchoolSessions } from "@/hooks/userMgt"
import { useSchoolClassOptions } from "@/hooks/useSchoolClassOptions"

export interface TermDateRange {
  startDate: string
  endDate: string
}

export interface ELearningFilterOptions {
  classOptions: FilterSelectOption[]

  termOptions: FilterSelectOption[]

  termRanges: Record<string, TermDateRange>

  termIdByName: Record<string, string>

  sessionId?: string

  currentTermName?: string
  isLoading: boolean
}

function toDateOnly(v?: string): string {
  return (v ?? "").slice(0, 10)
}

export function useELearningFilterOptions(
  schoolId: string
): ELearningFilterOptions {
  const { classes, isLoading: classesLoading } = useSchoolClassOptions(schoolId)

  const { sessions, isLoading: sessionsLoading } = useGetAllSchoolSessions({
    schoolId,
    pageNumber: 1,
    pageSize: 100,
  })

  const classOptions = useMemo<FilterSelectOption[]>(
    () => [
      { value: "all", label: "All classes" },
      ...classes.map((c) => ({ value: c.Id, label: c.ClsName })),
    ],
    [classes]
  )

  const { termOptions, termRanges, termIdByName, sessionId, currentTermName } =
    useMemo(() => {
      const currentSession =
        sessions.find((s) => s.IsCurrent || s.Status === "Active") ??
        sessions[0]
      const terms = currentSession?.Terms ?? []

      const options: FilterSelectOption[] = [
        { value: "all", label: "All terms" },
        ...terms.map((t) => ({ value: t.TermName, label: t.TermName })),
      ]

      const ranges: Record<string, TermDateRange> = {}
      const idByName: Record<string, string> = {}
      for (const t of terms) {
        ranges[t.TermName] = {
          startDate: toDateOnly(t.StartDate),
          endDate: toDateOnly(t.EndDate),
        }
        idByName[t.TermName] = t.Id
      }

      const current = terms.find((t) => t.IsCurrent) ?? terms[0]

      return {
        termOptions: options,
        termRanges: ranges,
        termIdByName: idByName,
        sessionId: currentSession?.Id,
        currentTermName: current?.TermName,
      }
    }, [sessions])

  return {
    classOptions,
    termOptions,
    termRanges,
    termIdByName,
    sessionId,
    currentTermName,
    isLoading: classesLoading || sessionsLoading,
  }
}
