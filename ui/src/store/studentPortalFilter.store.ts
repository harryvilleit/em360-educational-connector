import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface SelectedStudentClassI {
  enrollmentId: string
  schoolClassId: string
  className: string
  schoolArmId: string | null
  armName: string | null
  isPrimaryClass: boolean
  classType: string
  isCurrent: boolean
}

interface StudentPortalFilterState {
  studentId: string
  selectedSessionId: string
  selectedTermId: string
  selectedClass: SelectedStudentClassI | null
  setStudent: (studentId: string) => void
  selectSession: (id: string) => void
  selectTerm: (id: string) => void
  selectClass: (cls: SelectedStudentClassI | null) => void
}

export const useStudentPortalFilterStore = create<StudentPortalFilterState>()(
  persist(
    (set) => ({
      studentId: "",
      selectedSessionId: "",
      selectedTermId: "",
      selectedClass: null,
      setStudent: (studentId) =>
        set({
          studentId,
          selectedSessionId: "",
          selectedTermId: "",
          selectedClass: null,
        }),
      selectSession: (id) =>
        set({ selectedSessionId: id, selectedTermId: "", selectedClass: null }),
      selectTerm: (id) => set({ selectedTermId: id, selectedClass: null }),
      selectClass: (cls) => set({ selectedClass: cls }),
    }),
    { name: "em360-student-portal-filter" }
  )
)
