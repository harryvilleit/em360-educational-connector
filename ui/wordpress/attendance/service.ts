// School-wide attendance figures and ID verification served by the WordPress gateway's
// /WordPressAttendance operations (the main site computes these in the browser).
import { useQuery } from "@tanstack/react-query"
import apiClient from "@/api/api"
import { toCamelCase } from "@/utils/caseConversion"

/** GET (no body) or POST (with body) to /WordPressAttendance/<path>; the response is camel-cased. */
export async function attendanceRequest<T = unknown>(path: string, body?: unknown): Promise<T> {
  return toCamelCase<T>(
    await apiClient.request({
      url: "/WordPressAttendance/" + path,
      method: body ? "POST" : "GET",
      data: body,
    }),
  )
}

export interface StaffSummary {
  total: number
  present: number
  absent: number
  late: number
}

/** Today's staff attendance totals for the whole school. */
export const useStaffAttendanceSummary = () =>
  useQuery({
    queryKey: ["wordpress-attendance-staff-summary"],
    queryFn: () => attendanceRequest<StaffSummary>("StaffSummary"),
  })
