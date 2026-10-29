// WordPress version: Create/Update/Delete permissions, term and size limits, load errors with retry,
// paged "other weeks", the school's own date, unsaved-change prompts and a keyboard way to add periods.
import { useCallback, useEffect, useMemo, useState } from "react"
import { LayoutGrid, ListTree, Loader2, MapPin, Pencil, Video } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { SchoolStaffAvailability } from "@/components/timetable/StaffAvailability"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useSchoolId, useSchoolTimeZone } from "@/contexts/SchoolContext"
import { usePermissions } from "@/hooks/usePermissions"
import { dateISOInTimeZone } from "@/lib/schoolDate"
import { useGetAllSubjects } from "@/hooks/examAndRecords"
import {
  useCreateTimetable,
  useUpdateTimetableSlot,
  useDeleteTimetableSlot,
  useGetTimetableByWeek,
  useGetAllTimetables,
} from "@/hooks/timetable"
import { useGetPeriodTypesBySchool } from "@/hooks/timetablePeriodType"
import { useClassNotificationStore } from "@/store/classNotification.store"
import { EMPTY_TEMPLATES, usePeriodBankStore } from "@/store/periodBank.store"
import { useTimetableRefData } from "@/store/timetableRefData.store"
import type { TimetableSlotI } from "@/api/timetable.api/types"
import type { DayName } from "@/types/timetable"
import {
  TIMETABLE_TYPE,
  apiNumberToClassMode,
  dateForDayInWeek,
  dayNameToApiDayOfWeek,
  formatTimeHHMM,
  formatWeekRangeLabel,
  mondayOfWeekContaining,
  normalizeClassMode,
  normalizeTimeForApi,
  normalizeTimetableType,
  resolveDayName,
  timesOverlap,
  weekNumberInTerm,
} from "@/pages/Dashboard/Timetable/timetable.utils"
import { PeriodBankPanel } from "@/pages/Dashboard/Timetable/components/PeriodBankPanel"
import { WeekGridTable } from "@/pages/Dashboard/Timetable/components/WeekGridTable"
import { DayListView } from "@/pages/Dashboard/Timetable/components/DayListView"
import { PeriodFormDialog } from "@/pages/Dashboard/Timetable/components/PeriodFormDialog"
import { WeekStrip } from "@/pages/Dashboard/Timetable/components/WeekStrip"

const DAY_NAMES: DayName[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
]

const TIMETABLE_TYPE_LABEL: Record<number, string> = {
  [TIMETABLE_TYPE.Class]: "Class",
  [TIMETABLE_TYPE.Assessment]: "Assessment",
}

interface PendingSlot {
  localId: string
  day: DayName
  date: string
  timetableType: number
  startTime: string
  endTime: string
  periodTypeId: string
  periodTypeName: string
  periodTypeCode: string
  subjectId?: string
  subjectName?: string
  classMode?: number
  venue?: string
  assessmentType?: string
}

interface PendingSlotContext {
  schoolId: string
  sessionId: string
  termId: string
  classId: string
  weekStart: string
}

function pendingToSlot(p: PendingSlot, ctx: PendingSlotContext): TimetableSlotI {
  return {
    id: p.localId,
    schoolId: ctx.schoolId,
    schoolSessionId: ctx.sessionId,
    schoolSessionTermId: ctx.termId,
    schoolClassId: ctx.classId,
    schoolClassName: "",
    timetableType: p.timetableType,
    timetableTypeName: TIMETABLE_TYPE_LABEL[p.timetableType] ?? "",
    dayOfWeek: dayNameToApiDayOfWeek(p.day),
    dayOfWeekName: p.day,
    date: p.date,
    formattedDate: "",
    weekStartDate: ctx.weekStart,
    formattedWeekStartDate: "",
    periodTypeId: p.periodTypeId,
    periodTypeName: p.periodTypeName,
    periodTypeCode: p.periodTypeCode,
    startTime: p.startTime,
    formattedStartTime: "",
    endTime: p.endTime,
    formattedEndTime: "",
    subjectId: p.subjectId ?? "",
    subjectName: p.subjectName ?? "",
    classMode: p.classMode ?? null,
    classModeName: "",
    venue: p.venue ?? "",
    assessmentType: p.assessmentType ?? "",
    dateCreated: "",
  }
}

interface TimetableManageTabProps {
  initialTypeFilter?: number
}

export function TimetableManageTab({
  initialTypeFilter,
}: TimetableManageTabProps) {
  const schoolId = useSchoolId()
  const timeZone = useSchoolTimeZone()
  const permissions = usePermissions()
  const canCreate = permissions.canCreate("/dashboard/timetable/manage")
  const canUpdate = permissions.canUpdate("/dashboard/timetable/manage")
  const canDelete = permissions.canDelete("/dashboard/timetable/manage")
  // The monday of the school's own "today" (not the visitor's).
  const schoolWeekMonday = () => mondayOfWeekContaining(dateISOInTimeZone(timeZone))
  const [slotPage, setSlotPage] = useState(1)
  const notifyClassCreated = useClassNotificationStore((s) => s.notifyClassCreated)

  const {
    sessions,
    classes,
    isLoading: refDataLoading,
    isError: refDataError,
    refetch: refetchRefData,
  } = useTimetableRefData(schoolId)
  const sessionsLoading = refDataLoading && sessions.length === 0
  const classesLoading = refDataLoading && classes.length === 0
  const { subjects, isError: subjectsError, refetch: refetchSubjects } = useGetAllSubjects(schoolId)
  const {
    periodTypes,
    isError: periodTypesError,
    refetch: refetchPeriodTypes,
  } = useGetPeriodTypesBySchool({ schoolId })
  const classPeriodTypeId = periodTypes.find((t) => t.isBuiltIn && t.code === "class")?.id ?? ""

  const [selectedSessionId, setSelectedSessionId] = useState("")
  const [selectedTermId, setSelectedTermId] = useState("")
  const [selectedClassId, setSelectedClassId] = useState("")
  const [selectedWeekStart, setSelectedWeekStart] = useState(() => schoolWeekMonday())
  const [periodTypeFilter, setPeriodTypeFilter] = useState("all")
  const [timetableTypeFilter, setTimetableTypeFilter] = useState(
    initialTypeFilter ? String(initialTypeFilter) : "all"
  )
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingSlot, setEditingSlot] = useState<TimetableSlotI | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [pendingSlots, setPendingSlots] = useState<PendingSlot[]>([])
  const [isSaving, setIsSaving] = useState(false)


  const currentTermMatch = sessions
    .flatMap((s) => s.Terms.map((t) => ({ term: t, session: s })))
    .find(({ term }) => term.IsCurrent)
  const currentSession =
    currentTermMatch?.session ??
    sessions.find((s) => s.IsCurrent || s.Status === "Active") ??
    sessions[0]
  const activeSessionId = selectedSessionId || currentSession?.Id || ""
  const activeSession = sessions.find((s) => s.Id === activeSessionId)

  const currentTerm =
    activeSession?.Terms.find((t) => t.IsCurrent) ?? activeSession?.Terms[0]
  const activeTermId = selectedTermId || currentTerm?.Id || ""
  const activeTerm = activeSession?.Terms.find((t) => t.Id === activeTermId)
  const termStart = activeTerm?.StartDate?.slice(0, 10)
  const termEnd = activeTerm?.EndDate?.slice(0, 10)

  useEffect(() => {
    if (!termStart || !termEnd) return
    const today = schoolWeekMonday()
    setSelectedWeekStart((prev) => {
      if (prev >= termStart && prev <= termEnd) return prev
      if (today >= termStart && today <= termEnd) return today
      
      return mondayOfWeekContaining(today < termStart ? termStart : termEnd)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTermId, termStart, termEnd])

  const activeClassId = selectedClassId || classes[0]?.Id || ""


  useEffect(() => {
    setPendingSlots([])
  }, [activeSessionId, activeTermId, activeClassId, selectedWeekStart])

  const isReady =
    !!(activeSessionId && activeTermId && activeClassId) && !subjectsError && !periodTypesError

  const {
    timetable,
    isLoading,
    isError: weekError,
    refetch: refetchWeek,
  } = useGetTimetableByWeek({
    schoolId: isReady ? schoolId : "",
    sessionId: activeSessionId,
    termId: activeTermId,
    classId: activeClassId,
    weekStartDate: selectedWeekStart,
  })

 
  const isFlatListView =
    timetableTypeFilter !== String(TIMETABLE_TYPE.Class) && viewMode !== "grid"
  const {
    slots: allTimetableSlots,
    isLoading: allTimetableLoading,
    isError: allTimetableError,
    refetch: refetchAllTimetables,
    pagination: allTimetablePagination,
  } = useGetAllTimetables(
      {
        schoolId: isReady ? schoolId : "",
        sessionId: activeSessionId,
        termId: activeTermId,
        classId: activeClassId,
        timetableType:
          timetableTypeFilter === String(TIMETABLE_TYPE.Assessment)
            ? TIMETABLE_TYPE.Assessment
            : undefined,
        pageSize: 50,
        pageNumber: slotPage,
      },
      { enabled: isReady && isFlatListView }
    )

  const { createTimetableAsync } = useCreateTimetable()
  const { updateTimetableSlotAsync } = useUpdateTimetableSlot()
  const { deleteTimetableSlotAsync } = useDeleteTimetableSlot()

  const bankKey = `${schoolId}:${activeClassId}`
  const bankTemplates = usePeriodBankStore(
    (s) => s.templatesByClass[bankKey] ?? EMPTY_TEMPLATES
  )

  const allSlots = useMemo(() => timetable?.slots ?? [], [timetable])

  const pendingIds = useMemo(
    () => new Set(pendingSlots.map((p) => p.localId)),
    [pendingSlots]
  )

  const pendingSlotCtx: PendingSlotContext = {
    schoolId,
    sessionId: activeSessionId,
    termId: activeTermId,
    classId: activeClassId,
    weekStart: selectedWeekStart,
  }

  const periodsByDay = useMemo(() => {
    const map = new Map<DayName, TimetableSlotI[]>()
    DAY_NAMES.forEach((d) => map.set(d, []))

    function passesFilters(periodTypeId: string, type: number | undefined) {
      if (periodTypeFilter !== "all" && periodTypeId !== periodTypeFilter)
        return false
      if (timetableTypeFilter !== "all" && String(type) !== timetableTypeFilter)
        return false
      return true
    }

    allSlots.forEach((s) => {
      const day = resolveDayName(s)
      const bucket = day && map.get(day)
      if (!bucket) return
      if (!passesFilters(s.periodTypeId, normalizeTimetableType(s.timetableType))) return
      bucket.push(s)
    })

    pendingSlots.forEach((p) => {
      const bucket = map.get(p.day)
      if (!bucket) return
      if (!passesFilters(p.periodTypeId, normalizeTimetableType(p.timetableType))) return
      bucket.push(pendingToSlot(p, pendingSlotCtx))
    })

    return map
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allSlots, pendingSlots, periodTypeFilter, timetableTypeFilter])

  const totalPeriods = useMemo(
    () =>
      Array.from(periodsByDay.values()).reduce(
        (sum, slots) => sum + slots.length,
        0
      ),
    [periodsByDay]
  )

  const weekRangeLabel = useMemo(
    () => formatWeekRangeLabel(selectedWeekStart),
    [selectedWeekStart]
  )
  const weekNumber = useMemo(
    () => weekNumberInTerm(selectedWeekStart, termStart),
    [selectedWeekStart, termStart]
  )


  const flatListItems = useMemo(() => {
    if (!isFlatListView) return []

    const currentWeekEnd = dateForDayInWeek("Sunday", selectedWeekStart)

    return allTimetableSlots
      .filter((s) => periodTypeFilter === "all" || s.periodTypeId === periodTypeFilter)
      .filter((s) => {
        const date = s.date?.slice(0, 10)
        return !date || date < selectedWeekStart || date > currentWeekEnd
      })
      .sort((a, b) => {
        const dateCompare = (a.date || "").localeCompare(b.date || "")
        return dateCompare !== 0 ? dateCompare : a.startTime.localeCompare(b.startTime)
      })
  }, [allTimetableSlots, periodTypeFilter, selectedWeekStart, isFlatListView])

  const handleDropTemplate = useCallback(
    (day: DayName, templateId: string) => {
      if (!canCreate || isSaving) return
      const template = bankTemplates.find((t) => t.id === templateId)
      if (!template) return
      const templateType = template.timetableType ?? TIMETABLE_TYPE.Class
      const date = dateForDayInWeek(day, selectedWeekStart)
      if ((termStart && date < termStart) || (termEnd && date > termEnd)) {
        toast.error("Choose a day inside the selected term.")
        return
      }
      if (pendingSlots.length >= 200) {
        toast.error("Save these periods before adding more.")
        return
      }

      const daySlots = [
        ...allSlots.filter(
          (s) =>
            resolveDayName(s) === day &&
            normalizeTimetableType(s.timetableType) === templateType
        ),
        ...pendingSlots.filter(
          (p) =>
            p.day === day && p.date === date && p.timetableType === templateType
        ),
      ]
      const conflict = daySlots.find((s) =>
        timesOverlap(template.startTime, template.endTime, s.startTime, s.endTime)
      )
      if (conflict) {
        toast.error(
          `This overlaps with another ${TIMETABLE_TYPE_LABEL[templateType]} period already on ${day}.`
        )
        return
      }

      const isClassPeriod = template.periodTypeId === classPeriodTypeId
      const periodType = periodTypes.find((t) => t.id === template.periodTypeId)

      setPendingSlots((prev) => [
        ...prev,
        {
          localId: crypto.randomUUID(),
          day,
          date,
          timetableType: templateType,
          startTime: template.startTime,
          endTime: template.endTime,
          periodTypeId: template.periodTypeId,
          periodTypeName: periodType?.name ?? "",
          periodTypeCode: periodType?.code ?? "",
          subjectId: isClassPeriod ? template.subjectId : undefined,
          subjectName: isClassPeriod
            ? subjects.find((s) => s.Id === template.subjectId)?.Name
            : undefined,
          classMode: isClassPeriod ? template.classMode : undefined,
          venue: templateType === TIMETABLE_TYPE.Assessment ? template.venue : undefined,
          assessmentType:
            templateType === TIMETABLE_TYPE.Assessment
              ? template.assessmentType
              : undefined,
        },
      ])
    },
    [bankTemplates, selectedWeekStart, allSlots, pendingSlots, classPeriodTypeId, periodTypes, subjects, canCreate, isSaving, termStart, termEnd]
  )

  const openEditPeriod = useCallback(
    (slot: TimetableSlotI) => {
      if (!canUpdate) return
      setEditingSlot(slot)
      setDialogOpen(true)
    },
    [canUpdate],
  )

  const handleTimeSave = useCallback(
    async (period: TimetableSlotI, startTime: string, endTime: string) => {
      if (isSaving || !(pendingIds.has(period.id) ? canCreate : canUpdate)) return
      if (startTime >= endTime) {
        toast.error("End time must follow start time.")
        throw new Error("Invalid time range")
      }
      const normalizedStart = normalizeTimeForApi(startTime)
      const normalizedEnd = normalizeTimeForApi(endTime)

      if (pendingIds.has(period.id)) {
        setPendingSlots((prev) =>
          prev.map((p) =>
            p.localId === period.id
              ? { ...p, startTime: normalizedStart, endTime: normalizedEnd }
              : p
          )
        )
        return
      }

      const day = resolveDayName(period)
      await updateTimetableSlotAsync({
        id: period.id,
        schoolId,
        dayOfWeek: day ? dayNameToApiDayOfWeek(day) : period.dayOfWeek,
        date:
          period.date?.slice(0, 10) ||
          (day ? dateForDayInWeek(day, selectedWeekStart) : selectedWeekStart),
        weekStartDate: period.weekStartDate?.slice(0, 10) || selectedWeekStart,
        startTime: normalizedStart,
        endTime: normalizedEnd,
        subjectId: period.subjectId || undefined,
        periodTypeId: period.periodTypeId,
        classMode: normalizeClassMode(period.classMode),
        venue: period.venue || undefined,
        assessmentType: period.assessmentType || undefined,
      })
    },
    [pendingIds, schoolId, selectedWeekStart, updateTimetableSlotAsync, canCreate, canUpdate, isSaving]
  )

  const handleDeleteSlot = useCallback(
    async (id: string) => {
      if (isSaving || !(pendingIds.has(id) ? canCreate : canDelete)) return
      if (pendingIds.has(id)) {
        setPendingSlots((prev) => prev.filter((p) => p.localId !== id))
        return
      }
      if (!window.confirm("Remove this scheduled period?")) return
      setDeletingId(id)
      try {
        await deleteTimetableSlotAsync(id)
      } catch {
        // toasted by the mutation
      } finally {
        setDeletingId(null)
      }
    },
    [pendingIds, deleteTimetableSlotAsync, canCreate, canDelete, isSaving]
  )

  function handleDiscardChanges() {
    setPendingSlots([])
  }

  async function handleSaveChanges() {
    if (!canCreate || pendingSlots.length === 0 || isSaving) return
    setIsSaving(true)

    try {
      await createTimetableAsync({
        schoolId,
        schoolSessionId: activeSessionId,
        schoolSessionTermId: activeTermId,
        schoolClassId: activeClassId,
        weekStartDate: selectedWeekStart,
        slots: pendingSlots.map((p) => ({
          timetableType: p.timetableType,
          startTime: p.startTime,
          endTime: p.endTime,
          date: p.date,
          dayOfWeek: dayNameToApiDayOfWeek(p.day),
          periodTypeId: p.periodTypeId,
          classMode: p.classMode,
          subjectId: p.subjectId,
          venue: p.venue,
          assessmentType: p.assessmentType,
        })),
      })

   
      await refetchWeek()

      const activeClass = classes.find((c) => c.Id === activeClassId)
      if (activeClass) {
        pendingSlots
          .filter((p) => p.timetableType === TIMETABLE_TYPE.Class && p.subjectName)
          .forEach((p) => {
            notifyClassCreated({
              className: activeClass.ClsName,
              day: p.day,
              subject: p.subjectName!,
              mode: apiNumberToClassMode(p.classMode),
              startTime: p.startTime,
              endTime: p.endTime,
            })
          })
      }

      setPendingSlots([])
    } catch {
      // toasted by the mutation's onError
    } finally {
      setIsSaving(false)
    }
  }

  /** Changing session, class, term or week drops unsaved periods, so ask first. */
  function canLeaveSelection() {
    return (
      !isSaving &&
      (!pendingSlots.length || window.confirm("Discard unsaved periods and change the selection?"))
    )
  }

  const editingSlotType = normalizeTimetableType(editingSlot?.timetableType)

  return (
    <div className="space-y-5">
      {refDataError && (
        <div role="alert" className="rounded-xl bg-red-50 p-5">
          Unable to load sessions and classes.{" "}
          <Button
            onClick={() => {
              void refetchRefData()
            }}
          >
            Try Again
          </Button>
        </div>
      )}
      {(subjectsError || periodTypesError) && (
        <div role="alert" className="rounded-xl bg-red-50 p-5">
          Unable to load subjects or period types.{" "}
          <Button
            onClick={() => {
              void refetchSubjects()
              void refetchPeriodTypes()
            }}
          >
            Try Again
          </Button>
        </div>
      )}
      {/* Session / Term / Class */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Select
          value={activeSessionId}
          onValueChange={(v) => {
            if (!canLeaveSelection()) return
            setSlotPage(1)
            setSelectedSessionId(v)
            setSelectedTermId("")
          }}
        >
          <SelectTrigger className="h-11 rounded-xl border-gray-200 bg-white font-medium w-full">
            <SelectValue
              placeholder={sessionsLoading ? "Loading sessions..." : "Session"}
            />
          </SelectTrigger>
          <SelectContent>
            {sessions.map((s) => (
              <SelectItem key={s.Id} value={s.Id}>
                {s.SessionName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={activeClassId}
          onValueChange={(v) => {
            if (!canLeaveSelection()) return
            setSelectedClassId(v)
            setSlotPage(1)
          }}
        >
          <SelectTrigger className="h-11 rounded-xl border-gray-200 bg-white font-medium w-full">
            <SelectValue
              placeholder={
                classesLoading ? "Loading classes..." : "Select class"
              }
            />
          </SelectTrigger>
          <SelectContent className="max-h-64">
            {classes.map((c) => (
              <SelectItem key={c.Id} value={c.Id}>
                {c.ClsName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={activeTermId}
          onValueChange={(v) => {
            if (!canLeaveSelection()) return
            setSelectedTermId(v)
            setSlotPage(1)
          }}
        >
          <SelectTrigger className="h-11 rounded-xl border-gray-200 bg-white font-medium w-full">
            <SelectValue placeholder="Term" />
          </SelectTrigger>
          <SelectContent>
            {(activeSession?.Terms ?? []).map((t) => (
              <SelectItem key={t.Id} value={t.Id}>
                {t.TermName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {weekError ? (
        <div role="alert" className="rounded-xl bg-red-50 p-5">
          Unable to load the timetable.{" "}
          <Button
            onClick={() => {
              void refetchWeek()
            }}
          >
            Try Again
          </Button>
        </div>
      ) : isLoading ? (
        <div className="flex items-center justify-center rounded-xl border border-gray-200 bg-white py-16">
          <Loader2 className="size-6 animate-spin text-gray-400" />
        </div>
      ) : !isReady ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 bg-gray-50 py-16 text-center">
          <p className="text-sm font-medium text-gray-600">
            Select a session, term, and class to build a timetable.
          </p>
        </div>
      ) : (
        <>
          <WeekStrip
            weekStart={selectedWeekStart}
            onChange={(week) => {
              if (canLeaveSelection()) setSelectedWeekStart(week)
            }}
            termStart={termStart}
            termEnd={termEnd}
          />

          <SchoolStaffAvailability
            week={selectedWeekStart}
            classId={activeClassId}
            termId={activeTermId}
            className={classes.find((item) => item.Id === activeClassId)?.ClsName ?? ""}
          />

          {canCreate && (
            <>
              <PeriodBankPanel bankKey={bankKey} schoolClassId={activeClassId} />
              <SchedulePeriod templates={bankTemplates} onAdd={handleDropTemplate} />
            </>
          )}

          {pendingSlots.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
              <p className="text-sm font-medium text-amber-800">
                {pendingSlots.length} unsaved period
                {pendingSlots.length !== 1 ? "s" : ""} — drag more onto this
                week, then save to publish them all.
              </p>
              <div className="flex shrink-0 items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDiscardChanges}
                  disabled={isSaving}
                >
                  Discard
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleSaveChanges}
                  disabled={isSaving}
                >
                  {isSaving
                    ? "Saving…"
                    : `Save ${pendingSlots.length} Change${pendingSlots.length !== 1 ? "s" : ""}`}
                </Button>
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-xs font-medium text-gray-600">
            <span>{weekRangeLabel}</span>
            <span className="text-gray-300">·</span>
            <span>{activeSession?.SessionName}</span>
            {activeTerm && (
              <>
                <span className="text-gray-300">·</span>
                <span>{activeTerm.TermName}</span>
              </>
            )}
            <span className="text-gray-300">·</span>
            <span>
              {totalPeriods} period{totalPeriods !== 1 ? "s" : ""} this week
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <p className="text-xs font-bold tracking-widest text-gray-700 uppercase">
                Timetable
              </p>
              <Select
                value={timetableTypeFilter}
                onValueChange={(v) => {
                  setTimetableTypeFilter(v)
                  setSlotPage(1)
                }}
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
              <Select
                value={periodTypeFilter}
                onValueChange={setPeriodTypeFilter}
              >
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
              onClick={() =>
                setViewMode((m) => (m === "grid" ? "list" : "grid"))
              }
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

          {viewMode === "grid" ? (
            <WeekGridTable
              weekStart={selectedWeekStart}
              weekNumber={weekNumber}
              periodsByDay={periodsByDay}
              pendingIds={pendingIds}
              onDropTemplate={handleDropTemplate}
              onEdit={openEditPeriod}
              onDelete={handleDeleteSlot}
              onTimeSave={handleTimeSave}
              deletingId={deletingId}
            />
          ) : (
            <DayListView
              weekStart={selectedWeekStart}
              periodsByDay={periodsByDay}
              pendingIds={pendingIds}
              onDropTemplate={handleDropTemplate}
              onEdit={openEditPeriod}
              onDelete={handleDeleteSlot}
              deletingId={deletingId}
            />
          )}

          {isFlatListView && (
            <div className="space-y-2.5">
              <p className="text-xs font-bold tracking-widest text-gray-700 uppercase">
                {timetableTypeFilter === String(TIMETABLE_TYPE.Assessment)
                  ? "All Assessments"
                  : "All Timetables"}{" "}
                <span className="font-normal normal-case text-gray-400">
                  (other weeks)
                </span>
              </p>
              {allTimetableError && (
                <div role="alert" className="rounded-xl bg-red-50 p-5">
                  Unable to load the other weeks.{" "}
                  <Button
                    onClick={() => {
                      void refetchAllTimetables()
                    }}
                  >
                    Try Again
                  </Button>
                </div>
              )}
              <TimetableListPanel
                items={flatListItems}
                isLoading={allTimetableLoading}
                pendingIds={pendingIds}
                onEdit={openEditPeriod}
                onDelete={handleDeleteSlot}
                deletingId={deletingId}
              />
              <div className="flex items-center justify-end gap-3">
                <Button variant="outline" disabled={slotPage <= 1} onClick={() => setSlotPage((p) => p - 1)}>
                  Previous page
                </Button>
                <span className="text-sm">
                  Page {slotPage} of {allTimetablePagination?.totalPages || 1}
                </span>
                <Button
                  variant="outline"
                  disabled={slotPage >= (allTimetablePagination?.totalPages || 1)}
                  onClick={() => setSlotPage((p) => p + 1)}
                >
                  Next page
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <PeriodFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        schoolClassId={activeClassId}
        initialSlot={editingSlot}
        slotTimetableType={editingSlotType}
      />
    </div>
  )
}

// ─── Timetable list (flat, date-sorted — not week-scoped) ──────────────────────

function TimetableListPanel({
  items,
  isLoading,
  pendingIds,
  onEdit,
  onDelete,
  deletingId,
}: {
  items: TimetableSlotI[]
  isLoading: boolean
  pendingIds: Set<string>
  onEdit: (slot: TimetableSlotI) => void
  onDelete: (id: string) => void
  deletingId: string | null
}) {
  const permissions = usePermissions()
  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-gray-200 bg-white py-16">
        <Loader2 className="size-6 animate-spin text-gray-400" />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-gray-300 bg-gray-50 py-16 text-center">
        <p className="text-sm font-medium text-gray-600">
          No timetable slots created yet.
        </p>
        <p className="text-xs text-gray-400">
          Drag a period onto a day above to schedule one.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="divide-y divide-gray-100">
        {items.map((slot) => {
          const isPending = pendingIds.has(slot.id)
          const day = resolveDayName(slot)
          const type = normalizeTimetableType(slot.timetableType)
          const isAssessment = type === TIMETABLE_TYPE.Assessment
          const mode = apiNumberToClassMode(slot.classMode)
          return (
            <div
              key={slot.id}
              className={`flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 ${
                isPending ? "bg-amber-50/60" : ""
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-24 shrink-0">
                  <p className="text-sm font-semibold text-gray-800">
                    {slot.date ? fmtSlotDate(slot.date) : "—"}
                  </p>
                  {day && <p className="text-xs text-gray-400">{day}</p>}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    {type !== undefined && (
                      <span
                        className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${
                          isAssessment
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {TIMETABLE_TYPE_LABEL[type]}
                      </span>
                    )}
                    <p className="text-sm font-medium text-gray-800">
                      {slot.subjectName || slot.periodTypeName}
                    </p>
                  </div>
                  {isAssessment && (slot.venue || slot.assessmentType) && (
                    <p className="text-xs text-gray-400">
                      {[slot.assessmentType, slot.venue]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  )}
                  {!isAssessment && slot.subjectName && mode && (
                    <p className="flex items-center gap-1 text-xs text-gray-400 capitalize">
                      {mode === "virtual" ? (
                        <Video className="h-3 w-3" />
                      ) : (
                        <MapPin className="h-3 w-3" />
                      )}
                      {mode}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500">
                  {formatTimeHHMM(slot.startTime)}
                  {slot.endTime ? ` – ${formatTimeHHMM(slot.endTime)}` : ""}
                </span>
                {isPending ? (
                  <span className="flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wide text-amber-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                    Unsaved
                  </span>
                ) : (
                  <>
                    <button
                      type="button"
                      disabled={!permissions.canUpdate("/dashboard/timetable/manage")}
                      onClick={() => onEdit(slot)}
                      className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                      title="Edit"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(slot.id)}
                      disabled={deletingId === slot.id || !permissions.canDelete("/dashboard/timetable/manage")}
                      className="rounded-lg border border-gray-200 px-2.5 py-1 text-[11px] font-medium text-blue-600 hover:bg-blue-50 disabled:opacity-50"
                    >
                      {deletingId === slot.id ? "Removing…" : "Remove"}
                    </button>
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function fmtSlotDate(iso: string) {
  const [y, m, d] = iso.slice(0, 10).split("-")
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ]
  return `${parseInt(d)} ${months[parseInt(m) - 1]} ${y}`
}

/** A keyboard alternative to dragging a period from the bank onto a day. */
function SchedulePeriod({
  templates,
  onAdd,
}: {
  templates: { id: string; startTime: string; endTime: string }[]
  onAdd: (day: DayName, templateId: string) => void
}) {
  const [templateId, setTemplateId] = useState("")
  const [day, setDay] = useState<DayName>("Monday")
  if (!templates.length) return null
  return (
    <div className="flex flex-wrap items-center gap-3" aria-label="Schedule a period">
      <label>
        Period{" "}
        <select
          aria-label="Period to schedule"
          className="rounded border p-2"
          value={templateId}
          onChange={(e) => setTemplateId(e.target.value)}
        >
          <option value="">Choose a period</option>
          {templates.map((t, i) => (
            <option key={t.id} value={t.id}>
              Period {i + 1}: {t.startTime.slice(0, 5)}–{t.endTime.slice(0, 5)}
            </option>
          ))}
        </select>
      </label>
      <label>
        Day{" "}
        <select
          aria-label="Day to schedule"
          className="rounded border p-2"
          value={day}
          onChange={(e) => setDay(e.target.value as DayName)}
        >
          {DAY_NAMES.map((d) => (
            <option key={d}>{d}</option>
          ))}
        </select>
      </label>
      <Button disabled={!templates.some((t) => t.id === templateId)} onClick={() => onAdd(day, templateId)}>
        Add to week
      </Button>
    </div>
  )
}
