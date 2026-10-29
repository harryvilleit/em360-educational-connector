import apiClient, { ApiError } from "./api"
import { toCamelCase } from "@/utils/caseConversion"

export interface ClassArmAssignmentDto {
  armId: string
  armName: string
  description?: string
  isAssigned: boolean
  activeStudentCount: number
}

export interface UpdateClassArmsRequest {
  classId: string
  schoolId: string
  armIds: string[]
}

interface ClassArmsResult<T> {
  isSuccess: boolean
  statusCode: number
  message: string
  value: T
}

export async function getClassArmAssignments(
  params: Pick<UpdateClassArmsRequest, "classId" | "schoolId">,
  signal?: AbortSignal
) {
  const raw = await apiClient.get("/SchoolClass/GetClassArmAssignments", {
    params,
    signal,
  })
  const result = toCamelCase<ClassArmsResult<ClassArmAssignmentDto[]>>(raw)
  if (!result.isSuccess || !Array.isArray(result.value)) {
    throw new Error(result.message || "Unable to load class arm assignments.")
  }
  return result.value
}

export async function updateClassArms(payload: UpdateClassArmsRequest) {
  try {
    const raw = await apiClient.post("/SchoolClass/UpdateClassArms", payload)
    const result = toCamelCase<ClassArmsResult<Record<string, unknown>>>(raw)
    if (!result.isSuccess)
      throw new Error(result.message || "Unable to update class arms.")
    return result
  } catch (error) {
    if (error instanceof ApiError) {
      const body = toCamelCase<{ message?: string }>(error.data)
      if (body?.message) throw new Error(body.message)
    }
    throw error
  }
}
