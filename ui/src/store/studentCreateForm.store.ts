import { create } from "zustand"
import type { AcademicRecord, WelfareRecord } from "@/types/student"

export interface StudentFormData {
  // Basic Step
  studentId?: string
  firstname: string
  lastname: string
  middleName?: string
  email: string
  isDefaultEmail: boolean
  password: string
  gender: number | ""
  dateofBirth?: string
  profilePicture?: string | null
  guardianIds: string[]
  linkedExistingStudentId?: string

  // Standard Step
  nationality?: string
  stateOfOrigin?: string
  localGovernment?: string
  homeAddress?: string
  religion?: string
  admissionDate?: string
  previousSchool?: string
  academicHistory?: Array<
    Pick<AcademicRecord, "session" | "term" | "class" | "average" | "remarks">
  >

  // Advanced Step
  bloodGroup?: string
  genotype?: string
  allergies?: string
  chronicCondtions?: string
  disabilities?: string
  specialNeeds: boolean
  specialNeedsDescription?: string
  welfareRecords?: Array<
    Pick<
      WelfareRecord,
      "type" | "date" | "description" | "reportedBy" | "resolved"
    >
  >
  behavioralNotes?: string
  extracurriculars?: string[]
}

export interface StudentCreateFormState {
  formData: StudentFormData
  currentStep: "basic" | "standard" | "advanced"
  isBasicComplete: boolean
  isStandardComplete: boolean

  // Actions
  updateBasicStep: (data: Partial<StudentFormData>) => void
  updateStandardStep: (data: Partial<StudentFormData>) => void
  updateAdvancedStep: (data: Partial<StudentFormData>) => void
  setCurrentStep: (step: "basic" | "standard" | "advanced") => void
  setBasicComplete: (complete: boolean) => void
  setStandardComplete: (complete: boolean) => void
  getFormData: () => StudentFormData
  resetForm: () => void
}

const EMPTY_FORM_DATA: StudentFormData = {
  firstname: "",
  lastname: "",
  email: "",
  isDefaultEmail: true,
  password: "",
  gender: "",
  guardianIds: [],
  specialNeeds: false,
}

export const useStudentCreateFormStore = create<StudentCreateFormState>(
  (set, get) => ({
    formData: EMPTY_FORM_DATA,
    currentStep: "basic",
    isBasicComplete: false,
    isStandardComplete: false,

    updateBasicStep: (data) => {
      set((state) => ({
        formData: {
          ...state.formData,
          ...data,
        },
      }))
    },

    updateStandardStep: (data) => {
      set((state) => ({
        formData: {
          ...state.formData,
          ...data,
        },
      }))
    },

    updateAdvancedStep: (data) => {
      set((state) => ({
        formData: {
          ...state.formData,
          ...data,
        },
      }))
    },

    setCurrentStep: (step) => {
      set({ currentStep: step })
    },

    setBasicComplete: (complete) => {
      set({ isBasicComplete: complete })
    },

    setStandardComplete: (complete) => {
      set({ isStandardComplete: complete })
    },

    getFormData: () => {
      return get().formData
    },

    resetForm: () => {
      set({
        formData: EMPTY_FORM_DATA,
        currentStep: "basic",
        isBasicComplete: false,
        isStandardComplete: false,
      })
    },
  })
)
