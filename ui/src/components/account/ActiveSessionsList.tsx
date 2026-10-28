import { endPortalSession } from "@/lib/portal-navigation"
import { Laptop, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRevokeUserSession, useUserSessions } from "@/hooks/auth"
import { AuthRoutes } from "@/routes"
import { useAuthStore } from "@/store/auth.store"

export default function ActiveSessionsList() {
  const { sessions, isLoading: sessionsLoading, isError } = useUserSessions()
  const {
    revokeSessionAsync,
    isLoading: isRevoking,
    revokingSessionId,
  } = useRevokeUserSession()
  const clearAuth = useAuthStore((state) => state.clearAuth)

  async function revokeSession(sessionId: string, isCurrent: boolean) {
    try {
      await revokeSessionAsync(sessionId)

      if (isCurrent) {
        clearAuth()
        endPortalSession(AuthRoutes.login)
      }
    } catch {
      // The shared mutation displays the API error to the user.
    }
  }

  if (sessionsLoading) {
    return <p className="text-sm text-muted-foreground">Loading sessions…</p>
  }

  if (isError) {
    return (
      <p role="alert" className="text-sm text-red-600">
        Sessions could not be loaded. Please try again.
      </p>
    )
  }

  if (sessions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No active browser sessions.
      </p>
    )
  }

  return (
    <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200">
      {sessions.map((session) => (
        <li
          key={session.SessionId}
          className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50">
            {session.IsCurrent ? (
              <ShieldCheck className="size-5 text-blue-600" />
            ) : (
              <Laptop className="size-5 text-gray-500" />
            )}
          </span>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-900">
              {session.Device}
              {session.IsCurrent ? " · This device" : ""}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Last active {new Date(session.LastSeenUtc).toLocaleString()}
              {session.IpAddress ? ` · ${session.IpAddress}` : ""}
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            disabled={isRevoking}
            aria-busy={revokingSessionId === session.SessionId}
            onClick={() =>
              void revokeSession(session.SessionId, session.IsCurrent)
            }
            className="shrink-0 rounded-xl text-red-600 hover:text-red-700"
          >
            {revokingSessionId === session.SessionId ? "Signing out…" : "Sign out"}
          </Button>
        </li>
      ))}
    </ul>
  )
}
