// WordPress frames keep the parent filters in memory only; the main site persists them in browser storage.
import { create } from "zustand"

export interface SelectedClassI {
  enrollmentId: string
  schoolClassId: string
  className: string
  schoolArmId: string | null
  armName: string | null
  isCurrent: boolean
}

interface ParentPortalFilterState {
  guardianId: string
  selectedChildId: string
  selectedSessionId: string
  selectedTermId: string
  selectedClass: SelectedClassI | null
  setGuardian: (guardianId: string) => void
  selectChild: (id: string) => void
  selectSession: (id: string) => void
  selectTerm: (id: string) => void
  selectClass: (cls: SelectedClassI | null) => void
}

export const useParentPortalFilterStore = create<ParentPortalFilterState>(
  (set) => ({
    guardianId: "",
    selectedChildId: "",
    selectedSessionId: "",
    selectedTermId: "",
    selectedClass: null,
    setGuardian: (guardianId) =>
      set({
        guardianId,
        selectedChildId: "",
        selectedSessionId: "",
        selectedTermId: "",
        selectedClass: null,
      }),
    selectChild: (id) =>
      set({
        selectedChildId: id,
        selectedSessionId: "",
        selectedTermId: "",
        selectedClass: null,
      }),
    selectSession: (id) =>
      set({ selectedSessionId: id, selectedTermId: "", selectedClass: null }),
    selectTerm: (id) => set({ selectedTermId: id }),
    selectClass: (cls) => set({ selectedClass: cls }),
  })
)
