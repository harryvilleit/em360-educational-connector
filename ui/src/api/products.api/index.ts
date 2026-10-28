/* eslint-disable @typescript-eslint/no-explicit-any */
import apiClient from "../api"
import { toCamelCase } from "@/utils/caseConversion"
import { normalizeResponse } from "@/utils/apiResponse"
import type {
  AllProductsResponseI,
  CreateSchoolPayloadI,
  CreateSchoolResponseI,
  GetModuleByIdResponseI,
  GetTimeZonesResponseI,
  GetUserAssignedDashboardResponseI,
  ProductCatalogueResponseI,
  SchoolPortalAccessResponseI,
  GetUserProductsParams,
  UpdateSchoolTimeZonePayloadI,
  UpdateSchoolTimeZoneResponseI,
  UpdateSchoolProfilePayloadI,
  UserSubProductsResponseI,
} from "./types"

export const getAllProductsApi = async (
  params: GetUserProductsParams = {}
): Promise<AllProductsResponseI | any> => {
  const { pageNumber = 1, pageSize = 10, keyword } = params
  const queryParams = new URLSearchParams({
    pageNumber: String(pageNumber),
    pageSize: String(pageSize),
  })

  if (keyword?.trim()) {
    queryParams.set("keyword", keyword.trim())
  }

  const res = await apiClient.get(`/Product/GetAll?${queryParams.toString()}`)

  return res
}

export const getProductCatalogueApi =
  async (): Promise<ProductCatalogueResponseI> => {
    const res = await apiClient.get(`/Product/Catalogue`)
    return normalizeResponse<ProductCatalogueResponseI>(res)
  }

export const buildCreateSchoolFormData = (
  payload: CreateSchoolPayloadI
): FormData => {
  const formData = new FormData()

  formData.append("CountryCode", payload.CountryCode)
  formData.append("Name", payload.Name)
  formData.append("Description", payload.Description)
  if (payload.Logo) formData.append("Logo", payload.Logo)
  formData.append("RegistrationNumber", payload.RegistrationNumber)
  formData.append("EstablishedYear", String(payload.EstablishedYear))
  if (payload.WebsiteUrl?.trim()) {
    formData.append("WebsiteUrl", payload.WebsiteUrl.trim())
  }
  formData.append("Address", payload.Address)
  formData.append("State", payload.State)
  formData.append("LGA", payload.LGA)
  formData.append("City", payload.City)
  formData.append("PhoneNumber", payload.PhoneNumber)
  formData.append("Email", payload.Email)
  formData.append("TimeZoneId", payload.TimeZoneId)
  formData.append("ProductId", String(payload.ProductId))

  payload.ProductModuleIds.forEach((id) => {
    formData.append("ProductModuleIds", String(id))
  })

  if (payload.Tagline?.trim())
    formData.append("Tagline", payload.Tagline.trim())
  formData.append("Ownership", payload.Ownership)
  payload.SchoolTypes.forEach((type) => formData.append("SchoolTypes", type))
  if (
    payload.SchoolTypes.includes("Others") &&
    payload.OtherSchoolType?.trim()
  ) {
    formData.append("OtherSchoolType", payload.OtherSchoolType.trim())
  }
  payload.PublicPrograms.forEach((program) => {
    if (program.trim()) formData.append("PublicPrograms", program.trim())
  })
  payload.Facilities.forEach((facility, index) => {
    formData.append(`Facilities[${index}].Name`, facility.name.trim())
    if (facility.imageFile)
      formData.append(`Facilities[${index}].Image`, facility.imageFile)
  })
  return formData
}

export const createSchoolApi = async (
  payload: CreateSchoolPayloadI
): Promise<CreateSchoolResponseI> => {
  const raw = await apiClient.post(
    "/School/CreateWithModules",
    buildCreateSchoolFormData(payload)
  )
  const res = toCamelCase<CreateSchoolResponseI>(raw)
  if (!res?.isSuccess)
    throw new Error(res?.message || res?.error || "Failed to create school")
  return res
}

export const getTimeZonesApi = async (
  keyword?: string
): Promise<GetTimeZonesResponseI | any> => {
  const query = keyword?.trim()
    ? `?keyword=${encodeURIComponent(keyword.trim())}`
    : ""

  const res = await apiClient.get(`/School/TimeZones${query}`)

  return res
}

export const updateSchoolTimeZoneApi = async (
  payload: UpdateSchoolTimeZonePayloadI
): Promise<UpdateSchoolTimeZoneResponseI | any> => {
  const res = await apiClient.put(`/School/${payload.schoolId}/TimeZone`, {
    timeZoneId: payload.timeZoneId,
  })

  return res
}

export const updateSchoolProfileApi = async (
  payload: UpdateSchoolProfilePayloadI
): Promise<any> => {
  const form = new FormData()
  form.append("Name", payload.name)
  form.append("Description", payload.description)
  form.append("RegistrationNumber", payload.registrationNumber)
  form.append("Address", payload.address)
  form.append("State", payload.state)
  form.append("LGA", payload.lga)
  form.append("City", payload.city)
  form.append("PhoneNumber", payload.phoneNumber)
  form.append("Email", payload.email)
  if (payload.logo) form.append("Logo", payload.logo)
  return apiClient.put(`/School/${payload.schoolId}/Profile`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  })
}

export const deleteSchoolApi = async (schoolId: string): Promise<any> =>
  apiClient.delete(`/School/Delete/${encodeURIComponent(schoolId)}`)

export const getProductModuleByIdApi = async (
  productId: string
): Promise<GetModuleByIdResponseI> => {
  const res = (await apiClient.get(
    `/ProductModule/GetModulesByProductId/${encodeURIComponent(productId)}`
  )) as unknown as GetModuleByIdResponseI

  if (res?.IsSuccess === false) {
    throw new Error(res.Error || "Failed to load product modules")
  }

  return res
}

export const getUserSubscribedProductApi =
  async (): Promise<UserSubProductsResponseI> => {
    const res = await apiClient.get(`/ProductUser/GetUserProfileInformation`)
    return normalizeResponse<UserSubProductsResponseI>(res)
  }

export const getUserAssignedModulesApi = async (
  productId: string
): Promise<any> => {
  const res = await apiClient.get(
    `/ProductModule/GetModulesByProductId/${encodeURIComponent(productId)}`
  )

  return res
}

export const getUserAssginedDashboardApi = async (
  schoolId: string
): Promise<GetUserAssignedDashboardResponseI | any> => {
  const res = await apiClient.get(`/School/Dashboard/${schoolId}`)
  return res
}

export const getSchoolPortalAccessApi = async (
  schoolId: string
): Promise<SchoolPortalAccessResponseI> => {
  const res = await apiClient.get(
    `/School/PortalAccess/${encodeURIComponent(schoolId)}`
  )
  return normalizeResponse<SchoolPortalAccessResponseI>(res)
}
