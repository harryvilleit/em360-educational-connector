import { useNavigate } from "react-router"
import { PageHeader } from "@/components/general/PageHeader"
import { useSchoolId } from "@/contexts/SchoolContext"
import { StudentGate } from "../StudentGate"
import { StudentTimetableByWeekViewer } from "./StudentTimetableByWeekViewer"
import { formatClassOptionLabel } from "@/utils/guardianAdapter"
import { HomeRoutes } from "@/routes"

export function StudentPortalTimetablePage() {
  const schoolId = useSchoolId()
  const navigate = useNavigate()

  return (
    <StudentGate>
      {({
        studentId,
        student,
        launch,
        selectedTerm,
        selectedClass,
        selectClass,
        isLaunchLoading,
      }) => {
        // Prefer the primary class from the launch payload — falls back to
        // the single-class label off the student record for demo accounts.
        const displayClass = selectedClass
          ? formatClassOptionLabel(selectedClass.className, selectedClass.armName)
          : student.class

        return (
          <div>
            <PageHeader
              title="Timetable & Calendar"
              description={`${student.name} — ${displayClass}`}
              onBack={() => navigate(HomeRoutes.toStudentHome(schoolId))}
              className="mb-7"
            />
            {isLaunchLoading ? (
              <div className="flex items-center justify-center rounded-xl border border-gray-200 bg-white py-20">
                <p className="text-sm text-gray-400">Loading your timetable...</p>
              </div>
            ) : (
              <StudentTimetableByWeekViewer
                studentId={studentId}
                schoolId={schoolId}
                studentClass={displayClass}
                currentSessionName={launch?.currentSessionName ?? undefined}
                currentTermName={launch?.currentTermName ?? undefined}
                termStartDate={selectedTerm?.startDate}
                termEndDate={selectedTerm?.endDate}
                currentSessionClasses={launch?.currentSessionClasses ?? []}
                selectedClass={selectedClass}
                onClassChange={selectClass}
              />
            )}
          </div>
        )
      }}
    </StudentGate>
  )
}
