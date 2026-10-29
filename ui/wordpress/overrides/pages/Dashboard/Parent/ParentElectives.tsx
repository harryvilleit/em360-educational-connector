import { useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router"
import { ArrowRight, BookOpen, CheckCircle2, Loader2 } from "lucide-react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { PageHeader } from "@/components/general/PageHeader"
import { EmptyState } from "@/components/ui/empty-state"
import { Button } from "@/components/ui/button"
import { FilterSelect } from "@/components/ui/filter-select"
import { useSchoolId } from "@/contexts/SchoolContext"
import { useResolvedParent } from "@/hooks/useResolvedParent"
import { useChildSessionTree } from "@/hooks/useChildSessionTree"
import { useParentPortalSelection } from "@/hooks/useParentPortalSelection"
import {
  useGetStudentEnrolledClasses,
  useSubscribeToOptionalSubject,
} from "@/hooks/guardian"

import {
  formatClassOptionLabel,
  getCurrentPortalClass,
} from "@/utils/guardianAdapter"
import type { LaunchSchoolPortalDataI } from "@/api/guardian.api/types"
import { LinkedChildTab } from "@/pages/Dashboard/Parent/components/LinkedChildTab"
import { getParentCourses } from "@/api/parentCourses.api"
import { HomeRoutes } from "@/routes"

interface ParentElectivesPageProps {
  parentIdOverride?: string
  portalOverride?: LaunchSchoolPortalDataI
}

export default function ParentElectivesPage({
  parentIdOverride,
  portalOverride,
}: ParentElectivesPageProps = {}) {
  const { parentId: routeParentId } = useParams<{
    productId: string
    parentId: string
  }>()
  const parentId = parentIdOverride ?? routeParentId
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const schoolId = useSchoolId()
  const guardianId = parentId ?? ""

  const { parent, isLoading: parentLoading } = useResolvedParent(
    parentId,
    portalOverride
  )
  const {
    selectedChildId,
    selectedSessionId,
    selectedTermId,
    selectedClass,
    selectChild: storeSelectChild,
    selectSession: storeSelectSession,
    selectTerm: storeSelectTerm,
    selectClass,
  } = useParentPortalSelection(guardianId)
  // "all" is Electives-only, so it's kept local (null = use the shared default)
  const [classFilterOverride, setClassFilterOverride] = useState<string | null>(
    null
  )
  const [subscribingId, setSubscribingId] = useState<string | null>(null)

  const handleSelectChild = (id: string) => {
    storeSelectChild(id)
    setClassFilterOverride(null)
  }

  const selectSession = (id: string) => {
    storeSelectSession(id)
    setClassFilterOverride(null)
  }

  const selectTerm = (id: string) => {
    storeSelectTerm(id)
    setClassFilterOverride(null)
  }

  const activeChildId = selectedChildId || parent?.children[0]?.id || ""

  const { sessions: childSessions } = useChildSessionTree({
    schoolId,
    activeChildId,

    portal: portalOverride,
  })
  const sessionOptions = useMemo(
    () => childSessions.map((s) => ({ value: s.id, label: s.name })),
    [childSessions]
  )
  const defaultSessionId = useMemo(() => {
    const current = childSessions.find((s) => s.isCurrent)
    return current?.id ?? childSessions[0]?.id ?? ""
  }, [childSessions])
  const activeSessionId = selectedSessionId || defaultSessionId
  const activeSession = childSessions.find((s) => s.id === activeSessionId)

  const termOptions = useMemo(
    () =>
      (activeSession?.terms ?? []).map((t) => ({ value: t.id, label: t.name })),
    [activeSession]
  )
  const defaultTermId = useMemo(
    () =>
      activeSession?.terms.find((t) => t.isCurrent)?.id ??
      activeSession?.terms[0]?.id ??
      "",
    [activeSession]
  )
  const activeTermId = selectedTermId || defaultTermId

  const {
    enrolledClasses,
    isLoading: classesLoading,
    isError: classesError,
  } = useGetStudentEnrolledClasses({
    studentId: activeChildId,
    schoolId: schoolId,
    schoolSessionId: activeSessionId,
    schoolSessionTermId: activeTermId,
  })

  const classFilterOptions = useMemo(
    () => [
      { value: "all", label: "All classes" },
      ...enrolledClasses.map((c) => ({
        value: c.studentEnrollmentId,
        label: formatClassOptionLabel(c.className, c.classArmName),
      })),
    ],
    [enrolledClasses]
  )
  const activePortalChild = portalOverride?.children.find(
    (child) => child.studentId === activeChildId
  )
  const currentPortalClass = activePortalChild
    ? getCurrentPortalClass(activePortalChild)
    : undefined

  const defaultClassId =
    (selectedClass?.enrollmentId &&
      enrolledClasses.some(
        (c) => c.studentEnrollmentId === selectedClass.enrollmentId
      ) &&
      selectedClass.enrollmentId) ||
    enrolledClasses.find(
      (item) => item.classId === currentPortalClass?.schoolClassId
    )?.studentEnrollmentId ||
    "all"
  const activeClassId = classFilterOverride ?? defaultClassId

  const handleClassFilterChange = (value: string) => {
    setClassFilterOverride(value)
    if (value === "all") {
      selectClass(null)
      return
    }
    const cls = enrolledClasses.find((c) => c.studentEnrollmentId === value)
    selectClass(
      cls
        ? {
            enrollmentId: cls.studentEnrollmentId,
            schoolClassId: cls.classId,
            className: cls.className,
            schoolArmId: cls.classArmId,
            armName: cls.classArmName,
            isCurrent: cls.classId === currentPortalClass?.schoolClassId,
          }
        : null
    )
  }

  const visibleClasses =
    activeClassId === "all"
      ? enrolledClasses
      : enrolledClasses.filter((c) => c.studentEnrollmentId === activeClassId)

  const activeClass = enrolledClasses.find(
    (c) => c.studentEnrollmentId === activeClassId
  )
  const {
    data: courses = [],
    isPending: coursesLoading,
    isError: coursesError,
  } = useQuery({
    queryKey: [
      "parent-courses",
      schoolId,
      activeChildId,
      activeSessionId,
      activeTermId,
      activeClass?.classId,
    ],
    queryFn: () =>
      getParentCourses({
        schoolId,
        studentId: activeChildId,
        sessionId: activeSessionId,
        termId: activeTermId,
        classId: activeClass?.classId,
      }),
    enabled:
      !!schoolId &&
      !!activeChildId &&
      !!activeSessionId &&
      !!activeTermId &&
      !classesLoading,
  })

  const { subscribeToOptionalSubjectAsync } = useSubscribeToOptionalSubject()

  async function handleSubscribe(
    classSubjectId: string,
    subjectId: string,
    subjectName: string
  ) {
    if (!activeChildId || !classSubjectId) return
    setSubscribingId(subjectId)
    try {
      await subscribeToOptionalSubjectAsync({
        guardianId,
        studentId: activeChildId,
        schoolId,
        classSubjectId,
        subjectName,
      })
      await queryClient.invalidateQueries({
        queryKey: ["parent-courses", schoolId, activeChildId],
      })
    } finally {
      setSubscribingId(null)
    }
  }

  if (parentLoading) {
    return (
      <div className="p-6 text-center text-sm text-gray-400 dark:text-gray-500">
        Loading parent...
      </div>
    )
  }

  if (!parent) {
    return (
      <div className="p-6 text-center text-sm text-gray-400 dark:text-gray-500">
        Parent not found.
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="My child's courses"
        description={
          <>
            {parent.firstName} {parent.lastName} &mdash;{" "}
            {parent.children.length === 1
              ? parent.children[0].name
              : `${parent.children.length} children`}
          </>
        }
        onBack={parentIdOverride ? undefined : () => navigate(-1)}
        className="mb-7"
      />

      {parent.children.length > 1 && (
        <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
          {parent.children.map((child) => (
            <LinkedChildTab
              key={child.id}
              child={child}
              active={child.id === activeChildId}
              onClick={handleSelectChild}
            />
          ))}
        </div>
      )}

      {parent.children.length > 0 && (
        <div className="mb-6 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-3 dark:border-white/10 dark:bg-white/3">
          <label className="space-y-1 text-xs font-semibold text-slate-500">
            Session
            <FilterSelect
              value={activeSessionId}
              onChange={selectSession}
              options={sessionOptions}
              placeholder="Select session"
              triggerClassName="h-10 w-full"
            />
          </label>
          <label className="space-y-1 text-xs font-semibold text-slate-500">
            Term
            <FilterSelect
              value={activeTermId}
              onChange={selectTerm}
              options={termOptions}
              placeholder="Select term"
              triggerClassName="h-10 w-full"
            />
          </label>
          <label className="space-y-1 text-xs font-semibold text-slate-500">
            Class
            <FilterSelect
              value={activeClassId}
              onChange={handleClassFilterChange}
              options={classFilterOptions}
              placeholder="Select class"
              triggerClassName="h-10 w-full"
            />
          </label>
        </div>
      )}

      {parent.children.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No children linked"
          description="This guardian has no children linked at this school yet."
          size="sm"
        />
      ) : classesLoading ? (
        <div className="flex items-center justify-center rounded-xl border border-gray-200 bg-white py-20 dark:border-white/10 dark:bg-white/3">
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Loading enrolled classes...
          </p>
        </div>
      ) : classesError ? (
        <EmptyState
          icon={BookOpen}
          title="Couldn't load enrolled classes"
          description="Please try again in a moment."
          size="sm"
        />
      ) : enrolledClasses.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No enrolled classes"
          description="No class enrollment found for this student for the selected session and term."
          size="sm"
        />
      ) : visibleClasses.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No enrolled classes"
          description="No enrollment found for the selected class."
          size="sm"
        />
      ) : (
        <>
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-950 dark:text-white">
                Courses
              </h2>
              <p className="text-sm text-slate-500">
                See lessons, resources and assignment progress for this child.
              </p>
            </div>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
              {courses.length} courses
            </span>
          </div>
          {coursesLoading ? (
            <div className="py-16 text-center text-sm text-slate-500">
              Loading courses…
            </div>
          ) : coursesError ? (
            <EmptyState
              icon={BookOpen}
              title="Couldn't load courses"
              description="Please try again in a moment."
              size="sm"
            />
          ) : courses.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No courses yet"
              description="This child has no enrolled courses for the selected session, term and class."
              size="sm"
            />
          ) : (
            <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {courses.map((course, index) => (
                <button
                  key={`${course.classId}-${course.subjectId}`}
                  type="button"
                  onClick={() =>
                    navigate(
                      `${HomeRoutes.toParentCourse(schoolId, activeChildId, course.classId, course.subjectId)}?${new URLSearchParams({ sessionId: activeSessionId, termId: activeTermId })}`
                    )
                  }
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none dark:border-white/10 dark:bg-white/3"
                >
                  <div
                    className={
                      [
                        "bg-blue-500",
                        "bg-emerald-500",
                        "bg-violet-500",
                        "bg-amber-500",
                      ][index % 4] + " h-2"
                    }
                  />
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate font-bold text-slate-950 dark:text-white">
                          {course.subjectName}
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                          {course.className}
                        </p>
                      </div>
                      <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                        {Math.round(course.progressPercent)}%
                      </span>
                    </div>
                    <p className="mt-4 truncate text-sm text-slate-600 dark:text-slate-300">
                      {course.teacherName || "Teacher not assigned"}
                    </p>
                    <div className="mt-5 flex justify-between text-xs text-slate-500">
                      <span>Child's progress</span>
                      <span>
                        {course.completedLessonCount}/{course.lessonCount}{" "}
                        lessons
                      </span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-blue-600"
                        style={{
                          width: `${Math.min(100, Math.max(0, course.progressPercent))}%`,
                        }}
                      />
                    </div>
                    <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-sm font-semibold text-blue-600">
                      <span>View course</span>
                      <ArrowRight className="size-4 transition group-hover:translate-x-1" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
          <h2 className="mb-3 text-base font-bold text-slate-900 dark:text-white">
            Enrolled subjects & optional choices
          </h2>
          <div className="space-y-4">
            {visibleClasses.map((cls) => (
              <div
                key={cls.studentEnrollmentId}
                className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/10 dark:bg-white/3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 px-5 py-4 dark:border-white/5">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {cls.classArmName
                      ? `${cls.className} - ${cls.classArmName}`
                      : cls.className}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {cls.summary.mandatorySubjects} mandatory ·{" "}
                    {cls.summary.subscribedOptionalSubjects} subscribed ·{" "}
                    {cls.summary.availableOptionalSubjects} available
                  </p>
                </div>

                {cls.subjects.length === 0 ? (
                  <p className="px-5 py-6 text-center text-sm text-gray-400 dark:text-gray-500">
                    No subjects have been assigned to this class yet.
                  </p>
                ) : (
                  <div className="divide-y divide-gray-100 dark:divide-white/5">
                    {cls.subjects.map((subject) => {
                      const isAvailable =
                        subject.isOptional &&
                        !subject.isSubscribed &&
                        subject.canSubscribe
                      const isSubscribed =
                        subject.isOptional && subject.isSubscribed

                      return (
                        <div
                          key={subject.subjectId}
                          className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5"
                        >
                          <div className="flex items-center gap-2.5">
                            <BookOpen className="size-4 text-gray-400" />
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                              {subject.subjectName}
                            </p>
                            {subject.isMandatory && (
                              <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
                                Mandatory
                              </span>
                            )}
                          </div>

                          {isSubscribed ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
                              <CheckCircle2 className="size-3.5" />
                              Subscribed
                            </span>
                          ) : isAvailable ? (
                            <Button
                              size="sm"
                              variant="primary"
                              disabled={subscribingId === subject.subjectId}
                              onClick={() =>
                                handleSubscribe(
                                  subject.classSubjectId,
                                  subject.subjectId,
                                  subject.subjectName
                                )
                              }
                            >
                              {subscribingId === subject.subjectId ? (
                                <>
                                  <Loader2 className="size-3.5 animate-spin" />
                                  Subscribing…
                                </>
                              ) : (
                                "Subscribe Child"
                              )}
                            </Button>
                          ) : null}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
