import { useState } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router"
import { ChevronRight, Search, Users } from "lucide-react"
import { PageHeader } from "@/components/general/PageHeader"
import { FilterSelect } from "@/components/ui/filter-select"
import Pagination from "@/components/ui/pagination"
import { useSchoolId } from "@/contexts/SchoolContext"
import { useAttendanceRiskQueue } from "@/hooks/attendanceIntervention"
import type { AttendanceRiskLevel } from "@/api/attendanceIntervention.api"
import { DashboardRoutes } from "@/routes"
import { AttendanceInterventionAccessGate, InterventionStatusBadge, RiskBadge } from "./components"

const ALL_RISK_LEVELS = "all"

const riskOptions = [
  { value: ALL_RISK_LEVELS, label: "All risk levels" },
  { value: "Low", label: "Low" },
  { value: "Medium", label: "Medium" },
  { value: "High", label: "High" },
  { value: "Critical", label: "Critical" },
]

export default function AttendanceRiskQueuePage() {
  const navigate = useNavigate()
  const { productId = "" } = useParams()
  const [searchParams] = useSearchParams()
  const schoolId = useSchoolId()
  const [search, setSearch] = useState("")
  const [riskLevel, setRiskLevel] = useState<AttendanceRiskLevel | typeof ALL_RISK_LEVELS>(
    (searchParams.get("riskLevel") as AttendanceRiskLevel | null) || ALL_RISK_LEVELS
  )
  const [page, setPage] = useState(1)
  const pageSize = 20
  const { risks, pagination, isLoading } = useAttendanceRiskQueue({
    schoolId,
    search: search || undefined,
    riskLevel: riskLevel === ALL_RISK_LEVELS ? undefined : riskLevel,
    pageNumber: page,
    pageSize,
  })

  return (
    <AttendanceInterventionAccessGate>
      <div className="space-y-6">
        <PageHeader
          title="Attendance Risk Queue"
          description="Explainable alerts generated from recorded attendance, lateness and absence patterns."
          onBack={() => navigate(DashboardRoutes.toAttendanceIntervention(productId))}
          backLabel="Back to Early Intervention"
        />

        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="relative flex-1">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value)
                setPage(1)
              }}
              placeholder="Search learner, ID or class"
              className="h-10 w-full rounded-lg border border-gray-200 bg-white pr-3 pl-9 text-sm outline-none focus:border-blue-500"
            />
          </label>
          <FilterSelect
            value={riskLevel}
            onChange={(value) => {
              setRiskLevel(value as AttendanceRiskLevel | typeof ALL_RISK_LEVELS)
              setPage(1)
            }}
            options={riskOptions}
            placeholder="Risk level"
            triggerClassName="h-10 w-full sm:w-48"
          />
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
          {isLoading ? (
            <p className="py-20 text-center text-sm text-muted-foreground">Assessing attendance patterns…</p>
          ) : risks.length === 0 ? (
            <div className="py-20 text-center">
              <Users className="mx-auto mb-3 size-9 text-gray-300" />
              <p className="font-medium text-gray-800">No learners match these filters</p>
              <p className="mt-1 text-sm text-muted-foreground">Try another risk level or search term.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="border-b bg-gray-50 text-xs text-gray-500">
                  <tr>
                    <th className="px-5 py-3 font-medium">Learner</th>
                    <th className="px-4 py-3 font-medium">Risk</th>
                    <th className="px-4 py-3 font-medium">Attendance</th>
                    <th className="px-4 py-3 font-medium">Absent / Late</th>
                    <th className="px-4 py-3 font-medium">Primary trigger</th>
                    <th className="px-4 py-3 font-medium">Intervention</th>
                    <th className="w-12 px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {risks.map((learner) => (
                    <tr
                      key={learner.studentId}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() =>
                        navigate(
                          DashboardRoutes.toAttendanceStudentRisk(productId, learner.studentId)
                        )
                      }
                    >
                      <td className="px-5 py-4">
                        <p className="font-semibold text-gray-900">{learner.studentName}</p>
                        <p className="text-xs text-muted-foreground">
                          {learner.studentGivenId || "No learner ID"} · {learner.className || "No class"}
                        </p>
                      </td>
                      <td className="px-4 py-4"><RiskBadge risk={learner.riskLevel} /></td>
                      <td className="px-4 py-4">
                        <p className="font-bold text-gray-900">{learner.attendancePercentage.toFixed(1)}%</p>
                        {learner.changePercentagePoints != null && (
                          <p className={learner.changePercentagePoints < 0 ? "text-xs text-red-600" : "text-xs text-green-600"}>
                            {learner.changePercentagePoints > 0 ? "+" : ""}{learner.changePercentagePoints.toFixed(1)} points
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-4 text-gray-600">
                        {learner.absentCount} absent · {learner.lateCount} late
                      </td>
                      <td className="max-w-xs px-4 py-4 text-gray-600">
                        {learner.riskFactors[0]?.title || "Below attendance target"}
                      </td>
                      <td className="px-4 py-4">
                        {learner.interventionStatus ? (
                          <InterventionStatusBadge status={learner.interventionStatus} />
                        ) : (
                          <span className="text-xs text-muted-foreground">Not opened</span>
                        )}
                      </td>
                      <td className="px-4 py-4"><ChevronRight className="size-4 text-gray-400" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <Pagination
            page={page}
            total={pagination?.totalItems ?? 0}
            pageSize={pageSize}
            onPageChange={setPage}
          />
        </div>
      </div>
    </AttendanceInterventionAccessGate>
  )
}
