import { useCallback } from "react"
import api from "@/api/api"
import { useSchoolId } from "@/contexts/SchoolContext"
import { toCamelCase } from "@/utils/caseConversion"
import type { Request } from "./shared"
export function usePerformanceRequest(): Request {
  const schoolId = useSchoolId()
  return useCallback(
    async (path, method = "GET", body, params = {}) => {
      if (!schoolId) throw Error("Select a school to continue")
      try {
        const data: any = toCamelCase(
          await api.request({
            url: "/SchoolPerformance/" + path,
            method,
            params: { ...params, schoolId },
            data: body,
          })
        )
        if (data?.isSuccess === false)
          throw Error(data.message || data.error || "Request failed")
        return data && "value" in data ? data.value : data
      } catch (e: any) {
        throw Error(
          e?.response?.data?.message ||
            e?.response?.data?.Message ||
            e.message ||
            "Performance request failed"
        )
      }
    },
    [schoolId]
  )
}
