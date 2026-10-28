import { useMemo } from "react"
import { create } from "zustand"
import { persist } from "zustand/middleware"
import {
  DEFAULT_REPORT_CARD_CONFIG,
  type ReportCardConfig,
} from "@/components/report-card/config"

interface ReportCardConfigState {
  configsBySchool: Record<string, Partial<ReportCardConfig>>
  setConfig: (schoolId: string, config: ReportCardConfig) => void
  resetConfig: (schoolId: string) => void
}


export const useReportCardConfigStore = create<ReportCardConfigState>()(
  persist(
    (set) => ({
      configsBySchool: {},

      setConfig: (schoolId, config) =>
        set((state) => ({
          configsBySchool: { ...state.configsBySchool, [schoolId]: config },
        })),

      resetConfig: (schoolId) =>
        set((state) => {
          const next = { ...state.configsBySchool }
          delete next[schoolId]
          return { configsBySchool: next }
        }),
    }),
    { name: "em360-report-card-config" }
  )
)

/** The school's saved design, falling back to the default for anything unset. */
export function useReportCardConfig(schoolId: string): ReportCardConfig {
  const saved = useReportCardConfigStore((s) => s.configsBySchool[schoolId])
  return useMemo(() => ({ ...DEFAULT_REPORT_CARD_CONFIG, ...saved }), [saved])
}
