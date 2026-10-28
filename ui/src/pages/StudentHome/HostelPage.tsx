import { useNavigate } from "react-router"
import { BedDouble, Building2, Layers } from "lucide-react"
import { StatCard } from "@/components/general/StatCard"
import { PageHeader } from "@/components/general/PageHeader"
import { useSchoolId } from "@/contexts/SchoolContext"
import { useGetStudentPortalHostel } from "@/hooks/studentPortal"
import { StudentGate } from "./StudentGate"
import { HomeRoutes } from "@/routes"

export default function StudentHostelPage() {
  const schoolId = useSchoolId()
  const navigate = useNavigate()

  return (
    <StudentGate>
      {({ student, isLinked, studentId }) => (
        <HostelContent
          studentName={student.name}
          studentClass={student.class}
          isLinked={isLinked}
          studentId={studentId}
          schoolId={schoolId}
          onBack={() => navigate(HomeRoutes.toStudentHome(schoolId))}
        />
      )}
    </StudentGate>
  )
}

function HostelContent({
  studentName,
  studentClass,
  isLinked,
  studentId,
  schoolId,
  onBack,
}: {
  studentName: string
  studentClass: string
  isLinked: boolean
  studentId: string
  schoolId: string
  onBack: () => void
}) {
  const { assignment: realAssignment, isLoading } = useGetStudentPortalHostel({
    studentId: isLinked ? studentId : "",
    schoolId,
  })

  const assignment = isLinked && realAssignment?.isAssigned
    ? {
        hostelName: realAssignment.hostelName,
        roomName: realAssignment.roomName,
        bedLabel: realAssignment.bedLabel,
        floor: realAssignment.floorName || undefined,
      }
    : undefined

  if (isLinked && isLoading) {
    return (
      <div className="p-6 text-center text-sm text-gray-400">Loading...</div>
    )
  }

  return (
    <div>
      <PageHeader
        title="My Hostel"
        description={`${studentName} — ${studentClass}`}
        className="mb-7"
      />

      {assignment ? (
        <>
          <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <StatCard label="Hostel" value={assignment.hostelName} icon={Building2} color="cyan" />
            <StatCard label="Room" value={assignment.roomName} icon={Layers} color="indigo" />
            <StatCard label="Bed" value={assignment.bedLabel} icon={BedDouble} color="teal" />
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-4">
              <Building2 size={15} className="text-gray-400" />
              <h2 className="text-sm font-medium text-gray-900">Room Details</h2>
            </div>
            <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
              <DetailRow label="Hostel" value={assignment.hostelName} />
              {assignment.floor && <DetailRow label="Floor" value={assignment.floor} />}
              <DetailRow label="Room" value={assignment.roomName} />
              <DetailRow label="Bed" value={assignment.bedLabel} />
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <BedDouble size={36} className="mb-3 text-gray-300" />
          <p className="text-sm font-medium text-gray-500">
            You're not currently assigned to a hostel room
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Boarding students will see their room assignment here once allocated
          </p>
        </div>
      )}
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-gray-700">{value}</p>
    </div>
  )
}
