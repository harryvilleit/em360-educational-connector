import { QueryErrorPanel } from "@/components/general/QueryErrorPanel"
import { useEffect, useMemo, useState } from "react"
import {
  Bell,
  Info,
  LayoutGrid,
  ListTree,
  Loader2,
  MapPin,
  Video,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useClassNotificationStore } from "@/store/classNotification.store"
import { useSchoolId } from "@/contexts/SchoolContext"
import { useGetAllClasses } from "@/hooks/examAndRecords"
import { useGetAllSchoolSessions } from "@/hooks/userMgt"
import { useGetTimetableByWeek } from "@/hooks/timetable"
import { useGetPeriodTypesBySchool } from "@/hooks/timetablePeriodType"
import {
  TIMETABLE_TYPE,
  currentWeekMonday,
  formatWeekRangeLabel,
  mondayOfWeekContaining,
  normalizeTimetableType,
  resolveDayName,
  weekNumberInTerm,
} from "../timetable.utils"
import { DayListViewer } from "./DayListViewer"
import { WeekGridViewer } from "./WeekGridViewer"
import { WeekStrip } from "./WeekStrip"
import type { TimetableSlotI } from "@/api/timetable.api/types"
import type { SchoolSessionItem } from "@/api/userMgt.api/types"
import type { PeriodTypeI } from "@/api/timetablePeriodType.api/types"
import type { DayName } from "@/types/timetable"

const DAYS: DayName[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
]

interface TimetableViewerProps {
  studentClass: string
  sessionsOverride?: SchoolSessionItem[] // skips SchoolSession/GetAll when the caller already has this
  periodTypesOverride?: PeriodTypeI[] // skips TimetablePeriodType/GetBySchool when the caller already has this
  classIdOverride?: string // skips GetAllClasses name-match when the caller already knows the classId
  sessionIdOverride?: string // pins the viewer to a specific session instead of resolving the current one
}

export function TimetableViewer({
  studentClass,
  sessionsOverride,
  periodTypesOverride,
  classIdOverride,
  sessionIdOverride,
}: TimetableViewerProps) {
  const schoolId = useSchoolId()
  const [weekStart, setWeekStart] = useState(() => currentWeekMonday())
  const [timetableTypeFilter, setTimetableTypeFilter] = useState("all")
  const [periodTypeFilter, setPeriodTypeFilter] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  const today = new Date().toISOString().split("T")[0]

  const {
    classes,
    isSuccess: fetchedClassesLoaded,
    isError: classesError,
    refetch: reloadClasses,
  } = useGetAllClasses({
    schoolId: classIdOverride ? "" : schoolId,
    pageSize: 200,
  })
  const schoolClassId =
    classIdOverride ?? classes.find((c) => c.ClsName === studentClass)?.Id ?? ""
  const classesLoaded = classIdOverride ? true : fetchedClassesLoaded

  const {
    sessions: fetchedSessions,
    isSuccess: fetchedSessionsLoaded,
    isError: sessionsError,
    refetch: reloadSessions,
  } = useGetAllSchoolSessions({
    schoolId: sessionsOverride ? "" : schoolId,
    pageSize: 100,
  })
  const sessions = sessionsOverride ?? fetchedSessions
  const sessionsLoaded = sessionsOverride ? true : fetchedSessionsLoaded

  const currentTermMatch = sessions
    .flatMap((s) => s.Terms.map((t) => ({ term: t, session: s })))
    .find(({ term }) => term.IsCurrent)
  const overriddenSession = sessionIdOverride
    ? sessions.find((s) => s.Id === sessionIdOverride)
    : undefined
  const currentSession =
    overriddenSession ??
    currentTermMatch?.session ??
    sessions.find((s) => s.IsCurrent || s.Status === "Active") ??
    sessions[0]
  const currentTerm = overriddenSession
    ? (overriddenSession.Terms.find((t) => t.IsCurrent) ??
      overriddenSession.Terms[0])
    : (currentTermMatch?.term ?? currentSession?.Terms[0])
  const termStart = currentTerm?.StartDate?.slice(0, 10)
  const termEnd = currentTerm?.EndDate?.slice(0, 10)

  useEffect(() => {
    if (!termStart || !termEnd) return
    const today = currentWeekMonday()
    setWeekStart((prev) => {
      if (prev >= termStart && prev <= termEnd) return prev
      if (today >= termStart && today <= termEnd) return today

      return mondayOfWeekContaining(today < termStart ? termStart : termEnd)
    })
  }, [termStart, termEnd])

  const isReady = !!(schoolClassId && currentSession && currentTerm)

  const unresolved = classesLoaded && sessionsLoaded && !isReady
  const commonParams = {
    schoolId: isReady ? schoolId : "",
    sessionId: currentSession?.Id,
    termId: currentTerm?.Id,
    classId: schoolClassId,
  }

  const { periodTypes: fetchedPeriodTypes } = useGetPeriodTypesBySchool({
    schoolId: periodTypesOverride ? "" : schoolId,
  })
  const periodTypes = periodTypesOverride ?? fetchedPeriodTypes

  const {
    timetable: weekTimetable,
    isLoading: weekLoading,
    isError: weekError,
    refetch: reloadWeek,
  } = useGetTimetableByWeek({ ...commonParams, weekStartDate: weekStart })

  function passesFilters(s: TimetableSlotI) {
    if (
      timetableTypeFilter !== "all" &&
      String(normalizeTimetableType(s.timetableType)) !== timetableTypeFilter
    )
      return false
    if (periodTypeFilter !== "all" && s.periodTypeId !== periodTypeFilter)
      return false
    return true
  }

  const filteredSlots = useMemo(
    () => (weekTimetable?.slots ?? []).filter(passesFilters),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [weekTimetable, timetableTypeFilter, periodTypeFilter],
  )

  const periodsByDay = useMemo(() => {
    const map = new Map<DayName, TimetableSlotI[]>()
    DAYS.forEach((d) => map.set(d, []))
    filteredSlots.forEach((s) => {
      const day = resolveDayName(s)
      const bucket = day && map.get(day)
      if (bucket) bucket.push(s)
    })
    return map
  }, [filteredSlots])

  const weekNumber = useMemo(
    () => weekNumberInTerm(weekStart, termStart),
    [weekStart, termStart],
  )
  const weekRangeLabel = useMemo(
    () => formatWeekRangeLabel(weekStart),
    [weekStart],
  )

  if (
    weekError ||
    (!classIdOverride && classesError) ||
    (!sessionsOverride && sessionsError)
  )
    return (
      <QueryErrorPanel
        title="Unable to load timetable"
        message="Please retry to load the latest class schedule."
        onRetry={() => {
          if (!classIdOverride) void reloadClasses()
          if (!sessionsOverride) void reloadSessions()
          if (isReady) void reloadWeek()
        }}
      />
    )
  if (unresolved) {
    return (
      <EmptyState
        icon={Info}
        title={
          studentClass
            ? `We couldn't find a class matching "${studentClass}".`
            : "No class assigned yet."
        }
        hint="Please contact the school if this looks incorrect."
      />
    )
  }

  return (
    <div>
      <div className="mb-3 flex justify-end">
        <ClassNotificationsBell studentClass={studentClass} />
      </div>

      <WeekStrip
        weekStart={weekStart}
        onChange={setWeekStart}
        termStart={termStart}
        termEnd={termEnd}
      />

      <div className="mt-4 flex flex-wrap items-center justify-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-xs font-medium text-gray-600">
        <span>{weekRangeLabel}</span>
        <span className="text-gray-300">·</span>
        <span>{currentSession?.SessionName}</span>
        {currentTerm && (
          <>
            <span className="text-gray-300">·</span>
            <span>{currentTerm.TermName}</span>
          </>
        )}
        <span className="text-gray-300">·</span>
        <span>
          {filteredSlots.length} period{filteredSlots.length !== 1 ? "s" : ""}{" "}
          this week
        </span>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <p className="text-xs font-bold tracking-widest text-gray-700 uppercase">
            Timetable
          </p>
          <Select
            value={timetableTypeFilter}
            onValueChange={setTimetableTypeFilter}
          >
            <SelectTrigger className="h-9 w-40 border-gray-200 bg-white text-sm">
              <SelectValue placeholder="All timetables" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All timetables</SelectItem>
              <SelectItem value={String(TIMETABLE_TYPE.Class)}>
                Class
              </SelectItem>
              <SelectItem value={String(TIMETABLE_TYPE.Assessment)}>
                Assessment
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <p className="text-xs font-bold tracking-widest text-gray-700 uppercase">
            Period
          </p>
          <Select value={periodTypeFilter} onValueChange={setPeriodTypeFilter}>
            <SelectTrigger className="h-9 w-52 border-gray-200 bg-white text-sm">
              <SelectValue placeholder="All period types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All period types</SelectItem>
              {periodTypes.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <button
          type="button"
          onClick={() => setViewMode((m) => (m === "grid" ? "list" : "grid"))}
          title={
            viewMode === "grid"
              ? "Switch to day-by-day view"
              : "Switch to week grid view"
          }
          className="ml-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:text-gray-700"
        >
          {viewMode === "grid" ? (
            <ListTree className="size-4" />
          ) : (
            <LayoutGrid className="size-4" />
          )}
        </button>
      </div>

      <div className="mt-4">
        {weekLoading ? (
          <div className="flex items-center justify-center rounded-xl border border-gray-200 bg-white py-20">
            <Loader2 className="size-6 animate-spin text-gray-400" />
          </div>
        ) : viewMode === "grid" ? (
          <WeekGridViewer
            weekStart={weekStart}
            weekNumber={weekNumber}
            periodsByDay={periodsByDay}
          />
        ) : (
          <DayListViewer
            weekStart={weekStart}
            periodsByDay={periodsByDay}
            today={today}
          />
        )}
      </div>
    </div>
  )
}

export function ClassNotificationsBell({
  studentClass,
}: {
  studentClass: string
}) {
  const allNotifications = useClassNotificationStore((s) => s.notifications)
  const markAllRead = useClassNotificationStore((s) => s.markAllRead)
  const notifications = useMemo(
    () => allNotifications.filter((n) => n.className === studentClass),
    [allNotifications, studentClass],
  )
  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <DropdownMenu
      onOpenChange={(open) => {
        if (open && unreadCount > 0) markAllRead(studentClass)
      }}
    >
      <DropdownMenuTrigger asChild>
        <button className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:text-gray-700">
          <Bell size={14} />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-semibold text-white">
              {unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72 p-0">
        <div className="border-b border-gray-100 px-3.5 py-2.5">
          <p className="text-xs font-semibold text-gray-700">
            Class Notifications
          </p>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="px-3.5 py-6 text-center text-xs text-gray-400">
              No notifications yet.
            </p>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className="flex items-start gap-2.5 border-b border-gray-50 px-3.5 py-2.5 last:border-b-0"
              >
                {!n.read && (
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                )}
                <div className={`min-w-0 flex-1 ${n.read ? "pl-4" : ""}`}>
                  <p className="text-xs font-medium text-gray-800">
                    {n.subject}
                  </p>
                  <p className="mt-0.5 text-[11px] text-gray-400">
                    {n.day} · {n.startTime}–{n.endTime}
                    {n.teacher ? ` · ${n.teacher}` : ""}
                  </p>
                  {n.mode && (
                    <span
                      className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${
                        n.mode === "virtual"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {n.mode === "virtual" ? (
                        <Video size={9} />
                      ) : (
                        <MapPin size={9} />
                      )}
                      {n.mode}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function EmptyState({
  icon: Icon,
  title,
  hint,
}: {
  icon: React.ElementType
  title: string
  hint: string
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white py-20 text-center">
      <Icon size={36} className="mb-3 text-gray-300" />
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="mt-1 text-xs text-gray-400">{hint}</p>
    </div>
  )
}
