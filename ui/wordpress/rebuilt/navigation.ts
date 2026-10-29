import { matchPath } from "react-router"
export interface RouteRule {
  path: string
  menu: string
  permission?: string
}
export const routeRules: RouteRule[] = [
  { path: "hostel", menu: "hostel" },
  ...[
    "rooms",
    "hostel-types",
    "hostel-categories",
    "floors",
    "bed-spaces",
    "parents",
    "visitors",
    "damage",
    "movement",
    "attendance",
    "health-records",
  ].map((p) => ({ path: "hostel/" + p, menu: "hostel/" + p })),
  { path: "hostel/rooms/create", menu: "hostel/rooms", permission: "create" },
  { path: "hostel/rooms/:roomId", menu: "hostel/rooms" },
  {
    path: "hostel/rooms/:roomId/edit",
    menu: "hostel/rooms",
    permission: "update",
  },
  { path: "hostel/attendance/history", menu: "hostel/attendance" },
  { path: "hostel/supervisors/:supervisorId", menu: "hostel/parents" },
  { path: "staff", menu: "staff" },
  ...[
    "list",
    "leave",
    "my-leave",
    "payroll",
    "performance",
    "roles",
    "voting",
  ].map((p) => ({ path: "staff/" + p, menu: "staff/" + p })),
  { path: "staff/:id", menu: "staff/list" },
  { path: "staff/:id/edit", menu: "staff/list", permission: "update" },
  { path: "availability", menu: "availability" },
  { path: "elearning/lesson-notes", menu: "elearning/lesson-notes" },
  {
    path: "elearning/lesson-notes/create",
    menu: "elearning/lesson-notes",
    permission: "create",
  },
  // Reviewers open the editor read-only; the shared editor checks Update/Create before edits.
  {
    path: "elearning/lesson-notes/:noteId/edit",
    menu: "elearning/lesson-notes",
  },
]
export function relativeRoute(
  input: string,
  school: string
): string | undefined {
  if (typeof input !== "string" || input.length > 1000) return
  const path = input.split("?")[0].replace(/\/+$/, "")
  if (!/^\/dashboard(?:\/[a-zA-Z0-9_-]+)+$/.test(path)) return
  const parts = path.split("/").slice(2)
  if (parts[0]?.toLowerCase() === school.toLowerCase()) parts.shift()
  return parts.join("/")
}
export function ruleFor(input: string, school: string): RouteRule | undefined {
  const path = relativeRoute(input, school)
  if (!path) return
  // Reserved literal screens win over staff/:id and similar dynamic routes.
  const rule =
    routeRules.find((r) => r.path === path) ||
    routeRules.find((r) =>
      matchPath({ path: "/" + r.path, end: true }, "/" + path)
    )
  if (rule && rule.path.includes(":")) {
    const values = Object.values(
      matchPath({ path: "/" + rule.path, end: true }, "/" + path)?.params || {}
    )
    if (
      values.some(
        (v) =>
          !/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i.test(
            v || ""
          )
      )
    )
      return
  }
  return rule
}
export function permittedMenu<
  T extends { path: string; permissions: string[] },
>(menus: T[], path: string, school: string) {
  const rule = ruleFor(path, school)
  if (!rule) return
  return menus.find(
    (m) =>
      relativeRoute(m.path, school) === rule.menu &&
      ["view", ...(rule.permission ? [rule.permission] : [])].every((p) =>
        m.permissions.some((v) => v.toLowerCase() === p)
      )
  )
}
export function schoolRoute(input: string, school: string) {
  if (!ruleFor(input, school)) return
  const query = input.includes("?") ? input.slice(input.indexOf("?")) : ""
  return "/dashboard/" + school + "/" + relativeRoute(input, school) + query
}
