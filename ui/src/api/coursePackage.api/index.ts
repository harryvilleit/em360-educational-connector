import { HomeRoutes } from "@/routes"
import { elearningApiClient } from "../api"
import { normalizeResponse, type ApiResultI } from "@/utils/apiResponse"
import type {
  CoursePackageResponseI,
  CoursePackagesResponseI,
  CreateCoursePackageResponseI,
  PublicCoursePackageSearchParamsI,
  PublicCoursePackagesResponseI,
  SaveCoursePackagePayloadI,
} from "./types"

export async function createCoursePackageApi(payload: SaveCoursePackagePayloadI) {
  const res = await elearningApiClient.post("/CoursePackage/Create", payload)
  return normalizeResponse<CreateCoursePackageResponseI>(res)
}

export async function updateCoursePackageApi(id: string, payload: SaveCoursePackagePayloadI) {
  const res = await elearningApiClient.put(
    `/CoursePackage/${encodeURIComponent(id)}`,
    payload
  )
  return normalizeResponse<ApiResultI>(res)
}

export async function getTutorCoursePackagesApi() {
  const res = await elearningApiClient.get("/CoursePackage/TutorPackages")
  return normalizeResponse<CoursePackagesResponseI>(res)
}

export async function getCoursePackageByIdApi(id: string) {
  const res = await elearningApiClient.get(
    `/CoursePackage/GetById/${encodeURIComponent(id)}`
  )
  return normalizeResponse<CoursePackageResponseI>(res)
}

export async function getPublicCoursePackageByIdApi(id: string) {
  const res = await elearningApiClient.get(
    `/CoursePackage/Public/${encodeURIComponent(id)}`
  )
  return normalizeResponse<CoursePackageResponseI>(res)
}

/** Public: every published course package, newest first, with optional filters. */
export async function searchPublicCoursePackagesApi(params: PublicCoursePackageSearchParamsI = {}) {
  const res = await elearningApiClient.get("/CoursePackage/Search", { params })
  return normalizeResponse<PublicCoursePackagesResponseI>(res)
}

/** The shareable public page for a package. */
export function coursePackagePublicUrl(id: string, title?: string) {
  return `${window.location.origin}${HomeRoutes.toCoursePackageDetail(id, title)}`
}

export async function changeCoursePackageStatusApi(
  id: string,
  status: "Published" | "Archived"
) {
  const res = await elearningApiClient.patch(
    `/CoursePackage/${encodeURIComponent(id)}/Status`,
    { status }
  )
  return normalizeResponse<ApiResultI>(res)
}

export async function deleteCoursePackageApi(id: string) {
  const res = await elearningApiClient.delete(
    `/CoursePackage/${encodeURIComponent(id)}`
  )
  return normalizeResponse<ApiResultI>(res)
}

export type {
  PublicCoursePackageSearchParamsI,
  PublicCoursePackagePageI,
  CoursePackageI,
  CoursePackageResponseI,
  CoursePackagesResponseI,
  SaveCoursePackagePayloadI,
} from "./types"
