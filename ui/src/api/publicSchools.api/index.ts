import apiClient from "../api"
import { normalizeResponse, type ApiResultI } from "@/utils/apiResponse"
import type {
  SchoolEnquiryInput,
  SchoolEnquiryPage,
  SchoolEnquiry,
  PublicSchool,
  PublicSchoolSearchParams,
  PublicSchoolSearchResult,
  SchoolFacility,
  SchoolGalleryImage,
  SchoolPublicProfileSettings,
  SchoolRating,
  UpdateSchoolPublicProfilePayload,
} from "@/types/public-schools"
import type {
  SchoolBlogList,
  SchoolBlogPost,
  SchoolBlogPostInput,
} from "@/types/school-blog"

type ApiEnvelope<T> = ApiResultI & {
  value: T
  message?: string
  statusCode: number
}

export async function searchPublicSchoolsApi(
  params: PublicSchoolSearchParams
): Promise<PublicSchoolSearchResult> {
  const raw = await apiClient.get("/School/Public/Search", { params })
  return normalizeResponse<ApiEnvelope<PublicSchoolSearchResult>>(raw).value
}

export async function getPublicSchoolApi(id: string): Promise<PublicSchool> {
  const raw = await apiClient.get(`/School/Public/${encodeURIComponent(id)}`)
  return normalizeResponse<ApiEnvelope<PublicSchool>>(raw).value
}

export async function getSchoolPublicProfileSettingsApi(
  schoolId: string
): Promise<SchoolPublicProfileSettings> {
  const raw = await apiClient.get(
    `/School/${encodeURIComponent(schoolId)}/PublicProfileSettings`
  )
  return normalizeResponse<ApiEnvelope<SchoolPublicProfileSettings>>(raw).value
}

export async function updateSchoolPublicProfileApi(
  schoolId: string,
  payload: UpdateSchoolPublicProfilePayload
): Promise<SchoolPublicProfileSettings> {
  const raw = await apiClient.put(
    `/School/${encodeURIComponent(schoolId)}/PublicProfile`,
    payload
  )
  return normalizeResponse<ApiEnvelope<SchoolPublicProfileSettings>>(raw).value
}

export async function addSchoolFacilityApi(
  schoolId: string,
  name: string,
  image: File
): Promise<SchoolFacility> {
  const form = new FormData()
  form.append("Name", name)
  form.append("Image", image)
  const raw = await apiClient.post(
    `/School/${encodeURIComponent(schoolId)}/Facilities`,
    form
  )
  return normalizeResponse<ApiEnvelope<SchoolFacility>>(raw).value
}

export async function deleteSchoolFacilityApi(
  schoolId: string,
  facilityId: string
) {
  return apiClient.delete(
    `/School/${encodeURIComponent(schoolId)}/Facilities/${encodeURIComponent(facilityId)}`
  )
}

export async function addSchoolGalleryImagesApi(
  schoolId: string,
  images: File[]
): Promise<SchoolGalleryImage[]> {
  const form = new FormData()
  images.forEach((image) => form.append("Images", image))
  const raw = await apiClient.post(
    `/School/${encodeURIComponent(schoolId)}/Gallery`,
    form
  )
  return normalizeResponse<ApiEnvelope<SchoolGalleryImage[]>>(raw).value
}

export async function deleteSchoolGalleryImageApi(
  schoolId: string,
  imageId: string
) {
  return apiClient.delete(
    `/School/${encodeURIComponent(schoolId)}/Gallery/${encodeURIComponent(imageId)}`
  )
}

export async function getMySchoolRatingApi(
  schoolId: string
): Promise<SchoolRating | null> {
  const raw = await apiClient.get(
    `/School/${encodeURIComponent(schoolId)}/MyRating`
  )
  return normalizeResponse<ApiEnvelope<SchoolRating | null>>(raw).value
}

export async function rateSchoolApi(
  schoolId: string,
  payload: { score: number; comment?: string }
): Promise<SchoolRating> {
  const raw = await apiClient.put(
    `/School/${encodeURIComponent(schoolId)}/Rating`,
    payload
  )
  return normalizeResponse<ApiEnvelope<SchoolRating>>(raw).value
}

export async function getSchoolBlogPostsApi(
  schoolId: string
): Promise<SchoolBlogList> {
  const raw = await apiClient.get(
    `/School/${encodeURIComponent(schoolId)}/BlogPosts`,
    { params: { pageNumber: 1, pageSize: 100 } }
  )
  return normalizeResponse<ApiEnvelope<SchoolBlogList>>(raw).value
}

export async function getPublicSchoolBlogPostsApi(
  schoolId: string,
  pageSize = 12
): Promise<SchoolBlogList> {
  const raw = await apiClient.get(
    `/School/Public/${encodeURIComponent(schoolId)}/BlogPosts`,
    { params: { pageNumber: 1, pageSize } }
  )
  return normalizeResponse<ApiEnvelope<SchoolBlogList>>(raw).value
}

export async function getPublicSchoolBlogPostApi(
  schoolId: string,
  slug: string
): Promise<SchoolBlogPost> {
  const raw = await apiClient.get(
    `/School/Public/${encodeURIComponent(schoolId)}/BlogPosts/${encodeURIComponent(slug)}`
  )
  return normalizeResponse<ApiEnvelope<SchoolBlogPost>>(raw).value
}

function blogPostForm(payload: SchoolBlogPostInput) {
  const form = new FormData()
  form.append("Title", payload.title)
  form.append("Excerpt", payload.excerpt)
  form.append("Content", payload.content)
  form.append("Category", payload.category)
  form.append("AuthorName", payload.authorName)
  form.append("Status", payload.status)
  if (payload.coverImage) form.append("CoverImage", payload.coverImage)
  return form
}

export async function createSchoolBlogPostApi(
  schoolId: string,
  payload: SchoolBlogPostInput
): Promise<SchoolBlogPost> {
  const raw = await apiClient.post(
    `/School/${encodeURIComponent(schoolId)}/BlogPosts`,
    blogPostForm(payload)
  )
  return normalizeResponse<ApiEnvelope<SchoolBlogPost>>(raw).value
}

export async function updateSchoolBlogPostApi(
  schoolId: string,
  postId: string,
  payload: SchoolBlogPostInput
): Promise<SchoolBlogPost> {
  const raw = await apiClient.put(
    `/School/${encodeURIComponent(schoolId)}/BlogPosts/${encodeURIComponent(postId)}`,
    blogPostForm(payload)
  )
  return normalizeResponse<ApiEnvelope<SchoolBlogPost>>(raw).value
}

export async function deleteSchoolBlogPostApi(
  schoolId: string,
  postId: string
) {
  return apiClient.delete(
    `/School/${encodeURIComponent(schoolId)}/BlogPosts/${encodeURIComponent(postId)}`
  )
}

export async function getSchoolPricingApi(
  schoolId: string
): Promise<import("@/types/public-schools").SchoolPricingSettings> {
  const raw = await apiClient.get(
    `/School/${encodeURIComponent(schoolId)}/Pricing`
  )
  return normalizeResponse<
    ApiEnvelope<import("@/types/public-schools").SchoolPricingSettings>
  >(raw).value
}
export async function updateSchoolPricingApi(
  schoolId: string,
  payload: {
    title: string
    content: string
    showPricing: boolean
    action: "draft" | "publish"
  }
) {
  const raw = await apiClient.put(
    `/School/${encodeURIComponent(schoolId)}/Pricing`,
    payload
  )
  return normalizeResponse<
    ApiEnvelope<import("@/types/public-schools").SchoolPricingSettings>
  >(raw).value
}

export async function submitSchoolEnquiryApi(
  schoolId: string,
  payload: SchoolEnquiryInput
) {
  const raw = await apiClient.post(
    `/School/Public/${encodeURIComponent(schoolId)}/Requests`,
    payload
  )
  return normalizeResponse<ApiEnvelope<{ id: string }>>(raw).value
}
export async function getSchoolEnquiriesApi(schoolId: string, pageNumber = 1) {
  const raw = await apiClient.get(
    `/School/${encodeURIComponent(schoolId)}/Requests`,
    { params: { pageNumber } }
  )
  return normalizeResponse<ApiEnvelope<SchoolEnquiryPage>>(raw).value
}
export async function updateSchoolEnquiryStatusApi(
  schoolId: string,
  id: string,
  status: SchoolEnquiry["status"]
) {
  const raw = await apiClient.put(
    `/School/${encodeURIComponent(schoolId)}/Requests/${encodeURIComponent(id)}/Status`,
    { status }
  )
  return normalizeResponse<ApiResultI>(raw)
}
