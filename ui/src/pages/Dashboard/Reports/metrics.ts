import {
  AlertTriangle,
  BedDouble,
  BookOpen,
  Utensils,
  BookOpenCheck,
  CalendarCheck,
  GraduationCap,
  HeartPulse,
  LifeBuoy,
  Percent,
  ShieldAlert,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react"
import type { StatColor } from "@/components/general/StatCard"
import { pupilTeacherRatio } from "./reportCalcs"
import type { ReportData, ReportSource } from "./useReportData"

export type ReportDomain =
  | "enrolment"
  | "staff"
  | "academic"
  | "financial"
  | "attendance"
  | "welfare"
  | "operations"

export type MetricFormat = "number" | "percent" | "money"

export interface ReportMetric {
  id: string
  label: string
  domain: ReportDomain
  source: ReportSource
  format: MetricFormat
  icon: LucideIcon
  color: StatColor
  needs?: ReportSource[]
  select: (data: ReportData) => number | undefined
  change?: {
    select: (data: ReportData) => number | null | undefined
    label: string
    unit?: string
    lowerIsBetter?: boolean
  }
}

export const DOMAIN_META: Record<
  ReportDomain,
  { label: string; description: string }
> = {
  enrolment: {
    label: "Enrolment",
    description: "Pupils on roll by class and gender.",
  },
  staff: {
    label: "Staff",
    description: "Teaching and non-teaching staff, qualifications and status.",
  },
  academic: {
    label: "Academic",
    description: "Exam performance, pass rates and students at risk.",
  },
  financial: {
    label: "Financial",
    description: "Fees expected, collected and outstanding.",
  },
  attendance: {
    label: "Attendance",
    description: "Daily student attendance and class coverage.",
  },
  welfare: {
    label: "Welfare",
    description: "Safeguarding, learner support and health indicators.",
  },
  operations: {
    label: "Operations",
    description: "School population, classes and hostel occupancy.",
  },
}

export const DOMAIN_ORDER: ReportDomain[] = [
  "enrolment",
  "staff",
  "academic",
  "financial",
  "attendance",
  "welfare",
  "operations",
]

export const REPORT_METRICS: ReportMetric[] = [
  {
    id: "enrol.total",
    label: "Total enrolment",
    domain: "enrolment",
    source: "enrolment",
    format: "number",
    icon: Users,
    color: "blue",
    select: (d) => d.enrolment.data?.total,
  },
  {
    id: "enrol.boys",
    label: "Boys",
    domain: "enrolment",
    source: "enrolment",
    format: "number",
    icon: Users,
    color: "indigo",
    select: (d) => d.enrolment.data?.boys,
  },
  {
    id: "enrol.girls",
    label: "Girls",
    domain: "enrolment",
    source: "enrolment",
    format: "number",
    icon: Users,
    color: "rose",
    select: (d) => d.enrolment.data?.girls,
  },
  {
    id: "enrol.classes",
    label: "Classes on roll",
    domain: "enrolment",
    source: "enrolment",
    format: "number",
    icon: GraduationCap,
    color: "teal",
    select: (d) => d.enrolment.data?.byClass.length,
  },
  {
    id: "staff.total",
    label: "Total staff",
    domain: "staff",
    source: "staff",
    format: "number",
    icon: Users,
    color: "blue",
    select: (d) => d.staff.data?.total,
  },
  {
    id: "staff.teaching",
    label: "Teaching staff",
    domain: "staff",
    source: "staff",
    format: "number",
    icon: GraduationCap,
    color: "green",
    select: (d) => d.staff.data?.teaching,
  },
  {
    id: "staff.nonTeaching",
    label: "Non-teaching staff",
    domain: "staff",
    source: "staff",
    format: "number",
    icon: Users,
    color: "amber",
    select: (d) => d.staff.data?.nonTeaching,
  },
  {
    id: "staff.ptr",
    label: "Pupil-teacher ratio",
    domain: "staff",
    source: "staff",
    needs: ["enrolment"],
    format: "number",
    icon: Percent,
    color: "violet",
    select: pupilTeacherRatio,
  },
  {
    id: "exam.examsConducted",
    label: "Exams conducted",
    domain: "academic",
    source: "exam",
    format: "number",
    icon: BookOpenCheck,
    color: "blue",
    select: (d) => d.exam.data?.examsConducted,
    change: { select: (d) => d.exam.data?.examsConductedChange, label: "vs last term" },
  },
  {
    id: "exam.passRate",
    label: "Overall pass rate",
    domain: "academic",
    source: "exam",
    format: "percent",
    icon: GraduationCap,
    color: "green",
    select: (d) => d.exam.data?.overallPassRate,
    change: { select: (d) => d.exam.data?.overallPassRateChange, label: "vs last term", unit: "%" },
  },
  {
    id: "exam.studentsPassed",
    label: "Students passed",
    domain: "academic",
    source: "exam",
    format: "number",
    icon: Users,
    color: "emerald",
    select: (d) => d.exam.data?.studentsPassed,
    change: { select: (d) => d.exam.data?.studentsPassedChange, label: "vs last term" },
  },
  {
    id: "exam.atRisk",
    label: "At-risk students",
    domain: "academic",
    source: "exam",
    format: "number",
    icon: AlertTriangle,
    color: "red",
    select: (d) => d.exam.data?.atRiskStudents,
    change: { select: (d) => d.exam.data?.atRiskStudentsChange, label: "vs last term", lowerIsBetter: true },
  },
  {
    id: "fee.expected",
    label: "Fees expected",
    domain: "financial",
    source: "fee",
    format: "money",
    icon: Wallet,
    color: "blue",
    select: (d) => d.fee.data?.totalExpected,
  },
  {
    id: "fee.collected",
    label: "Fees collected",
    domain: "financial",
    source: "fee",
    format: "money",
    icon: Wallet,
    color: "green",
    select: (d) => d.fee.data?.totalCollected,
    change: { select: (d) => d.fee.data?.thisTermVsLastTermPercent, label: "this term vs last", unit: "%" },
  },
  {
    id: "fee.outstanding",
    label: "Outstanding fees",
    domain: "financial",
    source: "fee",
    format: "money",
    icon: Wallet,
    color: "amber",
    select: (d) => d.fee.data?.outstanding,
  },
  {
    id: "fee.collectionRate",
    label: "Collection rate",
    domain: "financial",
    source: "fee",
    format: "percent",
    icon: Percent,
    color: "teal",
    select: (d) => d.fee.data?.collectionRatePercent,
  },
  {
    id: "fee.defaulters",
    label: "Defaulters",
    domain: "financial",
    source: "fee",
    format: "number",
    icon: AlertTriangle,
    color: "red",
    select: (d) => d.fee.data?.defaulterCount,
  },
  {
    id: "attendance.avg",
    label: "Average attendance",
    domain: "attendance",
    source: "school",
    format: "percent",
    icon: CalendarCheck,
    color: "green",
    select: (d) => d.school.data?.kpis.averageAttendancePercentage,
    change: { select: (d) => d.school.data?.kpis.attendanceVsLastWeekDelta, label: "vs last week", unit: "%" },
  },
  {
    id: "attendance.presentToday",
    label: "Students present",
    domain: "attendance",
    source: "attendance",
    format: "number",
    icon: Users,
    color: "emerald",
    select: (d) => d.attendance.data?.presentToday,
  },
  {
    id: "attendance.absentToday",
    label: "Students absent",
    domain: "attendance",
    source: "attendance",
    format: "number",
    icon: Users,
    color: "red",
    select: (d) => d.attendance.data?.absentToday,
  },
  {
    id: "attendance.classesMarked",
    label: "Classes marked",
    domain: "attendance",
    source: "attendance",
    format: "number",
    icon: CalendarCheck,
    color: "blue",
    select: (d) => d.attendance.data?.markedClassesCount,
  },
  {
    id: "welfare.sgOpen",
    label: "Open safeguarding cases",
    domain: "welfare",
    source: "safeguarding",
    format: "number",
    icon: ShieldAlert,
    color: "orange",
    select: (d) => d.safeguarding.data?.openCases,
  },
  {
    id: "welfare.sgHighRisk",
    label: "High-risk safeguarding cases",
    domain: "welfare",
    source: "safeguarding",
    format: "number",
    icon: ShieldAlert,
    color: "red",
    select: (d) => d.safeguarding.data?.highRiskCases,
  },
  {
    id: "welfare.sgOverdue",
    label: "Overdue safeguarding actions",
    domain: "welfare",
    source: "safeguarding",
    format: "number",
    icon: AlertTriangle,
    color: "amber",
    select: (d) => d.safeguarding.data?.overdueActions,
  },
  {
    id: "welfare.lsReferrals",
    label: "Open support referrals",
    domain: "welfare",
    source: "learnerSupport",
    format: "number",
    icon: LifeBuoy,
    color: "violet",
    select: (d) => d.learnerSupport.data?.openReferrals,
  },
  {
    id: "welfare.lsPlans",
    label: "Active support plans",
    domain: "welfare",
    source: "learnerSupport",
    format: "number",
    icon: LifeBuoy,
    color: "indigo",
    select: (d) => d.learnerSupport.data?.activePlans,
  },
  {
    id: "welfare.lsOverdueReviews",
    label: "Overdue support reviews",
    domain: "welfare",
    source: "learnerSupport",
    format: "number",
    icon: AlertTriangle,
    color: "amber",
    select: (d) => d.learnerSupport.data?.overdueReviews,
  },
  {
    id: "welfare.healthAllergies",
    label: "Students with allergies",
    domain: "welfare",
    source: "health",
    format: "number",
    icon: HeartPulse,
    color: "rose",
    select: (d) => d.health.data?.allergyFlags,
  },
  {
    id: "welfare.healthChronic",
    label: "Chronic conditions",
    domain: "welfare",
    source: "health",
    format: "number",
    icon: HeartPulse,
    color: "purple",
    select: (d) => d.health.data?.chronicConditions,
  },
  {
    id: "welfare.healthAdmitted",
    label: "Currently in sick bay",
    domain: "welfare",
    source: "health",
    format: "number",
    icon: HeartPulse,
    color: "cyan",
    select: (d) => d.health.data?.currentlyAdmitted,
  },
  {
    id: "ops.students",
    label: "Total students",
    domain: "operations",
    source: "school",
    format: "number",
    icon: Users,
    color: "blue",
    select: (d) => d.school.data?.kpis.totalStudents,
    change: { select: (d) => d.school.data?.kpis.studentsThisTermDelta, label: "this term" },
  },
  {
    id: "ops.teachers",
    label: "Total teachers",
    domain: "operations",
    source: "school",
    format: "number",
    icon: Users,
    color: "indigo",
    select: (d) => d.school.data?.kpis.totalTeachers,
    change: { select: (d) => d.school.data?.kpis.teachersThisTermDelta, label: "this term" },
  },
  {
    id: "ops.classes",
    label: "Classes running",
    domain: "operations",
    source: "school",
    format: "number",
    icon: GraduationCap,
    color: "teal",
    select: (d) => d.school.data?.kpis.classesRunningCount,
  },
  {
    id: "ops.hostelOccupancy",
    label: "Hostel occupancy",
    domain: "operations",
    source: "hostel",
    format: "percent",
    icon: BedDouble,
    color: "violet",
    select: (d) => d.hostel.data?.overallSummary.occupancyRate,
  },
  {
    id: "ops.hostelAvailable",
    label: "Hostel beds available",
    domain: "operations",
    source: "hostel",
    format: "number",
    icon: BedDouble,
    color: "gray",
    select: (d) => d.hostel.data?.overallSummary.available,
  },
  {
    id: "ops.libraryTitles",
    label: "Library titles",
    domain: "operations",
    source: "library",
    format: "number",
    icon: BookOpen,
    color: "indigo",
    select: (d) => d.library.data?.titles,
  },
  {
    id: "ops.libraryOverdue",
    label: "Overdue library loans",
    domain: "operations",
    source: "library",
    format: "number",
    icon: BookOpen,
    color: "amber",
    select: (d) => d.library.data?.overdueLoans,
  },
  {
    id: "ops.libraryFines",
    label: "Unpaid library fines",
    domain: "operations",
    source: "library",
    format: "money",
    icon: BookOpen,
    color: "orange",
    select: (d) => d.library.data?.unpaidFines,
  },
  {
    id: "ops.mealsServed",
    label: "Meals served",
    domain: "operations",
    source: "cafeteria",
    format: "number",
    icon: Utensils,
    color: "green",
    select: (d) => d.cafeteria.data?.mealsServed,
  },
  {
    id: "ops.mealSubscriptions",
    label: "Active meal subscriptions",
    domain: "operations",
    source: "cafeteria",
    format: "number",
    icon: Utensils,
    color: "teal",
    select: (d) => d.cafeteria.data?.activeSubscriptions,
  },
  {
    id: "ops.lowStock",
    label: "Low-stock kitchen items",
    domain: "operations",
    source: "cafeteria",
    format: "number",
    icon: Utensils,
    color: "red",
    select: (d) => d.cafeteria.data?.lowStockItems,
  },
  {
    id: "welfare.mealWelfareRequests",
    label: "Open welfare requests",
    domain: "welfare",
    source: "cafeteria",
    format: "number",
    icon: LifeBuoy,
    color: "rose",
    select: (d) => d.cafeteria.data?.openWelfareRequests,
  },
]

export const METRIC_BY_ID = new Map(REPORT_METRICS.map((m) => [m.id, m]))

export function metricsForDomain(domain: ReportDomain) {
  return REPORT_METRICS.filter((m) => m.domain === domain)
}

// Pages that show only a few of their domain's metrics; the rest stay pinnable on My Dashboard
const PAGE_STAT_IDS: Partial<Record<ReportDomain, string[]>> = {
  financial: [
    "fee.expected",
    "fee.collected",
    "fee.outstanding",
    "fee.collectionRate",
  ],
  welfare: [
    "welfare.sgOpen",
    "welfare.sgHighRisk",
    "welfare.lsReferrals",
    "welfare.healthAdmitted",
  ],
  operations: [
    "ops.classes",
    "ops.hostelOccupancy",
    "ops.libraryOverdue",
    "ops.lowStock",
  ],
}

export function pageMetrics(domain: ReportDomain) {
  const ids = PAGE_STAT_IDS[domain]
  const all = metricsForDomain(domain)
  return ids ? ids.flatMap((id) => all.filter((m) => m.id === id)) : all
}

export function sourcesFor(metrics: ReportMetric[]): Set<ReportSource> {
  return new Set(metrics.flatMap((m) => [m.source, ...(m.needs ?? [])]))
}
