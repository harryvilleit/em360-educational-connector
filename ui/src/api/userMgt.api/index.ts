/* eslint-disable @typescript-eslint/no-explicit-any */
import apiClient from "../api"
import { normalizeResponse } from "@/utils/apiResponse"
import type {
  CreateJobRoleI,
  CreateSubUserPayloadI,
  CreateSubUserResponseI,
  DeleteSubUserPayloadI,
  GetMySubUsersParams,
  GetPaginatedJobRolesParams,
  GetSubUserAccessParams,
  UpdateJobRoleI,
  UpdateModulesPayloadI,
  GetSubUserAccessEditParams,
  UpdateSubUserAccessPayloadI,
  UpdateRoleAccessPayloadI,
  GetRoleAccessResponseI,
  ActivateDeactivatePayloadI,
  ManagementDashboardParams,
  AssignMultipleRolesPayloadI,
  AdminResetUserPasswordPayloadI,
  AdminResetUserPasswordResponseI,
  ManageTeachersParams,
  GetManageTeachersResponseI,
  RemoveJobRolesPayloadI,
  CreateSchoolSessionPayloadI,
  UpdateSchoolSessionPayloadI,
  GetAllSchoolSessionsParams,
  SetCurrentSessionPayloadI,
  SetCurrentTermPayloadI,
  CreateSchoolTermPayloadI,
  UpdateSchoolTermPayloadI,
  GetAllSchoolTermsParams,
  ResendRegistrationEmailPayloadI,
  ResendRegistrationEmailResponseI,
} from "./types"

export const createJobRoleApi = async (
  payload: CreateJobRoleI
): Promise<any> => {
  const res = await apiClient.post("/SchoolJobRole/Create", payload)

  return res
}

export const getAllSchoolJobRolesByIdApi = async (
  schoolId: string
): Promise<any> => {
  const res = await apiClient.get(`/SchoolJobRole/GetBySchool/${schoolId}`)
  return res
}

export const updateJobRoleApi = async (
  payload: UpdateJobRoleI
): Promise<any> => {
  const res = await apiClient.put("/SchoolJobRole/Update", payload)
  return res
}

export const getSingleJobRoleByIdApi = async (id: string): Promise<any> => {
  const res = await apiClient.get(`/SchoolJobRole/GetById/${id}`)
  return res
}

export const deleteSingleJobRoleApi = async (id: string): Promise<any> => {
  const res = await apiClient.delete(`/SchoolJobRole/Delete/${id}`)
  return res
}

export const getAllPaginatedJobRolesByIdApi = async ({
  schoolId,
  pageNumber,
  pageSize,
  keyword,
}: GetPaginatedJobRolesParams): Promise<any> => {
  const res = await apiClient.get(
    `/SchoolJobRole/GetBySchoolPaginated/${schoolId}`,
    { params: { pageNumber, pageSize, keyword } }
  )
  return res
}

export const createSubUserApi = async (
  payload: CreateSubUserPayloadI
): Promise<CreateSubUserResponseI> => {
  const res = await apiClient.post("/SubUser/CreateSubUser", payload)
  const response = normalizeResponse<CreateSubUserResponseI>(res)
  if (!response.isSuccess) throw new Error(response.message || response.error || "Unable to create this user.")
  return response
}

export const getRoleAccessApi = async (
  schoolJobRoleId: string,
  schoolId: string
): Promise<GetRoleAccessResponseI> => {
  const res = await apiClient.get(`/SchoolJobRole/GetAccess/${schoolJobRoleId}`, {
    params: { schoolId },
  })
  return normalizeResponse<GetRoleAccessResponseI>(res)
}

export const updateRoleAccessApi = async (
  payload: UpdateRoleAccessPayloadI
): Promise<any> => {
  const res = await apiClient.put("/SchoolJobRole/UpdateAccess", payload)
  return res
}

export const backfillLegacyAccessApi = async (
  schoolId: string
): Promise<any> => {
  const res = await apiClient.post(`/SchoolJobRole/BackfillLegacyAccess/${schoolId}`)
  return res
}

export const getSchoolModuleForSubUserApi = async (
  schoolId: string
): Promise<any> => {
  const res = await apiClient.get(`/School/Modules/${schoolId}`)

  return res
}

export const deleteSubUserApi = async (
  payload: DeleteSubUserPayloadI
): Promise<any> => {
  const res = await apiClient.delete("/SubUser/DeleteSubUser", {
    data: payload,
  })
  return res
}

export const getSubUserAccessApi = async ({
  subUserId,
  productId,
}: GetSubUserAccessParams): Promise<any> => {
  const res = await apiClient.get("/SubUser/GetSubUserAccess", {
    params: { subUserId, productId },
  })
  return res
}

export const getMySubUsersApi = async ({
  schoolId,
  keyword,
  subUserId,
  schoolJobRoleId,
  status,
  pageNumber,
  pageSize,
}: GetMySubUsersParams): Promise<any> => {
  const res = await apiClient.get("/SubUser/GetMySubUsers", {
    params: { keyword, subUserId, schoolId, schoolJobRoleId, status, pageNumber, pageSize },
  })
  return res
}

export const updateModulesApi = async (
  payload: UpdateModulesPayloadI
): Promise<any> => {
  const res = await apiClient.put("/SubUser/UpdateModules", payload)
  return res
}

export const getSubUserAccessEditApi = async ({
  subUserId,
  schoolId,
}: GetSubUserAccessEditParams): Promise<any> => {
  const res = await apiClient.get("/SubUser/GetSubUserAccessEdit", {
    params: { subUserId, schoolId },
  })
  return res
}

export const updateSubUserAccessApi = async (
  payload: UpdateSubUserAccessPayloadI
): Promise<any> => {
  const res = await apiClient.put("/SubUser/UpdateSubUserAccess", payload)
  return res
}

export const deactivateSubUserApi = async (
  payload: ActivateDeactivatePayloadI
): Promise<any> => {
  const res = await apiClient.put("/SubUser/Deactivate", payload)
  return res
}

export const activateSubUserApi = async (
  payload: ActivateDeactivatePayloadI
): Promise<any> => {
  const res = await apiClient.put("/SubUser/Activate", payload)
  return res
}

export const resendRegistrationEmailApi = async (
  payload: ResendRegistrationEmailPayloadI
): Promise<ResendRegistrationEmailResponseI> => {
  const res = await apiClient.post("/SubUser/ResendRegistrationEmail", payload)
  return normalizeResponse<ResendRegistrationEmailResponseI>(res)
}

export const assignMultipleJobRolesApi = async (
  payload: AssignMultipleRolesPayloadI
): Promise<any> => {
  const res = await apiClient.post("/SubUser/AddJobRoles", payload)
  return res
}

export const adminResetUserPasswordApi = async (
  payload: AdminResetUserPasswordPayloadI
): Promise<AdminResetUserPasswordResponseI> => {
  const res = await apiClient.post("/Users/AdminResetUserPassword", payload)
  return normalizeResponse<AdminResetUserPasswordResponseI>(res)
}

export const getManagementDashboardApi = async (
  params: ManagementDashboardParams
): Promise<any> => {
  const res = await apiClient.get("/SubUser/ManagementDashboard", {
    params,
  })
  return res
}

export const getManageTeachersApi = async (
  params: ManageTeachersParams
): Promise<GetManageTeachersResponseI> => {
  const res = await apiClient.get("/SubUser/ManageTeachers", { params })
  return normalizeResponse<GetManageTeachersResponseI>(res)
}

export const removeJobRolesApi = async (
  payload: RemoveJobRolesPayloadI
): Promise<any> => {
  const res = await apiClient.delete("/SubUser/RemoveJobRoles", { data: payload })
  return res
}


export const createSchoolSessionApi = async (
  payload: CreateSchoolSessionPayloadI
): Promise<any> => {
  const res = await apiClient.post("/SchoolSession/Create", payload)
  return res
}

export const updateSchoolSessionApi = async (
  payload: UpdateSchoolSessionPayloadI
): Promise<any> => {
  const res = await apiClient.put("/SchoolSession/Update", payload)
  return res
}

export const deleteSchoolSessionApi = async (id: string): Promise<any> => {
  const res = await apiClient.delete(`/SchoolSession/Delete/${id}`)
  return res
}

export const getAllSchoolSessionsApi = async (
  params: GetAllSchoolSessionsParams
): Promise<any> => {
  const res = await apiClient.get("/SchoolSession/GetAll", { params })
  return res
}

export const getSchoolSessionByIdApi = async (id: string): Promise<any> => {
  const res = await apiClient.get(`/SchoolSession/GetById/${id}`)
  return res
}

export const setCurrentSessionApi = async (
  payload: SetCurrentSessionPayloadI
): Promise<any> => {
  const res = await apiClient.post("/SchoolSession/SetCurrentSession", payload)
  return res
}

export const setCurrentTermApi = async (
  payload: SetCurrentTermPayloadI
): Promise<any> => {
  const res = await apiClient.post("/SchoolSession/SetCurrentTerm", payload)
  return res
}

// ─── School Term ───────────────────────────────────────────────────────────────

export const createSchoolTermApi = async (
  payload: CreateSchoolTermPayloadI
): Promise<any> => {
  const res = await apiClient.post("/SchoolTerm/Create", payload)
  return res
}

export const updateSchoolTermApi = async (
  payload: UpdateSchoolTermPayloadI
): Promise<any> => {
  const res = await apiClient.put("/SchoolTerm/Update", payload)
  return res
}

export const deleteSchoolTermApi = async (id: string): Promise<any> => {
  const res = await apiClient.delete(`/SchoolTerm/Delete/${id}`)
  return res
}

export const getAllSchoolTermsApi = async (
  params: GetAllSchoolTermsParams
): Promise<any> => {
  const res = await apiClient.get("/SchoolTerm/GetAll", { params })
  return res
}

export const getSchoolTermByIdApi = async (id: string): Promise<any> => {
  const res = await apiClient.get(`/SchoolTerm/GetById/${id}`)
  return res
}
