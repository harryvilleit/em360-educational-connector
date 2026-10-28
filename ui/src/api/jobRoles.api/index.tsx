/* eslint-disable @typescript-eslint/no-explicit-any */
import apiClient from "../api"
import type {
  CreateJobRolePayloadI,
  UpdateJobRolePayloadI,
  GetBySchoolPaginatedParams,
} from "./types"

export const getSystemJobRolesApi = async (): Promise<any> => {
  const res = await apiClient.get("/SchoolJobRole/GetSystemJobRoles")
  return res
}

export const createJobRoleApi = async (
  payload: CreateJobRolePayloadI
): Promise<any> => {
  const res = await apiClient.post("/SchoolJobRole/Create", payload)
  return res
}

export const updateJobRoleApi = async (
  payload: UpdateJobRolePayloadI
): Promise<any> => {
  const res = await apiClient.put("/SchoolJobRole/Update", payload)
  return res
}

export const deleteJobRoleApi = async (id: string): Promise<any> => {
  const res = await apiClient.delete(`/SchoolJobRole/Delete/${id}`)
  return res
}

export const getJobRolesBySchoolApi = async (
  schoolId: string
): Promise<any> => {
  const res = await apiClient.get(`/SchoolJobRole/GetBySchool/${schoolId}`)
  return res
}

export const getJobRolesBySchoolPaginatedApi = async ({
  schoolId,
  pageNumber,
  pageSize,
  keyword,
}: GetBySchoolPaginatedParams): Promise<any> => {
  const res = await apiClient.get(
    `/SchoolJobRole/GetBySchoolPaginated/${schoolId}`,
    { params: { pageNumber, pageSize, keyword } }
  )
  return res
}

export const getJobRoleByIdApi = async (id: string): Promise<any> => {
  const res = await apiClient.get(`/SchoolJobRole/GetById/${id}`)
  return res
}
