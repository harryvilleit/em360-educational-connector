import { useMemo } from "react"
import { useSchoolOverview } from "@/hooks/useSchoolOverview"
import { useGetExamRecordsOverview } from "@/hooks/examAndRecords"
import { useGetFeeManagementOverview } from "@/hooks/feeManagement"
import { useGetAttendanceDashboard } from "@/hooks/studentAttendance"
import { useSafeguardingDashboard } from "@/hooks/safeguarding"
import { useLearnerSupportDashboard } from "@/hooks/learnerSupport"
import { useGetHealthRecordOverview } from "@/hooks/healthRecord"
import { useGetHostelOverview } from "@/hooks/hostel"
import { formatDate } from "@/utils"
import {
  useAllSchoolStudents,
  useAllStaffDirectory,
} from "@/hooks/useAllSchoolRecords"
import { useSchoolStudentDirectory } from "@/hooks/useSchoolStudentDirectory"
import { buildEnrolment, buildStaff } from "./peopleSummaries"
import type { SchoolOverviewResponse } from "@/types/schoolOverview"
import type { ExamRecordsOverviewValueI } from "@/api/examAndRecords.api/types"
import type { FeeManagementOverviewI } from "@/api/feeManagement.api/types"
import type { StudentAttendanceDashboardI } from "@/api/studentAttendance.api/types"
import type { SafeguardingDashboardI } from "@/api/safeguarding.api/types"
import type { LearnerSupportDashboardI } from "@/api/learnerSupport.api/types"
import type { HealthRecordOverviewI } from "@/api/healthRecord.api/types"
import type { HostelOverviewI } from "@/api/hostel.api/types"

export interface ReportPeriod {
  sessionId?: string
  termId?: string
}

export interface CompletenessItem {
  label: string
  filled: number
  total: number
}

export interface EnrolmentSummary {
  total: number
  boys: number
  girls: number
  byClass: { className: string; boys: number; girls: number; total: number }[]
  ageBands: { band: string; count: number }[]
  completeness: CompletenessItem[]
}

export interface StaffRosterRow {
  id: string
  name: string
  sex: string
  dob: string | null
  qualification: string | null
  role: string
  department: string
  category: "Teaching" | "Non-teaching"
  status: string
  serviceNumber: string
  gradeLevel: string
  firstAppointment: string
  presentAppointment: string
  datePosted: string
  origin: string
  town: string
}

export interface StaffSummary {
  total: number
  teaching: number
  nonTeaching: number
  male: number
  female: number
  byQualification: { label: string; count: number }[]
  byRole: { label: string; count: number }[]
  byStatus: { label: string; count: number }[]
  roster: StaffRosterRow[]
  completeness: CompletenessItem[]
}

export interface LibrarySummary {
  titles: number
  totalCopies: number
  activeLoans: number
  overdueLoans: number
  unpaidFines: number
}

export interface CafeteriaSummary {
  mealsServed: number
  activeSubscriptions: number
  openWelfareRequests: number
  lowStockItems: number
}

export interface ReportSourceData {
  school: SchoolOverviewResponse
  exam: ExamRecordsOverviewValueI
  fee: FeeManagementOverviewI
  attendance: StudentAttendanceDashboardI
  safeguarding: SafeguardingDashboardI
  learnerSupport: LearnerSupportDashboardI
  health: HealthRecordOverviewI
  hostel: HostelOverviewI
  library: LibrarySummary
  cafeteria: CafeteriaSummary
  enrolment: EnrolmentSummary
  staff: StaffSummary
}

export type ReportSource = keyof ReportSourceData
export type ReportSourceState = "idle" | "loading" | "error" | "ready"

export interface ReportSourceResult<S extends ReportSource> {
  data?: ReportSourceData[S]
  state: ReportSourceState
  // True when the figures are sample or in-app demo data, not live API data
  isDemo: boolean
}

export type ReportData = { [S in ReportSource]: ReportSourceResult<S> }

// Live data only. A source that fails or is refused (for example Safeguarding or
// Health without the matching role) is reported as unavailable: invented sample
// figures must never stand in for a real school's records.
function resolve<S extends ReportSource>(
  wanted: boolean,
  isError: boolean,
  live: ReportSourceData[S] | undefined
): ReportSourceResult<S> {
  if (!wanted) return { state: "idle", isDemo: false }
  if (live) return { data: live, state: "ready", isDemo: false }
  return { state: isError ? "error" : "loading", isDemo: false }
}

// Sources outside `needed` get an empty schoolId so their query stays disabled.
export function useReportData(
  schoolId: string,
  period: ReportPeriod,
  needed: ReadonlySet<ReportSource>,
  attendanceDate?: string
): ReportData {
  const gate = (source: ReportSource) => (needed.has(source) ? schoolId : "")
  const attendanceDay = attendanceDate || formatDate(new Date(), "YYYY-MM-DD")

  const school = useSchoolOverview(gate("school"), period)
  // Every period-aware source uses one reporting period: the session/term chosen
  // in the filters, otherwise the period the school overview resolved (the
  // school's current session and term). Without this each source picked its own
  // default and one page could mix figures from different sessions.
  const selectedSessionId = school.data?.selectedSessionId || undefined
  const selectedTermId = school.data?.selectedTermId || undefined
  const reportPeriod = useMemo<ReportPeriod>(
    () => ({
      sessionId: period.sessionId ?? selectedSessionId,
      termId: period.termId ?? selectedTermId,
    }),
    [period.sessionId, period.termId, selectedSessionId, selectedTermId]
  )
  const periodReady =
    !needed.has("school") || !!period.sessionId || !school.isPending
  const periodGate = (source: ReportSource) => (periodReady ? gate(source) : "")

  const exam = useGetExamRecordsOverview({
    schoolId: periodGate("exam"),
    ...reportPeriod,
  })
  const fee = useGetFeeManagementOverview({
    schoolId: periodGate("fee"),
    ...reportPeriod,
  })
  const attendance = useGetAttendanceDashboard({
    schoolId: periodGate("attendance"),
    attendanceDate: attendanceDay,
    schoolSessionId: reportPeriod.sessionId,
    schoolSessionTermId: reportPeriod.termId,
  })
  const safeguarding = useSafeguardingDashboard(
    schoolId,
    needed.has("safeguarding")
  )
  const learnerSupport = useLearnerSupportDashboard(gate("learnerSupport"))
  const health = useGetHealthRecordOverview({ schoolId: gate("health") })
  const hostel = useGetHostelOverview({ schoolId: gate("hostel") })

  const roster = useSchoolStudentDirectory(
    gate("enrolment"),
    needed.has("enrolment")
  )
  const people = useAllSchoolStudents(gate("enrolment"))
  const staffDir = useAllStaffDirectory(gate("staff"))

  const enrolment = useMemo(
    () =>
      roster.students.length || people.students.length
        ? buildEnrolment(roster.students, people.students)
        : undefined,
    [roster.students, people.students]
  )
  const staff = useMemo(
    () =>
      staffDir.directory
        ? buildStaff(staffDir.directory.staff.items)
        : undefined,
    [staffDir.directory]
  )

  return useMemo(
    () => ({
      school: resolve(needed.has("school"), school.isError, school.data),
      exam: resolve(needed.has("exam"), exam.isError, exam.overview),
      fee: resolve(needed.has("fee"), fee.isError, fee.overview),
      attendance: resolve(
        needed.has("attendance"),
        attendance.isError,
        attendance.dashboard
      ),
      safeguarding: resolve(
        needed.has("safeguarding"),
        safeguarding.isError,
        safeguarding.dashboard
      ),
      learnerSupport: resolve(
        needed.has("learnerSupport"),
        learnerSupport.isError,
        learnerSupport.dashboard
      ),
      health: resolve(needed.has("health"), health.isError, health.overview),
      hostel: resolve(needed.has("hostel"), hostel.isError, hostel.overview),
      enrolment: resolve(
        needed.has("enrolment"),
        roster.isError || people.isError,
        enrolment
      ),
      staff: resolve(needed.has("staff"), staffDir.isError, staff),
      // Library and Cafeteria keep no school records in the EM360 API yet. Report
      // them as unavailable instead of showing the in-app demo stores.
      library: needed.has("library")
        ? { state: "error" as const, isDemo: false }
        : { state: "idle" as const, isDemo: false },
      cafeteria: needed.has("cafeteria")
        ? { state: "error" as const, isDemo: false }
        : { state: "idle" as const, isDemo: false },
    }),
    [
      needed,
      enrolment,
      staff,
      roster.isError,
      people.isError,
      staffDir.isError,
      school.data,
      school.isError,
      exam.overview,
      exam.isError,
      fee.overview,
      fee.isError,
      attendance.dashboard,
      attendance.isError,
      safeguarding.dashboard,
      safeguarding.isError,
      learnerSupport.dashboard,
      learnerSupport.isError,
      health.overview,
      health.isError,
      hostel.overview,
      hostel.isError,
    ]
  )
}
