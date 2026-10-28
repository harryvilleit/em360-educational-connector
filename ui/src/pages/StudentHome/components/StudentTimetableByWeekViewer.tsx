import { useEffect, useMemo, useState } from "react"
import { Info, LayoutGrid, ListTree, Loader2 } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useGetStudentPortalTimetableByWeek } from "@/hooks/studentPortal"
import { ClassNotificationsBell } from "@/pages/Dashboard/Timetable/components/TimetableViewer"
import { WeekGridViewer } from "@/pages/Dashboard/Timetable/components/WeekGridViewer"
import { DayListViewer } from "@/pages/Dashboard/Timetable/components/DayListViewer"
import { WeekStrip } from "@/pages/Dashboard/Timetable/components/WeekStrip"
import {
  TIMETABLE_TYPE,
  currentWeekMonday,
  formatWeekRangeLabel,
  mondayOfWeekContaining,
  normalizeClassMode,
  normalizeTimetableType,
  resolveDayName,
  weekNumberInTerm,
} from "@/pages/Dashboard/Timetable/timetable.utils"
import { formatClassOptionLabel } from "@/utils/guardianAdapter"
import type { TimetableSlotI } from "@/api/timetable.api/types"
import type {
  StudentPortalLaunchClassI,
  StudentPortalTimetableByWeekSlotI,
} from "@/api/studentPortal.api/types"
import type { SelectedStudentClassI } from "@/store/studentPortalFilter.store"
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

function mapSlot(s: StudentPortalTimetableByWeekSlotI): TimetableSlotI {
  return {
    id: s.id,
    schoolId: "",
    schoolSessionId: s.schoolSessionId,
    schoolSessionTermId: s.schoolSessionTermId,
    schoolClassId: s.schoolClassId,
    schoolClassName: s.schoolClassName,
    timetableType:
      normalizeTimetableType(s.timetableType) ?? TIMETABLE_TYPE.Class,
    timetableTypeName: s.timetableType,
    dayOfWeek: 0,
    dayOfWeekName: s.dayOfWeekName,
    date: "",
    formattedDate: "",
    weekStartDate: "",
    formattedWeekStartDate: "",
    periodTypeId: s.periodTypeId,
    periodTypeName: s.periodTypeName,
    periodTypeCode: s.periodTypeCode,
    startTime: s.startTime,
    formattedStartTime: s.formattedStartTime,
    endTime: s.endTime,
    formattedEndTime: s.formattedEndTime,
    subjectId: s.subjectId,
    subjectName: s.subjectName,
    classMode: normalizeClassMode(s.classMode) ?? null,
    classModeName: s.classMode,
    venue: s.venue ?? "",
    assessmentType: "",
    dateCreated: "",
  }
}

function toSelectedClass(c: StudentPortalLaunchClassI): SelectedStudentClassI {
  return {
    enrollmentId: c.enrollmentId,
    schoolClassId: c.schoolClassId,
    className: c.className,
    schoolArmId: c.schoolArmId,
    armName: c.armName,
    isPrimaryClass: c.isPrimaryClass,
    classType: c.classType,
    isCurrent: c.isCurrent,
  }
}

interface StudentTimetableByWeekViewerProps {
  studentId: string
  schoolId: string
  studentClass: string
  currentSessionName?: string
  currentTermName?: string
  termStartDate?: string
  termEndDate?: string
  currentSessionClasses: StudentPortalLaunchClassI[]
  selectedClass: SelectedStudentClassI | null
  onClassChange: (cls: SelectedStudentClassI | null) => void
}

export function StudentTimetableByWeekViewer({
  studentId,
  schoolId,
  studentClass,
  currentSessionName,
  currentTermName,
  termStartDate,
  termEndDate,
  currentSessionClasses,
  selectedClass,
  onClassChange,
}: StudentTimetableByWeekViewerProps) {
  const [weekStart, setWeekStart] = useState(() => currentWeekMonday())
  const [timetableTypeFilter, setTimetableTypeFilter] = useState("all")
  const [periodTypeFilter, setPeriodTypeFilter] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  const today = new Date().toISOString().split("T")[0]

  useEffect(() => {
    if (!termStartDate || !termEndDate) return
    const todayMonday = currentWeekMonday()
    setWeekStart((prev) => {
      if (prev >= termStartDate && prev <= termEndDate) return prev
      if (todayMonday >= termStartDate && todayMonday <= termEndDate)
        return todayMonday
      return mondayOfWeekContaining(
        todayMonday < termStartDate ? termStartDate : termEndDate
      )
    })
  }, [termStartDate, termEndDate])

  const { timetable, isLoading, isError } = useGetStudentPortalTimetableByWeek(
    studentId,
    schoolId,
    selectedClass?.schoolClassId || undefined,
    weekStart
  )

  const rawSlots = useMemo(() => timetable?.slots ?? [], [timetable])

  const timetableTypeOptions = useMemo(
    () =>
      Array.from(new Set(rawSlots.map((s) => s.timetableType))).filter(Boolean),
    [rawSlots]
  )
  const periodTypeOptions = useMemo(() => {
    const map = new Map<string, string>()
    rawSlots.forEach((s) => map.set(s.periodTypeId, s.periodTypeName))
    return Array.from(map.entries())
  }, [rawSlots])
  const classOptions = useMemo(
    () =>
      currentSessionClasses.map((c) => ({
        value: c.enrollmentId,
        label: `${formatClassOptionLabel(c.className, c.armName)}${c.isCurrent ? " (Current)" : ""}`,
        source: c,
      })),
    [currentSessionClasses]
  )

  const filteredSlots = useMemo(
    () =>
      rawSlots.filter((s) => {
        if (
          timetableTypeFilter !== "all" &&
          s.timetableType !== timetableTypeFilter
        )
          return false
        if (periodTypeFilter !== "all" && s.periodTypeId !== periodTypeFilter)
          return false
        return true
      }),
    [rawSlots, timetableTypeFilter, periodTypeFilter]
  )

  const periodsByDay = useMemo(() => {
    const map = new Map<DayName, TimetableSlotI[]>()
    DAYS.forEach((d) => map.set(d, []))
    filteredSlots.forEach((s) => {
      const day = resolveDayName(s)
      const bucket = day && map.get(day)
      if (bucket) bucket.push(mapSlot(s))
    })
    return map
  }, [filteredSlots])

  const weekRangeLabel = useMemo(
    () =>
      formatWeekRangeLabel(timetable?.weekStartDate?.slice(0, 10) ?? weekStart),
    [timetable, weekStart]
  )
  const weekNumber = useMemo(
    () => weekNumberInTerm(weekStart, termStartDate),
    [weekStart, termStartDate]
  )

  function handleClassChange(enrollmentId: string) {
    const cls = classOptions.find((o) => o.value === enrollmentId)?.source
    onClassChange(cls ? toSelectedClass(cls) : null)
  }

  if (currentSessionClasses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white py-20 text-center">
        <Info size={36} className="mb-3 text-gray-300" />
        <p className="text-sm font-medium text-gray-500">
          No class assigned yet.
        </p>
        <p className="mt-1 text-xs text-gray-400">
          Please contact the school if this looks incorrect.
        </p>
      </div>
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
        termStart={termStartDate}
        termEnd={termEndDate}
      />

      <div className="mt-4 flex flex-wrap items-center justify-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-xs font-medium text-gray-600">
        <span>{weekRangeLabel}</span>
        {currentSessionName && (
          <>
            <span className="text-gray-300">·</span>
            <span>{currentSessionName}</span>
          </>
        )}
        {currentTermName && (
          <>
            <span className="text-gray-300">·</span>
            <span>{currentTermName}</span>
          </>
        )}
        <span className="text-gray-300">·</span>
        <span>
          {timetable?.totalSlotsThisWeek ?? 0} period
          {(timetable?.totalSlotsThisWeek ?? 0) !== 1 ? "s" : ""} this week
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
              {timetableTypeOptions.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
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
              {periodTypeOptions.map(([id, name]) => (
                <SelectItem key={id} value={id}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <p className="text-xs font-bold tracking-widest text-gray-700 uppercase">
            Class
          </p>
          <Select
            value={selectedClass?.enrollmentId ?? ""}
            onValueChange={handleClassChange}
            disabled={classOptions.length <= 1}
          >
            <SelectTrigger className="h-9 w-48 border-gray-200 bg-white text-sm">
              <SelectValue placeholder="Select class" />
            </SelectTrigger>
            <SelectContent>
              {classOptions.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
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

      {!isLoading && !isError && (timetable?.totalSlotsThisWeek ?? 0) === 0 && (
        <p className="mt-4 text-center text-xs text-gray-400">
          No timetable periods scheduled for this week.
        </p>
      )}

      <div className="mt-4">
        {isLoading ? (
          <div className="flex items-center justify-center rounded-xl border border-gray-200 bg-white py-20">
            <Loader2 className="size-6 animate-spin text-gray-400" />
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white py-20 text-center">
            <Info size={36} className="mb-3 text-gray-300" />
            <p className="text-sm font-medium text-gray-500">
              Couldn't load timetable
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Please try again in a moment.
            </p>
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
