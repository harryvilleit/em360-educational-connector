import { useEffect } from "react"
import {
  useParentPortalFilterStore,
  type SelectedClassI,
} from "@/store/parentPortalFilter.store"

export function useParentPortalSelection(guardianId: string) {
  const store = useParentPortalFilterStore()
  const isCurrentGuardian = !!guardianId && store.guardianId === guardianId

  useEffect(() => {
    if (guardianId && store.guardianId !== guardianId) {
      store.setGuardian(guardianId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guardianId, store.guardianId])

  return {
    selectedChildId: isCurrentGuardian ? store.selectedChildId : "",
    selectedSessionId: isCurrentGuardian ? store.selectedSessionId : "",
    selectedTermId: isCurrentGuardian ? store.selectedTermId : "",
    selectedClass: isCurrentGuardian ? store.selectedClass : null,
    selectChild: store.selectChild,
    selectSession: store.selectSession,
    selectTerm: store.selectTerm,
    selectClass: store.selectClass,
  }
}

export type { SelectedClassI }
