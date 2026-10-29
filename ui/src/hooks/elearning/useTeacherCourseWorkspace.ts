import { useMemo } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  approveTeacherCourseAssignmentApi,
  aiGradeTeacherCourseAssignmentAttemptApi,
  confirmTeacherCoursePaperSubmissionApi,
  createTeacherCourseLessonApi,
  createTeacherCourseAssignmentApi,
  createTeacherCourseSectionApi,
  deleteTeacherCourseSectionApi,
  deleteTeacherCourseLessonApi,
  reorderTeacherCourseLessonsApi,
  deleteTeacherCourseAssignmentApi,
  finalizeTeacherCourseAssignmentGradeApi,
  bulkFinalizeTeacherCourseAssignmentGradesApi,
  getTeacherCourseAssignmentReviewApi,
  getTeacherCourseWorkspaceApi,
  getTeacherCourseUploadPolicyApi,
  interpretTeacherCourseAssignmentDocumentApi,
  reopenTeacherCourseAssignmentAttemptApi,
  transcribeTeacherCourseAssignmentVoiceAnswerApi,
  uploadTeacherCoursePaperSubmissionsApi,
  updateTeacherCourseLessonApi,
  updateTeacherCourseAssignmentApi,
  updateTeacherCourseSectionApi,
  type SaveTeacherCourseLessonPayloadI,
  type SaveTeacherCourseAssignmentPayloadI,
  type SaveTeacherCourseSectionPayloadI,
  type TeacherCourseRefI,
  type TeacherCourseAssignmentAnswerModeI,
  type TeacherCoursePaperScriptUploadI,
  type UpdateTeacherCourseAssignmentPayloadI,
} from "@/api/teacherCourse.api"
import type {
  ClassRecording,
  ELearningAssignment,
  LmsCourseModule,
  LmsEnrollment,
} from "@/types/elearning"

export const teacherCourseWorkspaceKey = (
  course?: Partial<TeacherCourseRefI>
) => [
  "teacher-course-workspace",
  course?.schoolId ?? null,
  course?.subjectId ?? null,
  course?.classId ?? null,
]

export function useTeacherCourseUploadPolicy(enabled = true) {
  return useQuery({
    queryKey: ["teacher-course-upload-policy"],
    queryFn: getTeacherCourseUploadPolicyApi,
    enabled,
    staleTime: 15 * 60 * 1000,
  })
}

export const teacherCourseAssignmentReviewKey = (
  course: Partial<TeacherCourseRefI> | undefined,
  assignmentId: string | undefined
) => [
  ...teacherCourseWorkspaceKey(course),
  "assignment-review",
  assignmentId ?? null,
]

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function useTeacherCourseWorkspace(
  courseId: string | undefined,
  course: TeacherCourseRefI | undefined
) {
  const query = useQuery({
    queryKey: teacherCourseWorkspaceKey(course),
    queryFn: () => getTeacherCourseWorkspaceApi(course!),
    enabled: Boolean(course?.schoolId && course.subjectId && course.classId),
    staleTime: 30 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: false,
  })

  const modules = useMemo<LmsCourseModule[]>(
    () =>
      (query.data?.value.sections ?? []).map((section) => ({
        id: section.id,
        courseId: courseId ?? "",
        title: section.title,
        order: section.sortOrder,
        lessons: section.lessons.map((lesson) => ({
          id: lesson.id,
          moduleId: section.id,
          courseId: courseId ?? "",
          title: lesson.title,
          type: lesson.contentType === "video" ? "video" : "article",
          duration: `${lesson.durationMinutes}min`,
          durationMinutes: lesson.durationMinutes,
          order: lesson.sortOrder,
          description: lesson.description ?? undefined,
          htmlContent: lesson.htmlContent ?? undefined,
          contentUrl: lesson.videoUrl ?? undefined,
          videoUploadId: lesson.videoUploadId ?? undefined,
          videoUploadStatus: lesson.videoUploadStatus ?? undefined,
          videoUploadSizeBytes: lesson.videoUploadSizeBytes ?? undefined,
          videoFileName: lesson.videoUploadFileName ?? undefined,
          materials: lesson.materials.map((material) => ({
            id: material.id,
            title: material.displayName,
            type:
              material.contentType === "application/pdf" ||
              material.originalFileName.toLowerCase().endsWith(".pdf")
                ? "pdf"
                : "document",
            url: material.fileUrl,
            fileName: material.originalFileName,
            fileSize: formatFileSize(material.sizeBytes),
            fileSizeBytes: material.sizeBytes,
            contentType: material.contentType,
          })),
        })),
      })),
    [query.data?.value.sections, courseId]
  )

  const courseTitle = query.data?.value
    ? `${query.data.value.subjectName} · ${query.data.value.className}`
    : ""

  const enrollments = useMemo<LmsEnrollment[]>(
    () =>
      (query.data?.value.enrollments ?? []).map((item) => ({
        id: item.id,
        learnerName: item.studentName,
        email: item.email,
        courseTitle,
        courseId: courseId ?? "",
        enrolledAt: item.enrolledAt,
        progress: item.progressPercent,
        completedLessons: item.completedLessons,
        totalLessons: item.totalLessons,
        lastStudiedAt: item.lastStudiedAtUtc ?? undefined,
        status:
          item.progressPercent >= 100
            ? "completed"
            : item.status.toLowerCase() === "active"
              ? "active"
              : "dropped",
      })),
    [query.data?.value.enrollments, courseId, courseTitle]
  )

  const recordings = useMemo<ClassRecording[]>(
    () =>
      (query.data?.value.recordings ?? []).map((item) => ({
        id: item.id,
        sessionId: item.liveClassId,
        title: item.title,
        subject: query.data?.value.subjectName,
        className: query.data?.value.className,
        courseId,
        teacherName: "",
        recordedAt: item.recordedAtUtc,
        duration: item.durationSeconds
          ? `${Math.ceil(item.durationSeconds / 60)}min`
          : "—",
        views: 0,
        thumbnailUrl: item.thumbnailUrl ?? undefined,
        videoUrl: item.fileUrl ?? "",
      })),
    [query.data?.value, courseId]
  )

  const assignments = useMemo<ELearningAssignment[]>(
    () =>
      (query.data?.value.assignments ?? []).map((item) => ({
        id: item.id,
        title: item.title,
        subject: query.data?.value.subjectName ?? "",
        className: query.data?.value.className ?? "",
        courseId,
        dueDate: item.dueDateUtc,
        status: item.status,
        submissions: item.submissionCount,
        totalStudents: query.data?.value.enrollments.length ?? 0,
        description: item.instructions ?? "",
        assignmentType: item.assignmentType,
        answerMode: item.answerMode,
        durationMinutes: item.durationMinutes,
        allowVideoRecording: item.allowVideoRecording,
        maxRetakes: item.maxRetakes,
        endAttemptOnTabLeave: item.endAttemptOnTabLeave,
        disableCopyPaste: item.disableCopyPaste,
        sourceDocumentName: item.sourceDocumentName ?? undefined,
        sourceDocumentUrl: item.sourceDocumentUrl ?? undefined,
        submissionMethod: item.submissionMethod,
        workType: item.workType,
        languageCode: item.languageCode,
        curriculumStandard: item.curriculumStandard ?? undefined,
        educationLevel: item.educationLevel ?? undefined,
        countryCode: item.countryCode ?? undefined,
        schoolSessionId: item.schoolSessionId ?? undefined,
        schoolSessionTermId: item.schoolSessionTermId ?? undefined,
        assessmentComponentId: item.assessmentComponentId ?? undefined,
        assessmentComponentName: item.assessmentComponentName ?? undefined,
        assessmentComponentWeight: item.assessmentComponentWeight ?? undefined,
        gradebookContributionPoints:
          item.gradebookContributionPoints ?? undefined,
        questions: item.questions.map((question) => ({
          id: question.id,
          prompt: question.prompt,
          referenceAnswer: question.referenceAnswer ?? undefined,
          points: question.points,
          rubricCriteria: question.rubricCriteria.map((criterion) => ({
            name: criterion.name,
            description: criterion.description ?? undefined,
            points: criterion.points,
          })),
          options: question.options.map((option) => ({
            id: option.id,
            text: option.text,
            isCorrect: option.isCorrect,
          })),
        })),
      })),
    [query.data?.value, courseId]
  )

  return {
    ...query,
    workspace: query.data?.value,
    modules,
    enrollments,
    recordings,
    assignments,
  }
}

export function useTeacherCourseAssignmentMutations(
  course?: TeacherCourseRefI
) {
  const queryClient = useQueryClient()
  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: teacherCourseWorkspaceKey(course),
    })

  const interpretDocument = useMutation({
    mutationFn: ({
      file,
      answerMode,
    }: {
      file: File
      answerMode: TeacherCourseAssignmentAnswerModeI
    }) =>
      interpretTeacherCourseAssignmentDocumentApi(course!, answerMode, file),
    onError: (error: Error) =>
      toast.error(
        error.message || "The question document could not be interpreted"
      ),
  })

  const createAssignment = useMutation({
    mutationFn: (
      payload: Omit<
        SaveTeacherCourseAssignmentPayloadI,
        keyof TeacherCourseRefI
      >
    ) => createTeacherCourseAssignmentApi({ ...course!, ...payload }),
    onSuccess: async (data) => {
      await invalidate()
      toast.success(data.message || "Assignment saved as draft")
    },
    onError: (error: Error) =>
      toast.error(error.message || "The assignment could not be saved"),
  })

  const updateAssignment = useMutation({
    mutationFn: (
      payload: Omit<
        UpdateTeacherCourseAssignmentPayloadI,
        keyof TeacherCourseRefI
      >
    ) => updateTeacherCourseAssignmentApi({ ...course!, ...payload }),
    onSuccess: async (data) => {
      await invalidate()
      toast.success(data.message || "Assignment draft updated")
    },
    onError: (error: Error) =>
      toast.error(error.message || "The assignment could not be updated"),
  })

  const approveAssignment = useMutation({
    mutationFn: (assignmentId: string) =>
      approveTeacherCourseAssignmentApi(course!, assignmentId),
    onSuccess: async (data) => {
      await invalidate()
      toast.success(data.message || "Assignment approved")
    },
    onError: (error: Error) =>
      toast.error(error.message || "The assignment could not be approved"),
  })

  const deleteAssignment = useMutation({
    mutationFn: (assignmentId: string) =>
      deleteTeacherCourseAssignmentApi(course!, assignmentId),
    onSuccess: async (data) => {
      await invalidate()
      toast.success(data.message || "Assignment deleted")
    },
    onError: (error: Error) =>
      toast.error(error.message || "The assignment could not be deleted"),
  })

  const reopenAttempt = useMutation({
    mutationFn: ({
      assignmentId,
      attemptId,
    }: {
      assignmentId: string
      attemptId: string
    }) =>
      reopenTeacherCourseAssignmentAttemptApi(course!, assignmentId, attemptId),
    onSuccess: async (data, variables) => {
      await Promise.all([
        invalidate(),
        queryClient.invalidateQueries({
          queryKey: teacherCourseAssignmentReviewKey(
            course,
            variables.assignmentId
          ),
        }),
      ])
      toast.success(data.message || "Assignment reopened for student")
    },
    onError: (error: Error) =>
      toast.error(error.message || "The student attempt could not be reopened"),
  })

  return {
    interpretDocumentAsync: interpretDocument.mutateAsync,
    createAssignmentAsync: createAssignment.mutateAsync,
    updateAssignmentAsync: updateAssignment.mutateAsync,
    approveAssignmentAsync: approveAssignment.mutateAsync,
    deleteAssignmentAsync: deleteAssignment.mutateAsync,
    reopenAttemptAsync: reopenAttempt.mutateAsync,
    isInterpretingDocument: interpretDocument.isPending,
    isPublishingAssignment:
      createAssignment.isPending || updateAssignment.isPending,
    isApprovingAssignment: approveAssignment.isPending,
    isDeletingAssignment: deleteAssignment.isPending,
    isReopeningAttempt: reopenAttempt.isPending,
  }
}

export function useTeacherCourseAssignmentReview(
  course: TeacherCourseRefI | undefined,
  assignmentId: string | undefined,
  enabled = true
) {
  return useQuery({
    queryKey: teacherCourseAssignmentReviewKey(course, assignmentId),
    queryFn: () => getTeacherCourseAssignmentReviewApi(course!, assignmentId!),
    enabled:
      enabled &&
      Boolean(
        course?.schoolId && course.subjectId && course.classId && assignmentId
      ),
    staleTime: 15 * 1000,
    retry: false,
  })
}

export function useTeacherCourseAssignmentAiGrading(
  course: TeacherCourseRefI | undefined
) {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: ({
      assignmentId,
      attemptId,
    }: {
      assignmentId: string
      attemptId: string
    }) =>
      aiGradeTeacherCourseAssignmentAttemptApi(
        course!,
        assignmentId,
        attemptId
      ),
    onSuccess: async (data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: teacherCourseAssignmentReviewKey(
          course,
          variables.assignmentId
        ),
      })
      toast.success(
        data.message ||
          "AI grade suggestions generated. Review them before finalising grades."
      )
    },
    onError: (error: Error) =>
      toast.error(error.message || "AI grading could not be completed"),
  })

  const bulkMutation = useMutation({
    mutationFn: async ({
      assignmentId,
      attemptIds,
    }: {
      assignmentId: string
      attemptIds: string[]
    }) => {
      let nextIndex = 0
      let marked = 0
      let failed = 0
      const worker = async () => {
        while (nextIndex < attemptIds.length) {
          const attemptId = attemptIds[nextIndex++]
          try {
            await aiGradeTeacherCourseAssignmentAttemptApi(
              course!,
              assignmentId,
              attemptId
            )
            marked += 1
          } catch {
            failed += 1
          }
        }
      }
      await Promise.all(
        Array.from({ length: Math.min(3, attemptIds.length) }, () => worker())
      )
      return { marked, failed }
    },
    onSuccess: async (result, variables) => {
      await queryClient.invalidateQueries({
        queryKey: teacherCourseAssignmentReviewKey(
          course,
          variables.assignmentId
        ),
      })
      if (result.failed) {
        toast.warning(
          `AI marked ${result.marked} paper${result.marked === 1 ? "" : "s"}; ${result.failed} need${result.failed === 1 ? "s" : ""} another attempt.`
        )
      } else {
        toast.success(
          `AI suggestions generated for ${result.marked} student${result.marked === 1 ? "" : "s"}.`
        )
      }
    },
    onError: (error: Error) =>
      toast.error(error.message || "Batch AI marking could not be completed"),
  })

  return {
    aiGradeAttemptAsync: mutation.mutateAsync,
    aiGradeAllAsync: bulkMutation.mutateAsync,
    isAiGrading: mutation.isPending,
    isBulkAiGrading: bulkMutation.isPending,
    gradingAttemptId: mutation.variables?.attemptId,
  }
}

export function useTeacherCoursePaperSubmissions(
  course: TeacherCourseRefI | undefined
) {
  const queryClient = useQueryClient()
  const refresh = (assignmentId: string) =>
    Promise.all([
      queryClient.invalidateQueries({
        queryKey: teacherCourseAssignmentReviewKey(course, assignmentId),
      }),
      queryClient.invalidateQueries({
        queryKey: teacherCourseWorkspaceKey(course),
      }),
    ])

  const upload = useMutation({
    mutationFn: ({
      assignmentId,
      scripts,
    }: {
      assignmentId: string
      scripts: TeacherCoursePaperScriptUploadI[]
    }) =>
      uploadTeacherCoursePaperSubmissionsApi(course!, assignmentId, scripts),
    onSuccess: async (data, variables) => {
      await refresh(variables.assignmentId)
      toast.success(data.message || "Paper scripts uploaded")
    },
    onError: (error: Error) =>
      toast.error(error.message || "The paper scripts could not be uploaded"),
  })

  const confirm = useMutation({
    mutationFn: ({
      assignmentId,
      paperSubmissionId,
      studentId,
    }: {
      assignmentId: string
      paperSubmissionId: string
      studentId: string
    }) =>
      confirmTeacherCoursePaperSubmissionApi(
        course!,
        assignmentId,
        paperSubmissionId,
        studentId
      ),
    onSuccess: async (data, variables) => {
      await refresh(variables.assignmentId)
      toast.success(data.message || "Student confirmed")
    },
    onError: (error: Error) =>
      toast.error(error.message || "The student match could not be confirmed"),
  })

  return {
    uploadPaperSubmissionsAsync: upload.mutateAsync,
    confirmPaperSubmissionAsync: confirm.mutateAsync,
    isUploadingPapers: upload.isPending,
    isConfirmingPaper: confirm.isPending,
    confirmingPaperSubmissionId: confirm.variables?.paperSubmissionId,
  }
}

export function useTeacherCourseAssignmentFinalization(
  course: TeacherCourseRefI | undefined
) {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: ({
      assignmentId,
      attemptId,
      answers,
    }: {
      assignmentId: string
      attemptId: string
      answers: {
        questionId: string
        awardedPoints: number
        teacherFeedback?: string
      }[]
    }) =>
      finalizeTeacherCourseAssignmentGradeApi({
        ...course!,
        assignmentId,
        attemptId,
        answers,
      }),
    onSuccess: async (data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: teacherCourseAssignmentReviewKey(
            course,
            variables.assignmentId
          ),
        }),
        queryClient.invalidateQueries({
          queryKey: teacherCourseWorkspaceKey(course),
        }),
        queryClient.invalidateQueries({
          queryKey: ["automated-score-contributions"],
        }),
      ])
      toast.success(data.message || "Final grade approved")
    },
    onError: (error: Error) =>
      toast.error(error.message || "The final grade could not be approved"),
  })

  return {
    finalizeGradeAsync: mutation.mutateAsync,
    isFinalizing: mutation.isPending,
    finalizingAttemptId: mutation.variables?.attemptId,
  }
}

export function useTeacherCourseAssignmentBulkFinalization(
  course: TeacherCourseRefI | undefined
) {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: (assignmentId: string) =>
      bulkFinalizeTeacherCourseAssignmentGradesApi(course!, assignmentId),
    onSuccess: async (data, assignmentId) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: teacherCourseAssignmentReviewKey(course, assignmentId),
        }),
        queryClient.invalidateQueries({
          queryKey: teacherCourseWorkspaceKey(course),
        }),
        queryClient.invalidateQueries({
          queryKey: ["automated-score-contributions"],
        }),
      ])
      toast.success(
        data.message ||
          `Approved ${data.value.approvedCount} student submissions.`
      )
    },
    onError: (error: Error) =>
      toast.error(error.message || "Bulk approval could not be completed"),
  })

  return {
    bulkFinalizeGradesAsync: mutation.mutateAsync,
    isBulkFinalizing: mutation.isPending,
  }
}

export function useTeacherCourseVoiceTranscription(
  course: TeacherCourseRefI | undefined
) {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: ({
      assignmentId,
      attemptId,
      answerId,
    }: {
      assignmentId: string
      attemptId: string
      answerId: string
    }) =>
      transcribeTeacherCourseAssignmentVoiceAnswerApi(
        course!,
        assignmentId,
        attemptId,
        answerId
      ),
    onSuccess: async (data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: teacherCourseAssignmentReviewKey(
          course,
          variables.assignmentId
        ),
      })
      toast.success(data.message || "Voice transcript generated")
    },
    onError: (error: Error) =>
      toast.error(
        error.message || "Voice transcription could not be completed"
      ),
  })

  return {
    transcribeVoiceAnswerAsync: mutation.mutateAsync,
    isTranscribing: mutation.isPending,
    transcribingAnswerId: mutation.variables?.answerId,
  }
}

export function useTeacherCourseCurriculumMutations(
  course?: TeacherCourseRefI
) {
  const queryClient = useQueryClient()
  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: teacherCourseWorkspaceKey(course),
    })

  const createSection = useMutation({
    mutationFn: (
      payload: Omit<SaveTeacherCourseSectionPayloadI, keyof TeacherCourseRefI>
    ) => createTeacherCourseSectionApi({ ...course!, ...payload }),
    onSuccess: async (data) => {
      await invalidate()
      toast.success(data.message || "Section added")
    },
    onError: (error: Error) =>
      toast.error(error.message || "Could not add section"),
  })

  const updateSection = useMutation({
    mutationFn: (
      payload: Omit<SaveTeacherCourseSectionPayloadI, keyof TeacherCourseRefI>
    ) => updateTeacherCourseSectionApi({ ...course!, ...payload }),
    onSuccess: async (data) => {
      await invalidate()
      toast.success(data.message || "Section updated")
    },
    onError: (error: Error) =>
      toast.error(error.message || "Could not update section"),
  })

  const createLesson = useMutation({
    mutationFn: (
      payload: Omit<SaveTeacherCourseLessonPayloadI, keyof TeacherCourseRefI>
    ) => createTeacherCourseLessonApi({ ...course!, ...payload }),
    onSuccess: async (data) => {
      await invalidate()
      toast.success(data.message || "Lesson created")
    },
    onError: (error: Error) =>
      toast.error(error.message || "Could not create lesson"),
  })

  const updateLesson = useMutation({
    mutationFn: (
      payload: Omit<SaveTeacherCourseLessonPayloadI, keyof TeacherCourseRefI>
    ) => updateTeacherCourseLessonApi({ ...course!, ...payload }),
    onSuccess: async (data) => {
      await invalidate()
      toast.success(data.message || "Lesson saved")
    },
    onError: (error: Error) =>
      toast.error(error.message || "Could not save lesson"),
  })

  const deleteLesson = useMutation({
    mutationFn: (lessonId: string) =>
      deleteTeacherCourseLessonApi({ ...course!, lessonId }),
    onSuccess: async (data) => {
      await invalidate()
      toast.success(data.message || "Lesson deleted")
    },
    onError: (error: Error) =>
      toast.error(error.message || "Could not delete lesson"),
  })

  const deleteSection = useMutation({
    mutationFn: (sectionId: string) =>
      deleteTeacherCourseSectionApi({ ...course!, sectionId }),
    onSuccess: async (data) => {
      await invalidate()
      toast.success(data.message || "Section deleted")
    },
    onError: (error: Error) =>
      toast.error(error.message || "Could not delete section"),
  })

  const reorderLessons = useMutation({
    mutationFn: ({
      sectionId,
      lessonIds,
    }: {
      sectionId: string
      lessonIds: string[]
    }) => reorderTeacherCourseLessonsApi({ ...course!, sectionId, lessonIds }),
    onSuccess: async (data) => {
      await invalidate()
      toast.success(data.message || "Lesson order updated")
    },
    onError: (error: Error) =>
      toast.error(error.message || "Could not reorder lessons"),
  })

  return {
    createSectionAsync: createSection.mutateAsync,
    updateSectionAsync: updateSection.mutateAsync,
    createLessonAsync: createLesson.mutateAsync,
    updateLessonAsync: updateLesson.mutateAsync,
    deleteLessonAsync: deleteLesson.mutateAsync,
    deleteSectionAsync: deleteSection.mutateAsync,
    reorderLessonsAsync: reorderLessons.mutateAsync,
    isSavingSection: createSection.isPending || updateSection.isPending,
    isSavingLesson: createLesson.isPending || updateLesson.isPending,
    isDeletingLesson: deleteLesson.isPending,
    isDeletingSection: deleteSection.isPending,
    isReorderingLessons: reorderLessons.isPending,
  }
}
