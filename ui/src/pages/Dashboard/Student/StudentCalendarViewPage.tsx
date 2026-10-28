import { QueryErrorPanel } from "@/components/general/QueryErrorPanel"
import { useNavigate, useParams } from "react-router"
import { useSchoolId } from "@/contexts/SchoolContext"
import { useGetStudentById } from "@/hooks/studentPortal"
import { PageHeader } from "@/components/general/PageHeader"
import { SchoolCalendarViewer } from "@/pages/Dashboard/Timetable/components/SchoolCalendarViewer"

export default function StudentCalendarViewPage() {
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
        message="Retry to load the calendar."
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
        title="School Calendar"
        description={`${studentName} — ${studentClass}`}
        onBack={() => navigate(-1)}
        className="mb-7"
      />

      <SchoolCalendarViewer studentClass={studentClass} studentId={studentId} />
    </div>
  )
}
