import { useNavigate } from "react-router"
import { useSchoolId } from "@/contexts/SchoolContext"
import { StudentGate } from "../StudentGate"
import { StudentResultsContent } from "./StudentResultsContent"
import { HomeRoutes } from "@/routes"

export function StudentPortalResultsPage() {
  const schoolId = useSchoolId()
  const navigate = useNavigate()

  return (
    <StudentGate>
      {({
        studentId,
        isLinked,
        student,
        launch,
        sessions,
        selectedSession,
        selectedTerm,
        selectSession,
        selectTerm,
        isLaunchLoading,
      }) => (
        <StudentResultsContent
          schoolId={schoolId}
          studentId={studentId}
          isLinked={isLinked}
          studentName={student.name}
          studentClass={student.class}
          currentClassName={launch?.currentClassName}
          sessions={sessions}
          selectedSession={selectedSession}
          selectedTerm={selectedTerm}
          selectSession={selectSession}
          selectTerm={selectTerm}
          isSessionsLoading={isLaunchLoading}
          onBack={() => navigate(HomeRoutes.toStudentHome(schoolId))}
        />
      )}
    </StudentGate>
  )
}
