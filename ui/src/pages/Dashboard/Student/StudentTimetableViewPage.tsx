import { QueryErrorPanel } from "@/components/general/QueryErrorPanel"
import { useNavigate, useParams } from "react-router"
import { useSchoolId } from "@/contexts/SchoolContext"
import { useGetStudentById } from "@/hooks/studentPortal"
import { PageHeader } from "@/components/general/PageHeader"
import { TimetableViewer } from "@/pages/Dashboard/Timetable/components/TimetableViewer"

export default function StudentTimetableViewPage() {
  const navigate = useNavigate()
  const { studentId } = useParams<{ productId: string; studentId: string }>()
  const schoolId = useSchoolId()

  const { student, isLoading, isError, refetch } = useGetStudentById({
    studentId: studentId ?? "",
    schoolId,
  })

  if (isLoading) {
    return (
      <div className="p-6 text-center text-sm text-gray-400">
        Loading student...
      </div>
    )
  }

  if (isError)
    return (
      <QueryErrorPanel
        title="Unable to load student"
        message="Retry to load the timetable."
        onRetry={() => void refetch()}
      />
    )
  if (!student) {
    return (
      <div className="p-6 text-center text-sm text-gray-400">
        Student not found.
      </div>
    )
  }

  const studentClass = [student.schoolClassName, student.schoolArmName]
    .filter(Boolean)
    .join(" ")
  const studentName = `${student.firstname} ${student.lastname}`

  return (
    <div>
      <PageHeader
        title="Timetable & Calendar"
        description={`${studentName} — ${studentClass}`}
        onBack={() => navigate(-1)}
        className="mb-7"
      />

      <TimetableViewer
        studentClass={studentClass}
        classIdOverride={
          student.enrolledClasses?.find((c) => c.isPrimary)?.schoolClassId ??
          student.enrolledClasses?.[0]?.schoolClassId
        }
      />
    </div>
  )
}
