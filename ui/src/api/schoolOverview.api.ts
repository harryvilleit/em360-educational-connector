import apiClient from "./api"
import { toCamelCase } from "@/utils/caseConversion"
import type { Result, SchoolOverviewResponse } from "@/types/schoolOverview"

export interface SchoolOverviewFilters {
  sessionId?: string
  termId?: string
}

export async function getSchoolOverview(
  schoolId: string,
  filters: SchoolOverviewFilters,
  signal?: AbortSignal
) {
  const response = await apiClient.get<
    Result<SchoolOverviewResponse>,
    Result<SchoolOverviewResponse>
  >(`/School/${encodeURIComponent(schoolId)}/Overview`, {
    params: filters,
    signal,
    headers: { Accept: "application/json" },
  })
  const result = toCamelCase<Result<SchoolOverviewResponse>>(response)
  if (!result.isSuccess || !result.value) {
    throw new Error(result.message || "Unable to load the school overview.")
  }
  return result.value
}
