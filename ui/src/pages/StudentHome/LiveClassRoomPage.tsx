import { useNavigate, useParams } from "react-router"
import RoomShell from "@/components/liveroom/RoomShell"
import { useSchoolId } from "@/contexts/SchoolContext"
import { useAuthStore } from "@/store/auth.store"
import { useGetLiveClasses } from "@/hooks/liveClass"
import { mapLiveClassToSession } from "@/pages/Dashboard/ELearning/liveClassMapping"
import { useCurrentStudentId } from "@/hooks/useCurrentStudentId"
import { useResolvedStudent } from "@/hooks/useResolvedStudent"
import { HomeRoutes } from "@/routes"

export default function StudentLiveClassRoomPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const schoolId = useSchoolId()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)

  const { studentId } = useCurrentStudentId(schoolId)
  const { student } = useResolvedStudent(studentId, schoolId)
  const { liveClasses } = useGetLiveClasses({
    schoolId,
    schoolClassId: student?.schoolClassId || undefined,
    pageSize: 100,
  })
  const liveClass = liveClasses.find((item) => item.id === sessionId)
  const session = liveClass ? mapLiveClassToSession(liveClass) : undefined

  const backToElearning = () =>
    navigate(HomeRoutes.toStudentElearning(schoolId))

  const title = session?.title ?? "Live class"
  const subtitle = session
    ? [session.subject, session.className, session.teacherName]
        .filter(Boolean)
        .join(" · ")
    : ""

  return (
    <RoomShell
      liveClassId={sessionId}
      studentId={studentId}
      role="participant"
      selfName={student?.name ?? user?.name ?? "Student"}
      title={title}
      subtitle={subtitle}
      assignedTeacherName={session?.teacherName}
      onExit={backToElearning}
    />
  )
}
