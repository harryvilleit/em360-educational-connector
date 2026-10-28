import { Calendar, Clock, Play, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import SessionStatusBadge from "./SessionStatusBadge"
import { dashboardCardSurface } from "@/components/general/StatCard"
import { getLiveSessionThumbnail } from "@/lib/live-session-thumbnails"
import { formatLiveSessionShortDate } from "@/lib/public-live-classes"
import { canEnterRoom, resolveLiveRole } from "@/utils/liveClassAccess"
import type { LiveClassSession } from "@/types/elearning"
import type { User } from "@/types"

interface ClassScheduleCardProps {
  session: LiveClassSession
  currentUser?: Pick<User, "id" | "name"> | null
  onJoin?: (session: LiveClassSession) => void
  onView?: (session: LiveClassSession) => void
  isJoining?: boolean
  /**
   * Overrides the role-based join test. The student portal needs this: a
   * timetable period can be inside its scheduled window — so role/status say
   * "joinable" — while the teacher has not opened the room yet, and there is
   * nothing to join.
   */
  canJoin?: boolean
  /** Students only need the live joined count; the register total is staff detail. */
  showEnrollmentTotal?: boolean
  /** Replaces the default "Opens at HH:mm" label on a non-joinable class. */
  pendingLabel?: string
}

export default function ClassScheduleCard({
  session,
  currentUser,
  onJoin,
  onView,
  isJoining,
  canJoin,
  showEnrollmentTotal = true,
  pendingLabel,
}: ClassScheduleCardProps) {
  const role = resolveLiveRole(session, currentUser)
  const joinable = canJoin ?? canEnterRoom(session, role)
  const hasEnrollmentTotal = showEnrollmentTotal && session.maxParticipants > 0
  const fillPercent = hasEnrollmentTotal
    ? Math.min(
        100,
        Math.round((session.participantCount / session.maxParticipants) * 100)
      )
    : 0
  const classContext = [session.subject, session.className]
    .filter(Boolean)
    .join(" · ")

  const topLabel =
    session.status === "live"
      ? joinable
        ? "Live now"
        : "Not started"
      : session.status === "upcoming"
        ? `Starts ${session.startTime}`
        : session.recordingUrl
          ? "Recording"
          : "Ended"

  return (
    <div
      className={`group overflow-hidden ${dashboardCardSurface} text-left transition hover:border-blue-300 hover:shadow-md`}
    >
      <div className="relative aspect-video w-full overflow-hidden bg-gray-900">
        <img
          src={getLiveSessionThumbnail(session)}
          alt={session.title}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/55 via-black/15 to-black/25" />

        <div className="absolute top-3 left-3">
          <SessionStatusBadge status={session.status} pulse />
        </div>

        <div className="absolute top-3 right-3 rounded-md bg-black/60 px-2 py-1 text-[10px] font-medium text-white backdrop-blur-sm">
          {topLabel}
        </div>

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/95 shadow-lg ring-4 ring-white/30 transition group-hover:scale-105">
            <Play className="ml-0.5 size-5 fill-gray-900 text-gray-900" />
          </div>
        </div>

        {hasEnrollmentTotal && (
          <div className="absolute right-0 bottom-0 left-0 h-1 bg-black/40">
            <div
              className="h-full bg-white/80"
              style={{ width: `${fillPercent}%` }}
            />
          </div>
        )}
      </div>

      <div className="p-4">
        {classContext && (
          <p className="text-xs text-muted-foreground">{classContext}</p>
        )}
        <h3 className="mt-1 truncate text-base font-semibold text-gray-900">
          {session.title}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {session.teacherName}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Calendar className="size-3.5" />
            {formatLiveSessionShortDate(session.scheduledDate)}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="size-3.5" />
            {session.startTime} – {session.endTime}
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="size-3.5" />
            {hasEnrollmentTotal
              ? `${session.participantCount}/${session.maxParticipants}`
              : `${session.participantCount} joined`}
          </span>
        </div>

        <div className="mt-4 space-y-2">
          {joinable ? (
            <Button
              className="h-9 w-full rounded-md bg-blue-600 text-sm hover:bg-blue-700"
              onClick={() => onJoin?.(session)}
              disabled={isJoining}
            >
              {isJoining
                ? "Starting…"
                : session.canSpectate
                  ? "Watch class"
                  : session.lmsStatus === "Scheduled" && role === "host"
                    ? "Start Class"
                    : session.status === "live"
                      ? "Join Class"
                      : "Start Class"}
            </Button>
          ) : session.status === "ended" ? (
            // Only offer playback when a recording actually exists — the
            // button used to show on every ended class and led nowhere.
            session.recordingUrl ? (
              <Button
                variant="outline"
                className="h-9 w-full rounded-md text-sm"
                onClick={() => onView?.(session)}
              >
                View Recording
              </Button>
            ) : (
              <Button
                variant="outline"
                className="h-9 w-full rounded-md text-sm"
                disabled
              >
                No recording available
              </Button>
            )
          ) : (
            <Button
              variant="outline"
              className="h-9 w-full rounded-md"
              disabled
            >
              {pendingLabel ?? `Opens at ${session.startTime}`}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
