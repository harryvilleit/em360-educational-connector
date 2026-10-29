import { useMemo } from "react"
import ClassScheduleCard from "./ClassScheduleCard"
import type { LiveClassSession } from "@/types/elearning"
import type { User } from "@/types"

interface UpcomingClassesListProps {
  sessions: LiveClassSession[]
  currentUser?: Pick<User, "id" | "name"> | null
  onJoin?: (session: LiveClassSession) => void
  onView?: (session: LiveClassSession) => void
  emptyMessage?: string
  isJoining?: boolean
}

export default function UpcomingClassesList({
  sessions,
  currentUser,
  onJoin,
  onView,
  emptyMessage = "No classes scheduled",
  isJoining,
}: UpcomingClassesListProps) {
  const sorted = useMemo(
    () =>
      [...sessions].sort((a, b) => {
        const order = { live: 0, upcoming: 1, ended: 2 }
        return order[a.status] - order[b.status]
      }),
    [sessions]
  )

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center">
        <p className="text-sm font-medium text-gray-600">{emptyMessage}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Schedule a live class to get started
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
      {sorted.map((session) => (
        <ClassScheduleCard
          key={session.id}
          session={session}
          currentUser={currentUser}
          onJoin={onJoin}
          isJoining={isJoining}
          onView={onView}
        />
      ))}
    </div>
  )
}
