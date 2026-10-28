import { toCamelCase } from "./caseConversion"

export interface ApiResultI {
  isSuccess: boolean
  message?: string
  error?: string
  isFailure?: boolean
}


export function normalizeResponse<T extends ApiResultI>(raw: unknown): T {
  const data = toCamelCase<T>(raw)
  if (data?.isSuccess === false) {
    throw new Error(data.error || "Request failed")
  }
  return data
}
