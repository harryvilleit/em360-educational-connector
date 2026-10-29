import { create } from "zustand"
import { persist } from "zustand/middleware"

interface LmsActiveCourseState {
  courseId: string | null
  setActiveCourse: (courseId: string | null) => void
}

export const useLmsActiveCourseStore = create<LmsActiveCourseState>()(
  persist(
    (set) => ({
      courseId: null,
      setActiveCourse: (courseId) =>
        set((state) =>
          state.courseId === courseId ? state : { courseId }
        ),
    }),
    { name: "lms-active-course" }
  )
)

export function parseLmsCourseIdFromPath(pathname: string): string | undefined {
  const match = pathname.match(/\/lms\/courses\/([^/]+)/)
  const id = match?.[1]
  if (!id || id === "create") return undefined
  return id
}
