export function parentMenuForRoute(path: string) {
  const rel = path.replace(/^\/dashboard\/[a-f0-9-]{36}/i, "/dashboard")
  const detail = rel.match(
    /^\/dashboard\/parents\/[a-f0-9-]{36}(?:\/([^/]+))?$/i
  )
  if (!detail) return rel
  return (
    "/dashboard/parents/" +
    ((
      {
        fees: "fees",
        notifications: "consent",
        visitation: "visitation",
        transcript: "transcript",
      } as Record<string, string>
    )[detail[1]] || "list")
  )
}
