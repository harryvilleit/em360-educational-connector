// Menu URLs come from the school permission matrix, not from display labels.
// Keep normalization separate from authorization: a known route still needs a grant.

/** Which staff-portal module the frame was opened for (set by the plugin in the runtime block). */
export type PortalModule =
  | "users"
  | "students"
  | "parents"
  | "exams"
  | "fees"
  | "elearning"
  | "timetable"
  | "attendance"
  | "hostel"
  | "staff"

export const userManagementPaths = [
  "/dashboard/users",
  "/dashboard/users/dashboard",
  "/dashboard/users/job-roles",
  "/dashboard/users/manage",
  "/dashboard/users/id-cards",
  "/dashboard/users/attendance",
  "/dashboard/users/consent",
  "/dashboard/users/visitation",
  "/dashboard/users/chat",
  "/dashboard/users/notifications",
  "/dashboard/users/academic",
  "/dashboard/users/settings",
] as const

export const studentPaths = [
  "/dashboard/students",
  "/dashboard/students/list",
  "/dashboard/students/add",
  "/dashboard/students/import",
] as const

export const parentPaths = [
  "/dashboard/parents",
  "/dashboard/parents/list",
  "/dashboard/parents/add",
  "/dashboard/parents/consent",
  "/dashboard/parents/fees",
  "/dashboard/parents/visitation",
  "/dashboard/parents/transcript",
] as const

export const examsPaths = [
  "/dashboard/exams_and_records",
  "/dashboard/exams_and_records/classes",
  "/dashboard/exams_and_records/subjects",
  "/dashboard/exams_and_records/categories",
  "/dashboard/exams_and_records/departments",
  "/dashboard/exams_and_records/manage-teachers",
  "/dashboard/exams_and_records/grade-book-settings",
  "/dashboard/exams_and_records/grade-entry",
  "/dashboard/exams_and_records/view-results",
  "/dashboard/exams_and_records/manage-class-results",
  "/dashboard/exams_and_records/promote-students",
  "/dashboard/exams_and_records/broadsheet",
  "/dashboard/exams_and_records/student-grade-entry",
  "/dashboard/exams_and_records/approve-grades",
] as const

export const feePaths = [
  "/dashboard/fees",
  "/dashboard/fees/online-payments",
  "/dashboard/fees/online-payment-setup",
  "/dashboard/fees/payment-disputes",
  "/dashboard/fees/payment-settlements",
  "/dashboard/fees/invoice/generate",
  "/dashboard/fees/payment-types/create",
  "/dashboard/fees/payment-items",
  "/dashboard/fees/bills",
  "/dashboard/fees/payment-reminder",
  "/dashboard/fees/book-keeping",
  "/dashboard/fees/transaction-types",
  "/dashboard/fees/class-fee-payments",
  "/dashboard/fees/payment-methods",
  "/dashboard/school-learning",
] as const

export const elearningPaths = [
  "/dashboard/elearning",
  "/dashboard/elearning/courses",
  "/dashboard/elearning/live-classes",
  "/dashboard/elearning/lesson-notes",
] as const

export const timetablePaths = [
  "/dashboard/timetable",
  "/dashboard/timetable/manage",
  "/dashboard/timetable/calendar",
  "/dashboard/timetable/period-types",
  "/dashboard/timetable/timetable-types",
] as const

export const attendancePaths = [
  "/dashboard/attendance",
  "/dashboard/attendance/students",
  "/dashboard/attendance/staff",
  "/dashboard/attendance/scan",
  "/dashboard/attendance/early-intervention",
  "/dashboard/attendance/early-intervention/risks",
  "/dashboard/attendance/early-intervention/settings",
] as const

export const hostelPaths = [
  "/dashboard/hostel",
  "/dashboard/hostel/rooms",
  "/dashboard/hostel/hostel-types",
  "/dashboard/hostel/hostel-categories",
  "/dashboard/hostel/floors",
  "/dashboard/hostel/bed-spaces",
  "/dashboard/hostel/parents",
  "/dashboard/hostel/attendance",
  "/dashboard/hostel/health-records",
  "/dashboard/hostel/visitors",
  "/dashboard/hostel/damage",
  "/dashboard/hostel/movement",
] as const

export const staffPaths = [
  "/dashboard/staff",
  "/dashboard/staff/list",
  "/dashboard/staff/roles",
  "/dashboard/staff/leave",
  "/dashboard/staff/my-leave",
  "/dashboard/staff/payroll",
  "/dashboard/staff/performance",
  "/dashboard/staff/voting",
  "/dashboard/availability",
] as const

const menuPaths: readonly string[] = [
  ...userManagementPaths,
  ...studentPaths,
  ...parentPaths,
  ...examsPaths,
  ...feePaths,
  ...elearningPaths,
  ...timetablePaths,
  ...attendancePaths,
  ...hostelPaths,
  ...staffPaths,
]

const uuid = "[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}"
const id = "[a-f0-9-]{36}"
const has = (list: readonly string[], path: string) => list.includes(path)

/** "/dashboard/<school>/a/b" or "/dashboard/a/b" → "/dashboard/a/b" (lower case). */
export function relativePath(
  input: string,
  school: string,
  module: PortalModule = "users",
): string | undefined {
  let path = input.trim().split("?")[0].replace(/\/+$/, "")
  if (!/^\/dashboard(?:\/[a-zA-Z0-9_:-]+)*$/i.test(path)) return undefined
  const parts = path.split("/")
  if (parts[2]?.toLowerCase() === school.toLowerCase()) parts.splice(2, 1)
  path = parts.join("/").toLowerCase()
  // In User Management, the parent consent and visitation menus open the shared screens.
  return module !== "users"
    ? path
    : path.replace(/^\/dashboard\/(parents)\/(consent|visitation)(?=\/|$)/, "/dashboard/users/$2")
}

/** The menu URL a menu entry points at, if it is one this portal can show. */
export function menuPath(
  input: string,
  school: string,
  module: PortalModule = "users",
): string | undefined {
  const path = relativePath(input, school, module)
  return menuPaths.find((p) => p === path)
}

/** The menu a screen address belongs to: detail screens resolve to their list menu. */
export function routeMenuPath(
  input: string,
  school: string,
  module: PortalModule = "users",
): string | undefined {
  const path = relativePath(input, school, module)
  if (!path) return undefined
  if (path === "/dashboard/availability") return path
  if (path.startsWith("/dashboard/staff"))
    return has(staffPaths, path)
      ? path
      : new RegExp(`^/dashboard/staff/${id}(?:/edit)?$`).test(path) || path === "/dashboard/staff/id-cards"
        ? "/dashboard/staff/list"
        : undefined
  if (path.startsWith("/dashboard/hostel")) {
    if (has(hostelPaths, path)) return path
    if (new RegExp(`^/dashboard/hostel/rooms/(?:create|${id}(?:/edit)?)$`).test(path)) return "/dashboard/hostel/rooms"
    if (new RegExp(`^/dashboard/hostel/supervisors/${id}$`).test(path)) return "/dashboard/hostel/parents"
    if (path === "/dashboard/hostel/attendance/history") return "/dashboard/hostel/attendance"
    if (new RegExp(`^/dashboard/hostel/health-records/${id}$`).test(path)) return "/dashboard/hostel/health-records"
    return undefined
  }
  if (path.startsWith("/dashboard/attendance")) {
    if (has(attendancePaths, path)) return path
    if (new RegExp(`^/dashboard/attendance/students/(?:mark|records|${id})$`).test(path)) return "/dashboard/attendance/students"
    if (new RegExp(`^/dashboard/attendance/early-intervention/students/${id}$`).test(path))
      return "/dashboard/attendance/early-intervention/risks"
    return undefined
  }
  if (path.startsWith("/dashboard/timetable")) return timetablePaths.find((p) => p === path)
  if (new RegExp(`^/dashboard/exams_and_records/manage-teachers/${id}/timetable$`).test(path))
    return "/dashboard/exams_and_records/manage-teachers"
  if (path === "/dashboard/school-learning") return path
  if (path.startsWith("/dashboard/fees")) {
    if (has(feePaths, path)) return path
    if (path === "/dashboard/fees/invoice/new" || new RegExp(`^/dashboard/fees/invoice/${id}$`).test(path))
      return "/dashboard/fees/invoice/generate"
    if (new RegExp(`^/dashboard/fees/payment-types/${id}$`).test(path)) return "/dashboard/fees/payment-types/create"
    if (new RegExp(`^/dashboard/fees/book-keeping/${id}$`).test(path)) return "/dashboard/fees/book-keeping"
    if (path === "/dashboard/fees/payment-reminder/details") return "/dashboard/fees/payment-reminder"
    return undefined
  }
  const exams = path.match(
    new RegExp(`^/dashboard/exams_and_records(?:/(classes|manage-teachers|grade-book-settings|approve-grades)/${id})?$`),
  )
  if (exams) return "/dashboard/exams_and_records" + (exams[1] ? "/" + exams[1] : "")
  if (path.startsWith("/dashboard/exams_and_records/")) return examsPaths.find((p) => p === path)
  // E-Learning course chat opens inside the courses menu.
  if (path === "/dashboard/chat" && module === "elearning") return "/dashboard/elearning/courses"
  if (path.startsWith("/dashboard/elearning")) {
    if (has(elearningPaths, path)) return path
    if (new RegExp(`^/dashboard/elearning/teachers/${uuid}/(?:courses|timetable)$`).test(path)) return "/dashboard/elearning"
    // Course IDs are "<course>::<class>"; lessons may be new.
    if (new RegExp(`^/dashboard/elearning/courses/${uuid}::${uuid}(?:/lessons/(?:${uuid}(?:/edit)?|new/edit))?$`).test(path))
      return "/dashboard/elearning/courses"
    if (new RegExp(`^/dashboard/elearning/live-classes/${uuid}/room$`).test(path)) return "/dashboard/elearning/live-classes"
    if (path === "/dashboard/elearning/lesson-notes/create" || new RegExp(`^/dashboard/elearning/lesson-notes/${uuid}/edit$`).test(path))
      return "/dashboard/elearning/lesson-notes"
    return undefined
  }
  const shared = path.match(new RegExp(`^/dashboard/parents/(consent|visitation)/${id}$`))
  if (shared) return "/dashboard/parents/" + shared[1]
  const parent = path.match(
    new RegExp(`^/dashboard/parents/${id}(?:/(edit|fees|results|attendance|timetable|calendar|notifications|visitation|transcript))?$`),
  )
  if (parent) {
    const menus: Record<string, string> = { fees: "fees", notifications: "consent", visitation: "visitation", transcript: "transcript" }
    return "/dashboard/parents/" + (menus[parent[1] ?? ""] || "list")
  }
  if (new RegExp(`^/dashboard/students/${id}(?:/(?:edit|timetable|calendar))?$`).test(path)) return "/dashboard/students/list"
  // Remaining User Management screens (for example users/manage/<id>) belong to the closest menu.
  const overviews: readonly string[] = ["/dashboard/users", ...studentPaths, "/dashboard/parents", ...parentPaths]
  return [...menuPaths].reverse().find((p) => path === p || (!overviews.includes(p) && path.startsWith(p + "/")))
}

/** A school-qualified router address for a menu or screen this portal can show. */
export function schoolRoute(
  input: string,
  school: string,
  module: PortalModule = "users",
): string | undefined {
  const path = relativePath(input, school, module)
  if (!path || !routeMenuPath(path, school, module)) return undefined
  const query = input.includes("?") ? input.slice(input.indexOf("?")) : ""
  return path.replace(/^\/dashboard/, "/dashboard/" + school) + query
}

/** The granted menu (with View) that a screen belongs to. */
export function grantedMenu<T extends { path: string; permissions: string[] }>(
  menus: T[],
  route: string,
  school: string,
  module: PortalModule = "users",
): T | undefined {
  const target = routeMenuPath(route, school, module)
  if (!target) return undefined
  const canView = (m: T) => m.permissions.some((p) => p.trim().toLowerCase() === "view")
  const exact = menus.find((m) => menuPath(m.path, school, module) === target)
  if (exact) return canView(exact) ? exact : undefined
  // Schools that grant only the parent menu still reach these screens through it.
  const parentMenu =
    target === "/dashboard/elearning/courses"
      ? "/dashboard/elearning"
      : target === "/dashboard/exams_and_records/student-grade-entry"
        ? "/dashboard/exams_and_records/grade-entry"
        : target === "/dashboard/exams_and_records/approve-grades"
          ? "/dashboard/exams_and_records/manage-class-results"
          : undefined
  return menus.find((m) => menuPath(m.path, school, module) === (parentMenu ?? target) && canView(m))
}
