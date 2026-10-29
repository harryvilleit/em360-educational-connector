import { useMemo, useState } from "react"
import { ClipboardList, Plus, Radio, Video } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAdaptiveCourseInsights } from "@/hooks/elearning/useAdaptiveLearning"
import { useQueryClient } from "@tanstack/react-query"
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router"
import { toast } from "sonner"
import { Spinner } from "@/components/ui/spinner"
import { DashboardRoutes } from "@/routes"
import { useSchoolId } from "@/contexts/SchoolContext"
import { useAuthStore } from "@/store/auth.store"
import { usePermissions } from "@/hooks/usePermissions"
import { useSchoolCurriculumAccess } from "@/hooks/subscriptions/useSchoolCurriculumAccess"
import { uploadTeacherCourseMaterialApi } from "@/api/teacherCourse.api"
import {
  useGetLiveClasses,
  useGetTeacherCourses,
  useStartClassFromSlot,
} from "@/hooks/liveClass"
import { mapLiveClassToSession } from "./liveClassMapping"
import { useELearningStore } from "@/store/elearning.store"
import { belongsToCourse, filterByCourse } from "@/lib/elearning-course"
import {
  type ApiCourseDetailState,
  isDemoSchoolCourse,
} from "@/lib/elearning-demo"
import { useELearningFilterOptions } from "@/hooks/elearning/useELearningFilterOptions"
import {
  isTimetableDerived,
  useTimetableClassSessions,
} from "@/hooks/elearning/useTimetableClassSessions"
import {
  useTeacherCourseAssignmentMutations,
  useTeacherCourseCurriculumMutations,
  useTeacherCourseWorkspace,
  teacherCourseWorkspaceKey,
} from "@/hooks/elearning/useTeacherCourseWorkspace"
import CourseCurriculum from "../Lms/components/CourseCurriculum"
import ModuleFormModal from "../Lms/components/ModuleFormModal"
import type { CourseTab } from "../Lms/components/CourseTabs"
import ELearningCourseWorkspace from "./components/ELearningCourseWorkspace"
import AiCourseBuilder from "./components/AiCourseBuilder"
import ELearningCourseTabs from "./components/ELearningCourseTabs"
import type { AssignmentForm } from "./components/AssignmentFormModal"
import { useELearningCourse } from "./hooks/useELearningCourse"
import { mapLiveClassesToSessions } from "./liveClassMapping"
import { mergeClassSessions } from "./timetableClassMapping"
import type {
  LmsCourseModule,
  LmsLesson,
  LiveClassSession,
  SchoolSubjectCourse,
} from "@/types/elearning"

const COURSE_COLORS = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-purple-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-cyan-500",
]

function toAssignmentPayload(assignment: AssignmentForm) {
  return {
    title: assignment.title,
    assignmentType: assignment.assignmentType,
    answerMode: assignment.answerMode,
    instructions: assignment.description,
    dueDateUtc: assignment.dueDate,
    durationMinutes: assignment.durationMinutes,
    allowVideoRecording: assignment.allowVideoRecording,
    maxRetakes: assignment.maxRetakes,
    sourceDocumentName: assignment.sourceDocumentName,
    sourceDocumentUrl: assignment.sourceDocumentUrl,
    submissionMethod: assignment.submissionMethod,
    workType: assignment.workType,
    languageCode: assignment.languageCode,
    curriculumStandard: assignment.curriculumStandard,
    educationLevel: assignment.educationLevel,
    countryCode: assignment.countryCode,
    schoolSessionId: assignment.schoolSessionId,
    schoolSessionTermId: assignment.schoolSessionTermId,
    assessmentComponentId: assignment.assessmentComponentId,
    gradebookContributionPoints: assignment.gradebookContributionPoints,
    questions: assignment.questions.map((question) => ({
      prompt: question.prompt,
      referenceAnswer: question.referenceAnswer,
      points: question.points,
      rubricCriteria: question.rubricCriteria,
      options: question.options.map((option) => ({
        text: option.text,
        isCorrect: option.isCorrect,
      })),
    })),
  }
}

const VALID_TABS = new Set<CourseTab>([
  "overview",
  "curriculum",
  "assignments",
  "certificates",
  "materials",
  "recordings",
  "live",
  "enrollments",
  "chat",
  "insights",
])

function parseTab(value: string | null): CourseTab {
  return value && VALID_TABS.has(value as CourseTab)
    ? (value as CourseTab)
    : "overview"
}

function mapApiCourse(
  raw: {
    id: string
    subjectId: string
    subjectName: string
    className: string
    classId: string
    studentCount: number
    teacherName: string
  },
  colorIndex: number
): SchoolSubjectCourse {
  return {
    id: raw.id,
    subjectId: raw.subjectId,
    subject: raw.subjectName,
    className: raw.className,
    classId: raw.classId,
    teacherName: raw.teacherName,
    description: `${raw.subjectName} · ${raw.className}`,
    studentCount: raw.studentCount,
    thumbnailColor: COURSE_COLORS[colorIndex % COURSE_COLORS.length],
  }
}

export default function ELearningCourseDetailPage() {
  const { productId, courseId } = useParams<{
    productId: string
    courseId: string
  }>()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const schoolId = useSchoolId()
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)
  const { isOwner } = usePermissions()
  const isDemo = isDemoSchoolCourse(courseId)
  const { canManageCurriculum: planAllowsCurriculum, isLoading: planLoading } =
    useSchoolCurriculumAccess(isDemo ? "" : schoolId)
  const canManageCurriculum = isDemo || planAllowsCurriculum
  const [isUploadingCourseMaterial, setIsUploadingCourseMaterial] = useState(false)
  const detailState = location.state as ApiCourseDetailState | null
  const teacherSubUserId =
    searchParams.get("teacherId") ?? detailState?.teacherSubUserId
  const readOnly =
    !isDemo &&
    isOwner &&
    (searchParams.get("mode") === "readonly" || detailState?.readOnly === true)

  const sessions = useELearningStore((s) => s.sessions)
  const recordingsStore = useELearningStore((s) => s.recordings)
  const addModule = useELearningStore((s) => s.addModule)
  const updateModule = useELearningStore((s) => s.updateModule)
  const deleteDemoLesson = useELearningStore((s) => s.deleteLesson)
  const { course: demoCourse, modules: demoModules } = useELearningCourse(
    isDemo ? courseId : undefined
  )

  const { courses: apiCourses, isLoading: apiLoading } = useGetTeacherCourses(
    isDemo ? "" : schoolId,
    teacherSubUserId
  )
  const apiCourseFromState = detailState?.apiCourse
  const apiCourseFromFetch = useMemo(() => {
    if (isDemo || !courseId) return undefined
    const index = apiCourses.findIndex((item) => item.id === courseId)
    return index < 0 ? undefined : mapApiCourse(apiCourses[index], index)
  }, [apiCourses, courseId, isDemo])
  const apiCourse = apiCourseFromState ?? apiCourseFromFetch

  const courseRef = useMemo(
    () =>
      !isDemo && apiCourse?.subjectId && apiCourse.classId
        ? {
            schoolId,
            subjectId: apiCourse.subjectId,
            classId: apiCourse.classId,
          }
        : undefined,
    [apiCourse, isDemo, schoolId]
  )
  const workspaceQuery = useTeacherCourseWorkspace(courseId, courseRef)
  const { insights: adaptiveInsights } = useAdaptiveCourseInsights(courseRef)
  const curriculumMutations = useTeacherCourseCurriculumMutations(courseRef)
  const assignmentMutations = useTeacherCourseAssignmentMutations(courseRef)

  const { termRanges, termIdByName, sessionId, currentTermName } =
    useELearningFilterOptions(isDemo ? "" : schoolId)
  const currentTermRange = currentTermName
    ? termRanges[currentTermName]
    : undefined
  const currentTermId = currentTermName
    ? termIdByName[currentTermName]
    : undefined

  const { liveClasses } = useGetLiveClasses({
    schoolId: isDemo ? "" : schoolId,
    schoolClassId: apiCourse?.classId,
    pageSize: 200,
  }, { refetchInterval: 15_000, refetchOnWindowFocus: true, staleTime: 10_000 })
  const { sessions: timetableSessions } = useTimetableClassSessions({
    schoolId: isDemo || readOnly ? "" : schoolId,
    sessionId,
    termId: currentTermId,
    startDate: currentTermRange?.startDate ?? "",
    endDate: currentTermRange?.endDate ?? "",
    teacherId: user?.id,
    teacherName: user?.name,
    schoolClassId: apiCourse?.classId,
  })

  const realCourseSessions = useMemo(() => {
    if (!apiCourse?.subjectId) return []
    const isInCurrentTerm = (item: LiveClassSession) =>
      !currentTermRange ||
      (item.scheduledDate >= currentTermRange.startDate &&
        item.scheduledDate <= currentTermRange.endDate)
    const virtual = timetableSessions.filter(
      (item) => item.courseId === apiCourse.subjectId
    )
    const live = mapLiveClassesToSessions(liveClasses).filter(
      (item) => item.courseId === apiCourse.subjectId && isInCurrentTerm(item)
    )
    return mergeClassSessions(virtual, live)
  }, [apiCourse, currentTermRange, liveClasses, timetableSessions])

  const course = isDemo
    ? demoCourse
    : apiCourse
      ? { ...apiCourse, terms: currentTermName ? [currentTermName] : [] }
      : undefined
  const modules = isDemo ? demoModules : workspaceQuery.modules
  const courseSessions = useMemo(
    () =>
      isDemo && demoCourse
        ? sessions.filter((item) => belongsToCourse(item, demoCourse))
        : realCourseSessions,
    [demoCourse, isDemo, realCourseSessions, sessions]
  )
  const courseRecordings = useMemo(
    () =>
      isDemo && demoCourse
        ? filterByCourse(recordingsStore, demoCourse)
        : workspaceQuery.recordings,
    [demoCourse, isDemo, recordingsStore, workspaceQuery.recordings]
  )

  const [moduleOpen, setModuleOpen] = useState(false)
  const [createAssignmentOpen, setCreateAssignmentOpen] = useState(false)
  const [editingModule, setEditingModule] = useState<LmsCourseModule | null>(
    null
  )
  const requestedTab = parseTab(searchParams.get("tab"))
  const activeTab = !canManageCurriculum && requestedTab === "curriculum"
    ? "assignments"
    : requestedTab

  const withViewerContext = (path: string) => {
    if (!teacherSubUserId) return path
    const params = new URLSearchParams()
    params.set("teacherId", teacherSubUserId)
    if (readOnly) params.set("mode", "readonly")
    return `${path}?${params.toString()}`
  }

  const openClassChat = () => {
    if (!course?.classId) return
    navigate(
      `${DashboardRoutes.toChat(productId ?? "")}?classId=${encodeURIComponent(course.classId)}`
    )
  }

  const handleTabChange = (tab: CourseTab) => {
    if (tab === "curriculum" && !canManageCurriculum) return
    if (tab === "chat") {
      openClassChat()
      return
    }
    const next = new URLSearchParams(searchParams)
    if (tab === "overview") next.delete("tab")
    else next.set("tab", tab)
    setSearchParams(next, { replace: true })
  }

  const { startClassFromSlotAsync, isPending: isJoiningClass } =
    useStartClassFromSlot()
  const openLiveClass = async (session: LiveClassSession) => {
    if (!isTimetableDerived(session)) {
      navigate(
        DashboardRoutes.toELearningLiveRoom(productId ?? "", session.id),
        { state: { session } }
      )
      return
    }
    if (!session.timetableSlotId) {
      toast.error("This class is not linked to a timetable period")
      return
    }
    const result = await startClassFromSlotAsync({
      schoolId,
      timetableSlotId: session.timetableSlotId,
      date: session.scheduledDate,
    })
    if (!result.value?.id) return
    navigate(
      DashboardRoutes.toELearningLiveRoom(productId ?? "", result.value.id),
      { state: { session: mapLiveClassToSession(result.value) } }
    )
  }

  if (
    (!course && apiLoading) ||
    (!isDemo && course && (workspaceQuery.isLoading || planLoading))
  ) {
    return (
      <div className="flex justify-center py-20">
        <Spinner className="h-6 w-6" />
      </div>
    )
  }
  if (!course) {
    return (
      <div className="py-20 text-center text-sm text-muted-foreground">
        Course not found
      </div>
    )
  }
  if (!isDemo && workspaceQuery.isError) {
    return (
      <div className="py-20 text-center text-sm text-muted-foreground">
        This course workspace could not be loaded.
      </div>
    )
  }

  const openLessonPlayer = (lesson: LmsLesson) =>
    navigate(
      withViewerContext(
        DashboardRoutes.toELearningLesson(
          productId ?? "",
          courseId ?? "",
          lesson.id
        )
      )
    )
  const openLessonEditor = (lesson: LmsLesson) =>
    navigate(
      DashboardRoutes.toELearningLessonEdit(
        productId ?? "",
        courseId ?? "",
        lesson.id
      )
    )
  const openNewLesson = (moduleId: string) =>
    navigate(
      `${DashboardRoutes.toELearningLessonEdit(productId ?? "", courseId ?? "", "new")}?moduleId=${encodeURIComponent(moduleId)}`
    )

  const openCoursePlayer = () => {
    const firstLesson = [...modules]
      .sort((a, b) => a.order - b.order)
      .flatMap((module) =>
        [...module.lessons].sort((a, b) => a.order - b.order)
      )[0]
    if (!firstLesson) {
      toast.info("Add a lesson before opening the course view")
      return
    }
    openLessonPlayer(firstLesson)
  }

  const deleteLesson = async (lesson: LmsLesson) => {
    if (!window.confirm(`Delete “${lesson.title}”? This cannot be undone.`))
      return
    if (isDemo) {
      deleteDemoLesson(lesson.id)
      toast.success("Lesson deleted")
      return
    }
    await curriculumMutations.deleteLessonAsync(lesson.id)
  }

  const deleteSection = async (module: LmsCourseModule) => {
    if (!window.confirm(`Delete “${module.title}” and all its lessons? This cannot be undone.`))
      return
    if (isDemo) {
      toast.info("Section deletion is available for saved courses")
      return
    }
    await curriculumMutations.deleteSectionAsync(module.id)
  }

  const moveLesson = async (
    module: LmsCourseModule,
    lessonIndex: number,
    direction: -1 | 1
  ) => {
    const targetIndex = lessonIndex + direction
    if (targetIndex < 0 || targetIndex >= module.lessons.length) return
    const lessonIds = module.lessons.map((item) => item.id)
    ;[lessonIds[lessonIndex], lessonIds[targetIndex]] = [
      lessonIds[targetIndex], lessonIds[lessonIndex],
    ]
    if (isDemo) {
      toast.info("Lesson reordering is available for saved courses")
      return
    }
    await curriculumMutations.reorderLessonsAsync({ sectionId: module.id, lessonIds })
  }

  const liveSession = courseSessions.find((item) => item.status === "live")
  const liveCount = courseSessions.filter(
    (item) => item.status === "live"
  ).length
  const upcomingCount = courseSessions.filter(
    (item) => item.status === "upcoming"
  ).length

  const uploadCourseMaterial = async (file: File) => {
    if (!courseRef || readOnly) return
    setIsUploadingCourseMaterial(true)
    try {
      await uploadTeacherCourseMaterialApi(courseRef, file)
      await queryClient.invalidateQueries({ queryKey: teacherCourseWorkspaceKey(courseRef) })
      toast.success("Course material uploaded")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Material could not be uploaded")
    } finally {
      setIsUploadingCourseMaterial(false)
    }
  }

  return (
    <>
      <ELearningCourseWorkspace
        course={course}
        modules={modules}
        liveCount={liveCount}
        upcomingCount={upcomingCount}
        isDemo={isDemo}
        readOnly={readOnly}
        questionsTagged={
          adaptiveInsights
            ? {
                tagged: adaptiveInsights.taggedQuestionCount,
                total:
                  adaptiveInsights.taggedQuestionCount +
                  adaptiveInsights.untaggedQuestionCount,
              }
            : undefined
        }
        actions={
          readOnly ? undefined : (
            <>
              {liveSession ? (
                <Button
                  variant="outline"
                  className="h-11 rounded-xl px-4"
                  disabled={isJoiningClass}
                  onClick={() => void openLiveClass(liveSession)}
                >
                  <Radio className="size-4 text-rose-600" aria-hidden="true" />
                  Join live class
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="h-11 rounded-xl px-4"
                  onClick={() => handleTabChange("live")}
                >
                  <Video className="size-4" aria-hidden="true" />
                  Live classes
                </Button>
              )}
              <Button
                variant="outline"
                className="h-11 rounded-xl px-4"
                onClick={() => handleTabChange("assignments")}
              >
                <ClipboardList className="size-4" aria-hidden="true" />
                Assignments
              </Button>
              <Button
                className="h-11 rounded-xl px-4"
                onClick={() => setCreateAssignmentOpen(true)}
              >
                <Plus className="size-4" aria-hidden="true" />
                New assignment
              </Button>
            </>
          )
        }
        backPath={
          teacherSubUserId
            ? DashboardRoutes.toELearningTeacherCourses(
                productId ?? "",
                teacherSubUserId
              )
            : DashboardRoutes.toELearningCourses(productId ?? "")
        }
      >
        <ELearningCourseTabs
          overviewAside={
            courseRef && !isDemo && !readOnly && canManageCurriculum ? (
              <AiCourseBuilder
                variant="card"
                courseRef={courseRef}
                courseTitle={apiCourse?.subject ?? "New course"}
                className={apiCourse?.className}
              />
            ) : undefined
          }
          createAssignmentOpen={createAssignmentOpen}
          onCreateAssignmentOpenChange={setCreateAssignmentOpen}
          course={course}
          modules={modules}
          sessions={courseSessions}
          recordings={courseRecordings}
          enrollments={isDemo ? undefined : workspaceQuery.enrollments}
          assignments={isDemo ? undefined : workspaceQuery.assignments}
          courseRef={courseRef}
          courseMaterials={workspaceQuery.workspace?.courseMaterials ?? []}
          canManageCurriculum={canManageCurriculum}
          onUploadCourseMaterial={isDemo || readOnly ? undefined : uploadCourseMaterial}
          isUploadingCourseMaterial={isUploadingCourseMaterial}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onJoinSession={readOnly ? undefined : openLiveClass}
          isJoiningSession={isJoiningClass}
          onInterpretAssignmentDocument={
            isDemo || readOnly
              ? undefined
              : (file, answerMode) =>
                  assignmentMutations.interpretDocumentAsync({
                    file,
                    answerMode,
                  })
          }
          onCreateAssignment={
            isDemo || readOnly
              ? undefined
              : async (assignment) => {
                  await assignmentMutations.createAssignmentAsync(
                    toAssignmentPayload(assignment)
                  )
                }
          }
          onUpdateAssignment={
            isDemo || readOnly
              ? undefined
              : async (assignmentId, assignment) => {
                  await assignmentMutations.updateAssignmentAsync({
                    assignmentId,
                    ...toAssignmentPayload(assignment),
                  })
                }
          }
          onApproveAssignment={
            isDemo || readOnly
              ? undefined
              : assignmentMutations.approveAssignmentAsync
          }
          onDeleteAssignment={
            isDemo || readOnly
              ? undefined
              : assignmentMutations.deleteAssignmentAsync
          }
          onReopenAssignment={
            isDemo || readOnly
              ? undefined
              : (assignmentId, attemptId) =>
                  assignmentMutations.reopenAttemptAsync({
                    assignmentId,
                    attemptId,
                  })
          }
          isInterpretingAssignment={assignmentMutations.isInterpretingDocument}
          isPublishingAssignment={assignmentMutations.isPublishingAssignment}
          isApprovingAssignment={assignmentMutations.isApprovingAssignment}
          isDeletingAssignment={assignmentMutations.isDeletingAssignment}
          isReopeningAssignment={assignmentMutations.isReopeningAttempt}
          curriculumSlot={
            <CourseCurriculum
              modules={modules}
              isTutor={!readOnly}
              onLessonClick={openLessonPlayer}
              onViewLesson={openLessonPlayer}
              onEditLesson={readOnly ? undefined : openLessonEditor}
              onDeleteLesson={readOnly ? undefined : deleteLesson}
              onMoveLesson={readOnly ? undefined : moveLesson}
              onViewCourse={openCoursePlayer}
              onAddModule={
                readOnly
                  ? undefined
                  : () => {
                      setEditingModule(null)
                      setModuleOpen(true)
                    }
              }
              onEditModule={
                readOnly
                  ? undefined
                  : (mod) => {
                      setEditingModule(mod)
                      setModuleOpen(true)
                    }
              }
              onDeleteModule={readOnly ? undefined : deleteSection}
              onAddLesson={readOnly ? undefined : openNewLesson}
              canDeleteCurriculum={(course.studentCount ?? 0) === 0}
              deleteDisabledReason="Lessons and sections cannot be deleted while students are attached to this course."
            />
          }
          readOnly={readOnly}
        />
      </ELearningCourseWorkspace>

      {!readOnly && canManageCurriculum && (
        <ModuleFormModal
          open={moduleOpen}
          onClose={() => {
            setModuleOpen(false)
            setEditingModule(null)
          }}
          mode={editingModule ? "edit" : "create"}
          initialTitle={editingModule?.title ?? ""}
          isPending={curriculumMutations.isSavingSection}
          onSubmit={async (title) => {
            if (isDemo) {
              if (editingModule) {
                updateModule(editingModule.id, { title })
                toast.success("Section updated")
              } else {
                addModule(courseId ?? "", title)
                toast.success("Section added")
              }
              return
            }
            if (editingModule) {
              await curriculumMutations.updateSectionAsync({
                sectionId: editingModule.id,
                title,
                sortOrder: editingModule.order,
              })
            } else {
              await curriculumMutations.createSectionAsync({
                title,
                sortOrder: modules.length + 1,
              })
            }
          }}
        />
      )}
    </>
  )
}
