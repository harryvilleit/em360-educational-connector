import { useNavigate } from "react-router"
import { useSchoolId } from "@/contexts/SchoolContext"
import { HomeRoutes } from "@/routes"
import { StudentGate } from "./StudentGate"
import StudentElections from "./components/StudentElections"

export default function StudentVotingPage() {
  const navigate = useNavigate()
  const schoolId = useSchoolId()

  return (
    <StudentGate>
      {({ isLinked, launch, isLaunchLoading, studentId }) =>
        !isLinked ? (
          <p role="alert">
            Your account must be linked to a registered student before you can
            vote.
          </p>
        ) : isLaunchLoading ? (
          <p role="status">Loading...</p>
        ) : !launch?.studentSchoolId ? (
          <p role="alert">Your student record could not be loaded.</p>
        ) : (
          <StudentElections
            key={`${schoolId}-${studentId}`}
            studentSchoolId={launch.studentSchoolId}
            schoolId={schoolId}
            onBack={() => navigate(HomeRoutes.toStudentHome(schoolId))}
          />
        )
      }
    </StudentGate>
  )
}
