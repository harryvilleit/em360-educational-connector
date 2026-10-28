import apiClient from "../api"
import { normalizeResponse } from "@/utils/apiResponse"
import type { ApiResultI } from "@/utils/apiResponse"
import {
  createUploadRequestConfig,
  type UploadRequestOptions,
} from "@/api/upload-request"
import type {
  SaveTeacherCourseLessonPayloadI,
  SaveTeacherCourseAssignmentPayloadI,
  SaveTeacherCourseSectionPayloadI,
  TeacherCourseLessonResponseI,
  TeacherCourseAssignmentImportResponseI,
  TeacherCourseAssignmentResponseI,
  TeacherCourseAssignmentReviewResponseI,
  TeacherCourseAssignmentAnswerModeI,
  TeacherCourseAiGradeAttemptResponseI,
  TeacherCourseBulkFinalGradeResponseI,
  TeacherCourseVoiceTranscriptionResponseI,
  TeacherCourseMaterialUploadResponseI,
  TeacherCourseMaterialUploadI,
  TeacherCourseMutationResponseI,
  TeacherCourseRefI,
  TeacherCourseSectionResponseI,
  TeacherCourseWorkspaceResponseI,
  TeacherCourseUploadPolicyResponseI,
  TeacherCourseVideoPlaybackResponseI,
  TeacherCourseVideoUploadResponseI,
  TeacherCourseVideoUploadListResponseI,
  UpdateTeacherCourseAssignmentPayloadI,
  FinalizeTeacherCourseAssignmentGradePayloadI,
  TeacherCourseFinalGradeResponseI,
  TeacherCoursePaperScriptUploadI,
  TeacherCoursePaperSubmissionResponseI,
  TeacherCoursePaperUploadBatchResponseI,
} from "./types"

export async function getTeacherCourseUploadPolicyApi(): Promise<TeacherCourseUploadPolicyResponseI> {
  const res = await apiClient.get("/ELearning/UploadPolicy")
  return normalizeResponse<TeacherCourseUploadPolicyResponseI>(res)
}

function coursePath({ subjectId, classId }: TeacherCourseRefI) {
  return `/ELearning/Courses/${encodeURIComponent(subjectId)}/${encodeURIComponent(classId)}`
}

export async function getTeacherCourseWorkspaceApi(
  course: TeacherCourseRefI
): Promise<TeacherCourseWorkspaceResponseI> {
  const res = await apiClient.get(`${coursePath(course)}/Workspace`, {
    params: { schoolId: course.schoolId },
  })
  return normalizeResponse<TeacherCourseWorkspaceResponseI>(res)
}

export async function createTeacherCourseSectionApi(
  payload: SaveTeacherCourseSectionPayloadI
): Promise<TeacherCourseSectionResponseI> {
  const res = await apiClient.post(
    `${coursePath(payload)}/Sections`,
    {
      title: payload.title,
      sortOrder: payload.sortOrder,
    },
    { params: { schoolId: payload.schoolId } }
  )
  return normalizeResponse<TeacherCourseSectionResponseI>(res)
}

export async function updateTeacherCourseSectionApi(
  payload: SaveTeacherCourseSectionPayloadI
): Promise<TeacherCourseSectionResponseI> {
  const res = await apiClient.put(
    `${coursePath(payload)}/Sections/${encodeURIComponent(payload.sectionId ?? "")}`,
    { title: payload.title, sortOrder: payload.sortOrder },
    { params: { schoolId: payload.schoolId } }
  )
  return normalizeResponse<TeacherCourseSectionResponseI>(res)
}

export async function deleteTeacherCourseSectionApi(
  course: TeacherCourseRefI & { sectionId: string }
): Promise<TeacherCourseMutationResponseI> {
  const res = await apiClient.delete(
    `${coursePath(course)}/Sections/${encodeURIComponent(course.sectionId)}`,
    { params: { schoolId: course.schoolId } }
  )
  return normalizeResponse<TeacherCourseMutationResponseI>(res)
}

export async function createTeacherCourseLessonApi(
  payload: SaveTeacherCourseLessonPayloadI
): Promise<TeacherCourseLessonResponseI> {
  const res = await apiClient.post(
    `${coursePath(payload)}/Sections/${encodeURIComponent(payload.sectionId)}/Lessons`,
    {
      title: payload.title,
      contentType: payload.contentType,
      durationMinutes: payload.durationMinutes,
      sortOrder: payload.sortOrder,
      description: payload.description,
      htmlContent: payload.htmlContent,
      videoUrl: payload.videoUrl,
      videoUploadId: payload.videoUploadId,
      materials: payload.materials,
    },
    { params: { schoolId: payload.schoolId } }
  )
  return normalizeResponse<TeacherCourseLessonResponseI>(res)
}

export async function updateTeacherCourseLessonApi(
  payload: SaveTeacherCourseLessonPayloadI
): Promise<TeacherCourseLessonResponseI> {
  const res = await apiClient.put(
    `${coursePath(payload)}/Sections/${encodeURIComponent(payload.sectionId)}/Lessons/${encodeURIComponent(payload.lessonId ?? "")}`,
    {
      title: payload.title,
      contentType: payload.contentType,
      durationMinutes: payload.durationMinutes,
      sortOrder: payload.sortOrder,
      description: payload.description,
      htmlContent: payload.htmlContent,
      videoUrl: payload.videoUrl,
      videoUploadId: payload.videoUploadId,
      materials: payload.materials,
    },
    { params: { schoolId: payload.schoolId } }
  )
  return normalizeResponse<TeacherCourseLessonResponseI>(res)
}

export async function deleteTeacherCourseLessonApi(
  course: TeacherCourseRefI & { lessonId: string }
): Promise<TeacherCourseMutationResponseI> {
  const res = await apiClient.delete(
    `${coursePath(course)}/Lessons/${encodeURIComponent(course.lessonId)}`,
    { params: { schoolId: course.schoolId } }
  )
  return normalizeResponse<TeacherCourseMutationResponseI>(res)
}

export async function createTeacherCourseVideoUploadApi(
  course: TeacherCourseRefI,
  payload: {
    sectionId: string
    fileName: string
    contentType: string
    fileSizeBytes: number
    durationSeconds?: number
  }
): Promise<TeacherCourseVideoUploadResponseI> {
  const res = await apiClient.post(
    `${coursePath(course)}/VideoUploads`,
    payload,
    {
      params: { schoolId: course.schoolId },
    }
  )
  return normalizeResponse<TeacherCourseVideoUploadResponseI>(res)
}

export async function completeTeacherCourseVideoUploadApi(
  course: TeacherCourseRefI,
  uploadId: string
): Promise<TeacherCourseVideoUploadResponseI> {
  const res = await apiClient.post(
    `${coursePath(course)}/VideoUploads/${encodeURIComponent(uploadId)}/Complete`,
    undefined,
    { params: { schoolId: course.schoolId } }
  )
  return normalizeResponse<TeacherCourseVideoUploadResponseI>(res)
}

export async function getTeacherCourseVideoUploadApi(
  course: TeacherCourseRefI,
  uploadId: string
): Promise<TeacherCourseVideoUploadResponseI> {
  const res = await apiClient.get(
    `${coursePath(course)}/VideoUploads/${encodeURIComponent(uploadId)}`,
    { params: { schoolId: course.schoolId } }
  )
  return normalizeResponse<TeacherCourseVideoUploadResponseI>(res)
}

export async function getAvailableTeacherCourseVideoUploadsApi(
  course: TeacherCourseRefI,
  sectionId: string
): Promise<TeacherCourseVideoUploadListResponseI> {
  const res = await apiClient.get(
    `${coursePath(course)}/VideoUploads/Available`,
    { params: { schoolId: course.schoolId, sectionId } }
  )
  return normalizeResponse<TeacherCourseVideoUploadListResponseI>(res)
}

export async function attachTeacherCourseLessonVideoUploadApi(
  course: TeacherCourseRefI,
  lessonId: string,
  uploadId: string
): Promise<TeacherCourseMutationResponseI> {
  const res = await apiClient.put(
    `${coursePath(course)}/Lessons/${encodeURIComponent(lessonId)}/VideoUpload`,
    { uploadId },
    { params: { schoolId: course.schoolId } }
  )
  return normalizeResponse<TeacherCourseMutationResponseI>(res)
}

export async function getTeacherCourseVideoUploadPlaybackApi(
  course: TeacherCourseRefI,
  uploadId: string
): Promise<TeacherCourseVideoPlaybackResponseI> {
  const res = await apiClient.get(
    `${coursePath(course)}/VideoUploads/${encodeURIComponent(uploadId)}/Playback`,
    { params: { schoolId: course.schoolId } }
  )
  return normalizeResponse<TeacherCourseVideoPlaybackResponseI>(res)
}

export async function getTeacherCourseLessonVideoPlaybackApi(
  course: TeacherCourseRefI,
  lessonId: string
): Promise<TeacherCourseVideoPlaybackResponseI> {
  const res = await apiClient.get(
    `${coursePath(course)}/Lessons/${encodeURIComponent(lessonId)}/Playback`,
    { params: { schoolId: course.schoolId } }
  )
  return normalizeResponse<TeacherCourseVideoPlaybackResponseI>(res)
}

export async function reorderTeacherCourseLessonsApi(
  course: TeacherCourseRefI & { sectionId: string; lessonIds: string[] }
): Promise<TeacherCourseMutationResponseI> {
  const res = await apiClient.put(
    `${coursePath(course)}/Sections/${encodeURIComponent(course.sectionId)}/Lessons/Reorder`,
    { lessonIds: course.lessonIds },
    { params: { schoolId: course.schoolId } }
  )
  return normalizeResponse<TeacherCourseMutationResponseI>(res)
}

export async function uploadTeacherCourseMaterialApi(
  course: TeacherCourseRefI,
  file: File,
  options: UploadRequestOptions = {},
  sectionId = ""
) {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("sectionId", sectionId)
  const res = await apiClient.post(
    `${coursePath(course)}/Materials/Upload`,
    formData,
    {
      ...createUploadRequestConfig(file, options),
      params: { schoolId: course.schoolId },
    }
  )
  return normalizeResponse<TeacherCourseMaterialUploadResponseI>(res)
}

export async function listAvailableTeacherCourseMaterialsApi(
  course: TeacherCourseRefI,
  sectionId: string
): Promise<ApiResultI & { value: TeacherCourseMaterialUploadI[] }> {
  const res = await apiClient.get(`${coursePath(course)}/Materials/Available`, {
    params: { schoolId: course.schoolId, sectionId },
  })
  return normalizeResponse<ApiResultI & { value: TeacherCourseMaterialUploadI[] }>(res)
}

export async function interpretTeacherCourseAssignmentDocumentApi(
  course: TeacherCourseRefI,
  answerMode: TeacherCourseAssignmentAnswerModeI,
  file: File
): Promise<TeacherCourseAssignmentImportResponseI> {
  const formData = new FormData()
  formData.append("answerMode", answerMode)
  formData.append("file", file)
  const res = await apiClient.post(
    `${coursePath(course)}/Assignments/Interpret`,
    formData,
    { params: { schoolId: course.schoolId } }
  )
  return normalizeResponse<TeacherCourseAssignmentImportResponseI>(res)
}

export async function createTeacherCourseAssignmentApi(
  payload: SaveTeacherCourseAssignmentPayloadI
): Promise<TeacherCourseAssignmentResponseI> {
  const res = await apiClient.post(
    `${coursePath(payload)}/Assignments`,
    {
      title: payload.title,
      assignmentType: payload.assignmentType,
      answerMode: payload.answerMode,
      instructions: payload.instructions,
      dueDateUtc: payload.dueDateUtc,
      durationMinutes: payload.durationMinutes,
      allowVideoRecording: payload.allowVideoRecording,
      maxRetakes: payload.maxRetakes,
      sourceDocumentName: payload.sourceDocumentName,
      sourceDocumentUrl: payload.sourceDocumentUrl,
      submissionMethod: payload.submissionMethod,
      workType: payload.workType,
      languageCode: payload.languageCode,
      curriculumStandard: payload.curriculumStandard,
      educationLevel: payload.educationLevel,
      countryCode: payload.countryCode,
      schoolSessionId: payload.schoolSessionId,
      schoolSessionTermId: payload.schoolSessionTermId,
      assessmentComponentId: payload.assessmentComponentId,
      gradebookContributionPoints: payload.gradebookContributionPoints,
      questions: payload.questions,
    },
    { params: { schoolId: payload.schoolId } }
  )
  return normalizeResponse<TeacherCourseAssignmentResponseI>(res)
}

export async function updateTeacherCourseAssignmentApi(
  payload: UpdateTeacherCourseAssignmentPayloadI
): Promise<TeacherCourseAssignmentResponseI> {
  const res = await apiClient.put(
    `${coursePath(payload)}/Assignments/${encodeURIComponent(payload.assignmentId)}`,
    {
      title: payload.title,
      assignmentType: payload.assignmentType,
      answerMode: payload.answerMode,
      instructions: payload.instructions,
      dueDateUtc: payload.dueDateUtc,
      durationMinutes: payload.durationMinutes,
      allowVideoRecording: payload.allowVideoRecording,
      maxRetakes: payload.maxRetakes,
      sourceDocumentName: payload.sourceDocumentName,
      sourceDocumentUrl: payload.sourceDocumentUrl,
      submissionMethod: payload.submissionMethod,
      workType: payload.workType,
      languageCode: payload.languageCode,
      curriculumStandard: payload.curriculumStandard,
      educationLevel: payload.educationLevel,
      countryCode: payload.countryCode,
      schoolSessionId: payload.schoolSessionId,
      schoolSessionTermId: payload.schoolSessionTermId,
      assessmentComponentId: payload.assessmentComponentId,
      gradebookContributionPoints: payload.gradebookContributionPoints,
      questions: payload.questions,
    },
    { params: { schoolId: payload.schoolId } }
  )
  return normalizeResponse<TeacherCourseAssignmentResponseI>(res)
}

export async function approveTeacherCourseAssignmentApi(
  course: TeacherCourseRefI,
  assignmentId: string
): Promise<TeacherCourseAssignmentResponseI> {
  const res = await apiClient.post(
    `${coursePath(course)}/Assignments/${encodeURIComponent(assignmentId)}/Approve`,
    undefined,
    { params: { schoolId: course.schoolId } }
  )
  return normalizeResponse<TeacherCourseAssignmentResponseI>(res)
}

export async function deleteTeacherCourseAssignmentApi(
  course: TeacherCourseRefI,
  assignmentId: string
): Promise<TeacherCourseMutationResponseI> {
  const res = await apiClient.delete(
    `${coursePath(course)}/Assignments/${encodeURIComponent(assignmentId)}`,
    { params: { schoolId: course.schoolId } }
  )
  return normalizeResponse<TeacherCourseMutationResponseI>(res)
}

export async function getTeacherCourseAssignmentReviewApi(
  course: TeacherCourseRefI,
  assignmentId: string
): Promise<TeacherCourseAssignmentReviewResponseI> {
  const res = await apiClient.get(
    `${coursePath(course)}/Assignments/${encodeURIComponent(assignmentId)}/Review`,
    { params: { schoolId: course.schoolId } }
  )
  return normalizeResponse<TeacherCourseAssignmentReviewResponseI>(res)
}

export async function reopenTeacherCourseAssignmentAttemptApi(
  course: TeacherCourseRefI,
  assignmentId: string,
  attemptId: string
): Promise<TeacherCourseMutationResponseI> {
  const res = await apiClient.post(
    `${coursePath(course)}/Assignments/${encodeURIComponent(assignmentId)}/Attempts/${encodeURIComponent(attemptId)}/Reopen`,
    undefined,
    { params: { schoolId: course.schoolId } }
  )
  return normalizeResponse<TeacherCourseMutationResponseI>(res)
}

export async function aiGradeTeacherCourseAssignmentAttemptApi(
  course: TeacherCourseRefI,
  assignmentId: string,
  attemptId: string
): Promise<TeacherCourseAiGradeAttemptResponseI> {
  const res = await apiClient.post(
    `${coursePath(course)}/Assignments/${encodeURIComponent(assignmentId)}/Attempts/${encodeURIComponent(attemptId)}/AiGrade`,
    undefined,
    { params: { schoolId: course.schoolId } }
  )
  return normalizeResponse<TeacherCourseAiGradeAttemptResponseI>(res)
}

export async function transcribeTeacherCourseAssignmentVoiceAnswerApi(
  course: TeacherCourseRefI,
  assignmentId: string,
  attemptId: string,
  answerId: string
): Promise<TeacherCourseVoiceTranscriptionResponseI> {
  const res = await apiClient.post(
    `${coursePath(course)}/Assignments/${encodeURIComponent(assignmentId)}/Attempts/${encodeURIComponent(attemptId)}/Answers/${encodeURIComponent(answerId)}/Transcribe`,
    undefined,
    { params: { schoolId: course.schoolId } }
  )
  return normalizeResponse<TeacherCourseVoiceTranscriptionResponseI>(res)
}

export async function finalizeTeacherCourseAssignmentGradeApi(
  payload: FinalizeTeacherCourseAssignmentGradePayloadI
): Promise<TeacherCourseFinalGradeResponseI> {
  const res = await apiClient.post(
    `${coursePath(payload)}/Assignments/${encodeURIComponent(payload.assignmentId)}/Attempts/${encodeURIComponent(payload.attemptId)}/FinalizeGrade`,
    { answers: payload.answers },
    { params: { schoolId: payload.schoolId } }
  )
  return normalizeResponse<TeacherCourseFinalGradeResponseI>(res)
}

export async function bulkFinalizeTeacherCourseAssignmentGradesApi(
  course: TeacherCourseRefI,
  assignmentId: string
): Promise<TeacherCourseBulkFinalGradeResponseI> {
  const res = await apiClient.post(
    `${coursePath(course)}/Assignments/${encodeURIComponent(assignmentId)}/Attempts/BulkFinalizeAiGrades`,
    undefined,
    { params: { schoolId: course.schoolId } }
  )
  return normalizeResponse<TeacherCourseBulkFinalGradeResponseI>(res)
}

export async function uploadTeacherCoursePaperSubmissionsApi(
  course: TeacherCourseRefI,
  assignmentId: string,
  scripts: TeacherCoursePaperScriptUploadI[]
): Promise<TeacherCoursePaperUploadBatchResponseI> {
  const formData = new FormData()
  const manifest: {
    clientReference: string
    studentId?: string
    fileIndexes: number[]
  }[] = []
  let fileIndex = 0
  scripts.forEach((script) => {
    const fileIndexes = script.pages.map((file) => {
      formData.append("files", file)
      return fileIndex++
    })
    manifest.push({
      clientReference: script.clientReference,
      studentId: script.studentId,
      fileIndexes,
    })
  })
  formData.append("manifest", JSON.stringify(manifest))
  const res = await apiClient.post(
    `${coursePath(course)}/Assignments/${encodeURIComponent(assignmentId)}/PaperSubmissions`,
    formData,
    { params: { schoolId: course.schoolId } }
  )
  return normalizeResponse<TeacherCoursePaperUploadBatchResponseI>(res)
}

export async function confirmTeacherCoursePaperSubmissionApi(
  course: TeacherCourseRefI,
  assignmentId: string,
  paperSubmissionId: string,
  studentId: string
): Promise<TeacherCoursePaperSubmissionResponseI> {
  const res = await apiClient.post(
    `${coursePath(course)}/Assignments/${encodeURIComponent(assignmentId)}/PaperSubmissions/${encodeURIComponent(paperSubmissionId)}/Confirm`,
    { studentId },
    { params: { schoolId: course.schoolId } }
  )
  return normalizeResponse<TeacherCoursePaperSubmissionResponseI>(res)
}

export type * from "./types"
