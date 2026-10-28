import { BookOpen } from "lucide-react"
import { useNavigate } from "react-router"
import { HomeRoutes } from "@/routes"
import type { StudentELearningCourseI } from "@/api/studentElearning.api"
import StudentCourseCard from "./StudentCourseCard"

export default function StudentCoursesGrid({
  schoolId,
  courses,
}: {
  schoolId: string
  courses: StudentELearningCourseI[]
}) {
  const navigate = useNavigate()
  if (courses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
        <BookOpen className="mb-3 size-9 text-slate-300" />
        <p className="font-semibold text-slate-700">No courses found</p>
        <p className="mt-1 text-sm text-slate-400">
          Subjects assigned to your class will appear here.
        </p>
      </div>
    )
  }
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
      {courses.map((course, index) => (
        <StudentCourseCard
          key={course.id}
          course={course}
          index={index}
          onOpen={() =>
            navigate(
              HomeRoutes.toStudentElearningCourse(
                schoolId,
                course.subjectId,
                course.classId
              )
            )
          }
        />
      ))}
    </div>
  )
}
