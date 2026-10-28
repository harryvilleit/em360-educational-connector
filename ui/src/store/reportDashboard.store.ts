import { create } from "zustand"
import { persist } from "zustand/middleware"

const DEFAULT_PINNED = [
  "exam.passRate",
  "fee.collectionRate",
  "attendance.avg",
  "ops.students",
]

interface ReportDashboardState {
  pinnedBySchool: Record<string, string[]>
  toggleMetric: (schoolId: string, metricId: string) => void
  reset: (schoolId: string) => void
}

export const useReportDashboardStore = create<ReportDashboardState>()(
  persist(
    (set) => ({
      pinnedBySchool: {},

      toggleMetric: (schoolId, metricId) =>
        set((state) => {
          const current = state.pinnedBySchool[schoolId] ?? DEFAULT_PINNED
          const next = current.includes(metricId)
            ? current.filter((id) => id !== metricId)
            : [...current, metricId]
          return { pinnedBySchool: { ...state.pinnedBySchool, [schoolId]: next } }
        }),

      reset: (schoolId) =>
        set((state) => {
          const rest = { ...state.pinnedBySchool }
          delete rest[schoolId]
          return { pinnedBySchool: rest }
        }),
    }),
    { name: "report-dashboards" }
  )
)

export function selectPinnedMetricIds(schoolId: string) {
  return (state: ReportDashboardState) =>
    state.pinnedBySchool[schoolId] ?? DEFAULT_PINNED
}
