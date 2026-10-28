import type { ReportDomain } from "./metrics"
import type { ReportData } from "./useReportData"

export interface Attention {
  text: string
  domain: ReportDomain
  tone: "red" | "amber" | "blue"
}

export function buildAttention(data: ReportData): Attention[] {
  const fee = data.fee.data
  const exam = data.exam.data
  const att = data.attendance.data
  const sg = data.safeguarding.data
  const ls = data.learnerSupport.data
  const lib = data.library.data
  const caf = data.cafeteria.data

  const items: (Attention | false)[] = [
    !!fee?.defaulterCount && {
      text: `${fee.defaulterCount} students have overdue fees`,
      domain: "financial",
      tone: "red",
    },
    !!exam?.atRiskStudents && {
      text: `${exam.atRiskStudents} students are academically at risk`,
      domain: "academic",
      tone: "red",
    },
    !!sg?.overdueActions && {
      text: `${sg.overdueActions} safeguarding actions are overdue`,
      domain: "welfare",
      tone: "red",
    },
    !!sg?.highRiskCases && {
      text: `${sg.highRiskCases} high-risk safeguarding cases`,
      domain: "welfare",
      tone: "amber",
    },
    !!ls?.overdueReviews && {
      text: `${ls.overdueReviews} learner support reviews are overdue`,
      domain: "welfare",
      tone: "amber",
    },
    !!att?.classesNotYetMarked.length && {
      text: `${att.classesNotYetMarked.length} classes have not marked attendance`,
      domain: "attendance",
      tone: "amber",
    },
    !!lib?.overdueLoans && {
      text: `${lib.overdueLoans} library loans are overdue`,
      domain: "operations",
      tone: "blue",
    },
    !!caf?.lowStockItems && {
      text: `${caf.lowStockItems} kitchen items are low on stock`,
      domain: "operations",
      tone: "blue",
    },
  ]
  return items.filter((i): i is Attention => i !== false)
}
