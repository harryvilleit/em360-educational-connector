import type { TutorCourseI, CourseSectionI } from "@/api/course.api"
import type { SectionWithLessonsI } from "@/api/section.api"
import type { TutorMyProfileI } from "@/api/tutor.api"
import type {
  LmsCourse,
  LmsCourseLevel,
  LmsCourseModule,
  LmsLesson,
  LmsTutorOnboardingProfile,
} from "@/types/elearning"

function levelsFromFlags(course: TutorCourseI): LmsCourseLevel[] {
  const levels: LmsCourseLevel[] = []
  if (course.isBeginner) levels.push("beginner")
  if (course.isIntermediate) levels.push("intermediate")
  if (course.isAdvanced) levels.push("advanced")
  return levels.length ? levels : ["beginner"]
}

function isFreeCourse(course: TutorCourseI): boolean {
  const pricing = String(course.pricingType ?? "").toLowerCase()
  if (pricing === "free" || course.pricingType === 0) return true
  if (pricing === "paid" || course.pricingType === 1) return false
  return (course.price ?? 0) <= 0
}

function detectIntroMediaType(url?: string): "image" | "video" | undefined {
  if (!url) return undefined
  const lower = url.toLowerCase()
  if (/\.(mp4|webm|mov|m4v)(\?|$)/.test(lower) || lower.includes("/videos/"))
    return "video"
  if (
    /\.(png|jpe?g|gif|webp|svg)(\?|$)/.test(lower) ||
    lower.includes("/images/")
  )
    return "image"
  return "image"
}

export function mapTutorCourseToLmsCourse(course: TutorCourseI): LmsCourse {
  const statusRaw = String(
    course.statusName ?? course.status ?? "draft"
  ).toLowerCase()
  const status: LmsCourse["status"] = statusRaw.includes("publish")
    ? "published"
    : statusRaw.includes("archiv")
      ? "archived"
      : "draft"

  const isFree = isFreeCourse(course)

  return {
    id: course.id,
    title: course.title,
    description: course.description ?? "",
    instructor: course.tutorName || course.instructorName || "Instructor",
    categoryId: course.categoryId,
    category: course.categoryName ?? "",
    subcategoryId: course.subCategoryId,
    subcategory: course.subCategoryName,
    topic: course.topic,
    levels: levelsFromFlags(course),
    status,
    isDeleted: course.isDeleted ?? false,
    deletedAtUtc: course.deletedAtUtc ?? undefined,
    enrolledCount: course.enrolledCount ?? 0,
    lessonCount: course.lessonCount ?? course.sections?.length ?? 0,
    duration: course.version || "Self-paced",
    thumbnailColor: "bg-blue-500",
    thumbnailUrl: course.introMediaUrl,
    isFree,
    price: course.price,
    currency: course.currency,

    gradeType: "percentage",
    scoreWeight: 100,
    passScorePercent: course.passScorePercent ?? 50,
    introMediaUrl: course.introMediaUrl,
    introMediaType: detectIntroMediaType(course.introMediaUrl),
    lastUpdated: course.dateModified || course.dateCreated,
    tutorId: course.tutorId,
    isOwner: course.isOwner,
  }
}

export function getTutorCoursePriceLabel(course: LmsCourse): string {
  if (course.isFree) return "Free"
  const amount = Number(course.price ?? 0).toLocaleString()
  const currency = (course.currency || "NGN").toUpperCase()
  if (currency === "NGN") return `₦${amount}`
  if (currency === "USD") return `$${amount}`
  if (currency === "GBP") return `£${amount}`
  if (currency === "EUR") return `€${amount}`
  return `${currency} ${amount}`
}

export function mapCourseSectionsToModules(
  courseId: string,
  sections: Array<CourseSectionI | SectionWithLessonsI> | undefined | null
): LmsCourseModule[] {
  if (!sections?.length) return []

  return sections
    .slice()
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    .map((section, index) => {
      const moduleId = section.id || `mod-${courseId}-${index}`
      const lessons: LmsLesson[] = (section.lessons ?? [])
        .slice()
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
        .map((lesson, lessonIndex) => ({
          id: lesson.id || `les-${moduleId}-${lessonIndex}`,
          moduleId,
          courseId,
          title: lesson.title || `Lesson ${lessonIndex + 1}`,
          type:
            lesson.videoUploadId || lesson.videoUrl || lesson.embedUrl
              ? ("video" as const)
              : ("article" as const),
          duration: lesson.durationInMinutes
            ? `${lesson.durationInMinutes} min`
            : "Self-paced",
          durationMinutes: lesson.durationInMinutes || undefined,
          order: lesson.sortOrder ?? lessonIndex + 1,
          description: lesson.shortDescription || undefined,
          htmlContent: lesson.content || undefined,
          embedUrl: lesson.embedUrl || undefined,
          contentUrl: lesson.videoUrl || undefined,
          videoUploadId: lesson.videoUploadId || undefined,
          videoUploadStatus: lesson.videoUploadStatus || undefined,
          videoUploadSizeBytes: lesson.videoUploadSizeBytes || undefined,
          videoFileName: lesson.videoUploadFileName || undefined,
          materials: (lesson.materials ?? []).map((m, matIndex) => {
            const fileName = m.fileName || "Material"
            const lower = fileName.toLowerCase()
            const type =
              lower.endsWith(".pdf") ||
              (m.fileUrl || "").toLowerCase().includes(".pdf")
                ? ("pdf" as const)
                : /\.(mp4|webm|mov)(\?|$)/i.test(m.fileUrl || "") ||
                    lower.endsWith(".mp4")
                  ? ("video" as const)
                  : ("document" as const)
            return {
              id: m.id || `mat-${moduleId}-${lessonIndex}-${matIndex}`,
              title: fileName,
              type,
              url: m.fileUrl,
              fileName,
            }
          }),
        }))

      return {
        id: moduleId,
        courseId,
        title: section.title || `Section ${index + 1}`,
        order: section.sortOrder ?? index + 1,
        lessons,
      }
    })
}

export function mapMyProfileToLocalTutor(
  profile: TutorMyProfileI
): LmsTutorOnboardingProfile {
  const first = profile.categories?.[0]
  const firstSub = first?.selectedSubCategories?.[0]

  return {
    fullName:
      profile.fullName || `${profile.firstName} ${profile.lastName}`.trim(),
    email: profile.email,
    phone: profile.phoneNumber,
    professionalTitle: profile.professionalTitle,
    bio: profile.bio,
    country: profile.country,
    countryIso: profile.countryCode || "",
    categorySelections: (profile.categories ?? []).map((cat) => ({
      categoryId: cat.categoryId,
      category: cat.categoryName,
      subCategories: (cat.selectedSubCategories ?? []).map((sub) => ({
        id: sub.id,
        name: sub.name,
      })),
    })),
    categoryId: first?.categoryId ?? "",
    category: first?.categoryName ?? "",
    subcategoryId: firstSub?.id ?? "",
    subcategory: firstSub?.name ?? "",
    languages: profile.languages
      ? profile.languages
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [],
    experienceYears: String(profile.yearsOfExperience ?? 0),
    qualifications: profile.qualifications,
    certifications: profile.certifications || undefined,
    identityDocumentType: profile.identityDocumentType,
    identityDocumentLabel: profile.identityDocumentType,
    identityFileName: "identity-document",
    identityFileUrl: profile.identityDocumentUrl,
    hourlyRate: profile.hourlyRate,
    currency: profile.currency || "NGN",
    cvFileName: "cv",
    cvFileUrl: profile.cvUrl,
    introVideoUrl: profile.introVideoUrl || undefined,
    portfolioUrl: profile.portfolioUrl || undefined,
    phoneVerified: true,
    completedAt: profile.dateCreated || new Date().toISOString(),
  }
}
