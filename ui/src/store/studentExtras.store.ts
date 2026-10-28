import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { AcademicRecord, WelfareRecord } from "@/types/student"

export interface StudentExtras {
  sssTrack?: string
  middleName?: string
  admissionDate?: string
  previousSchool?: string
  academicHistory: AcademicRecord[]
  welfareRecords: WelfareRecord[]
  extracurriculars: string[]
  behavioralNotes?: string
  specialNeedsDescription?: string
  emergencyMedicalInfo?: string
  guardianId?: string
}

const EMPTY_EXTRAS: StudentExtras = {
  academicHistory: [],
  welfareRecords: [],
  extracurriculars: [],
}

export interface StudentExtrasState {
  extras: Record<string, StudentExtras>

  getExtras: (studentId: string) => StudentExtras
  setExtras: (studentId: string, data: Partial<StudentExtras>) => void
  addAcademicRecord: (studentId: string, record: AcademicRecord) => void
  addWelfareRecord: (studentId: string, record: WelfareRecord) => void
  resolveWelfareRecord: (
    studentId: string,
    recordIndex: number,
    resolution: string
  ) => void
}

export const useStudentExtrasStore = create<StudentExtrasState>()(
  persist(
    (set, get) => ({
      extras: {},

      getExtras: (studentId) => get().extras[studentId] ?? EMPTY_EXTRAS,

      setExtras: (studentId, data) => {
        set((state) => ({
          extras: {
            ...state.extras,
            [studentId]: {
              ...EMPTY_EXTRAS,
              ...state.extras[studentId],
              ...data,
            },
          },
        }))
      },

      addAcademicRecord: (studentId, record) => {
        set((state) => {
          const current = state.extras[studentId] ?? EMPTY_EXTRAS
          return {
            extras: {
              ...state.extras,
              [studentId]: {
                ...current,
                academicHistory: [...current.academicHistory, record],
              },
            },
          }
        })
      },

      addWelfareRecord: (studentId, record) => {
        set((state) => {
          const current = state.extras[studentId] ?? EMPTY_EXTRAS
          return {
            extras: {
              ...state.extras,
              [studentId]: {
                ...current,
                welfareRecords: [...current.welfareRecords, record],
              },
            },
          }
        })
      },

      resolveWelfareRecord: (studentId, recordIndex, resolution) => {
        set((state) => {
          const current = state.extras[studentId] ?? EMPTY_EXTRAS
          const updated = [...current.welfareRecords]
          if (!updated[recordIndex]) return state
          updated[recordIndex] = {
            ...updated[recordIndex],
            resolved: true,
            resolution,
          }
          return {
            extras: {
              ...state.extras,
              [studentId]: {
                ...current,
                welfareRecords: updated,
              },
            },
          }
        })
      },
    }),
    { name: "em360-student-extras", version: 1 }
  )
)
