import { useGeUserAssignedDashboard } from "@/hooks/products"
import type { ReportData } from "./useReportData"
import type { SchoolProfile } from "./types"

export function useSchoolProfile(
  schoolId: string,
  data: ReportData
): SchoolProfile {
  const { userDashboard } = useGeUserAssignedDashboard(schoolId)
  const raw = ((
    userDashboard as
      | { Value?: { School?: Record<string, unknown> } }
      | undefined
  )?.Value?.School ?? {}) as Record<string, unknown>
  const text = (...keys: string[]) =>
    String(
      keys.map((k) => raw[k]).find((v) => typeof v === "string" && v) ?? ""
    )

  return {
    name:
      text("Name") ||
      (data.school.isDemo ? "" : (data.school.data?.schoolName ?? "")),
    registrationNumber: text("RegistrationNumber"),
    state: text("State"),
    lga: text("LGA", "Lga"),
    address: text("Address"),
    status: text("Status"),
  }
}
