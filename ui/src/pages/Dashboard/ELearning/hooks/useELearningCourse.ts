import { useMemo } from "react"
import { useELearningStore } from "@/store/elearning.store"
import type { SchoolSubjectCourse } from "@/types/elearning"

export function useELearningCourse(courseId?: string) {
  const courses = useELearningStore((s) => s.courses)
  const curriculum = useELearningStore((s) => s.curriculum)

  const course = useMemo(
    () => courses.find((c) => c.id === courseId),
    [courses, courseId]
  )

  const modules = useMemo(
    () =>
      courseId
        ? curriculum
            .filter((m) => m.courseId === courseId)
            .sort((a, b) => a.order - b.order)
        : [],
    [courseId, curriculum]
  )

  return { course, modules, courseId }
}

export type SchoolCourseInput = Omit<SchoolSubjectCourse, "id">
