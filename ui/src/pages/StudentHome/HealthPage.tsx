import { useMemo } from "react"
import { Droplet, Dna, AlertTriangle, HeartPulse, Stethoscope } from "lucide-react"
import { StatCard } from "@/components/general/StatCard"
import { PageHeader } from "@/components/general/PageHeader"
import { useSchoolId } from "@/contexts/SchoolContext"
import { useGetStudentPortalHealthRecord } from "@/hooks/studentPortal"
import SickBayBadge from "@/pages/Dashboard/Health/components/SickBayBadge"
import { StudentGate } from "./StudentGate"

export default function StudentHealthPage() {
  const schoolId = useSchoolId()

  return (
    <StudentGate>
      {({ student, isLinked, studentId }) => (
        <HealthContent
          studentName={student.name}
          studentClass={student.class}
          isLinked={isLinked}
          studentId={studentId}
          schoolId={schoolId}
        />
      )}
    </StudentGate>
  )
}

interface HealthVisitDisplay {
  date: string
  complaint: string
  treatment: string
  attendedBy: string
  status: string
}

interface HealthDisplay {
  bloodGroup?: string
  genotype?: string
  allergies?: string
  chronicConditions?: string
  disabilities?: string
  visits: HealthVisitDisplay[]
}

function HealthContent({
  studentName,
  studentClass,
  isLinked,
  studentId,
  schoolId,
}: {
  studentName: string
  studentClass: string
  isLinked: boolean
  studentId: string
  schoolId: string
}) {
  const { record, isLoading } = useGetStudentPortalHealthRecord({
    studentId: isLinked ? studentId : "",
    schoolId,
  })

  const display: HealthDisplay | undefined = useMemo(() => {
    if (!record) return undefined
    return {
      bloodGroup: record.medicalProfile.bloodGroup,
      genotype: record.medicalProfile.genotype,
      allergies: record.medicalProfile.allergies,
      chronicConditions: record.medicalProfile.chronicConditions,
      disabilities: record.medicalProfile.disabilities,
      visits: record.sickBayVisits.map((v) => ({
        date: v.visitDate,
        complaint: v.complaint,
        treatment: v.treatment,
        attendedBy: v.attendedBy,
        status: String(v.status),
      })),
    }
  }, [record])

  if (isLinked && isLoading) {
    return (
      <div className="p-6 text-center text-sm text-gray-400">Loading...</div>
    )
  }

  return (
    <div>
      <PageHeader
        title="My Health Record"
        description={`${studentName} — ${studentClass}`}
        className="mb-7"
      />

      {display ? (
        <>
          <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard label="Blood Group" value={display.bloodGroup || "—"} icon={Droplet} color="rose" />
            <StatCard label="Genotype" value={display.genotype || "—"} icon={Dna} color="indigo" />
            <StatCard label="Allergies" value={display.allergies || "None"} icon={AlertTriangle} color="amber" />
            <StatCard label="Chronic Conditions" value={display.chronicConditions || "None"} icon={HeartPulse} color="red" />
          </div>

          {display.disabilities && (
            <div className="mb-5 overflow-hidden rounded-xl border border-gray-200 bg-white p-5">
              <p className="text-xs text-gray-400">Disabilities</p>
              <p className="mt-0.5 text-sm font-medium text-gray-700">{display.disabilities}</p>
            </div>
          )}

          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-4">
              <Stethoscope size={15} className="text-gray-400" />
              <h2 className="text-sm font-medium text-gray-900">Sick Bay Visit History</h2>
              <span className="ml-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                {display.visits.length} visits
              </span>
            </div>

            {display.visits.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 text-center">
                <Stethoscope size={30} className="mb-2 text-gray-300" />
                <p className="text-sm text-gray-400">No sick bay visits recorded</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {display.visits.map((v, i) => (
                  <div key={i} className="grid grid-cols-1 gap-1 px-5 py-3.5 sm:grid-cols-[100px_1fr_1fr_120px_110px] sm:items-center sm:gap-4">
                    <p className="text-xs text-gray-500">{new Date(v.date).toLocaleDateString()}</p>
                    <p className="text-sm font-medium text-gray-800">{v.complaint}</p>
                    <p className="text-sm text-gray-600">{v.treatment}</p>
                    <p className="text-xs text-gray-500">{v.attendedBy}</p>
                    <SickBayBadge status={v.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <HeartPulse size={36} className="mb-3 text-gray-300" />
          <p className="text-sm font-medium text-gray-500">No health record on file yet</p>
          <p className="mt-1 text-xs text-gray-400">
            Your health record will appear here once the school adds one
          </p>
        </div>
      )}
    </div>
  )
}
