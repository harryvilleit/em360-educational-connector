import { formatDate } from "@/utils"
import { performanceRows } from "./academicPerformance"
import { academicSummary } from "./academicSummary"
import { serviceRows } from "./operationsServices"
import type { ReportDomain } from "./metrics"
import { casHeader } from "./casSheet"
import type { CasSheetState } from "./useCasSheet"
import type { ReportData } from "./useReportData"

type Cell = string | number | null | undefined

export interface ExportTable {
  label: string
  tab?: string
  filename: string
  header: string[]
  rows: Cell[][]
}

// Every table a report page shows, in a plain shape that PDF and CSV downloads share.
export function buildExports(
  view: ReportDomain,
  data: ReportData,
  date: string,
  cas?: CasSheetState
): ExportTable[] {
  switch (view) {
    case "academic": {
      const exam = data.exam.data
      return [
        {
          label: "Academic Summary",
          tab: "summary",
          filename: "academic-summary.csv",
          header: ["Measure", "Value"],
          rows: academicSummary(exam).map((r) => [r.label, r.value]),
        },
        {
          label: "Grade Distribution",
          tab: "grades",
          filename: "grade-distribution.csv",
          header: [
            "Grade",
            "Score range",
            "Description",
            "Students",
            "Share (%)",
          ],
          rows: (exam?.gradeDistribution ?? []).map((g) => [
            g.grade,
            g.scoreRange,
            g.label,
            g.count,
            g.percentage,
          ]),
        },
        {
          label: "Performance",
          tab: "performance",
          filename: "academic-performance.csv",
          header: ["Name", "Type", "Average score (%)", "Pass rate (%)"],
          rows: performanceRows(exam).map((r) => [
            r.name,
            r.type,
            r.avgScore,
            r.passRate,
          ]),
        },
        {
          label: cas?.sheet ? `CAS Sheet - ${cas.sheet.className}` : "CAS Sheet",
          tab: "cas",
          filename: "cas-sheet.csv",
          header: [
            "S/N",
            "Student name",
            "Admission no.",
            "Gender",
            ...(cas?.sheet?.columns ?? []).map(casHeader),
          ],
          rows: (cas?.sheet?.rows ?? []).map((r, i) => [
            i + 1,
            r.name,
            r.admissionNumber,
            r.gender,
            ...(cas?.sheet?.columns ?? []).map((c) => r.scores[c.key] ?? ""),
          ]),
        },
      ]
    }
    case "financial": {
      const fee = data.fee.data
      return [
        {
          label: "Monthly Collection",
          filename: "monthly-collection.csv",
          header: ["Month", "Collected", "Outstanding"],
          rows: (fee?.collectionTrend ?? []).map((t) => [
            t.month,
            t.collected,
            t.outstanding,
          ]),
        },
        {
          label: "Collection by Level",
          filename: "fees-by-level.csv",
          header: ["Level", "Expected", "Collected", "Collection rate (%)"],
          rows: (fee?.byLevel ?? []).map((l) => [
            l.level,
            l.totalExpected,
            l.totalCollected,
            l.collectionRatePercent,
          ]),
        },
        {
          label: "Recent Payments",
          filename: "recent-payments.csv",
          header: ["Student", "Class / term", "Amount", "Method", "Date"],
          rows: (fee?.recentPayments ?? []).map((r) => [
            r.studentName,
            r.classTerm,
            r.amount,
            r.paymentMethod,
            r.paymentDate ? formatDate(r.paymentDate, "short") : "",
          ]),
        },
        {
          label: "Outstanding Balances",
          filename: "outstanding-fees.csv",
          header: ["Student", "Class", "Outstanding", "Days overdue"],
          rows: (fee?.outstandingFees ?? []).map((o) => [
            o.studentName,
            o.className,
            o.outstandingBalance,
            o.daysOverdue,
          ]),
        },
      ]
    }
    case "attendance": {
      const att = data.attendance.data
      return [
        {
          label: "This Week",
          filename: "attendance-this-week.csv",
          header: ["Day", "Date", "Present", "Absent"],
          rows: (data.school.data?.weeklyAttendance.days ?? []).map((w) => [
            w.dayName,
            w.date,
            w.presentCount,
            w.absentCount,
          ]),
        },
        {
          label: `By Class (${date})`,
          filename: `attendance-${date}-by-class.csv`,
          header: [
            "Class",
            "Students",
            "Present",
            "Absent",
            "Late",
            "Excused",
            "Present (%)",
          ],
          rows: (att?.todaysSummary ?? []).map((s) => [
            s.schoolClassName,
            s.totalStudents,
            s.presentCount,
            s.absentCount,
            s.lateCount,
            s.excusedCount,
            s.presentPercentage,
          ]),
        },
        {
          label: "Classes Not Marked",
          filename: `attendance-${date}-not-marked.csv`,
          header: ["Class", "Students"],
          rows: (att?.classesNotYetMarked ?? []).map((c) => [
            c.schoolClassName,
            c.studentCount,
          ]),
        },
      ]
    }
    case "enrolment": {
      const e = data.enrolment.data
      const ageTotal = (e?.ageBands ?? []).reduce((n, a) => n + a.count, 0)
      return [
        {
          label: "Enrolment Register",
          tab: "register",
          filename: "enrolment-by-class.csv",
          header: ["Class", "Boys", "Girls", "Total"],
          rows: [
            ...(e?.byClass ?? []).map((r) => [
              r.className,
              r.boys,
              r.girls,
              r.total,
            ]),
            ...(e ? [["Grand total", e.boys, e.girls, e.total]] : []),
          ],
        },
        {
          label: "Age Profile",
          tab: "age",
          filename: "enrolment-age-profile.csv",
          header: ["Age band", "Pupils", "Share (%)"],
          rows: (e?.ageBands ?? [])
            .filter((a) => a.count > 0)
            .map((a) => [
              a.band,
              a.count,
              ageTotal ? Math.round((a.count / ageTotal) * 1000) / 10 : 0,
            ]),
        },
        {
          label: "Record Completeness",
          tab: "completeness",
          filename: "enrolment-record-completeness.csv",
          header: ["Field", "Recorded", "Total records"],
          rows: (e?.completeness ?? []).map((c) => [
            c.label,
            c.filled,
            c.total,
          ]),
        },
      ]
    }
    case "staff": {
      const s = data.staff.data
      return [
        {
          label: "Staff Nominal Roll",
          tab: "roster",
          filename: "staff-nominal-roll.csv",
          header: [
            "S/N",
            "Name",
            "Sex",
            "Date of birth",
            "Qualification",
            "Role",
            "Category",
            "Status",
            "SB number",
            "GL / Step",
            "First appointment",
            "Present appointment",
            "Date posted",
            "State / LGA of origin",
            "Town",
          ],
          rows: (s?.roster ?? []).map((r, i) => [
            i + 1,
            r.name,
            r.sex,
            r.dob ? formatDate(r.dob, "numeric") : "",
            r.qualification,
            r.role,
            r.category,
            r.status,
            r.serviceNumber,
            r.gradeLevel,
            r.firstAppointment ? formatDate(r.firstAppointment, "numeric") : "",
            r.presentAppointment
              ? formatDate(r.presentAppointment, "numeric")
              : "",
            r.datePosted ? formatDate(r.datePosted, "numeric") : "",
            r.origin,
            r.town,
          ]),
        },
        {
          label: "Record Completeness",
          tab: "completeness",
          filename: "staff-record-completeness.csv",
          header: ["Field", "Recorded", "Total records"],
          rows: (s?.completeness ?? []).map((c) => [
            c.label,
            c.filled,
            c.total,
          ]),
        },
      ]
    }
    case "welfare":
      return [
        {
          label: "Priority Safeguarding Cases",
          tab: "safeguarding",
          filename: "priority-safeguarding-cases.csv",
          header: [
            "Case",
            "Student",
            "Class",
            "Risk",
            "Status",
            "Category",
            "Next action due",
          ],
          rows: (data.safeguarding.data?.priorityCases ?? []).map((c) => [
            c.caseNumber,
            c.studentName,
            c.className,
            c.riskLevel,
            c.status,
            c.category,
            c.nextActionDueAtUtc
              ? formatDate(c.nextActionDueAtUtc, "short")
              : "",
          ]),
        },
        {
          label: "Priority Learner Support Cases",
          tab: "support",
          filename: "priority-learner-support-cases.csv",
          header: [
            "Case",
            "Student",
            "Class",
            "Status",
            "Owner",
            "Next review",
          ],
          rows: (data.learnerSupport.data?.priorityCases ?? []).map((c) => [
            c.caseNumber,
            c.studentName,
            c.className,
            c.status,
            c.caseOwnerName,
            c.nextReviewDate ? formatDate(c.nextReviewDate, "short") : "",
          ]),
        },
      ]
    case "operations": {
      const lib = data.library.data
      const caf = data.cafeteria.data
      return [
        {
          label: "Enrolment by Level",
          tab: "levels",
          filename: "enrolment-by-level.csv",
          header: ["Level", "Students", "Share (%)"],
          rows: (data.school.data?.enrollmentBreakdown.levels ?? []).map(
            (l) => [l.levelName, l.studentCount, l.percentage]
          ),
        },
        {
          label: "Hostel Occupancy",
          tab: "hostel",
          filename: "hostel-occupancy.csv",
          header: [
            "Hostel",
            "Category",
            "Beds",
            "Occupied",
            "Available",
            "Occupancy (%)",
          ],
          rows: (data.hostel.data?.hostelBreakdowns ?? []).map((h) => [
            h.hostelName,
            h.categoryName,
            h.totalBeds,
            h.occupied,
            h.available,
            h.occupancyRate,
          ]),
        },
        {
          label: "Library and Cafeteria",
          tab: "services",
          filename: "library-and-cafeteria.csv",
          header: ["Area", "Measure", "Value"],
          rows: serviceRows(lib, caf).map((r) => [r.area, r.measure, r.value]),
        },
      ]
    }
  }
}
