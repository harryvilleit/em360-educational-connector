import type { SchoolSubjectCourse } from "@/types/elearning"

export interface CourseFilters {
  className: string
  term: string
  search: string
}

export const DEFAULT_COURSE_FILTERS: CourseFilters = {
  className: "all",
  term: "3rd Term",
  search: "",
}

export function filterCourses(
  courses: SchoolSubjectCourse[],
  filters: CourseFilters
): SchoolSubjectCourse[] {
  const query = filters.search.trim().toLowerCase()

  return courses.filter((course) => {
    if (filters.className !== "all") {
      const byId = course.classId && course.classId === filters.className
      const byName = course.className === filters.className
      if (!byId && !byName) return false
    }

    if (filters.term !== "all" && course.terms?.length) {
      if (!course.terms.includes(filters.term)) return false
    }

    if (query) {
      const haystack = [course.subject, course.className, course.teacherName, course.description]
        .join(" ")
        .toLowerCase()
      if (!haystack.includes(query)) return false
    }

    return true
  })
}

export function parseCourseFilters(params: URLSearchParams): CourseFilters {
  return {
    className: params.get("class") ?? DEFAULT_COURSE_FILTERS.className,
    term: params.get("term") ?? DEFAULT_COURSE_FILTERS.term,
    search: params.get("search") ?? "",
  }
}

export function courseFiltersToParams(filters: CourseFilters): Record<string, string> {
  const params: Record<string, string> = {}

  if (filters.className !== "all") params.class = filters.className
  if (filters.term !== "all") params.term = filters.term
  if (filters.search.trim()) params.search = filters.search.trim()

  return params
}
