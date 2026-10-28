import type { ApiResultI } from "@/utils/apiResponse"
import type { LessonVideoPlaybackI } from "@/api/lesson.api/types"

export interface StudentELearningCourseI {
  id: string
  subjectId: string
  subjectName: string
  classId: string
  className: string
  teacherName?: string | null
  lessonCount: number
  completedLessonCount: number
  progressPercent: number
  nextLessonId?: string | null
  lastStudiedAtUtc?: string | null
}

export interface StudentLessonMaterialI {
  id: string
  displayName: string
  originalFileName: string
  fileUrl: string
  contentType: string
  sizeBytes: number
}

export interface StudentLessonI {
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
  isCompleted: boolean
  lastPositionSeconds: number
  lastAccessedAtUtc?: string | null
  materials: StudentLessonMaterialI[]
}

export interface StudentCourseSectionI {
  id: string
  title: string
  sortOrder: number
  durationMinutes: number
  completedLessons: number
  lessons: StudentLessonI[]
}

export interface StudentCourseRecordingI {
  id: string
  liveClassId: string
  title: string
  fileUrl?: string | null
  thumbnailUrl?: string | null
  sizeBytes?: number | null
  durationSeconds?: number | null
  recordedAtUtc: string
}

export type StudentAssignmentAnswerMode =
  | "single_choice"
  | "multiple_choice"
  | "written"
  | "voice"
  | "visual"

export interface StudentRubricCriterionI {
  name: string
  description?: string | null
  points: number
}

export interface StudentVisualPageI {
  id: string
  fileUrl: string
  originalFileName: string
  contentType: string
  pageNumber: number
}

export interface StudentAssignmentOptionI {
  id: string
  text: string
  sortOrder: number
}

export interface StudentAssignmentQuestionI {
  id: string
  prompt: string
  answerMode: StudentAssignmentAnswerMode
  sortOrder: number
  points: number
  rubricCriteria: StudentRubricCriterionI[]
  options: StudentAssignmentOptionI[]
}

export interface StudentSavedAnswerI {
  questionId: string
  selectedOptionIds: string[]
  textAnswer?: string | null
  voiceAnswerUrl?: string | null
  awardedPoints?: number | null
  teacherFeedback?: string | null
  visualPages: StudentVisualPageI[]
}

export interface StudentAssignmentAttemptI {
  id: string
  attemptNumber: number
  status: "in_progress" | "submitted" | "ended"
  startedAtUtc: string
  endedAtUtc?: string | null
  submittedAtUtc?: string | null
  endedReason?: string | null
  finalScore?: number | null
  remainingSeconds?: number | null
  reopenGranted: boolean
  snapshotCount: number
  answers: StudentSavedAnswerI[]
}

export interface StudentAssignmentI {
  id: string
  title: string
  subjectId: string
  subjectName: string
  classId: string
  assignmentType: "objective" | "voice" | "visual"
  answerMode: StudentAssignmentAnswerMode
  workType: "not_applicable" | "handwritten" | "map" | "diagram" | "mixed"
  languageCode: string
  instructions?: string | null
  dueDateUtc: string
  durationMinutes: number
  allowVideoRecording: boolean
  maxRetakes: number
  endAttemptOnTabLeave: boolean
  disableCopyPaste: boolean
  studentStatus:
    | "not_started"
    | "in_progress"
    | "submitted"
    | "ended"
    | "reopened"
  attemptCount: number
  latestAttempt?: StudentAssignmentAttemptI | null
  questions: StudentAssignmentQuestionI[]
}

export interface StudentCourseWorkspaceI {
  schoolId: string
  subjectId: string
  subjectName: string
  classId: string
  className: string
  teacherName?: string | null
  lessonCount: number
  completedLessonCount: number
  progressPercent: number
  nextLessonId?: string | null
  sections: StudentCourseSectionI[]
  courseMaterials: StudentCourseMaterialI[]
  recordings: StudentCourseRecordingI[]
  assignments: StudentAssignmentI[]
}

export interface StudentCourseMaterialI {
  id: string
  originalFileName: string
  fileUrl: string
  contentType: string
  sizeBytes: number
  dateCreatedUtc: string
}

export interface StudentCoursesResponseI extends ApiResultI {
  value: StudentELearningCourseI[]
}

export interface StudentCourseWorkspaceResponseI extends ApiResultI {
  value: StudentCourseWorkspaceI
}

export interface StudentLessonProgressI {
  lessonId: string
  lastPositionSeconds: number
  isCompleted: boolean
  lastAccessedAtUtc: string
  completedAtUtc?: string | null
  completedLessonCount: number
  totalLessonCount: number
  courseProgressPercent: number
}

export interface StudentLessonProgressResponseI extends ApiResultI {
  value: StudentLessonProgressI
}

export interface StudentLessonVideoPlaybackResponseI extends ApiResultI {
  value: LessonVideoPlaybackI
}

export interface StudentAssignmentAttemptResponseI extends ApiResultI {
  value: Omit<StudentAssignmentAttemptI, "answers">
}

export interface StudentMutationResponseI extends ApiResultI {
  value?: boolean
}

export interface StudentSnapshotResponseI extends ApiResultI {
  value: { id: string; fileUrl: string; capturedAtUtc: string }
}

export interface StudentVoiceAnswerResponseI extends ApiResultI {
  value: { questionId: string; voiceAnswerUrl: string }
}

export interface StudentVisualPageResponseI extends ApiResultI {
  value: StudentVisualPageI
}
