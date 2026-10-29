import { useMemo } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router"
import { PageHeader } from "@/components/general/PageHeader"
import { dashboardCardInner } from "@/components/general/StatCard"
import { Spinner } from "@/components/ui/spinner"
import { DashboardRoutes } from "@/routes"
import { useSchoolId } from "@/contexts/SchoolContext"
import { useAuthStore } from "@/store/auth.store"
import { usePermissions } from "@/hooks/usePermissions"
import { useGetTeacherCourses } from "@/hooks/liveClass"
import { useELearningFilterOptions } from "@/hooks/elearning/useELearningFilterOptions"
import type { SchoolSubjectCourse } from "@/types/elearning"
import CoursesFilters from "./components/CoursesFilters"
import {
  courseFiltersToParams,
  filterCourses,
  parseCourseFilters,
} from "./courses.utils"

const COURSE_COLORS = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-purple-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-cyan-500",
]

export default function ELearningCoursesPage() {
  const { productId, teacherId } = useParams<{
    productId: string
    teacherId?: string
  }>()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const schoolId = useSchoolId()
  const user = useAuthStore((s) => s.user)
  const { isOwner } = usePermissions()

  const { courses: apiCourses, isLoading: apiLoading } = useGetTeacherCourses(
    schoolId,
    teacherId
  )
  const {
    classOptions,
    termOptions,
    currentTermName,
    isLoading: optionsLoading,
  } = useELearningFilterOptions(schoolId)

  const apiMapped = useMemo<SchoolSubjectCourse[]>(
    () =>
      apiCourses.map((c, i) => ({
        id: c.id,
        subjectId: c.subjectId,
        subject: c.subjectName,
        className: c.className,
        classId: c.classId,
        teacherName: c.teacherName || user?.name || "Teacher",
        description: `${c.subjectName} · ${c.className}`,
        studentCount: c.studentCount,
        thumbnailColor: COURSE_COLORS[i % COURSE_COLORS.length],
      })),
    [apiCourses, user]
  )

  const courses = apiMapped

  const filters = useMemo(
    () => parseCourseFilters(searchParams),
    [searchParams]
  )

  const effectiveFilters = useMemo(() => {
    const hasExplicitTerm = searchParams.get("term")
    return {
      ...filters,
      term: hasExplicitTerm ? filters.term : (currentTermName ?? filters.term),
    }
  }, [filters, currentTermName, searchParams])

  const filteredCourses = useMemo(
    () => filterCourses(courses, effectiveFilters),
    [courses, effectiveFilters]
  )

  const updateFilters = (patch: Partial<typeof filters>) => {
    const next = { ...effectiveFilters, ...patch }
    setSearchParams(courseFiltersToParams(next), { replace: true })
  }

  const openCourse = (course: SchoolSubjectCourse) => {
    const path = DashboardRoutes.toELearningCourseDetail(
      productId ?? "",
      course.id
    )
    const query = new URLSearchParams()
    if (teacherId) query.set("teacherId", teacherId)
    if (isOwner && teacherId) query.set("mode", "readonly")
    const queryString = query.toString()
    navigate(queryString ? `${path}?${queryString}` : path, {
      state: {
        apiCourse: course,
        teacherSubUserId: teacherId,
        readOnly: isOwner && Boolean(teacherId),
      },
    })
  }

  const loading = apiLoading || optionsLoading

  return (
    <div className="space-y-6">
      <PageHeader
        title={
          teacherId && apiCourses[0]?.teacherName
            ? `${apiCourses[0].teacherName} · Courses`
            : "Courses"
        }
        description={
          isOwner && teacherId
            ? "Read-only access to this teacher’s assigned courses and learning content."
            : "Your assigned subject courses. Open any course to manage its curriculum, lessons, resources, classes, recordings, and students."
        }
        onBack={
          teacherId
            ? () => navigate(DashboardRoutes.toELearning(productId ?? ""))
            : undefined
        }
        backLabel={teacherId ? "Back to overview" : undefined}
      />

      <CoursesFilters
        filters={effectiveFilters}
        onChange={updateFilters}
        classOptions={classOptions}
        termOptions={termOptions}
        loading={optionsLoading}
      />

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner className="h-6 w-6" />
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            Showing{" "}
            <span className="font-medium text-gray-900">
              {filteredCourses.length}
            </span>{" "}
            {filteredCourses.length === 1 ? "course" : "courses"}
          </p>

          {filteredCourses.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center">
              <p className="text-sm font-medium text-gray-600">
                No courses match your filters
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Try changing class or term
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredCourses.map((course) => {
                return (
                  <button
                    key={course.id}
                    type="button"
                    onClick={() => openCourse(course)}
                    className={`${dashboardCardInner} overflow-hidden p-0 text-left transition-shadow hover:shadow-md`}
                  >
                    <div className={`h-2 ${course.thumbnailColor}`} />
                    <div className="space-y-2 p-4">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-gray-900">
                          {course.subject}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {course.className}
                      </p>
                      <p className="line-clamp-2 text-xs text-muted-foreground">
                        {course.description}
                      </p>
                      <div className="flex items-center justify-between pt-1 text-xs text-muted-foreground">
                        <span>{course.teacherName}</span>
                        <span>{course.studentCount} students</span>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
