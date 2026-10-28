import { useEffect } from "react"
import {
  useStudentPortalFilterStore,
  type SelectedStudentClassI,
} from "@/store/studentPortalFilter.store"

export function useStudentPortalSelection(studentId: string) {
  const store = useStudentPortalFilterStore()
  const isCurrentStudent = !!studentId && store.studentId === studentId

  useEffect(() => {
    if (studentId && store.studentId !== studentId) {
      store.setStudent(studentId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId, store.studentId])

  return {
    selectedSessionId: isCurrentStudent ? store.selectedSessionId : "",
    selectedTermId: isCurrentStudent ? store.selectedTermId : "",
    selectedClass: isCurrentStudent ? store.selectedClass : null,
    selectSession: store.selectSession,
    selectTerm: store.selectTerm,
    selectClass: store.selectClass,
  }
}

export type { SelectedStudentClassI }
