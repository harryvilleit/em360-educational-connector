import { FileText, Mic, MonitorCheck, PlayCircle, type LucideIcon } from "lucide-react"
import { LMS_ASSIGNMENT_TYPE_LABELS } from "@/data/lms-options"
import {
  isYouTubeEmbedUrl,
  lessonDurationMinutes,
  toEmbedPlaybackUrl,
} from "@/utils/lmsDuration"
import type {
  LmsCourseModule,
  LmsLesson,
  LmsLessonMaterial,
  LmsLessonMediaPreview,
  LmsLessonMediaPreviewKind,
} from "@/types/elearning"

export function lessonHasVideo(lesson: LmsLesson): boolean {
  return Boolean(lesson.contentUrl?.trim() || lesson.embedUrl?.trim())
}

export function getLessonTypeLabel(lesson: LmsLesson): string {
  if (lessonHasVideo(lesson) || lesson.type === "video") return "Video"
  if (lesson.assignmentType) {
    return `Assignment · ${LMS_ASSIGNMENT_TYPE_LABELS[lesson.assignmentType]}`
  }
  return lesson.type.charAt(0).toUpperCase() + lesson.type.slice(1)
}

export function getLessonDisplayIcon(lesson: LmsLesson): LucideIcon {
  if (lessonHasVideo(lesson) || lesson.type === "video") return PlayCircle
  if (lesson.type === "quiz") return MonitorCheck
  if (lesson.type === "live") return Mic
  return FileText
}

export function getLessonVideoSrc(lesson: LmsLesson): string {
  const url = lesson.embedUrl?.trim() || lesson.contentUrl?.trim() || ""
  return isYouTubeEmbedUrl(url) ? toEmbedPlaybackUrl(url) : url
}

export function isLessonEmbedPlayback(lesson: LmsLesson, videoSrc: string): boolean {
  if (lesson.embedUrl?.trim()) return true
  return /youtube|youtu\.be|vimeo/i.test(videoSrc)
}

export function lessonHasDetails(lesson: LmsLesson): boolean {
  return lessonHasVideo(lesson) || (lesson.materials?.length ?? 0) > 0
}

export function getCurriculumTotals(modules: LmsCourseModule[]) {
  const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0)
  const totalDurationMinutes = modules
    .flatMap((m) => m.lessons)
    .reduce((sum, l) => sum + lessonDurationMinutes(l), 0)
  return { totalLessons, totalDurationMinutes }
}

export function getSectionDurationMinutes(module: LmsCourseModule): number {
  return module.lessons.reduce((sum, l) => sum + lessonDurationMinutes(l), 0)
}

export function materialToMediaPreview(
  material: LmsLessonMaterial
): LmsLessonMediaPreview | null {
  if (!material.url) return null

  const kind: LmsLessonMediaPreviewKind =
    material.type === "pdf"
      ? "pdf"
      : material.type === "video"
        ? "video"
        : material.type === "link"
          ? "link"
          : "document"

  return {
    title: material.title,
    url: material.url,
    kind,
    fileName: material.fileName,
  }
}

export function lessonVideoToMediaPreview(
  lesson: LmsLesson
): LmsLessonMediaPreview | null {
  const url = getLessonVideoSrc(lesson)
  if (!url) return null

  return {
    title: lesson.title,
    url,
    kind:
      isYouTubeEmbedUrl(url) || /vimeo/i.test(url) ? "embed" : "video",
  }
}

export function buildInitialExpandMap(
  ids: string[],
  defaultOpen = false
): Record<string, boolean> {
  return Object.fromEntries(ids.map((id) => [id, defaultOpen]))
}
