import type { LmsAssignment } from "@/types/elearning"

export function getCourseAssignmentWeightTotal(
  assignments: LmsAssignment[],
  courseId: string,
  excludeAssignmentId?: string
) {
  return assignments
    .filter((a) => a.courseId === courseId && a.id !== excludeAssignmentId)
    .reduce((sum, a) => sum + (a.weightPercent ?? 0), 0)
}

export function getRemainingCourseWeight(
  assignments: LmsAssignment[],
  courseId: string,
  excludeAssignmentId?: string
) {
  return Math.max(0, 100 - getCourseAssignmentWeightTotal(assignments, courseId, excludeAssignmentId))
}

export function isCourseWeightComplete(
  assignments: LmsAssignment[],
  courseId: string
) {
  return getCourseAssignmentWeightTotal(assignments, courseId) === 100
}

export function weightedContribution(
  scorePercent: number,
  weightPercent: number
) {
  return (scorePercent * weightPercent) / 100
}
