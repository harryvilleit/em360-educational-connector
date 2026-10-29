import { create } from "zustand"
import { persist } from "zustand/middleware"

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


export const useParentPortalFilterStore = create<ParentPortalFilterState>()(
  persist(
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
    }),
    { name: "em360-parent-portal-filter" }
  )
)
