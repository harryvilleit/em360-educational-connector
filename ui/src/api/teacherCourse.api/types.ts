import type { ApiResultI } from "@/utils/apiResponse"
import type {
  LessonVideoPlaybackI,
  LessonVideoUploadI,
} from "@/api/lesson.api/types"

export interface TeacherCourseRefI {
  schoolId: string
  subjectId: string
  classId: string
}

export interface TeacherCourseUploadPolicyI {
  maxImageSizeMB: number
  maxDocumentSizeMB: number
  maxMediaSizeMB: number
  maxLessonMaterialSizeMB: number
  allowedLessonMaterialExtensions: string[]
}

export interface TeacherCourseUploadPolicyResponseI extends ApiResultI {
  message?: string
  value: TeacherCourseUploadPolicyI
}

export interface TeacherCourseMaterialI {
  id: string
  displayName: string
  originalFileName: string
  fileUrl: string
  contentType: string
  sizeBytes: number
}

export interface TeacherCourseLessonI {
  id: string
  sectionId: string
  title: string
  contentType: "video" | "html"
  durationMinutes: number
  sortOrder: number
  description?: string | null
  htmlContent?: string | null
  videoUrl?: string | null
  videoUploadId?: string | null
  videoUploadFileName?: string | null
  videoUploadSizeBytes?: number | null
  videoUploadStatus?: "Uploading" | "Processing" | "Ready" | "Failed" | null
  materials: TeacherCourseMaterialI[]
}

export interface TeacherCourseSectionI {
  id: string
  title: string
  sortOrder: number
  durationMinutes: number
  lessons: TeacherCourseLessonI[]
}

export interface TeacherCourseEnrollmentI {
  id: string
  studentId: string
  studentName: string
  email: string
  enrolledAt: string
  status: string
  completedLessons: number
  totalLessons: number
  progressPercent: number
  lastStudiedAtUtc?: string | null
}

export interface TeacherCourseRecordingI {
  id: string
  liveClassId: string
  title: string
  fileUrl?: string | null
  thumbnailUrl?: string | null
  sizeBytes?: number | null
  durationSeconds?: number | null
  recordedAtUtc: string
}

export interface TeacherCourseWorkspaceI {
  schoolId: string
  subjectId: string
  subjectName: string
  classId: string
  className: string
  sections: TeacherCourseSectionI[]
  courseMaterials: TeacherCourseMaterialUploadI[]
  enrollments: TeacherCourseEnrollmentI[]
  recordings: TeacherCourseRecordingI[]
  assignments: TeacherCourseAssignmentI[]
}

export type TeacherCourseAssignmentTypeI = "objective" | "voice" | "visual"
export type TeacherCourseAssignmentAnswerModeI =
  | "single_choice"
  | "multiple_choice"
  | "written"
  | "voice"
  | "visual"
export type TeacherCourseVisualWorkTypeI =
  | "not_applicable"
  | "handwritten"
  | "map"
  | "diagram"
  | "mixed"
export type TeacherCourseSubmissionMethodI =
  | "student_online"
  | "teacher_paper"
  | "hybrid"

export interface TeacherCourseRubricCriterionI {
  name: string
  description?: string | null
  points: number
}

export interface TeacherCourseAssignmentOptionI {
  id: string
  text: string
  sortOrder: number
  isCorrect: boolean
}

export interface TeacherCourseAssignmentQuestionI {
  id: string
  prompt: string
  answerMode: TeacherCourseAssignmentAnswerModeI
  referenceAnswer?: string | null
  sortOrder: number
  points: number
  rubricCriteria: TeacherCourseRubricCriterionI[]
  options: TeacherCourseAssignmentOptionI[]
}

export interface TeacherCourseAssignmentI {
  id: string
  title: string
  assignmentType: TeacherCourseAssignmentTypeI
  answerMode: TeacherCourseAssignmentAnswerModeI
  instructions?: string | null
  dueDateUtc: string
  durationMinutes: number
  allowVideoRecording: boolean
  maxRetakes: number
  endAttemptOnTabLeave: boolean
  disableCopyPaste: boolean
  sourceDocumentName?: string | null
  sourceDocumentUrl?: string | null
  submissionMethod: TeacherCourseSubmissionMethodI
  workType: TeacherCourseVisualWorkTypeI
  languageCode: string
  curriculumStandard?: string | null
  educationLevel?: string | null
  countryCode?: string | null
  schoolSessionId?: string | null
  schoolSessionTermId?: string | null
  assessmentComponentId?: string | null
  assessmentComponentName?: string | null
  assessmentComponentWeight?: number | null
  gradebookContributionPoints?: number | null
  status: "draft" | "approved" | "closed"
  questionCount: number
  submissionCount: number
  questions: TeacherCourseAssignmentQuestionI[]
}

export interface TeacherCourseWorkspaceResponseI extends ApiResultI {
  message?: string
  value: TeacherCourseWorkspaceI
}

export interface SaveTeacherCourseSectionPayloadI extends TeacherCourseRefI {
  sectionId?: string
  title: string
  sortOrder?: number
}

export interface SaveTeacherCourseLessonMaterialI {
  displayName: string
  originalFileName: string
  fileUrl: string
  contentType: string
  sizeBytes: number
}

export interface SaveTeacherCourseLessonPayloadI extends TeacherCourseRefI {
  lessonId?: string
  sectionId: string
  title: string
  contentType: "video" | "html"
  durationMinutes: number
  sortOrder?: number
  description?: string
  htmlContent?: string
  videoUrl?: string
  videoUploadId?: string
  materials: SaveTeacherCourseLessonMaterialI[]
}

export interface TeacherCourseVideoUploadResponseI extends ApiResultI {
  message?: string
  value: LessonVideoUploadI
}

export interface TeacherCourseVideoUploadListResponseI extends ApiResultI {
  message?: string
  value: LessonVideoUploadI[]
}

export interface TeacherCourseVideoPlaybackResponseI extends ApiResultI {
  message?: string
  value: LessonVideoPlaybackI
}

export interface TeacherCourseSectionResponseI extends ApiResultI {
  message?: string
  value: TeacherCourseSectionI
}

export interface TeacherCourseLessonResponseI extends ApiResultI {
  message?: string
  value: TeacherCourseLessonI
}

export interface TeacherCourseMutationResponseI extends ApiResultI {
  message?: string
}

export interface TeacherCourseMaterialUploadI {
  id: string
  dateCreatedUtc: string
  originalFileName: string
  fileUrl: string
  contentType: string
  sizeBytes: number
}

export interface TeacherCourseMaterialUploadResponseI extends ApiResultI {
  message?: string
  value: TeacherCourseMaterialUploadI
}

export interface SaveTeacherCourseAssignmentOptionI {
  text: string
  isCorrect: boolean
}

export interface SaveTeacherCourseAssignmentQuestionI {
  prompt: string
  referenceAnswer?: string
  points: number
  rubricCriteria?: TeacherCourseRubricCriterionI[]
  options: SaveTeacherCourseAssignmentOptionI[]
}

export interface SaveTeacherCourseAssignmentPayloadI extends TeacherCourseRefI {
  title: string
  assignmentType: TeacherCourseAssignmentTypeI
  answerMode: TeacherCourseAssignmentAnswerModeI
  instructions?: string
  dueDateUtc: string
  durationMinutes: number
  allowVideoRecording: boolean
  maxRetakes: number
  sourceDocumentName?: string
  sourceDocumentUrl?: string
  submissionMethod: TeacherCourseSubmissionMethodI
  workType: TeacherCourseVisualWorkTypeI
  languageCode: string
  curriculumStandard?: string
  educationLevel?: string
  countryCode?: string
  schoolSessionId?: string
  schoolSessionTermId?: string
  assessmentComponentId?: string
  gradebookContributionPoints?: number
  questions: SaveTeacherCourseAssignmentQuestionI[]
}

export interface UpdateTeacherCourseAssignmentPayloadI extends SaveTeacherCourseAssignmentPayloadI {
  assignmentId: string
}

export interface TeacherCourseAssignmentResponseI extends ApiResultI {
  message?: string
  value: TeacherCourseAssignmentI
}

export interface ImportedTeacherCourseAssignmentOptionI {
  label: string
  text: string
  isCorrect: boolean
}

export interface ImportedTeacherCourseAssignmentQuestionI {
  prompt: string
  referenceAnswer?: string | null
  options: ImportedTeacherCourseAssignmentOptionI[]
}

export interface TeacherCourseAssignmentImportI {
  sourceDocumentName: string
  sourceDocumentUrl: string
  questions: ImportedTeacherCourseAssignmentQuestionI[]
  warnings: string[]
}

export interface TeacherCourseAssignmentImportResponseI extends ApiResultI {
  message?: string
  value: TeacherCourseAssignmentImportI
}

export interface TeacherCourseAssignmentSnapshotI {
  id: string
  fileUrl: string
  capturedAtUtc: string
}

export interface TeacherCourseVisualPageI {
  id: string
  fileUrl: string
  originalFileName: string
  contentType: string
  pageNumber: number
}

export interface TeacherCourseAssignmentAnswerI {
  id: string
  questionId: string
  prompt: string
  answerMode: TeacherCourseAssignmentAnswerModeI
  selectedOptionIds: string[]
  textAnswer?: string | null
  voiceAnswerUrl?: string | null
  voiceTranscript?: string | null
  transcriptionStatus?:
    | "processing"
    | "completed"
    | "failed"
    | "not_configured"
    | null
  transcriptionError?: string | null
  transcriptionModel?: string | null
  transcribedAtUtc?: string | null
  awardedPoints?: number | null
  aiSuggestedPoints?: number | null
  aiConfidence?: number | null
  aiFeedback?: string | null
  aiModel?: string | null
  aiMarkedAtUtc?: string | null
  teacherFeedback?: string | null
  visualPages: TeacherCourseVisualPageI[]
}

export interface FinalizeTeacherCourseAssignmentGradePayloadI extends TeacherCourseRefI {
  assignmentId: string
  attemptId: string
  answers: {
    questionId: string
    awardedPoints: number
    teacherFeedback?: string
  }[]
}

export interface TeacherCourseFinalGradeI {
  attemptId: string
  awardedPoints: number
  availablePoints: number
  finalPercent: number
  addedToGradebook: boolean
  gradebookContributionPoints?: number | null
  assessmentComponentName?: string | null
}

export interface TeacherCourseFinalGradeResponseI extends ApiResultI {
  message?: string
  value: TeacherCourseFinalGradeI
}

export interface TeacherCourseBulkFinalGradeItemI {
  attemptId: string
  studentId: string
  approved: boolean
  message: string
  finalPercent?: number | null
}

export interface TeacherCourseBulkFinalGradeI {
  submittedCount: number
  readyCount: number
  approvedCount: number
  skippedCount: number
  items: TeacherCourseBulkFinalGradeItemI[]
}

export interface TeacherCourseBulkFinalGradeResponseI extends ApiResultI {
  message?: string
  value: TeacherCourseBulkFinalGradeI
}

export interface TeacherCourseAiGradeAttemptI {
  attemptId: string
  suggestedAnswerCount: number
  skippedAnswerCount: number
  suggestedPoints: number
  availablePoints: number
  suggestedPercent: number
  model: string
  requiresTeacherApproval: boolean
}

export interface TeacherCourseAiGradeAttemptResponseI extends ApiResultI {
  message?: string
  value: TeacherCourseAiGradeAttemptI
}

export interface TeacherCourseVoiceTranscriptionI {
  answerId: string
  questionId: string
  voiceTranscript: string
  transcriptionStatus: "processing" | "completed" | "failed" | "not_configured"
  transcriptionError?: string | null
  transcriptionModel?: string | null
  transcribedAtUtc?: string | null
}

export interface TeacherCourseVoiceTranscriptionResponseI extends ApiResultI {
  message?: string
  value: TeacherCourseVoiceTranscriptionI
}

export interface TeacherCourseAssignmentAttemptI {
  id: string
  attemptNumber: number
  status: "in_progress" | "submitted" | "ended"
  startedAtUtc: string
  endedAtUtc?: string | null
  submittedAtUtc?: string | null
  endedReason?: string | null
  objectiveScore?: number | null
  finalScore?: number | null
  reopenGranted: boolean
  submissionSource: "student_online" | "teacher_paper"
  paperSubmissionId?: string | null
  uploadedByUserId?: string | null
  paperPages: TeacherCoursePaperPageI[]
  answers: TeacherCourseAssignmentAnswerI[]
  snapshots: TeacherCourseAssignmentSnapshotI[]
}

export interface TeacherCourseAssignmentStudentI {
  studentId: string
  studentName: string
  email: string
  studentIdentifier: string
  status: "not_started" | "in_progress" | "submitted" | "ended" | "reopened"
  attemptCount: number
  latestAttempt?: TeacherCourseAssignmentAttemptI | null
  attempts: TeacherCourseAssignmentAttemptI[]
}

export interface TeacherCourseAssignmentReviewI {
  assignment: TeacherCourseAssignmentI
  students: TeacherCourseAssignmentStudentI[]
  paperSubmissions: TeacherCoursePaperSubmissionI[]
}

export interface TeacherCoursePaperPageI {
  id: string
  fileUrl: string
  originalFileName: string
  contentType: string
  pageNumber: number
}

export interface TeacherCoursePaperSubmissionI {
  id: string
  batchReference: string
  status:
    | "processing"
    | "matched"
    | "needs_review"
    | "ready_for_marking"
    | "failed"
  matchedStudentId?: string | null
  matchedStudentName?: string | null
  detectedStudentName?: string | null
  detectedStudentIdentifier?: string | null
  identityConfidence?: number | null
  identityNotes?: string | null
  matchMethod: string
  failureReason?: string | null
  attemptId?: string | null
  dateCreated: string
  pages: TeacherCoursePaperPageI[]
}

export interface TeacherCoursePaperScriptUploadI {
  clientReference: string
  studentId?: string
  pages: File[]
}

export interface TeacherCoursePaperUploadBatchI {
  batchReference: string
  uploadedCount: number
  suggestedMatchCount: number
  needsReviewCount: number
  submissions: TeacherCoursePaperSubmissionI[]
}

export interface TeacherCoursePaperUploadBatchResponseI extends ApiResultI {
  message?: string
  value: TeacherCoursePaperUploadBatchI
}

export interface TeacherCoursePaperSubmissionResponseI extends ApiResultI {
  message?: string
  value: TeacherCoursePaperSubmissionI
}

export interface TeacherCourseAssignmentReviewResponseI extends ApiResultI {
  message?: string
  value: TeacherCourseAssignmentReviewI
}
