import { useMemo } from "react"
import { useGetAllClasses, useGetBroadsheet } from "@/hooks/examAndRecords"
import { buildCasSheet } from "./casSheet"

export function useCasSheet(
  enabled: boolean,
  schoolId: string,
  classId: string,
  sessionId: string,
  termId: string
) {
  const { classes, isLoading: classesLoading } = useGetAllClasses({
    schoolId: enabled ? schoolId : undefined,
    pageSize: 200,
  })
  const query = useGetBroadsheet({
    schoolId: enabled ? schoolId : "",
    classId,
    sessionId,
    schoolSessionTermId: termId,
  })
  const sheet = useMemo(
    () => (query.broadsheet ? buildCasSheet(query.broadsheet) : undefined),
    [query.broadsheet]
  )
  return {
    sheet,
    classes: classes.map((c) => ({ value: c.Id, label: c.ClsName })),
    loading: enabled && (classesLoading || query.isLoading),
    failed: query.isError,
  }
}

export type CasSheetState = ReturnType<typeof useCasSheet>
