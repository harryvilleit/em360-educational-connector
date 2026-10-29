import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  createTutorProfileApi,
  getPublicTutorApi,
  getTutorMyProfileApi,
  searchPublicTutorsApi,
  type CreateTutorProfilePayloadI,
  type CreateTutorProfileResponseI,
  type TutorMyProfileI,
  type TutorMyProfileResponseI,
  type PublicTutorI,
  type PublicTutorSearchParamsI,
  type PublicTutorSearchResponseI,
  type PublicTutorResponseI,
} from "@/api/tutor.api"
import type { TutorOnboardingProfileFormValues } from "@/schema/tutorOnboarding.schema"
import { getIdentityDocumentLabel } from "@/data/tutor-identity-documents"
import type { CountryCode } from "@/utils/phone"
import type { LmsTutor, LmsTutorOnboardingProfile } from "@/types/elearning"
import type { LmsCategory } from "@/types/elearning"
import { mapMyProfileToLocalTutor } from "@/lib/elearning-mappers"
import { queryKeys } from "@/utils/queryKeys"

type TutorDocumentUrls = {
  cvUrl: string
  identityDocumentUrl: string
  introVideoUrl?: string
}

type UseCreateTutorProfileOptions = {
  onSuccess?: (
    data: CreateTutorProfileResponseI,
    profile: LmsTutorOnboardingProfile
  ) => void | Promise<void>
  onError?: (error: Error) => void
}

export function buildCreateTutorProfilePayload(
  values: TutorOnboardingProfileFormValues,
  urls: TutorDocumentUrls
): CreateTutorProfilePayloadI {
  return {
    email: values.email.trim(),
    professionalTitle: values.professionalTitle.trim(),
    bio: values.bio.trim(),
    country: values.country.trim(),
    countryCode: values.countryIso,
    languages: values.languages
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .join(", "),
    categorySelections: values.categorySelections.map((sel) => ({
      categoryId: sel.categoryId,
      subCategoryIds: sel.subCategoryIds,
    })),
    yearsOfExperience: Number(values.experienceYears) || 0,
    qualifications: values.qualifications.trim(),
    certifications: values.certifications?.trim() || "",
    hourlyRate: Number(values.hourlyRate) || 0,
    currency: values.currency,
    portfolioUrl: values.portfolioUrl?.trim() || "",
    cvUrl: urls.cvUrl,
    introVideoUrl: urls.introVideoUrl || "",
    phoneNumber: values.phone.trim(),
    identityDocumentType: values.identityDocumentType,
    identityDocumentUrl: urls.identityDocumentUrl,
  }
}

export function buildLocalTutorProfile(
  values: TutorOnboardingProfileFormValues,
  categories: LmsCategory[],
  urls: TutorDocumentUrls
): LmsTutorOnboardingProfile {
  const identityFile = values.identityFile!
  const cvFile = values.cvFile!
  const categorySelections = values.categorySelections.map((sel) => {
    const cat = categories.find((c) => c.id === sel.categoryId)
    return {
      categoryId: sel.categoryId,
      category: cat?.name ?? "",
      subCategories: sel.subCategoryIds.map((subId) => {
        const sub = cat?.subcategories.find((s) => s.id === subId)
        return { id: subId, name: sub?.name ?? "" }
      }),
    }
  })
  const first = categorySelections[0]
  const firstSub = first?.subCategories[0]

  return {
    fullName: values.fullName.trim(),
    email: values.email.trim(),
    phone: values.phone.trim(),
    professionalTitle: values.professionalTitle.trim(),
    bio: values.bio.trim(),
    country: values.country.trim(),
    countryIso: values.countryIso,
    categorySelections,
    categoryId: first?.categoryId ?? "",
    category: first?.category ?? "",
    subcategoryId: firstSub?.id ?? "",
    subcategory: firstSub?.name ?? "",
    languages: values.languages
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    experienceYears: values.experienceYears.trim(),
    qualifications: values.qualifications.trim(),
    certifications: values.certifications?.trim() || undefined,
    identityDocumentType: values.identityDocumentType,
    identityDocumentLabel: getIdentityDocumentLabel(
      values.countryIso as CountryCode | "",
      values.identityDocumentType
    ),
    identityFileName: identityFile.name,
    identityFileUrl: urls.identityDocumentUrl,
    hourlyRate: Number(values.hourlyRate),
    currency: values.currency,
    cvFileName: cvFile.name,
    cvFileUrl: urls.cvUrl,
    introVideoFileName: values.introVideoFile?.name,
    introVideoUrl: urls.introVideoUrl || undefined,
    portfolioUrl: values.portfolioUrl?.trim() || undefined,
    phoneVerified: true,
    completedAt: new Date().toISOString(),
  }
}

type SubmitTutorProfileInput = {
  values: TutorOnboardingProfileFormValues
  categories: LmsCategory[]
}

export const useCreateTutorProfile = ({
  onSuccess,
  onError,
}: UseCreateTutorProfileOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<
      {
        response: CreateTutorProfileResponseI
        profile: LmsTutorOnboardingProfile
        myProfile: TutorMyProfileI | null
      },
      Error,
      SubmitTutorProfileInput
    >({
      mutationFn: async ({ values, categories }) => {
        const urls: TutorDocumentUrls = {
          cvUrl: values.cvUrl,
          identityDocumentUrl: values.identityDocumentUrl,
          introVideoUrl: values.introVideoUrl || undefined,
        }

        if (!urls.cvUrl || !urls.identityDocumentUrl) {
          throw new Error(
            "Upload your CV and identity document before submitting"
          )
        }

        const payload = buildCreateTutorProfilePayload(values, urls)
        const response = await createTutorProfileApi(payload)

        let myProfile: TutorMyProfileI | null = null
        try {
          const myProfileRes = await getTutorMyProfileApi()
          myProfile = myProfileRes.value
        } catch {
          myProfile = null
        }

        const profile = myProfile
          ? mapMyProfileToLocalTutor(myProfile)
          : buildLocalTutorProfile(values, categories, urls)

        return { response, profile, myProfile }
      },
      onSuccess: async ({ response, profile }) => {
        queryClient.invalidateQueries({ queryKey: [queryKeys.tutorMyProfile] })
        toast.success(
          response.message || "Tutor profile created successfully"
        )
        await onSuccess?.(response, profile)
      },
      onError: (err) => {
        toast.error(err?.message ?? "Failed to create tutor profile")
        onError?.(err)
      },
    })

  return {
    createTutorProfile: mutate,
    createTutorProfileAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

export const useTutorMyProfile = (enabled = true) => {
  const { data, isPending, isError, error, isSuccess, refetch, isFetching } =
    useQuery<TutorMyProfileResponseI>({
      queryKey: [queryKeys.tutorMyProfile],
      queryFn: getTutorMyProfileApi,
      enabled,
      staleTime: 2 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: false,
    })

  const myProfile = data?.value ?? null
  const localProfile = myProfile ? mapMyProfileToLocalTutor(myProfile) : null
  const profileMissing =
    Boolean(data) && (data?.value == null || data?.isSuccess === false)

  return {
    myProfile,
    localProfile,
    hasProfile: Boolean(myProfile?.id),
    profileMissing,
    isPendingApproval: isTutorProfilePending(myProfile),
    profileCategories: mapTutorProfileCategoriesToLms(myProfile),
    isLoading: isPending,
    isPending,
    isFetching,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

export function mapTutorProfileCategoriesToLms(
  profile: TutorMyProfileI | null | undefined
): LmsCategory[] {
  if (!profile?.categories?.length) return []

  return profile.categories.map((cat) => ({
    id: cat.categoryId,
    name: cat.categoryName,
    subcategories: (cat.selectedSubCategories ?? [])
      .filter((sub) => sub.isActive !== false)
      .map((sub) => ({
        id: sub.id,
        name: sub.name,
        topics: [],
      })),
  }))
}

export function isTutorProfilePending(
  profile: TutorMyProfileI | null | undefined
): boolean {
  if (!profile) return false
  const raw = String(profile.statusName ?? profile.status ?? "")
    .trim()
    .toLowerCase()
  return raw === "pending"
}

export function mapPublicTutorToLmsTutor(tutor: PublicTutorI): LmsTutor {
  return {
    id: tutor.id,
    name: tutor.fullName,
    title: tutor.professionalTitle,
    avatarColor: "bg-blue-600",
    subjects: tutor.subjects ?? [],
    rating: 0,
    reviewCount: 0,
    sessionsCompleted: 0,
    hourlyRate: tutor.hourlyRate,
    currency: tutor.currency,
    bio: tutor.bio,
    languages: tutor.languages ?? [],
    experience: `${tutor.yearsOfExperience} year${tutor.yearsOfExperience === 1 ? "" : "s"}`,
    availability: [],
    country: tutor.country,
    verified: tutor.isVerified,
    introVideoUrl: tutor.introVideoUrl || undefined,
    qualifications: tutor.qualifications
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
    certifications: tutor.certifications
      ? tutor.certifications
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean)
      : [],
    teachingLevels: [],
    isOnline: false,
    isFree: tutor.hourlyRate <= 0,
    publishedCourses: (tutor.publishedCourses ?? []).map((course) => ({
      courseId: course.id,
      title: course.title,
    })),
  }
}

export const usePublicTutors = (
  filters: PublicTutorSearchParamsI = {},
  enabled = true
) => {
  const query = useQuery<PublicTutorSearchResponseI>({
    queryKey: ["lms", "public-tutors", filters],
    queryFn: () => searchPublicTutorsApi(filters),
    enabled,
    staleTime: 2 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  })
  const raw = query.data?.value?.items ?? []
  return {
    ...query,
    raw,
    tutors: raw.map(mapPublicTutorToLmsTutor),
    totalItems: query.data?.value?.totalItems ?? 0,
  }
}

export const usePublicTutor = (tutorId?: string) => {
  const query = useQuery<PublicTutorResponseI>({
    queryKey: ["lms", "public-tutor", tutorId],
    queryFn: () => getPublicTutorApi(tutorId!),
    enabled: Boolean(tutorId),
    staleTime: 2 * 60 * 1000,
  })
  const raw = query.data?.value ?? null
  return {
    ...query,
    raw,
    tutor: raw ? mapPublicTutorToLmsTutor(raw) : null,
  }
}
