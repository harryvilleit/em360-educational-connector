import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  addSchoolFacilityApi,
  addSchoolGalleryImagesApi,
  deleteSchoolFacilityApi,
  deleteSchoolGalleryImageApi,
  getMySchoolRatingApi,
  getPublicSchoolApi,
  getSchoolPublicProfileSettingsApi,
  rateSchoolApi,
  searchPublicSchoolsApi,
  updateSchoolPublicProfileApi,
  createSchoolBlogPostApi,
  deleteSchoolBlogPostApi,
  getPublicSchoolBlogPostApi,
  getPublicSchoolBlogPostsApi,
  getSchoolBlogPostsApi,
  updateSchoolBlogPostApi,
} from "@/api/publicSchools.api"
import type {
  PublicSchoolSearchParams,
  UpdateSchoolPublicProfilePayload,
} from "@/types/public-schools"
import type { SchoolBlogPostInput } from "@/types/school-blog"

export const publicSchoolKeys = {
  all: ["public-schools"] as const,
  search: (params: PublicSchoolSearchParams) =>
    [...publicSchoolKeys.all, "search", params] as const,
  detail: (schoolId: string) =>
    [...publicSchoolKeys.all, "detail", schoolId] as const,
  settings: (schoolId: string) =>
    [...publicSchoolKeys.all, "settings", schoolId] as const,
  myRating: (schoolId: string) =>
    [...publicSchoolKeys.all, "my-rating", schoolId] as const,
  blogAdmin: (schoolId: string) =>
    [...publicSchoolKeys.all, "blog-admin", schoolId] as const,
  blogPublic: (schoolId: string) =>
    [...publicSchoolKeys.all, "blog-public", schoolId] as const,
  blogPost: (schoolId: string, slug: string) =>
    [...publicSchoolKeys.all, "blog-post", schoolId, slug] as const,
}

export function useSchoolBlogPosts(schoolId?: string) {
  return useQuery({
    queryKey: publicSchoolKeys.blogAdmin(schoolId ?? ""),
    queryFn: () => getSchoolBlogPostsApi(schoolId!),
    enabled: Boolean(schoolId),
  })
}

export function usePublicSchoolBlogPosts(schoolId?: string, pageSize = 12) {
  return useQuery({
    queryKey: [...publicSchoolKeys.blogPublic(schoolId ?? ""), pageSize],
    queryFn: () => getPublicSchoolBlogPostsApi(schoolId!, pageSize),
    enabled: Boolean(schoolId),
    staleTime: 60_000,
  })
}

export function usePublicSchoolBlogPost(schoolId?: string, slug?: string) {
  return useQuery({
    queryKey: publicSchoolKeys.blogPost(schoolId ?? "", slug ?? ""),
    queryFn: () => getPublicSchoolBlogPostApi(schoolId!, slug!),
    enabled: Boolean(schoolId && slug),
    staleTime: 60_000,
  })
}

function useRefreshSchoolBlog(schoolId: string) {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: publicSchoolKeys.blogAdmin(schoolId) })
    queryClient.invalidateQueries({ queryKey: publicSchoolKeys.blogPublic(schoolId) })
  }
}

export function useCreateSchoolBlogPost(schoolId: string) {
  const refresh = useRefreshSchoolBlog(schoolId)
  return useMutation({
    mutationFn: (payload: SchoolBlogPostInput) => createSchoolBlogPostApi(schoolId, payload),
    onSuccess: (_, payload) => {
      refresh()
      toast.success(payload.status === "Published" ? "Blog post published" : "Draft saved")
    },
    onError: (error: Error) => toast.error(error.message),
  })
}

export function useUpdateSchoolBlogPost(schoolId: string) {
  const refresh = useRefreshSchoolBlog(schoolId)
  return useMutation({
    mutationFn: ({ postId, payload }: { postId: string; payload: SchoolBlogPostInput }) =>
      updateSchoolBlogPostApi(schoolId, postId, payload),
    onSuccess: () => {
      refresh()
      toast.success("Blog post updated")
    },
    onError: (error: Error) => toast.error(error.message),
  })
}

export function useDeleteSchoolBlogPost(schoolId: string) {
  const refresh = useRefreshSchoolBlog(schoolId)
  return useMutation({
    mutationFn: (postId: string) => deleteSchoolBlogPostApi(schoolId, postId),
    onSuccess: () => {
      refresh()
      toast.success("Blog post deleted")
    },
    onError: (error: Error) => toast.error(error.message),
  })
}

export function usePublicSchoolSearch(params: PublicSchoolSearchParams) {
  return useQuery({
    queryKey: publicSchoolKeys.search(params),
    queryFn: () => searchPublicSchoolsApi(params),
    staleTime: 60_000,
  })
}

export function usePublicSchool(schoolId?: string) {
  return useQuery({
    queryKey: publicSchoolKeys.detail(schoolId ?? ""),
    queryFn: () => getPublicSchoolApi(schoolId!),
    enabled: Boolean(schoolId),
    staleTime: 60_000,
  })
}

export function useSchoolPublicProfileSettings(schoolId?: string) {
  return useQuery({
    queryKey: publicSchoolKeys.settings(schoolId ?? ""),
    queryFn: () => getSchoolPublicProfileSettingsApi(schoolId!),
    enabled: Boolean(schoolId),
  })
}

function useRefreshSchoolSettings(schoolId: string) {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({
      queryKey: publicSchoolKeys.settings(schoolId),
    })
    queryClient.invalidateQueries({
      queryKey: publicSchoolKeys.detail(schoolId),
    })
    queryClient.invalidateQueries({ queryKey: publicSchoolKeys.all })
  }
}

export function useUpdateSchoolPublicProfile(schoolId: string) {
  const refresh = useRefreshSchoolSettings(schoolId)
  return useMutation({
    mutationFn: (payload: UpdateSchoolPublicProfilePayload) =>
      updateSchoolPublicProfileApi(schoolId, payload),
    onSuccess: () => {
      refresh()
      toast.success("Public school page updated")
    },
    onError: (error: Error) => toast.error(error.message),
  })
}

export function useAddSchoolFacility(schoolId: string) {
  const refresh = useRefreshSchoolSettings(schoolId)
  return useMutation({
    mutationFn: ({ name, image }: { name: string; image: File }) =>
      addSchoolFacilityApi(schoolId, name, image),
    onSuccess: () => {
      refresh()
      toast.success("Facility added")
    },
    onError: (error: Error) => toast.error(error.message),
  })
}

export function useDeleteSchoolFacility(schoolId: string) {
  const refresh = useRefreshSchoolSettings(schoolId)
  return useMutation({
    mutationFn: (facilityId: string) =>
      deleteSchoolFacilityApi(schoolId, facilityId),
    onSuccess: () => {
      refresh()
      toast.success("Facility removed")
    },
    onError: (error: Error) => toast.error(error.message),
  })
}

export function useAddSchoolGalleryImages(schoolId: string) {
  const refresh = useRefreshSchoolSettings(schoolId)
  return useMutation({
    mutationFn: (images: File[]) => addSchoolGalleryImagesApi(schoolId, images),
    onSuccess: () => {
      refresh()
      toast.success("Gallery updated")
    },
    onError: (error: Error) => toast.error(error.message),
  })
}

export function useDeleteSchoolGalleryImage(schoolId: string) {
  const refresh = useRefreshSchoolSettings(schoolId)
  return useMutation({
    mutationFn: (imageId: string) =>
      deleteSchoolGalleryImageApi(schoolId, imageId),
    onSuccess: () => {
      refresh()
      toast.success("Gallery image removed")
    },
    onError: (error: Error) => toast.error(error.message),
  })
}

export function useMySchoolRating(schoolId?: string) {
  return useQuery({
    queryKey: publicSchoolKeys.myRating(schoolId ?? ""),
    queryFn: () => getMySchoolRatingApi(schoolId!),
    enabled: Boolean(schoolId),
    retry: false,
  })
}

export function useRateSchool(schoolId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { score: number; comment?: string }) =>
      rateSchoolApi(schoolId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: publicSchoolKeys.myRating(schoolId),
      })
      queryClient.invalidateQueries({
        queryKey: publicSchoolKeys.detail(schoolId),
      })
      queryClient.invalidateQueries({ queryKey: publicSchoolKeys.all })
      toast.success("Your rating was saved")
    },
    onError: (error: Error) => toast.error(error.message),
  })
}
