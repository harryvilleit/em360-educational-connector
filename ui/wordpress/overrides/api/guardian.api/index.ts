import apiClient, { ApiError } from "@/api/api"
import type { ChildPaymentHistoryPageI } from "@/api/guardian.api/types"
import { normalizeResponse } from "@/utils/apiResponse"
import type {
  CreateGuardianPayloadI,
  CreateGuardianResponseI,
  UpdateGuardianPayloadI,
  UpdateGuardianResponseI,
  DeleteGuardianParamsI,
  DeleteGuardianResponseI,
  GetAllGuardiansParamsI,
  GetAllGuardiansResponseI,
  GetGuardianByIdParamsI,
  GetGuardianByIdResponseI,
  GetGuardianByEmailParamsI,
  GetGuardianByEmailResponseI,
  GetSchoolParentsParamsI,
  GetSchoolParentsResponseI,
  GetGuardianDetailsParamsI,
  GetGuardianDetailsResponseI,
  GetLaunchSchoolPortalParamsI,
  LaunchSchoolPortalResponseI,
  GetGuardianChildrenParamsI,
  GetGuardianChildrenResponseI,
  GetGuardianFeeManagementParamsI,
  GetGuardianFeeManagementResponseI,
  GetStudentFeeBreakdownParamsI,
  GetStudentFeeBreakdownResponseI,
  SubscribeToPaymentItemPayloadI,
  SubscribeToPaymentItemResponseI,
  GetStudentEnrolledClassesParamsI,
  GetStudentEnrolledClassesResponseI,
  SubscribeToOptionalSubjectPayloadI,
  SubscribeToOptionalSubjectResponseI,
  GetGuardianStudentResultParamsI,
  GetGuardianStudentResultResponseI,
  GetGuardianStudentAttendanceParamsI,
  GetGuardianStudentAttendanceResponseI,
  AdminResetGuardianPasswordPayloadI,
  AdminResetGuardianPasswordResponseI,
  AssignGuardiansToStudentPayloadI,
  AssignGuardiansToStudentResponseI,
} from "@/api/guardian.api/types"

export const createGuardianApi = async (
  payload: CreateGuardianPayloadI
): Promise<CreateGuardianResponseI> => {
  const res = await apiClient.post("/Guardian/Create", payload)
  return normalizeResponse<CreateGuardianResponseI>(res)
}

export const updateGuardianApi = async (
  payload: UpdateGuardianPayloadI
): Promise<UpdateGuardianResponseI> => {
  const res = await apiClient.put("/Guardian/Update", payload)
  return normalizeResponse<UpdateGuardianResponseI>(res)
}

export const deleteGuardianApi = async ({
  id,
}: DeleteGuardianParamsI): Promise<DeleteGuardianResponseI> => {
  const res = await apiClient.delete(`/Guardian/Delete/${id}`)
  return normalizeResponse<DeleteGuardianResponseI>(res)
}

export const getAllGuardiansApi = async (
  params: GetAllGuardiansParamsI
): Promise<GetAllGuardiansResponseI> => {
  const res = await apiClient.get("/Guardian/GetAll", { params })
  return normalizeResponse<GetAllGuardiansResponseI>(res)
}

export const getGuardianByIdApi = async ({
  id,
  schoolId,
}: GetGuardianByIdParamsI): Promise<GetGuardianByIdResponseI> => {
  const res = await apiClient.get(`/Guardian/GetById/${id}`, {
    params: { schoolId },
  })
  return normalizeResponse<GetGuardianByIdResponseI>(res)
}

export const getGuardianByEmailApi = async ({
  email,
}: GetGuardianByEmailParamsI): Promise<GetGuardianByEmailResponseI> => {
  try {
    const res = await apiClient.get("/Guardian/GetGuardianByEmail", {
      params: { email },
    })
    return normalizeResponse<GetGuardianByEmailResponseI>(res)
  } catch (err) {
    if (err instanceof ApiError && (err.status === 404 || err.status === 400)) {
      return {
        isSuccess: false,
        isFailure: true,
        message: err.message,
        error: err.message,
        statusCode: err.status,
        value: null,
      }
    }
    throw err
  }
}

export const getSchoolParentsApi = async ({
  schoolId,
  ...params
}: GetSchoolParentsParamsI): Promise<GetSchoolParentsResponseI> => {
  const res = await apiClient.get(`/Guardian/GetSchoolParents/${schoolId}`, {
    params,
  })
  return normalizeResponse<GetSchoolParentsResponseI>(res)
}

export const getGuardianDetailsApi = async ({
  guardianId,
  schoolId,
}: GetGuardianDetailsParamsI): Promise<GetGuardianDetailsResponseI> => {
  const res = await apiClient.get(`/Guardian/GetDetails/${guardianId}`, {
    params: { schoolId },
  })
  return normalizeResponse<GetGuardianDetailsResponseI>(res)
}

export const getLaunchSchoolPortalApi = async (
  params: GetLaunchSchoolPortalParamsI
): Promise<LaunchSchoolPortalResponseI> => {
  const res = await apiClient.get("/Guardian/LaunchSchoolPortal", { params })
  return normalizeResponse<LaunchSchoolPortalResponseI>(res)
}

export const getGuardianChildrenApi = async (
  params: GetGuardianChildrenParamsI
): Promise<GetGuardianChildrenResponseI> => {
  const res = await apiClient.get("/Guardian/GetGuardianChildren", { params })
  return normalizeResponse<GetGuardianChildrenResponseI>(res)
}

export const getGuardianFeeManagementApi = async (
  params: GetGuardianFeeManagementParamsI
): Promise<GetGuardianFeeManagementResponseI> => {
  const res = await apiClient.get("/Guardian/GetFeeManagement", { params })
  return normalizeResponse<GetGuardianFeeManagementResponseI>(res)
}

export const getStudentFeeBreakdownApi = async (
  params: GetStudentFeeBreakdownParamsI
): Promise<GetStudentFeeBreakdownResponseI> => {
  const res = await apiClient.get("/Guardian/GetStudentFeeBreakdown", {
    params,
  })
  return normalizeResponse<GetStudentFeeBreakdownResponseI>(res)
}

export const getChildPaymentHistoryApi = async (params: {
  schoolId: string
  studentId: string
  sessionId?: string
  pageNumber: number
  pageSize?: number
}): Promise<ChildPaymentHistoryPageI> => {
  const response = await apiClient.get("/Guardian/GetChildPaymentHistory", {
    params,
  })
  return normalizeResponse<{
    isSuccess: boolean
    value: ChildPaymentHistoryPageI
  }>(response).value
}

export const subscribeToPaymentItemApi = async (
  payload: SubscribeToPaymentItemPayloadI
): Promise<SubscribeToPaymentItemResponseI> => {
  const res = await apiClient.post("/Guardian/SubscribeToPaymentItem", payload)
  return normalizeResponse<SubscribeToPaymentItemResponseI>(res)
}

export const getStudentEnrolledClassesApi = async (
  params: GetStudentEnrolledClassesParamsI
): Promise<GetStudentEnrolledClassesResponseI> => {
  const res = await apiClient.get("/Guardian/GetStudentEnrolledClasses", {
    params: {
      SchoolId: params.schoolId,
      StudentId: params.studentId,
      SchoolSessionId: params.schoolSessionId || null,
      SchoolSessionTermId: params.schoolSessionTermId || null,
    },
  })
  return normalizeResponse<GetStudentEnrolledClassesResponseI>(res)
}

export const subscribeToOptionalSubjectApi = async (
  payload: SubscribeToOptionalSubjectPayloadI
): Promise<SubscribeToOptionalSubjectResponseI> => {
  const res = await apiClient.post(
    "/Guardian/SubscribeToOptionalSubject",
    payload
  )
  return normalizeResponse<SubscribeToOptionalSubjectResponseI>(res)
}

export const getGuardianStudentResultApi = async (
  params: GetGuardianStudentResultParamsI
): Promise<GetGuardianStudentResultResponseI> => {
  const res = await apiClient.get("/Guardian/GetStudentResult", { params })
  return normalizeResponse<GetGuardianStudentResultResponseI>(res)
}

// axios omits params whose value is undefined, so unselected filters
// (class/session/term/date range) never reach the query string.
export const getGuardianStudentAttendanceApi = async (
  params: GetGuardianStudentAttendanceParamsI
): Promise<GetGuardianStudentAttendanceResponseI> => {
  const res = await apiClient.get("/Guardian/GetStudentAttendance", { params })
  return normalizeResponse<GetGuardianStudentAttendanceResponseI>(res)
}

export const adminResetGuardianPasswordApi = async (
  payload: AdminResetGuardianPasswordPayloadI
): Promise<AdminResetGuardianPasswordResponseI> => {
  const res = await apiClient.post("/Users/AdminResetGuardianPassword", payload)
  return normalizeResponse<AdminResetGuardianPasswordResponseI>(res)
}

export const assignGuardiansToStudentApi = async (
  payload: AssignGuardiansToStudentPayloadI
): Promise<AssignGuardiansToStudentResponseI> => {
  const res = await apiClient.post("/Guardian/AssignToStudent", payload)
  return normalizeResponse<AssignGuardiansToStudentResponseI>(res)
}
