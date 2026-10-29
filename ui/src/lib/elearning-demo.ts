import type { SchoolSubjectCourse } from "@/types/elearning"

/** Id of the built-in demo course; full curriculum / lesson UI uses this id only. */
export const DEMO_SCHOOL_COURSE_ID = "course-math-ss2a"

export function isDemoSchoolCourse(courseId?: string | null): boolean {
  return courseId === DEMO_SCHOOL_COURSE_ID
}

export type ApiCourseDetailState = {
  apiCourse?: SchoolSubjectCourse
  teacherSubUserId?: string
  readOnly?: boolean
}
