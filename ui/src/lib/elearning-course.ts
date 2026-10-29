import type { SchoolSubjectCourse } from "@/types/elearning"

type CourseScoped = {
  courseId?: string
  subject?: string
  className?: string
}

export function belongsToCourse(
  item: CourseScoped,
  course: SchoolSubjectCourse
) {
  if (item.courseId) return item.courseId === course.id
  return item.subject === course.subject && item.className === course.className
}

export function filterByCourse<T extends CourseScoped>(
  items: T[],
  course: SchoolSubjectCourse
) {
  return items.filter((item) => belongsToCourse(item, course))
}
