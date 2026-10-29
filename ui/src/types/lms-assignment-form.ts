import type {
  LmsAssignment,
  LmsAssignmentQuestion,
  LmsAssignmentType,
} from "@/types/elearning"
import type { LmsAssignmentFormSchema } from "@/schema/lmsAssignment.schema"

export type CreateAssignmentPayload = {
  title: string
  courseId: string
  courseTitle: string
  type: LmsAssignmentType
  description: string
  dueDate: string
  startDate?: string
  endDate?: string
  durationMinutes?: number
  questionFileUrl?: string
  questionFileName?: string
  tutorVoicePromptUrl?: string
  tutorVideoNoteUrl?: string
  requireStudentVideo?: boolean
  requireCameraRecording?: boolean
  requireVoiceResponse?: boolean
  voiceTimerMode?: "total" | "per_question"
  gradeType?: "percentage" | "points"
  maxScore?: number
  weightPercent?: number
  questions?: LmsAssignmentQuestion[]
}

export const ASSIGNMENT_MCQ_OPTION_KEYS = ["A", "B", "C", "D"] as const
export type AssignmentMcqOptionKey = (typeof ASSIGNMENT_MCQ_OPTION_KEYS)[number]

export type AssignmentMcqOptionsDraft = Record<AssignmentMcqOptionKey, string>

export type AssignmentCbtDraft = {
  id?: string
  text: string
  options: AssignmentMcqOptionsDraft
  correct: AssignmentMcqOptionKey
}

export type AssignmentVoiceQuestionDraft = {
  id: string
  tutorVoicePromptUrl?: string
  voicePromptFileName?: string
  text: string
  voicePromptFile: File | null
  recordingVoice: boolean
  durationMinutes: string
}

export type AssignmentFormValues = LmsAssignmentFormSchema

export type CreateAssignmentFormProps = {
  courses: { id: string; title: string }[]
  defaultCourseId?: string
  lockCourse?: boolean
  editingAssignmentId?: string
  initialAssignment?: LmsAssignment
  existingAssignments?: LmsAssignment[]
  submitLabel?: string
  onSubmit: (data: CreateAssignmentPayload) => void | Promise<void>
  onCancel: () => void
}
