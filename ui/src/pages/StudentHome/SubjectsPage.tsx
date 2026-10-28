import { useMemo, useState } from "react"
import { Search } from "lucide-react"
import { useNavigate } from "react-router"
import { PageHeader } from "@/components/general/PageHeader"
import { Input } from "@/components/ui/input"
import { useSchoolId } from "@/contexts/SchoolContext"
import { useStudentELearningCourses } from "@/hooks/elearning/useStudentELearning"
import { HomeRoutes } from "@/routes"
import { StudentGate, type StudentGateContext } from "./StudentGate"
import StudentCoursesGrid from "./ELearning/StudentCoursesGrid"

export default function StudentSubjectsPage() {
  const schoolId = useSchoolId()
  const navigate = useNavigate()
  return (
    <StudentGate>
      {(context) => (
        <StudentCoursesContent
          {...context}
          onBack={() => navigate(HomeRoutes.toStudentHome(schoolId))}
        />
      )}
    </StudentGate>
  )
}

function StudentCoursesContent({
  schoolId,
  isLinked,
  student,
  selectedTerm,
  isLaunchLoading,
  onBack,
}: StudentGateContext & { onBack: () => void }) {
  const [search, setSearch] = useState("")
  const { courses, isLoading, isError } = useStudentELearningCourses(
    isLinked ? schoolId : undefined
  )
  const visibleCourses = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return courses
    return courses.filter((course) =>
      [course.subjectName, course.className, course.teacherName]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(term))
    )
  }, [courses, search])

  return (
    <div>
      <PageHeader
        title="My Courses"
        description={[student.class, selectedTerm?.termName].filter(Boolean).join(" · ")}
        onBack={onBack}
        className="mb-6"
      />

      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              {courses.length} {courses.length === 1 ? "course" : "courses"}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Open a course to continue from your last completed lesson.
            </p>
          </div>
          <div className="relative w-full sm:max-w-sm">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search courses or teachers…"
              className="h-11 rounded-xl pl-9"
            />
          </div>
        </div>
      </div>

      {isLaunchLoading || isLoading ? (
        <div className="rounded-2xl border border-slate-200 bg-white py-20 text-center text-sm text-slate-400">
          Loading your courses…
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-rose-100 bg-rose-50 py-14 text-center text-sm text-rose-700">
          We couldn't load your courses. Please try again.
        </div>
      ) : (
        <StudentCoursesGrid schoolId={schoolId} courses={visibleCourses} />
      )}
    </div>
  )
}
