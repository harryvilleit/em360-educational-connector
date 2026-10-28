// Menu URLs come from the school permission matrix, not from display labels.
// Keep normalization separate from authorization: a known route still needs a grant.
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
const modulePaths = [...userManagementPaths, ...studentPaths]

export function relativePath(
  input: string,
  school: string,
): string | undefined {
  let path = input.trim().split("?")[0].replace(/\/+$/, "")
  if (!/^\/dashboard(?:\/[a-zA-Z0-9_-]+)*$/i.test(path)) return undefined
  const parts = path.split("/")
  if (parts[2]?.toLowerCase() === school.toLowerCase()) parts.splice(2, 1)
  path = parts.join("/").toLowerCase()
  return path.replace(
    /^\/dashboard\/parents\/(consent|visitation)(?=\/|$)/,
    "/dashboard/users/$1",
  )
}

export function menuPath(input: string, school: string): string | undefined {
  const path = relativePath(input, school)
  return modulePaths.find((p) => p === path)
}

export function routeMenuPath(
  input: string,
  school: string,
): string | undefined {
  const path = relativePath(input, school)
  if (!path) return undefined
  if (
    /^\/dashboard\/students\/[a-f0-9-]{36}(?:\/(?:edit|timetable|calendar))?$/.test(
      path,
    )
  )
    return "/dashboard/students/list"
  return [...modulePaths]
    .reverse()
    .find(
      (p) =>
        path === p ||
        (!(["/dashboard/users", ...studentPaths] as readonly string[]).includes(
          p,
        ) &&
          path.startsWith(p + "/")),
    )
}

export function schoolRoute(input: string, school: string): string | undefined {
  const path = relativePath(input, school)
  if (!path || !routeMenuPath(path, school)) return undefined
  const query = input.includes("?") ? input.slice(input.indexOf("?")) : ""
  return path.replace(/^\/dashboard/, "/dashboard/" + school) + query
}

export function grantedMenu<T extends { path: string; permissions: string[] }>(
  menus: T[],
  route: string,
  school: string,
): T | undefined {
  const target = routeMenuPath(route, school)
  if (!target) return undefined
  return menus.find(
    (m) =>
      menuPath(m.path, school) === target &&
      m.permissions.some((p) => p.trim().toLowerCase() === "view"),
  )
}
