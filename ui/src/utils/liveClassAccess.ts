import type { LiveClassSession } from "@/types/elearning"
import type { LiveRoomRole } from "@/types/liveroom"
import type { User } from "@/types"

/**
 * Who is this person in this class?
 *
 * For a school class, the server selects the sole host when an assigned
 * teacher starts it. Other assigned teachers can watch after it is live.
 *
 * Matching is by id. `teacherName` is only a fallback for sessions created
 * before `teacherId` existed; names are not unique and two Mrs. Adeyemis in
 * one school would both get host.
 */
export function resolveLiveRole(
  session: Pick<LiveClassSession, "teacherId" | "coTeacherIds" | "teacherName" | "canStart" | "yourRole" | "lmsStatus">,
  user: Pick<User, "id" | "name"> | null | undefined
): LiveRoomRole {
  if (!user) return "participant"

  // The API knows who actually started a real class. Before it starts,
  // all teachers assigned to the course may claim the host role.
  if (session.lmsStatus) {
    if (session.lmsStatus === "Scheduled")
      return session.canStart ? "host" : "participant"
    return session.yourRole === "Host" ? "host" : "participant"
  }

  if (session.teacherId) {
    if (session.teacherId === user.id) return "host"
    if (session.coTeacherIds?.includes(user.id)) return "cohost"
    return "participant"
  }

  // Legacy sessions with no teacherId. Remove once the backend supplies it.
  if (
    session.teacherName &&
    session.teacherName.trim().toLowerCase() === user.name?.trim().toLowerCase()
  ) {
    return "host"
  }

  return "participant"
}

/**
 * A class can only be entered once its assigned teacher has started it.
 *
 * An ended class — whether explicitly ended or simply past its scheduled window
 * (a past date) — is never enterable, not even by the host: there's nothing to
 * start or re-join, only a recording to view. This is what keeps the Join/Start
 * button off past-dated classes.
 */
export function canEnterRoom(
  session: Pick<LiveClassSession, "status" | "lmsStatus">,
  role: LiveRoomRole
) {
  if (session.status === "ended") return false
  if (session.lmsStatus === "Scheduled" && role !== "host") return false
  if (role === "host" || role === "cohost") return true
  return session.status === "live"
}

/* -------------------------------------------------------------------------
 * Guest links
 * ---------------------------------------------------------------------- */

/**
 * Placeholder token. Replace with a server-signed, short-lived JWT that
 * encodes the session id — a token minted in the browser proves nothing.
 */
export function createGuestToken() {
  const raw =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`
  return raw.replace(/-/g, "").slice(0, 24)
}

export function buildGuestLink(token: string) {
  const origin = typeof window !== "undefined" ? window.location.origin : ""
  return `${origin}/join/${token}`
}

export type GuestLinkState = "valid" | "disabled" | "expired" | "exhausted" | "unknown"

export function checkGuestLink(
  session: Pick<LiveClassSession, "guestAccess"> | undefined
): GuestLinkState {
  const access = session?.guestAccess
  if (!session || !access) return "unknown"
  if (!access.enabled) return "disabled"
  if (access.expiresAt && new Date(access.expiresAt).getTime() < Date.now())
    return "expired"
  if (access.maxUses !== undefined && access.uses >= access.maxUses) return "exhausted"
  return "valid"
}

export const GUEST_LINK_MESSAGES: Record<Exclude<GuestLinkState, "valid">, string> = {
  disabled: "The teacher has turned this link off.",
  expired: "This link has expired. Ask the teacher for a new one.",
  exhausted: "This link has already been used the maximum number of times.",
  unknown: "This link doesn't match any class. Check you copied all of it.",
}
