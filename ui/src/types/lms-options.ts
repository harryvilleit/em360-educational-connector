import type { LmsAssignmentType, LmsLessonType } from "@/types/elearning"

export type LmsCreateAssignmentType = "cbt" | "voice" | "file_upload"

export type LmsLessonTypeOption = {
  value: LmsLessonType
  label: string
}

export type LmsAssignmentTypeOption = {
  value: LmsAssignmentType
  label: string
  hint?: string
  description?: string
}

export type LmsCreateAssignmentTypeOption = {
  value: LmsCreateAssignmentType
  label: string
  description?: string
}

export type LmsSelectOption = {
  value: string
  label: string
  description?: string
}
