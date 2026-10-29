import { useEffect } from "react"
import { useLocation, useNavigate, useParams } from "react-router"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import RoomShell from "@/components/liveroom/RoomShell"
import { useELearningStore } from "@/store/elearning.store"
import { useAuthStore } from "@/store/auth.store"
import { useStartLiveClass, useEndLiveClass } from "@/hooks/liveClass"
import { useGetLiveClasses } from "@/hooks/liveClass"
import { useSchoolId } from "@/contexts/SchoolContext"
import { mapLiveClassToSession } from "./liveClassMapping"
import { resolveLiveRole } from "@/utils/liveClassAccess"
import { DashboardRoutes } from "@/routes"
import type { LiveClassSession } from "@/types/elearning"

/**
 * Staff-side live class room.
 *
 * `sessionId` is a backend LiveClass id. Passing it to RoomShell as
 * `liveClassId` is what switches the room onto real Agora + backend admission;
 * the session object here only supplies the header text.
 *
 * That distinction matters: this page used to resolve the session from the
 * local elearning store and refuse to render — "That class isn't on the
 * schedule" — whenever it wasn't found. The store only ever holds locally
 * created demo sessions, so every class started from a timetable period hit
 * that dead end. Metadata is now optional and arrives by whichever route is
 * available (router state first, store second), while the id alone is enough
 * to open the room.
 */
export default function LiveClassRoomPage() {
  const { productId, sessionId } = useParams<{
    productId: string
    sessionId: string
  }>()
  const location = useLocation()
  const navigate = useNavigate()
  const sessions = useELearningStore((s) => s.sessions)
  const updateSessionStatus = useELearningStore((s) => s.updateSessionStatus)
  const user = useAuthStore((s) => s.user)
  const schoolId = useSchoolId()
  const classList = useGetLiveClasses(
    { schoolId, teacherId: user?.id, pageSize: 200 },
    { staleTime: 0, refetchOnWindowFocus: true }
  )
  const refetchClasses = classList.refetch
  useEffect(() => {
    if (schoolId && sessionId) void refetchClasses()
  }, [schoolId, sessionId, refetchClasses])

  // The Classes list hands the session across on navigate, which covers rows
  // that have no local store entry (anything backed by a timetable period).
  const passedSession = (location.state as { session?: LiveClassSession } | null)
    ?.session
  const currentClass = classList.liveClasses.find((item) => item.id === sessionId)
  const session = currentClass
    ? mapLiveClassToSession(currentClass)
    : passedSession ?? sessions.find((s) => s.id === sessionId)

  const role = session ? resolveLiveRole(session, user) : "participant"

  /**
   * Actually starts the class server-side.
   *
   * The lobby's Start button only ever flipped local zustand state, so the
   * LiveClass row stayed `Scheduled` no matter what the teacher did. Nothing
   * else in the app called POST /LiveClass/{id}/Start either — the hook existed
   * with no call sites. That is why a student never saw the room open: they
   * poll the class list, and as far as the backend was concerned the class had
   * not started. Starting for real is what flips their button to "Join class".
   */
  const { startLiveClassAsync } = useStartLiveClass()

  /**
   * The mirror of the above. The room's red button says "End class" for a host,
   * but it only navigated away — POST /LiveClass/{id}/End was never called from
   * anywhere in the app, so a started class stayed Live in the database
   * indefinitely and students kept being offered "Join class" long after the
   * lesson finished.
   */
  const { endLiveClass } = useEndLiveClass()

  const backToClasses = () =>
    navigate(DashboardRoutes.toELearningLiveClasses(productId ?? ""))

  const handleExit = () => {
    // Only the host ends the class for everyone; anyone else is just leaving.
    if (sessionId && role === "host" && session?.lmsStatus === "Live")
      endLiveClass(sessionId)
    backToClasses()
  }

  // Only a genuinely missing id is unrecoverable now.
  if (!sessionId) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-sm font-medium text-gray-600">
          That class isn&apos;t on the schedule
        </p>
        <p className="mt-1 text-xs text-gray-500">
          It may have been cancelled, or the link is out of date.
        </p>
        <Button variant="outline" className="mt-4 gap-2" onClick={backToClasses}>
          <ArrowLeft className="size-4" />
          Back to Classes
        </Button>
      </div>
    )
  }

  if (schoolId && (classList.isPending || classList.isFetching)) {
    return <div className="py-20 text-center text-muted-foreground">Loading class access…</div>
  }



  return (
    <RoomShell
      liveClassId={sessionId}
      role={role}
      viewOnly={session?.canSpectate === true}
      selfName={user?.name ?? "Staff"}
      title={session?.title ?? "Live class"}
      subtitle={
        session
          ? [session.subject, session.className, session.teacherName]
              .filter(Boolean)
              .join(" · ")
          : ""
      }
      sessionStarted={session
        ? session.lmsStatus ? session.lmsStatus === "Live" : session.status === "live"
        : true}
      assignedTeacherName={session?.teacherName}
      onStart={async () => {
        try {
          await startLiveClassAsync(sessionId)
          if (session) updateSessionStatus(session.id, "live")
          return true
        } catch {
          return false
        }
      }}
      onExit={handleExit}
    />
  )
}
