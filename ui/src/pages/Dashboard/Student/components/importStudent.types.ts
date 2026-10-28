import type { Gender } from "@/types/student"

export type ValidRow = {
  rowNumber: number
  studentId: string
  firstName: string
  lastName: string
  middleName?: string
  gender: Gender
  email: string
  dob: string
  class: string
  arm?: string
  guardianName: string
  guardianRelationship: string
  guardianPhone: string
  guardianEmail: string
  guardianAddress?: string
}

export type InvalidRow = {
  rowNumber: number
  data: Record<string, string>
  errors: string[]
}
