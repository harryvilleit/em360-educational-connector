import { useMemo, useState } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router"
import { toast } from "sonner"
import { PageHeader } from "@/components/general/PageHeader"
import type { LiveClassSession } from "@/types/elearning"
import { DashboardRoutes } from "@/routes"
import { useSchoolId } from "@/contexts/SchoolContext"
import { useAuthStore } from "@/store/auth.store"
import { useELearningStore } from "@/store/elearning.store"
import { useGetLiveClasses, useStartClassFromSlot } from "@/hooks/liveClass"
import { useELearningFilterOptions } from "@/hooks/elearning/useELearningFilterOptions"
import {
  useTimetableClassSessions,
  isTimetableDerived,
} from "@/hooks/elearning/useTimetableClassSessions"
import { mapLiveClassesToSessions } from "./liveClassMapping"
import { mapLiveClassToSession } from "./liveClassMapping"
import { mergeClassSessions } from "./timetableClassMapping"
import UpcomingClassesList from "./components/UpcomingClassesList"
import ELearningFullCalendarModal from "./components/ELearningFullCalendarModal"
import {
  buildCalendarActivities,
  dateHeading,
  filterLiveClassSessions,
  liveClassFiltersToParams,
  parseLiveClassFilters,
} from "./liveClasses.utils"
import LiveClassesFilters from "./components/LiveClassesFilters"

export default function LiveClassesPage() {
  const { productId } = useParams<{ productId: string }>()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const schoolId = useSchoolId()
  const user = useAuthStore((s) => s.user)

  const { liveClasses, isLoading } = useGetLiveClasses(
    { schoolId, teacherId: user?.id, pageSize: 200 },
    { refetchInterval: 15_000, refetchOnWindowFocus: true, staleTime: 10_000 }
  )
  const assignments = useELearningStore((s) => s.assignments)
  const materials = useELearningStore((s) => s.materials)

  const {
    classOptions,
    termOptions,
    termRanges,
    termIdByName,
    sessionId,
    currentTermName,
    isLoading: optionsLoading,
  } = useELearningFilterOptions(schoolId)

  const [calendarOpen, setCalendarOpen] = useState(false)

  const liveClassSessions = useMemo(
    () => mapLiveClassesToSessions(liveClasses),
    [liveClasses]
  )

  const filters = useMemo(
    () => parseLiveClassFilters(searchParams),
    [searchParams]
  )

  // Constrain the visible window to the current academic term when the user
  // hasn't explicitly picked dates in the URL.
  const effectiveFilters = useMemo(() => {
    const hasExplicitStart = searchParams.get("startDate")
    const hasExplicitEnd = searchParams.get("endDate")
    const term = searchParams.get("term") ?? currentTermName ?? "all"
    const range = termRanges[term === "all" ? (currentTermName ?? "") : term]
    return {
      ...filters,
      term,
      startDate: hasExplicitStart
        ? filters.startDate
        : (range?.startDate ?? filters.startDate),
      endDate: hasExplicitEnd
        ? filters.endDate
        : (range?.endDate ?? filters.endDate),
    }
  }, [currentTermName, termRanges, filters, searchParams])

  /**
   * Resolve the selected term name into the term ID required by the timetable
   * range API.
   *
   * When "all" is selected, use the current term because timetable requests
   * must still be scoped to one SchoolSessionTermId.
   */
  const effectiveTermId = useMemo(() => {
    if (effectiveFilters.term !== "all") {
      return termIdByName[effectiveFilters.term]
    }

    if (currentTermName) {
      return termIdByName[currentTermName]
    }

    return undefined
  }, [effectiveFilters.term, currentTermName, termIdByName])

  /**
   * Load all Online/Hybrid timetable slots for the selected term and date
   * range using one API request.
   *
   * The hook now calls:
   *
   * POST /TeacherPortal/Timetable/Range/{schoolId}
   *
   * It no longer sends one API request for each week.
   */
  const { sessions: timetableSessions } = useTimetableClassSessions({
    schoolId,
    sessionId,
    termId: effectiveTermId,
    startDate: effectiveFilters.startDate,
    endDate: effectiveFilters.endDate,
    teacherId: user?.id,
    teacherName: user?.name,
    schoolClassId:
      effectiveFilters.className !== "all"
        ? effectiveFilters.className
        : undefined,
  })

  /**
   * Merge timetable-derived sessions with existing liveclass rows.
   *
   * The merge function should ensure that once a liveclass row exists for a
   * timetable slot, the real liveclass row takes precedence over the synthetic
   * timetable session.
   */
  const sessions = useMemo(
    () => mergeClassSessions(timetableSessions, liveClassSessions),
    [timetableSessions, liveClassSessions]
  )

  /**
   * Build calendar activities from classes, assignments and materials.
   */
  const calendarActivities = useMemo(
    () =>
      buildCalendarActivities(
        sessions,
        assignments,
        materials,
        effectiveFilters
      ),
    [sessions, assignments, materials, effectiveFilters]
  )

  const filteredSessions = useMemo(
    () => filterLiveClassSessions(sessions, effectiveFilters),
    [sessions, effectiveFilters]
  )

  const updateFilters = (patch: Partial<typeof filters>) => {
    const next = { ...effectiveFilters, ...patch }
    setSearchParams(liveClassFiltersToParams(next), { replace: true })
  }

  const { startClassFromSlotAsync, isPending: startingFromSlot } =
    useStartClassFromSlot()

  /**
   * Open the room for a class card.
   *
   * Cards on this page come from two places. Rows that already exist in the
   * LiveClasses table carry a real id and can be opened directly. Rows derived
   * from a virtual timetable period only carry the synthetic id
   * `slot:<slotId>:<date>` — there is no LiveClass behind them yet, so
   * navigating straight to the room produced "That class isn't on the
   * schedule": the room looked the id up and found nothing.
   *
   * POST /ELearning/Classes/StartFromSlot is the bridge — it find-or-creates
   * the LiveClass backing that period occurrence and returns it. Only the
   * teacher responsible for the period may call it (the API answers 403
   * otherwise), which is exactly who sees "Start Class" here.
   */
  const handleEnterRoom = async (session: LiveClassSession) => {
    if (!isTimetableDerived(session)) {
      navigate(
        DashboardRoutes.toELearningLiveRoom(productId ?? "", session.id),
        { state: { session } }
      )
      return
    }

    if (!session.timetableSlotId || !schoolId) {
      toast.error("This class isn't linked to a timetable period")
      return
    }

    const result = await startClassFromSlotAsync({
      schoolId,
      timetableSlotId: session.timetableSlotId,
      date: session.scheduledDate,
    })

    const liveClass = result?.value
    if (!liveClass?.id) {
      toast.error("Couldn't open this class. Please try again.")
      return
    }

    // Carry the metadata across so the room can render its header without a
    // second round trip.
    navigate(
      DashboardRoutes.toELearningLiveRoom(productId ?? "", liveClass.id),
      {
        state: { session: mapLiveClassToSession(liveClass) },
      }
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Live Classes"
        description="Any teacher assigned to this course and class can start a session. The teacher who starts it hosts; assigned colleagues can watch."
      />

      <LiveClassesFilters
        filters={effectiveFilters}
        onChange={updateFilters}
        onOpenCalendar={() => setCalendarOpen(true)}
        classOptions={classOptions}
        termOptions={termOptions}
        termRanges={termRanges}
        loading={optionsLoading}
      />

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {isLoading ? (
            "Loading classes…"
          ) : (
            <>
              Showing{" "}
              <span className="font-medium text-gray-900">
                {filteredSessions.length}
              </span>{" "}
              {filteredSessions.length === 1 ? "class" : "classes"} for{" "}
              <span className="font-medium text-gray-900">
                {dateHeading(effectiveFilters)}
              </span>
            </>
          )}
        </p>
      </div>

      <UpcomingClassesList
        sessions={filteredSessions}
        currentUser={user}
        emptyMessage="No live classes match your filters"
        onJoin={handleEnterRoom}
        isJoining={startingFromSlot}
        onView={() =>
          navigate(DashboardRoutes.toELearningRecordings(productId ?? ""))
        }
      />

      <ELearningFullCalendarModal
        open={calendarOpen}
        onClose={() => setCalendarOpen(false)}
        activities={calendarActivities}
        selectedDate={effectiveFilters.selectedDate}
        onDateSelect={(selectedDate) => updateFilters({ selectedDate })}
        minDate={effectiveFilters.startDate}
        maxDate={effectiveFilters.endDate}
      />
    </div>
  )
}
