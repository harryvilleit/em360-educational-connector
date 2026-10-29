import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  createAssignmentApi,
  approveAssignmentSubmissionApi,
  autoGradeAssignmentSubmissionApi,
  deleteAssignmentApi,
  getCourseAssignmentPlanApi,
  getCourseGradesApi,
  getMyCourseGradeApi,
  getCourseAssignmentsApi,
  getMyAssignmentsApi,
  mapCourseAssignment,
  submitAssignmentApi,
  gradeAssignmentSubmissionApi,
  publishCourseAssignmentPlanApi,
  reopenAssignmentSubmissionApi,
  updateAssignmentApi,
} from "@/api/assignment.api"
import type { CreateAssignmentPayload } from "@/types/lms-assignment-form"

const rootKey = ["lms", "assignments"] as const

export function useMyAssignments(enabled = true) {
  const query = useQuery({
    queryKey: [...rootKey, "mine"],
    queryFn: getMyAssignmentsApi,
    enabled,
    staleTime: 15_000,
  })
  return {
    ...query,
    assignments: (query.data?.value ?? []).map(mapCourseAssignment),
  }
}

export function useCourseAssignments(courseId?: string, enabled = true) {
  const query = useQuery({
    queryKey: [...rootKey, "course", courseId],
    queryFn: () => getCourseAssignmentsApi(courseId!),
    enabled: enabled && Boolean(courseId),
    staleTime: 15_000,
  })
  return {
    ...query,
    assignments: (query.data?.value ?? []).map(mapCourseAssignment),
  }
}

export function useCourseAssignmentPlan(courseId?: string, enabled = true) {
  const query = useQuery({
    queryKey: [...rootKey, "plan", courseId],
    queryFn: () => getCourseAssignmentPlanApi(courseId!),
    enabled: enabled && Boolean(courseId),
  })
  return { ...query, plan: query.data?.value }
}

export function useMyCourseGrade(courseId?: string, enabled = true) {
  const query = useQuery({
    queryKey: [...rootKey, "result", "mine", courseId],
    queryFn: () => getMyCourseGradeApi(courseId!),
    enabled: enabled && Boolean(courseId),
  })
  return { ...query, result: query.data?.value }
}

export function useCourseGrades(courseId?: string, enabled = true) {
  const query = useQuery({
    queryKey: [...rootKey, "results", courseId],
    queryFn: () => getCourseGradesApi(courseId!),
    enabled: enabled && Boolean(courseId),
  })
  return { ...query, results: query.data?.value ?? [] }
}

export function useAssignmentActions() {
  const client = useQueryClient()
  const invalidate = () => client.invalidateQueries({ queryKey: rootKey })
  const create = useMutation({ mutationFn: createAssignmentApi, onSuccess: invalidate })
  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CreateAssignmentPayload }) =>
      updateAssignmentApi(id, payload),
    onSuccess: invalidate,
  })
  const submit = useMutation({
    mutationFn: ({
      assignmentId,
      response,
    }: {
      assignmentId: string
      response: Record<string, unknown>
    }) => submitAssignmentApi(assignmentId, response),
    onSuccess: invalidate,
  })
  const publishPlan = useMutation({
    mutationFn: publishCourseAssignmentPlanApi,
    onSuccess: invalidate,
  })
  const remove = useMutation({
    mutationFn: deleteAssignmentApi,
    onSuccess: invalidate,
  })
  const grade = useMutation({
    mutationFn: ({ assignmentId, submissionId, score, feedback, privateNotes, approve = true }: {
      assignmentId: string
      submissionId: string
      score: number
      feedback?: string
      privateNotes?: string
      approve?: boolean
    }) => gradeAssignmentSubmissionApi(
      assignmentId, submissionId, score, feedback, privateNotes, approve
    ),
    onSuccess: invalidate,
  })
  const autoGrade = useMutation({
    mutationFn: ({ assignmentId, submissionId }: { assignmentId: string; submissionId: string }) =>
      autoGradeAssignmentSubmissionApi(assignmentId, submissionId),
    onSuccess: invalidate,
  })
  const approve = useMutation({
    mutationFn: ({ assignmentId, submissionId }: { assignmentId: string; submissionId: string }) =>
      approveAssignmentSubmissionApi(assignmentId, submissionId),
    onSuccess: invalidate,
  })
  const reopen = useMutation({
    mutationFn: ({ assignmentId, submissionId }: { assignmentId: string; submissionId: string }) =>
      reopenAssignmentSubmissionApi(assignmentId, submissionId),
    onSuccess: invalidate,
  })
  return { create, update, submit, publishPlan, remove, grade, autoGrade, approve, reopen }
}
