import apiClient from "../api"
import { normalizeResponse } from "@/utils/apiResponse"
import type {
  AdaptiveCourseInsightsResponseI,
  AdaptiveCourseRefI,
  AdaptiveExplanationDraftInputI,
  AdaptiveExplanationDraftsResponseI,
  AdaptivePracticeBankDeleteResponseI,
  AdaptivePracticeBankQuestionResponseI,
  AdaptivePracticeBankResponseI,
  AdaptiveTopicSuggestionsResponseI,
  SaveAdaptivePracticeQuestionInputI,
  AdaptivePracticeResultResponseI,
  AdaptivePracticeSetResponseI,
  AdaptiveQuestionTaggingResponseI,
  AdaptiveQuestionTopicInputI,
  AdaptiveStudentLearningResponseI,
  AdaptiveTaggingResultResponseI,
} from "./types"

const segment = (value: string) => encodeURIComponent(value)

function teacherPath({ subjectId, classId }: AdaptiveCourseRefI) {
  return `/ELearning/Courses/${segment(subjectId)}/${segment(classId)}/Adaptive`
}

function studentPath({ subjectId, classId }: AdaptiveCourseRefI) {
  return `/ELearning/Student/Courses/${segment(subjectId)}/${segment(classId)}/Adaptive`
}

export async function getAdaptiveCourseInsightsApi(
  course: AdaptiveCourseRefI
): Promise<AdaptiveCourseInsightsResponseI> {
  const res = await apiClient.get(`${teacherPath(course)}/Insights`, {
    params: { schoolId: course.schoolId },
  })
  return normalizeResponse<AdaptiveCourseInsightsResponseI>(res)
}

export async function getAdaptiveQuestionTopicsApi(
  course: AdaptiveCourseRefI
): Promise<AdaptiveQuestionTaggingResponseI> {
  const res = await apiClient.get(`${teacherPath(course)}/QuestionTopics`, {
    params: { schoolId: course.schoolId },
  })
  return normalizeResponse<AdaptiveQuestionTaggingResponseI>(res)
}

export async function setAdaptiveQuestionTopicsApi(
  course: AdaptiveCourseRefI,
  tags: AdaptiveQuestionTopicInputI[]
): Promise<AdaptiveTaggingResultResponseI> {
  const res = await apiClient.put(
    `${teacherPath(course)}/QuestionTopics`,
    { tags },
    { params: { schoolId: course.schoolId } }
  )
  return normalizeResponse<AdaptiveTaggingResultResponseI>(res)
}

export async function suggestAdaptiveQuestionTopicsApi(
  course: AdaptiveCourseRefI,
  questionIds: string[] = []
): Promise<AdaptiveTopicSuggestionsResponseI> {
  const res = await apiClient.post(
    `${teacherPath(course)}/QuestionTopics/Suggest`,
    { questionIds },
    { params: { schoolId: course.schoolId } }
  )
  return normalizeResponse<AdaptiveTopicSuggestionsResponseI>(res)
}

export async function draftAdaptiveExplanationsApi(
  course: AdaptiveCourseRefI,
  items: AdaptiveExplanationDraftInputI[]
): Promise<AdaptiveExplanationDraftsResponseI> {
  const res = await apiClient.post(
    `${teacherPath(course)}/Explanations/Draft`,
    { items },
    { params: { schoolId: course.schoolId } }
  )
  return normalizeResponse<AdaptiveExplanationDraftsResponseI>(res)
}

export async function saveAdaptiveExplanationsApi(
  course: AdaptiveCourseRefI,
  items: { questionId: string; explanation: string | null }[]
): Promise<AdaptiveTaggingResultResponseI> {
  const res = await apiClient.put(
    `${teacherPath(course)}/Explanations`,
    { items },
    { params: { schoolId: course.schoolId } }
  )
  return normalizeResponse<AdaptiveTaggingResultResponseI>(res)
}

export async function getAdaptivePracticeBankApi(
  course: AdaptiveCourseRefI
): Promise<AdaptivePracticeBankResponseI> {
  const res = await apiClient.get(`${teacherPath(course)}/PracticeQuestions`, {
    params: { schoolId: course.schoolId },
  })
  return normalizeResponse<AdaptivePracticeBankResponseI>(res)
}

export async function saveAdaptivePracticeQuestionApi(
  course: AdaptiveCourseRefI,
  input: SaveAdaptivePracticeQuestionInputI,
  practiceQuestionId?: string
): Promise<AdaptivePracticeBankQuestionResponseI> {
  const path = `${teacherPath(course)}/PracticeQuestions`
  const config = { params: { schoolId: course.schoolId } }
  const res = practiceQuestionId
    ? await apiClient.put(`${path}/${segment(practiceQuestionId)}`, input, config)
    : await apiClient.post(path, input, config)
  return normalizeResponse<AdaptivePracticeBankQuestionResponseI>(res)
}

export async function deleteAdaptivePracticeQuestionApi(
  course: AdaptiveCourseRefI,
  practiceQuestionId: string
): Promise<AdaptivePracticeBankDeleteResponseI> {
  const res = await apiClient.delete(
    `${teacherPath(course)}/PracticeQuestions/${segment(practiceQuestionId)}`,
    { params: { schoolId: course.schoolId } }
  )
  return normalizeResponse<AdaptivePracticeBankDeleteResponseI>(res)
}

export async function getStudentAdaptiveLearningApi(
  course: AdaptiveCourseRefI
): Promise<AdaptiveStudentLearningResponseI> {
  const res = await apiClient.get(studentPath(course), {
    params: { schoolId: course.schoolId },
  })
  return normalizeResponse<AdaptiveStudentLearningResponseI>(res)
}

export async function getStudentAdaptivePracticeApi(
  course: AdaptiveCourseRefI,
  sectionId: string,
  count = 5
): Promise<AdaptivePracticeSetResponseI> {
  const res = await apiClient.get(
    `${studentPath(course)}/Topics/${segment(sectionId)}/Practice`,
    { params: { schoolId: course.schoolId, count } }
  )
  return normalizeResponse<AdaptivePracticeSetResponseI>(res)
}

export async function submitStudentAdaptivePracticeAnswerApi(
  course: AdaptiveCourseRefI,
  sectionId: string,
  input: { questionId: string; selectedOptionIds: string[] }
): Promise<AdaptivePracticeResultResponseI> {
  const res = await apiClient.post(
    `${studentPath(course)}/Topics/${segment(sectionId)}/Practice/Answers`,
    input,
    { params: { schoolId: course.schoolId } }
  )
  return normalizeResponse<AdaptivePracticeResultResponseI>(res)
}

export type * from "./types"
