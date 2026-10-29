import { z } from "zod"

const fileRequired = (message: string) =>
  z.custom<File | null>((val) => val instanceof File, { message })

export const TutorCategorySelectionSchema = z.object({
  categoryId: z.string().min(1),
  subCategoryIds: z.array(z.string()).min(1),
})

export const TutorOnboardingProfileSchema = z
  .object({
    fullName: z.string().trim().min(1, "Full name is required"),
    email: z.email("Enter a valid email address"),
    phone: z.string().trim().min(1, "Phone number is required"),
    professionalTitle: z.string().trim().min(1, "Professional title is required"),
    bio: z.string().trim().min(1, "Bio is required"),
    countryIso: z.string().trim().min(1, "Country is required"),
    country: z.string().trim().min(1, "Country is required"),
    categorySelections: z
      .array(TutorCategorySelectionSchema)
      .min(1, "Select at least one category and subcategory"),
    languages: z.string(),
    identityDocumentType: z.string().min(1, "Select your means of identity"),
    identityFile: fileRequired("Upload your identity document"),
    identityDocumentUrl: z.string(),
    experienceYears: z.string().trim().min(1, "Years of experience is required"),
    qualifications: z.string().trim().min(1, "Qualifications are required"),
    certifications: z.string(),
    hourlyRate: z
      .string()
      .trim()
      .min(1, "Hourly rate is required")
      .refine((value) => Number(value) > 0, "Please set a valid hourly rate"),
    currency: z.enum(["NGN", "USD", "GBP", "EUR"]),
    portfolioUrl: z.string(),
    cvFile: fileRequired("Upload your CV / resume"),
    cvUrl: z.string(),
    introVideoFile: z.custom<File | null>(
      (val) => val === null || val instanceof File
    ),
    introVideoUrl: z.string(),
  })
  .superRefine((values, ctx) => {
    if (!values.identityDocumentUrl.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["identityFile"],
        message: "Wait for identity document upload to finish",
      })
    }
    if (!values.cvUrl.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["cvFile"],
        message: "Wait for CV upload to finish",
      })
    }
  })

export type TutorOnboardingProfileFormValues = z.infer<
  typeof TutorOnboardingProfileSchema
>

export function getTutorOnboardingDefaultValues(
  defaultName = "",
  defaultEmail = ""
): TutorOnboardingProfileFormValues {
  return {
    fullName: defaultName,
    email: defaultEmail,
    phone: "",
    professionalTitle: "",
    bio: "",
    countryIso: "",
    country: "",
    categorySelections: [],
    languages: "English",
    identityDocumentType: "",
    identityFile: null,
    identityDocumentUrl: "",
    experienceYears: "",
    qualifications: "",
    certifications: "",
    hourlyRate: "",
    currency: "USD",
    portfolioUrl: "",
    cvFile: null,
    cvUrl: "",
    introVideoFile: null,
    introVideoUrl: "",
  }
}
