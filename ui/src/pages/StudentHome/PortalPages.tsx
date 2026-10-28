import { useNavigate } from "react-router"
import { useSchoolId } from "@/contexts/SchoolContext"
import { StudentGate } from "./StudentGate"
import { StudentAttendanceContent } from "./components/StudentAttendanceContent"
import { HomeRoutes } from "@/routes"

export {
  StudentPortalTimetablePage,
  StudentPortalCalendarPage,
  StudentPortalResultsPage,
} from "./StudentAcademicPortalPages"

export function StudentPortalAttendancePage() {
  const schoolId = useSchoolId()
  const navigate = useNavigate()

  return (
    <StudentGate>
      {({
        studentId,
        isLinked,
        sessions,
        selectedSession,
        selectedTerm,
        selectedClass,
        selectSession,
        selectTerm,
        selectClass,
        isLaunchLoading,
      }) => (
        <StudentAttendanceContent
          schoolId={schoolId}
          studentId={studentId}
          isLinked={isLinked}
          sessions={sessions}
          selectedSession={selectedSession}
          selectedTerm={selectedTerm}
          selectedClass={selectedClass}
          selectSession={selectSession}
          selectTerm={selectTerm}
          selectClass={selectClass}
          isSessionsLoading={isLaunchLoading}
          onBack={() => navigate(HomeRoutes.toStudentHome(schoolId))}
        />
      )}
    </StudentGate>
  )
}
