import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router"
import { useQueries } from "@tanstack/react-query"
import { toast } from "sonner"
import { Video, BookOpen, Radio, CheckCircle2 } from "lucide-react"
import { StatCard } from "@/components/general/StatCard"
import { PageHeader } from "@/components/general/PageHeader"
import { StudentNotLinked } from "@/components/general/StudentNotLinked"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useSchoolId } from "@/contexts/SchoolContext"
import { useResolvedStudent } from "@/hooks/useResolvedStudent"
import { useStudentPortal } from "@/hooks/useStudentPortal"
import { useStudentELearningCourses } from "@/hooks/elearning/useStudentELearning"
import { useGetTimetableByWeek, useGetAllTimetables } from "@/hooks/timetable"
import { useGetLiveClasses } from "@/hooks/liveClass"
import { getSubUserSubjectsBySubjectApi } from "@/api/examAndRecords.api"
import { queryKeys } from "@/utils/queryKeys"
import { mapLiveClassToSession } from "@/pages/Dashboard/ELearning/liveClassMapping"
import {
  TIMETABLE_TYPE,
  apiNumberToClassMode,
  normalizeTimetableType,
} from "../Dashboard/Timetable/timetable.utils"
import { ClassWeekStrip } from "@/pages/Dashboard/ELearning/components/ClassWeekStrip"
import ClassScheduleCard from "@/pages/Dashboard/ELearning/components/ClassScheduleCard"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useAuthStore } from "@/store/auth.store"
import type { ClassSessionStatus, LiveClassSession } from "@/types/elearning"
import { HomeRoutes } from "@/routes"
import StudentCoursesGrid from "./ELearning/StudentCoursesGrid"
import CourseVideoPlayer from "@/pages/Dashboard/ELearning/components/CourseVideoPlayer"

type ELearningTab = "classes" | "courses"

/** Times arrive as "HH:mm" or "HH:mm:ss" depending on the endpoint. */
function toHHmm(time?: string): string {
  return (time ?? "").slice(0, 5)
}

/** Match key between a timetable period and a real LiveClass row. */
function scheduleKey(
  subjectId: string | undefined,
  date: string,
  startTime?: string
): string {
  return `${subjectId ?? "*"}::${date}::${toHHmm(startTime)}`
}

/**
 * Status of a scheduled period relative to now — the same rule
 * liveClassMapping applies to real rows, so badges agree across both sources.
 */
function deriveScheduledStatus(
  date: string,
  startTime: string | undefined,
  endTime: string | undefined,
  now: Date = new Date()
): ClassSessionStatus {
  const start = new Date(`${date}T${toHHmm(startTime) || "00:00"}:00`)
  const end = new Date(
    `${date}T${toHHmm(endTime) || toHHmm(startTime) || "00:00"}:00`
  )
  if (Number.isNaN(start.getTime())) return "upcoming"
  if (now < start) return "upcoming"
  if (!Number.isNaN(end.getTime()) && now > end) return "ended"
  return "live"
}

const CLASS_FILTERS: { value: ClassFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "live", label: "Live" },
  { value: "upcoming", label: "Upcoming" },
  { value: "ended", label: "Ended" },
]

/**
 * A clock that re-renders the page on a fixed beat.
 *
 * Class status is a function of the current time, but `new Date()` inside a
 * useMemo is only re-read when that memo's dependencies change — so a class
 * whose start time passed while the student sat on the page stayed "Upcoming"
 * until something unrelated forced a render. Ticking a piece of state makes
 * time an actual input.
 */
function useNow(intervalMs = 30_000): Date {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])

  return now
}

/** A class can only be joined once a real LiveClass row exists for it. */
function isJoinable(session: LiveClassSession): boolean {
  return !session.id.startsWith("pending-") && session.status === "live"
}

/** Status filter for the Classes tab. */
type ClassFilter = "all" | ClassSessionStatus

export default function StudentElearningPage() {
  const schoolId = useSchoolId()
  const navigate = useNavigate()
  const [tab, setTab] = useState<ELearningTab>("classes")
  const [classFilter, setClassFilter] = useState<ClassFilter>("all")
  const [watching, setWatching] = useState<LiveClassSession | null>(null)
  const user = useAuthStore((s) => s.user)
  const now = useNow()

  const {
    studentId,
    isLinked,
    isLoading: idLoading,
    selectedSession,
    selectedTerm,
    selectedClass,
    selectTerm: selectPortalTerm,
  } = useStudentPortal(schoolId)
  // mockContentId is deliberately not read: the Classes tab no longer renders
  // any sample content, so nothing on this page depends on the mock dataset.
  const { student, isLoading: studentLoading } = useResolvedStudent(
    studentId,
    schoolId
  )

  // ── Term / week selectors ──────────────────────────────────────────────────
  // Session/term/class come from the StudentPortal/LaunchSchool bootstrap —
  // this page only ever offers a Term switcher, so the current session is
  // used as-is (no session picker here).
  const [selectedWeekStart, setSelectedWeekStart] = useState<string | "all">(
    "all"
  )

  const activeSessionId = selectedSession?.sessionId ?? ""
  const schoolTerms = selectedSession?.terms ?? []
  const activeTermId = selectedTerm?.schoolSessionTermId ?? ""
  const termStart = selectedTerm?.startDate?.slice(0, 10)
  const termEnd = selectedTerm?.endDate?.slice(0, 10)

  // The student's primary/selected class enrollment, resolved by id from the
  // launch payload — no more matching the timetable class list by name.
  const schoolClassId = selectedClass?.schoolClassId ?? ""
  const showingAllWeeks = selectedWeekStart === "all"
  const isTimetableReady = !!(
    schoolId &&
    schoolClassId &&
    activeSessionId &&
    activeTermId
  )

  // ── Timetable slots for Classes tab ────────────────────────────────────────
  const { timetable, isLoading: weekLoading } = useGetTimetableByWeek(
    {
      schoolId: isTimetableReady ? schoolId : "",
      sessionId: activeSessionId,
      termId: activeTermId,
      classId: schoolClassId,
      weekStartDate: showingAllWeeks ? undefined : selectedWeekStart,
    },
    { enabled: isTimetableReady && !showingAllWeeks }
  )
  const { slots: termSlots, isLoading: termLoading } = useGetAllTimetables(
    {
      schoolId: isTimetableReady ? schoolId : "",
      sessionId: activeSessionId,
      termId: activeTermId,
      classId: schoolClassId,
      timetableType: TIMETABLE_TYPE.Class,
      dateFrom: termStart,
      dateTo: termEnd,
      pageSize: 500,
    },
    { enabled: isTimetableReady && showingAllWeeks }
  )

  const rawSlots = useMemo(
    () => (showingAllWeeks ? termSlots : (timetable?.slots ?? [])),
    [showingAllWeeks, termSlots, timetable?.slots]
  )
  const slotsLoading = showingAllWeeks ? termLoading : weekLoading

  const virtualSlots = useMemo(
    () =>
      rawSlots.filter(
        (s) =>
          normalizeTimetableType(s.timetableType) === TIMETABLE_TYPE.Class &&
          apiNumberToClassMode(s.classMode) === "virtual" &&
          !!s.subjectId
      ),
    [rawSlots]
  )

  // ── Teacher resolution per subject ─────────────────────────────────────────
  const distinctSubjectIds = useMemo(
    () => Array.from(new Set(virtualSlots.map((s) => s.subjectId))),
    [virtualSlots]
  )

  const subjectTeacherQueries = useQueries({
    queries: distinctSubjectIds.map((subjectId) => ({
      queryKey: [queryKeys.subjectTeachers, subjectId, schoolId],
      queryFn: () => getSubUserSubjectsBySubjectApi({ subjectId, schoolId }),
      enabled: !!(subjectId && schoolId),
      staleTime: 60 * 1000,
      gcTime: 5 * 60 * 1000,
    })),
  })

  const teachersBySubjectId = useMemo(() => {
    const map = new Map<string, { subUserId: string; subUserName: string }[]>()

    distinctSubjectIds.forEach((subjectId, i) => {
      const subjectTeachers = subjectTeacherQueries[i]?.data?.value ?? []
      map.set(
        subjectId,
        subjectTeachers
          // SubUserSubject is the authoritative teacher+class+subject row.
          // Do not intersect it with SubUserClass: a subject assignment is
          // valid even when the separate class-wide grant is not selected.
          .filter((t) => t.classId === schoolClassId)
          .map((t) => ({ subUserId: t.subUserId, subUserName: t.subUserName }))
      )
    })
    return map
  }, [distinctSubjectIds, subjectTeacherQueries, schoolClassId])

  // ── Real LiveClass rows — merge with timetable-derived sessions ───────────
  /**
   * Polled, unlike everywhere else this hook is used. The student is waiting
   * for their teacher to open the room, and that transition happens entirely
   * server-side: without polling the default 5 minute staleTime meant "Join
   * class" could take five minutes to appear, or need a full page reload.
   */
  const { liveClasses } = useGetLiveClasses(
    {
      schoolId,
      schoolClassId: schoolClassId || undefined,
      pageSize: 100,
    },
    {
      refetchInterval: 20_000,
      refetchOnWindowFocus: true,
      staleTime: 10_000,
    }
  )

  const realSessions = useMemo(
    () => liveClasses.map((dto) => mapLiveClassToSession(dto)),
    [liveClasses]
  )

  /**
   * Real rows indexed so a class the teacher actually started can be matched
   * back to the timetable period it came from.
   *
   * LiveClassDtoI exposes no timetableSlotId, so there is no id to join on —
   * the previous code built this map keyed by `dto.id` and then looked it up
   * with `${slot.id}::${date}`, a key it never contained, so every lookup
   * missed and every class stayed an unjoinable placeholder. Match on the
   * things both sides do carry instead: subject + date + start time, with a
   * looser date + start time fallback for rows saved without a subject.
   */
  const realByScheduleKey = useMemo(() => {
    const map = new Map<string, LiveClassSession>()
    for (const session of realSessions) {
      const exact = scheduleKey(
        session.courseId,
        session.scheduledDate,
        session.startTime
      )
      const loose = scheduleKey(
        undefined,
        session.scheduledDate,
        session.startTime
      )
      map.set(exact, session)
      // Never let the loose key overwrite a more specific entry.
      if (!map.has(loose)) map.set(loose, session)
    }
    return map
  }, [realSessions])

  /** Exact slot link, for rows the backend stamped with a timetableSlotId. */
  const realBySlotId = useMemo(() => {
    const map = new Map<string, LiveClassSession>()
    for (const session of realSessions) {
      if (!session.timetableSlotId) continue
      map.set(`${session.timetableSlotId}::${session.scheduledDate}`, session)
    }
    return map
  }, [realSessions])

  const liveClassSessions = useMemo(() => {
    const matchedRealIds = new Set<string>()

    const fromTimetable = virtualSlots.map((slot): LiveClassSession => {
      const slotDate = slot.date.slice(0, 10)


      const real =
        realBySlotId.get(`${slot.id}::${slotDate}`) ??
        realByScheduleKey.get(
          scheduleKey(slot.subjectId, slotDate, slot.startTime)
        ) ??
        realByScheduleKey.get(scheduleKey(undefined, slotDate, slot.startTime))

      if (real) {
        matchedRealIds.add(real.id)
        return { ...real, timetableSlotId: slot.id }
      }

      const matchedTeachers = teachersBySubjectId.get(slot.subjectId) ?? []
      const teacherName =
        matchedTeachers.length > 0
          ? matchedTeachers.map((t) => t.subUserName).join(", ")
          : "No teacher assigned"

      return {
       
        id: `pending-${slot.id}`,
        timetableSlotId: slot.id,
        title: slot.subjectName,
        subject: slot.subjectName,
        className: slot.schoolClassName || student?.class || "",
        teacherName,
        scheduledDate: slotDate,
        startTime: slot.startTime,
        endTime: slot.endTime,
    
        status: deriveScheduledStatus(
          slotDate,
          slot.startTime,
          slot.endTime,
          now
        ),
        participantCount: 0,
        maxParticipants: 0,
        agoraChannelId: "",
      }
    })

    // Classes the teacher scheduled outside the timetable still belong to the
    // student — without this they were invisible in the portal.
    const adHoc = realSessions.filter(
      (session) => !matchedRealIds.has(session.id)
    )

    return [...fromTimetable, ...adHoc]
  }, [
    virtualSlots,
    realSessions,
    realByScheduleKey,
    realBySlotId,
    teachersBySubjectId,
    student?.class,
    now,
  ])

  // ── Courses tab data ───────────────────────────────────────────────────────
  const { courses: studentCourses, isLoading: coursesLoading } =
    useStudentELearningCourses(isLinked ? schoolId : undefined)

  // ── Navigate to live room ──────────────────────────────────────────────────
  const handleJoinClass = (session: LiveClassSession) => {
    // Only real LiveClass rows (not pending-* ids) can be joined.
    if (session.id.startsWith("pending-")) {
      toast.error("Your teacher hasn't started this class yet")
      return
    }
    navigate(HomeRoutes.toStudentLiveRoom(schoolId, session.id))
  }

  // ── Counts + ordering ──────────────────────────────────────────────────────
  const sortedSessions = useMemo(() => {
    const order: Record<ClassSessionStatus, number> = {
      live: 0,
      upcoming: 1,
      ended: 2,
    }
    return [...liveClassSessions].sort((a, b) => {
      if (order[a.status] !== order[b.status])
        return order[a.status] - order[b.status]
      // Soonest first within upcoming/live; most recent first for ended.
      const aWhen = `${a.scheduledDate} ${toHHmm(a.startTime)}`
      const bWhen = `${b.scheduledDate} ${toHHmm(b.startTime)}`
      return a.status === "ended"
        ? bWhen.localeCompare(aWhen)
        : aWhen.localeCompare(bWhen)
    })
  }, [liveClassSessions])

  const counts = useMemo(
    () => ({
      all: sortedSessions.length,
      live: sortedSessions.filter((s) => s.status === "live").length,
      upcoming: sortedSessions.filter((s) => s.status === "upcoming").length,
      ended: sortedSessions.filter((s) => s.status === "ended").length,
    }),
    [sortedSessions]
  )

  const visibleSessions = useMemo(
    () =>
      classFilter === "all"
        ? sortedSessions
        : sortedSessions.filter((s) => s.status === classFilter),
    [sortedSessions, classFilter]
  )

  if (idLoading || studentLoading) {
    return (
      <div className="p-6 text-center text-sm text-gray-400">Loading...</div>
    )
  }

  if (!student) {
    return (
      <div className="p-6 text-center text-sm text-gray-400">
        We couldn't load your student record.
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="E-Learning"
        description={`${student.name} — ${student.class}`}
        onBack={() => navigate(HomeRoutes.toStudentHome(schoolId))}
        className="mb-7"
      />

      {/* Every figure here is derived from the timetable + live-class data the
          Classes tab renders, so the cards can never disagree with the list. */}
      <div className="mb-5 grid grid-cols-3 gap-3">
        <StatCard
          label="Live Now"
          value={counts.live}
          icon={Radio}
          color="red"
        />
        <StatCard
          label="Upcoming Classes"
          value={counts.upcoming}
          icon={Video}
          color="blue"
        />
        <StatCard
          label="Ended Classes"
          value={counts.ended}
          icon={CheckCircle2}
          color="indigo"
        />
      </div>

      {/* ── Tab bar ──────────────────────────────────────────────── */}
      <div className="mb-5 flex gap-0 border-b border-gray-200">
        <button
          type="button"
          onClick={() => setTab("classes")}
          className={`px-4 py-2.5 text-sm font-medium transition ${
            tab === "classes"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Classes
        </button>
        <button
          type="button"
          onClick={() => setTab("courses")}
          className={`px-4 py-2.5 text-sm font-medium transition ${
            tab === "courses"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Courses
        </button>
      </div>

      {/* ── Classes tab ──────────────────────────────────────────── */}
      {tab === "classes" && (
        <div className="mb-5 overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="space-y-4 border-b border-gray-100 px-5 py-4">
            <Select value={activeTermId} onValueChange={selectPortalTerm}>
              <SelectTrigger className="h-10 w-full rounded-xl border-gray-200 bg-white font-medium sm:w-64">
                <SelectValue placeholder="Term" />
              </SelectTrigger>
              <SelectContent>
                {schoolTerms.map((t) => (
                  <SelectItem
                    key={t.schoolSessionTermId}
                    value={t.schoolSessionTermId}
                  >
                    {t.termName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <ClassWeekStrip
              weekStart={selectedWeekStart}
              onChange={setSelectedWeekStart}
              termStart={termStart}
              termEnd={termEnd}
            />
          </div>

          {idLoading || slotsLoading ? (
            <div className="px-5 py-10 text-center text-sm text-gray-400">
              Loading your classes…
            </div>
          ) : !schoolClassId ? (
            <div className="px-5 py-10 text-center text-sm text-gray-400">
              We couldn't match your class to a timetable yet.
            </div>
          ) : (
            <>
              {/* Live / upcoming / ended are all reachable from here — ended
                  classes used to be hidden behind a "view past" toggle. */}
              <div className="flex flex-wrap gap-2 border-b border-gray-100 px-5 py-3">
                {CLASS_FILTERS.map((f) => (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() => setClassFilter(f.value)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                      classFilter === f.value
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {f.label}
                    <span
                      className={
                        classFilter === f.value
                          ? "ml-1.5 text-blue-100"
                          : "ml-1.5 text-gray-400"
                      }
                    >
                      {counts[f.value]}
                    </span>
                  </button>
                ))}
              </div>

              {visibleSessions.length === 0 ? (
                <div className="px-5 py-10 text-center text-sm text-gray-400">
                  {counts.all === 0
                    ? showingAllWeeks
                      ? "No online classes on your class's timetable this term"
                      : "No online classes for this week"
                    : `No ${classFilter} classes right now`}
                </div>
              ) : (
                /* Same card the staff Classes page renders, so a class looks
                   the same to the student as it does to their teacher. */
                <div className="grid grid-cols-1 gap-5 p-5 md:grid-cols-2 xl:grid-cols-3">
                  {visibleSessions.map((s) => (
                    <ClassScheduleCard
                      key={s.id}
                      session={s}
                      currentUser={user}
                      // A student never hosts, and can only enter a room that
                      // actually exists — see isJoinable.
                      canJoin={isJoinable(s)}
                      showEnrollmentTotal={false}
                      pendingLabel={
                        s.status === "live"
                          ? "Waiting for teacher"
                          : `Opens at ${toHHmm(s.startTime)}`
                      }
                      onJoin={handleJoinClass}
                      onView={setWatching}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── Courses tab ──────────────────────────────────────────── */}
      {tab === "courses" && (
        <div className="mb-5">
          {!isLinked ? (
            <StudentNotLinked />
          ) : coursesLoading ? (
            <div className="py-10 text-center text-sm text-gray-400">
              Loading courses…
            </div>
          ) : studentCourses.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center">
              <BookOpen className="mb-3 size-8 text-gray-300" />
              <p className="text-sm font-medium text-gray-600">
                No courses found
              </p>
              <p className="mt-1 text-xs text-gray-400">
                Subjects assigned to your class will appear here.
              </p>
            </div>
          ) : (
            <>
              <p className="mb-3 text-sm text-gray-500">
                Showing{" "}
                <span className="font-medium text-gray-900">
                  {studentCourses.length}
                </span>{" "}
                {studentCourses.length === 1 ? "course" : "courses"} for{" "}
                {student.class}
              </p>
              <StudentCoursesGrid
                schoolId={schoolId}
                courses={studentCourses}
              />
            </>
          )}
        </div>
      )}

      <RecordingModal session={watching} onClose={() => setWatching(null)} />
    </div>
  )
}

// ─── Recording playback ─────────────────────────────────────────────────────

/**
 * Plays back a finished class. The staff-side RecordingWatchModal embeds a
 * hardcoded demo YouTube id and ignores the stored URL, so it can't be reused
 * here — this plays the real `recordingUrl` the API now returns, and always
 * offers a direct link for formats the browser won't play inline.
 */
function RecordingModal({
  session,
  onClose,
}: {
  session: LiveClassSession | null
  onClose: () => void
}) {
  if (!session?.recordingUrl) return null

  return (
    <Dialog open={!!session} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-[calc(100%-2rem)] overflow-hidden rounded-xl p-0 sm:max-w-3xl">
        <DialogHeader className="space-y-1 px-5 pt-5 pb-3">
          <DialogTitle>{session.title}</DialogTitle>
          <DialogDescription>
            {[session.subject, session.className, session.teacherName]
              .filter(Boolean)
              .join(" · ")}{" "}
            ·{" "}
            {new Date(`${session.scheduledDate}T00:00:00`).toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>

        <div className="bg-black">
          {/* Recordings may be Cloudflare player links, YouTube or plain files. */}
          <div className="aspect-video w-full">
            <CourseVideoPlayer
              key={session.recordingUrl}
              url={session.recordingUrl}
              title={session.title}
              autoPlay
            />
          </div>
        </div>

        <div className="flex justify-end px-5 py-3">
          <a
            href={session.recordingUrl}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-medium text-blue-600 hover:underline"
          >
            Open recording in a new tab
          </a>
        </div>
      </DialogContent>
    </Dialog>
  )
}
