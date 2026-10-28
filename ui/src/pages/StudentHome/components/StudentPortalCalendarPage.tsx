import { useNavigate } from "react-router"
import { PageHeader } from "@/components/general/PageHeader"
import { useSchoolId } from "@/contexts/SchoolContext"
import { StudentGate } from "../StudentGate"
import { SchoolCalendarViewer } from "@/pages/Dashboard/Timetable/components/SchoolCalendarViewer"
import { formatClassOptionLabel } from "@/utils/guardianAdapter"
import { HomeRoutes } from "@/routes"

export function StudentPortalCalendarPage() {
  const schoolId = useSchoolId()
  const navigate = useNavigate()

  return (
    <StudentGate>
      {({ studentId, student, selectedClass }) => {
        // Prefer the primary class from the launch payload — falls back to
        // the single-class label off the student record for demo accounts.
        const displayClass = selectedClass
          ? formatClassOptionLabel(
              selectedClass.className,
              selectedClass.armName
            )
          : student.class

        return (
          <div>
            <PageHeader
              title="School Calendar"
              description={`${student.name} — ${displayClass}`}
              onBack={() => navigate(HomeRoutes.toStudentHome(schoolId))}
              className="mb-7"
            />
            <SchoolCalendarViewer
              studentClass={displayClass}
              studentId={studentId}
              classId={selectedClass?.schoolClassId}
            />
          </div>
        )
      }}
    </StudentGate>
  )
}
