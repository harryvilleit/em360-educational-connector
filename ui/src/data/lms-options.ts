import type { LmsAssignmentType, LmsCourseLevel } from "@/types/elearning"
import type {
  LmsAssignmentTypeOption,
  LmsCreateAssignmentTypeOption,
  LmsLessonTypeOption,
  LmsSelectOption,
} from "@/types/lms-options"

export const LMS_COURSE_LEVELS: LmsCourseLevel[] = [
  "beginner",
  "intermediate",
  "advanced",
]

export const LMS_CURRENCY_OPTIONS: LmsSelectOption[] = [
  { value: "NGN", label: "NGN — Nigerian Naira", description: "₦" },
  { value: "USD", label: "USD — US Dollar", description: "$" },
  { value: "GBP", label: "GBP — British Pound", description: "£" },
  { value: "EUR", label: "EUR — Euro", description: "€" },
]

export const LMS_LESSON_TYPES: LmsLessonTypeOption[] = [
  { value: "video", label: "Pre-recorded video" },
  { value: "article", label: "Article / HTML content" },
  { value: "document", label: "Material / document" },
  { value: "assignment", label: "Assignment" },
  { value: "live", label: "Live session link" },
]

export const LMS_LESSON_ASSIGNMENT_TYPES: LmsAssignmentTypeOption[] = [
  {
    value: "cbt",
    label: "CBT (Multiple choice)",
    hint: "Auto-graded online test",
  },
  {
    value: "paper",
    label: "Paper / PDF upload",
    hint: "Student scans or uploads PDF",
  },
  { value: "written", label: "Written / typed", hint: "Student types answers" },
  { value: "voice", label: "Voice response", hint: "Student records voice" },
  {
    value: "video_response",
    label: "Video response",
    hint: "Student records video",
  },
]

export const LMS_CREATE_ASSIGNMENT_TYPES: LmsCreateAssignmentTypeOption[] = [
  {
    value: "cbt",
    label: "CBT / Online test",
    description: "Multiple-choice questions auto-graded on submit",
  },
  {
    value: "voice",
    label: "Voice response",
    description: "Students record voice answers to your prompts",
  },
  {
    value: "file_upload",
    label: "Document",
    description: "Upload a document students download, complete, and submit",
  },
]

export const LMS_ASSIGNMENT_TYPE_LABELS: Record<LmsAssignmentType, string> = {
  cbt: "CBT / MCQ",
  paper: "Paper / PDF",
  voice: "Voice",
  written: "Written",
  handwritten: "Handwritten (scan)",
  file_upload: "File upload",
  video_response: "Video response",
  video_mcq: "Video + MCQ",
}

export function getLmsAssignmentTypeLabel(type: LmsAssignmentType | string) {
  return LMS_ASSIGNMENT_TYPE_LABELS[type as LmsAssignmentType] ?? type
}
