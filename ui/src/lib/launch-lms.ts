import { DashboardRoutes } from "@/routes"
import type { Menu } from "@/types"
import type { LmsRole } from "@/types/elearning"

export const LMS_PRODUCT_SLUG = "e-learning-lms"
export const LMS_DEMO_SCHOOL_ID = "00000000-0000-0000-0000-000000000001"

const tutorMenus: Menu[] = [
  { id: "lms_overview", name: "Overview", path: "/dashboard/lms" },
  { id: "lms_courses", name: "My Courses", path: "/dashboard/lms/courses" },
  {
    id: "lms_packages",
    name: "Course Packages",
    path: "/dashboard/lms/packages",
  },
  {
    id: "lms_live",
    name: "Live Classes",
    path: "/dashboard/lms/live-classes",
  },
  {
    id: "lms_conferences",
    name: "Conferences",
    path: "/dashboard/lms/conferences",
  },
  {
    id: "lms_earnings",
    name: "Earnings & Payout Account",
    path: "/dashboard/lms/earnings",
  },
  {
    id: "lms_agreement",
    name: "Agreement & Earnings",
    path: "/dashboard/lms/agreement-and-earnings",
  },
  {
    id: "lms_school_assignments",
    name: "School Invitations",
    path: "/dashboard/lms/school-assignments",
  },
  {
    id: "lms_organization",
    name: "Organization",
    path: "/dashboard/lms/organization",
  },
  { id: "lms_reports", name: "Reports", path: "/dashboard/lms/reports" },
]

const studentMenus: Menu[] = [
  { id: "lms_overview", name: "Overview", path: "/dashboard/lms" },
  {
    id: "lms_my_courses",
    name: "My Courses",
    path: "/dashboard/lms/my-courses",
  },
  { id: "lms_tutors", name: "Find Tutors", path: "/dashboard/lms/tutors" },
]

export function createLmsModule(role: LmsRole = "tutor") {
  return {
    id: "lms",
    name: "E-Learning / LMS",
    menus: role === "student" ? studentMenus : tutorMenus,
  }
}

export function getLmsDashboardPath() {
  return DashboardRoutes.toLms(LMS_PRODUCT_SLUG)
}

export { parseLmsCourseIdFromPath } from "@/store/lmsActiveCourse.store"
