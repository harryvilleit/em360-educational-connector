import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  deleteAdaptivePracticeQuestionApi,
  draftAdaptiveExplanationsApi,
  getAdaptivePracticeBankApi,
  saveAdaptiveExplanationsApi,
  saveAdaptivePracticeQuestionApi,
  suggestAdaptiveQuestionTopicsApi,
  getAdaptiveCourseInsightsApi,
  getAdaptiveQuestionTopicsApi,
  getStudentAdaptiveLearningApi,
  getStudentAdaptivePracticeApi,
  setAdaptiveQuestionTopicsApi,
  submitStudentAdaptivePracticeAnswerApi,
  type AdaptiveCourseRefI,
  type AdaptiveExplanationDraftInputI,
  type AdaptiveQuestionTopicInputI,
  type SaveAdaptivePracticeQuestionInputI,
} from "@/api/adaptiveLearning.api"
import { useAuthStore } from "@/store/auth.store"

const courseKey = (course?: AdaptiveCourseRefI) => [
  course?.schoolId ?? null,
  course?.subjectId ?? null,
  course?.classId ?? null,
]

export const adaptiveInsightsKey = (course?: AdaptiveCourseRefI) => [
  "adaptive-insights",
  ...courseKey(course),
]
export const adaptiveQuestionTopicsKey = (course?: AdaptiveCourseRefI) => [
  "adaptive-question-topics",
  ...courseKey(course),
]
export const adaptivePracticeBankKey = (course?: AdaptiveCourseRefI) => [
  "adaptive-practice-bank",
  ...courseKey(course),
]
export const studentAdaptiveKey = (course?: AdaptiveCourseRefI, userId?: string) => [
  "student-adaptive-learning",
  ...courseKey(course),
  userId ?? null,
]

const isComplete = (course?: AdaptiveCourseRefI): course is AdaptiveCourseRefI =>
  Boolean(course?.schoolId && course.subjectId && course.classId)

export function useAdaptiveCourseInsights(course?: AdaptiveCourseRefI) {
  const query = useQuery({
    queryKey: adaptiveInsightsKey(course),
    queryFn: () => getAdaptiveCourseInsightsApi(course!),
    enabled: isComplete(course),
    staleTime: 60 * 1000,
    retry: false,
  })
  return { ...query, insights: query.data?.value }
}

export function useAdaptiveQuestionTopics(course?: AdaptiveCourseRefI, enabled = true) {
  const query = useQuery({
    queryKey: adaptiveQuestionTopicsKey(course),
    queryFn: () => getAdaptiveQuestionTopicsApi(course!),
    enabled: enabled && isComplete(course),
    staleTime: 30 * 1000,
    retry: false,
  })
  return { ...query, tagging: query.data?.value }
}

export function useSetAdaptiveQuestionTopics(course?: AdaptiveCourseRefI) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (tags: AdaptiveQuestionTopicInputI[]) =>
      setAdaptiveQuestionTopicsApi(course!, tags),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adaptiveQuestionTopicsKey(course) })
      void queryClient.invalidateQueries({ queryKey: adaptiveInsightsKey(course) })
    },
  })
}

export function useSuggestAdaptiveQuestionTopics(course?: AdaptiveCourseRefI) {
  return useMutation({
    mutationFn: (questionIds: string[] = []) =>
      suggestAdaptiveQuestionTopicsApi(course!, questionIds),
  })
}

export function useDraftAdaptiveExplanations(course?: AdaptiveCourseRefI) {
  return useMutation({
    mutationFn: (items: AdaptiveExplanationDraftInputI[]) =>
      draftAdaptiveExplanationsApi(course!, items),
  })
}

export function useSaveAdaptiveExplanations(course?: AdaptiveCourseRefI) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (items: { questionId: string; explanation: string | null }[]) =>
      saveAdaptiveExplanationsApi(course!, items),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adaptiveQuestionTopicsKey(course) })
    },
  })
}

export function useAdaptivePracticeBank(course?: AdaptiveCourseRefI, enabled = true) {
  const query = useQuery({
    queryKey: adaptivePracticeBankKey(course),
    queryFn: () => getAdaptivePracticeBankApi(course!),
    enabled: enabled && isComplete(course),
    staleTime: 30 * 1000,
    retry: false,
  })
  return { ...query, bank: query.data?.value }
}

export function useSaveAdaptivePracticeQuestion(course?: AdaptiveCourseRefI) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: { id?: string; data: SaveAdaptivePracticeQuestionInputI }) =>
      saveAdaptivePracticeQuestionApi(course!, input.data, input.id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adaptivePracticeBankKey(course) })
      void queryClient.invalidateQueries({ queryKey: adaptiveInsightsKey(course) })
    },
  })
}

export function useDeleteAdaptivePracticeQuestion(course?: AdaptiveCourseRefI) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteAdaptivePracticeQuestionApi(course!, id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adaptivePracticeBankKey(course) })
      void queryClient.invalidateQueries({ queryKey: adaptiveInsightsKey(course) })
    },
  })
}

export function useStudentAdaptiveLearning(course?: AdaptiveCourseRefI) {
  const userId = useAuthStore((state) => state.user?.id)
  const query = useQuery({
    queryKey: studentAdaptiveKey(course, userId),
    queryFn: () => getStudentAdaptiveLearningApi(course!),
    enabled: isComplete(course) && Boolean(userId),
    staleTime: 30 * 1000,
    retry: false,
  })
  return { ...query, learning: query.data?.value }
}

/** Practice sets are fetched on demand so a fresh, re-prioritised set comes back each time. */
export function useStartStudentPractice(course?: AdaptiveCourseRefI) {
  return useMutation({
    mutationFn: (sectionId: string) => getStudentAdaptivePracticeApi(course!, sectionId),
  })
}

export function useSubmitStudentPracticeAnswer(course?: AdaptiveCourseRefI) {
  const queryClient = useQueryClient()
  const userId = useAuthStore((state) => state.user?.id)
  return useMutation({
    mutationFn: (input: {
      sectionId: string
      questionId: string
      selectedOptionIds: string[]
    }) =>
      submitStudentAdaptivePracticeAnswerApi(course!, input.sectionId, {
        questionId: input.questionId,
        selectedOptionIds: input.selectedOptionIds,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: studentAdaptiveKey(course, userId) })
    },
  })
}
