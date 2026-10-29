import { useCallback, useMemo, useState } from "react"
import {
  buildInitialExpandMap,
  getCurriculumTotals,
  lessonVideoToMediaPreview,
  materialToMediaPreview,
} from "@/lib/lms-lesson-display"
import type {
  LmsCourseModule,
  LmsExpandStateMap,
  LmsLesson,
  LmsLessonMaterial,
  LmsLessonMediaPreview,
} from "@/types/elearning"

type UseCourseCurriculumOptions = {
  modules: LmsCourseModule[]
  onLessonClick: (lesson: LmsLesson) => void
  onViewLesson?: (lesson: LmsLesson) => void
}

export function useCourseCurriculum({
  modules,
  onLessonClick,
  onViewLesson,
}: UseCourseCurriculumOptions) {
  const [expandedSections, setExpandedSections] = useState<LmsExpandStateMap>(() =>
    buildInitialExpandMap(modules.map((m) => m.id))
  )
  const [expandedLessons, setExpandedLessons] = useState<LmsExpandStateMap>(() =>
    buildInitialExpandMap(modules.flatMap((m) => m.lessons.map((l) => l.id)))
  )
  const [preview, setPreview] = useState<LmsLessonMediaPreview | null>(null)

  const { totalLessons, totalDurationMinutes } = useMemo(
    () => getCurriculumTotals(modules),
    [modules]
  )

  const isSectionOpen = useCallback(
    (sectionId: string) => expandedSections[sectionId] ?? false,
    [expandedSections]
  )

  const isLessonOpen = useCallback(
    (lessonId: string) => expandedLessons[lessonId] ?? false,
    [expandedLessons]
  )

  const setSectionOpen = useCallback((sectionId: string, open: boolean) => {
    setExpandedSections((prev) => ({ ...prev, [sectionId]: open }))
  }, [])

  const setLessonOpen = useCallback((lessonId: string, open: boolean) => {
    setExpandedLessons((prev) => ({ ...prev, [lessonId]: open }))
  }, [])

  const handleViewLesson = useCallback(
    (lesson: LmsLesson) => {
      ;(onViewLesson ?? onLessonClick)(lesson)
    },
    [onLessonClick, onViewLesson]
  )

  const openMaterialPreview = useCallback((material: LmsLessonMaterial) => {
    const next = materialToMediaPreview(material)
    if (next) setPreview(next)
  }, [])

  const openLessonVideoPreview = useCallback((lesson: LmsLesson) => {
    const next = lessonVideoToMediaPreview(lesson)
    if (next) setPreview(next)
  }, [])

  const closePreview = useCallback(() => setPreview(null), [])

  return {
    totalLessons,
    totalDurationMinutes,
    preview,
    isSectionOpen,
    isLessonOpen,
    setSectionOpen,
    setLessonOpen,
    handleViewLesson,
    openMaterialPreview,
    openLessonVideoPreview,
    closePreview,
  }
}
