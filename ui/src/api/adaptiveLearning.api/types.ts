import type { ApiResultI } from "@/utils/apiResponse"

export type AdaptiveMasteryStatusI =
  | "secure"
  | "developing"
  | "gap"
  | "not_enough_evidence"

export interface AdaptiveCourseRefI {
  schoolId: string
  subjectId: string
  classId: string
}

export interface AdaptiveMethodI {
  model: string
  description: string
  secureThresholdPercent: number
  gapThresholdPercent: number
  minimumEvidenceItems: number
  recencyHalfLifeDays: number
  practiceWeight: number
}

// ── Teacher: tagging ─────────────────────────────────────────────────────────

export interface AdaptiveTopicOptionI {
  id: string
  title: string
  sortOrder: number
}

export interface AdaptiveTaggingQuestionI {
  questionId: string
  sortOrder: number
  prompt: string
  answerMode: string
  topicSectionId?: string | null
  isObjective: boolean
  hasReferenceAnswer: boolean
  practiceExplanation?: string | null
}

export interface AdaptiveTaggingAssignmentI {
  assignmentId: string
  title: string
  status: string
  dueDateUtc: string
  questions: AdaptiveTaggingQuestionI[]
}

export interface AdaptiveQuestionTaggingI {
  topics: AdaptiveTopicOptionI[]
  assignments: AdaptiveTaggingAssignmentI[]
  taggedQuestionCount: number
  untaggedQuestionCount: number
  aiAvailable: boolean
}

export interface AdaptiveQuestionTopicInputI {
  questionId: string
  topicSectionId: string | null
}

// ── Teacher: insights ────────────────────────────────────────────────────────

export interface AdaptiveTopicSummaryI {
  sectionId: string
  title: string
  sortOrder: number
  taggedQuestionCount: number
  assessedStudentCount: number
  averageMasteryPercent?: number | null
  secureCount: number
  developingCount: number
  gapCount: number
  notEnoughEvidenceCount: number
}

export interface AdaptiveStudentTopicI {
  sectionId: string
  title: string
  masteryPercent?: number | null
  status: AdaptiveMasteryStatusI
}

export interface AdaptiveStudentSupportI {
  studentId: string
  studentName: string
  gapCount: number
  developingCount: number
  averageMasteryPercent?: number | null
  gapTopics: AdaptiveStudentTopicI[]
  lastPracticedAtUtc?: string | null
}

export interface AdaptiveMisconceptionI {
  questionId: string
  sectionId: string
  topicTitle: string
  questionPrompt: string
  wrongOptionText: string
  correctOptionText: string
  chosenCount: number
  responseCount: number
  sharePercent: number
}

export interface AdaptiveCourseInsightsI {
  schoolId: string
  subjectId: string
  classId: string
  enrolledStudentCount: number
  taggedQuestionCount: number
  untaggedQuestionCount: number
  assessmentEvidenceCount: number
  practiceResponseCount: number
  practicingStudentCount: number
  practiceBankQuestionCount: number
  topics: AdaptiveTopicSummaryI[]
  studentsNeedingSupport: AdaptiveStudentSupportI[]
  misconceptions: AdaptiveMisconceptionI[]
  method: AdaptiveMethodI
  generatedAtUtc: string
}

// ── Student ──────────────────────────────────────────────────────────────────

export interface AdaptiveStudentTopicMasteryI {
  sectionId: string
  title: string
  sortOrder: number
  masteryPercent?: number | null
  status: AdaptiveMasteryStatusI
  assessmentEvidenceCount: number
  practiceEvidenceCount: number
  lastEvidenceAtUtc?: string | null
  practiceQuestionCount: number
}

export interface AdaptiveRecommendationI {
  sectionId: string
  title: string
  status: AdaptiveMasteryStatusI
  masteryPercent?: number | null
  reason: string
  nextLessonId?: string | null
  nextLessonTitle?: string | null
  lessonAction?: "start" | "continue" | "review" | null
  practiceQuestionCount: number
}

export interface AdaptiveStudentLearningI {
  subjectId: string
  subjectName: string
  classId: string
  className: string
  overallMasteryPercent?: number | null
  topics: AdaptiveStudentTopicMasteryI[]
  recommendations: AdaptiveRecommendationI[]
  method: AdaptiveMethodI
}

export interface AdaptivePracticeOptionI {
  id: string
  text: string
}

export interface AdaptivePracticeQuestionI {
  questionId: string
  prompt: string
  answerMode: "single_choice" | "multiple_choice" | string
  options: AdaptivePracticeOptionI[]
  reason: string
  isTeacherPractice: boolean
}

export interface AdaptivePracticeSetI {
  sectionId: string
  title: string
  questions: AdaptivePracticeQuestionI[]
}

export interface AdaptivePracticeResultI {
  isCorrect: boolean
  correctOptionIds: string[]
  explanation?: string | null
  topic: AdaptiveStudentTopicMasteryI
}

// ── Teacher: AI assists ──────────────────────────────────────────────────────

export interface AdaptiveTopicSuggestionI {
  questionId: string
  topicSectionId?: string | null
  topicTitle?: string | null
  confidence: number
  reason: string
}

export interface AdaptivePracticeOptionInputI {
  text: string
  isCorrect: boolean
}

export interface AdaptiveExplanationDraftInputI {
  questionId?: string
  prompt?: string
  answerMode?: string
  sectionId?: string
  options?: AdaptivePracticeOptionInputI[]
}

export interface AdaptiveExplanationDraftI {
  key: string
  explanation: string
}

// ── Teacher: practice bank ───────────────────────────────────────────────────

export interface AdaptivePracticeBankOptionI {
  id: string
  text: string
  isCorrect: boolean
  sortOrder: number
}

export interface AdaptivePracticeBankQuestionI {
  id: string
  sectionId: string
  prompt: string
  answerMode: "single_choice" | "multiple_choice"
  explanation?: string | null
  isActive: boolean
  sortOrder: number
  responseCount: number
  options: AdaptivePracticeBankOptionI[]
  dateModified: string
}

export interface AdaptivePracticeBankI {
  topics: AdaptiveTopicOptionI[]
  questions: AdaptivePracticeBankQuestionI[]
  aiAvailable: boolean
}

export interface SaveAdaptivePracticeQuestionInputI {
  sectionId: string
  prompt: string
  answerMode: "single_choice" | "multiple_choice"
  explanation?: string | null
  isActive: boolean
  options: AdaptivePracticeOptionInputI[]
}

export interface AdaptiveTopicSuggestionsResponseI extends ApiResultI {
  value: { suggestions: AdaptiveTopicSuggestionI[]; model: string }
}
export interface AdaptiveExplanationDraftsResponseI extends ApiResultI {
  value: { drafts: AdaptiveExplanationDraftI[]; model: string }
}
export interface AdaptivePracticeBankResponseI extends ApiResultI {
  value: AdaptivePracticeBankI
}
export interface AdaptivePracticeBankQuestionResponseI extends ApiResultI {
  value: AdaptivePracticeBankQuestionI
}
export interface AdaptivePracticeBankDeleteResponseI extends ApiResultI {
  value: { deleted: boolean; archived: boolean }
}

export interface AdaptiveQuestionTaggingResponseI extends ApiResultI {
  value: AdaptiveQuestionTaggingI
}
export interface AdaptiveTaggingResultResponseI extends ApiResultI {
  value: { updatedCount: number }
}
export interface AdaptiveCourseInsightsResponseI extends ApiResultI {
  value: AdaptiveCourseInsightsI
}
export interface AdaptiveStudentLearningResponseI extends ApiResultI {
  value: AdaptiveStudentLearningI
}
export interface AdaptivePracticeSetResponseI extends ApiResultI {
  value: AdaptivePracticeSetI
}
export interface AdaptivePracticeResultResponseI extends ApiResultI {
  value: AdaptivePracticeResultI
}
