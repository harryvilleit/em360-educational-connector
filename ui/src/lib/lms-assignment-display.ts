import type {
  LmsAssignmentType,
  LmsSubmission,
} from "@/types/elearning"
import { getLmsAssignmentTypeLabel } from "@/data/lms-options"

export { getLmsAssignmentTypeLabel }

export const LMS_ASSIGNMENT_STATUS_STYLES = {
  draft: "bg-amber-50 text-amber-800",
  open: "bg-green-50 text-green-700",
  closed: "bg-gray-50 text-gray-600",
  graded: "bg-blue-50 text-blue-700",
} as const

export const LMS_SUBMISSION_STATUS_STYLES = {
  submitted: "bg-amber-50 text-amber-800",
  pending_approval: "bg-blue-50 text-blue-700",
  graded: "bg-green-50 text-green-700",
  resubmit_requested: "bg-red-50 text-red-700",
} as const

export function getAssignmentStatusStyle(
  status: keyof typeof LMS_ASSIGNMENT_STATUS_STYLES | string
) {
  return (
    LMS_ASSIGNMENT_STATUS_STYLES[
      status as keyof typeof LMS_ASSIGNMENT_STATUS_STYLES
    ] ?? "bg-gray-50 text-gray-600"
  )
}

export function getSubmissionStatusStyle(
  status: keyof typeof LMS_SUBMISSION_STATUS_STYLES | string
) {
  return (
    LMS_SUBMISSION_STATUS_STYLES[
      status as keyof typeof LMS_SUBMISSION_STATUS_STYLES
    ] ?? "bg-gray-50 text-gray-600"
  )
}

export function getAssignmentTypeLabel(type: LmsAssignmentType | string) {
  return getLmsAssignmentTypeLabel(type as LmsAssignmentType) ?? type
}

export function scoreTone(score: number) {
  if (score >= 70) return "text-emerald-700 bg-emerald-50"
  if (score >= 50) return "text-amber-700 bg-amber-50"
  return "text-red-700 bg-red-50"
}

export function formatScorePercent(score: number | undefined | null) {
  if (score == null) return null
  return `${Math.round(score)}%`
}

export type StudentScoreBadgeProps = {
  score?: number
  status?: LmsSubmission["status"] | string
}
