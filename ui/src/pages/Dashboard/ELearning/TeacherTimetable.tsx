import { useMemo } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router"
import {
  BookOpen,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  MapPin,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PageHeader } from "@/components/general/PageHeader"
import { dashboardCardSurface } from "@/components/general/StatCard"
import { DashboardRoutes } from "@/routes"
import { useSchoolId } from "@/contexts/SchoolContext"
import { useELearningFilterOptions } from "@/hooks/elearning/useELearningFilterOptions"
import {
  useELearningOverview,
  useELearningTeacherTimetableWeek,
} from "@/hooks/elearning/useELearningOverview"
import type { TimetableSlotI } from "@/api/timetable.api/types"

const CLASS_TIMETABLE = 1

function toDate(value: string) {
  return new Date(`${value.slice(0, 10)}T00:00:00`)
}

function toISO(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function mondayOf(date: Date) {
  const output = new Date(date)
  const offset = (output.getDay() + 6) % 7
  output.setDate(output.getDate() - offset)
  return output
}

function termWeeks(startDate?: string, endDate?: string) {
  if (!startDate || !endDate) return []
  const end = toDate(endDate)
  const cursor = mondayOf(toDate(startDate))
  const weeks: string[] = []
  while (cursor <= end && weeks.length < 60) {
    weeks.push(toISO(cursor))
    cursor.setDate(cursor.getDate() + 7)
  }
  return weeks
}

function weekLabel(value: string) {
  const start = toDate(value)
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
  }
  return `${start.toLocaleDateString(undefined, options)} – ${end.toLocaleDateString(undefined, { ...options, year: "numeric" })}`
}

function dayLabel(slot: TimetableSlotI) {
  if (slot.dayOfWeekName) return slot.dayOfWeekName
  const raw = slot.formattedDate || slot.date
  if (!raw) return "Day"
  const date = toDate(raw)
  return Number.isNaN(date.getTime())
    ? "Day"
    : date.toLocaleDateString(undefined, { weekday: "long" })
}

function TimetableRow({ slot }: { slot: TimetableSlotI }) {
  return (
    <div className="grid gap-3 border-b border-slate-100 px-5 py-4 last:border-b-0 md:grid-cols-[0.8fr_1fr_1.2fr_1fr_0.9fr] md:items-center">
      <p className="text-sm font-semibold text-slate-800">{dayLabel(slot)}</p>
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <Clock3 className="size-4 text-slate-400" />
        {slot.formattedStartTime || slot.startTime} –{" "}
        {slot.formattedEndTime || slot.endTime}
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-slate-900">
          {slot.subjectName || slot.periodTypeName || "Class period"}
        </p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {slot.schoolClassName}
        </p>
      </div>
      <span className="w-fit rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
        {slot.classModeName || "Not specified"}
      </span>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <MapPin className="size-3.5" />
        <span className="truncate">{slot.venue || "No venue"}</span>
      </div>
    </div>
  )
}

export default function ELearningTeacherTimetablePage() {
  const { productId, teacherId } = useParams<{
    productId: string
    teacherId: string
  }>()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const schoolId = useSchoolId()
  const {
    termRanges,
    termIdByName,
    sessionId,
    currentTermName,
    isLoading: optionsLoading,
  } = useELearningFilterOptions(schoolId)

  const termId = currentTermName ? termIdByName[currentTermName] : undefined
  const range = currentTermName ? termRanges[currentTermName] : undefined
  const weeks = useMemo(
    () => termWeeks(range?.startDate, range?.endDate),
    [range?.endDate, range?.startDate]
  )
  const requestedWeek = searchParams.get("week") ?? ""
  const currentMonday = toISO(mondayOf(new Date()))
  const selectedWeek = weeks.includes(requestedWeek)
    ? requestedWeek
    : weeks.includes(currentMonday)
      ? currentMonday
      : (weeks[0] ?? "")
  const selectedIndex = weeks.indexOf(selectedWeek)

  const overviewQuery = useELearningOverview({
    schoolId,
    schoolSessionId: sessionId,
    schoolSessionTermId: termId,
  })
  const teacher = overviewQuery.overview?.teachers.find(
    (item) => item.subUserId === teacherId
  )

  const timetableQuery = useELearningTeacherTimetableWeek({
    schoolId,
    teacherSubUserId: teacherId,
    schoolSessionId: sessionId,
    schoolSessionTermId: termId,
    timetableType: CLASS_TIMETABLE,
    weekStartDate: selectedWeek,
  })
  const slots = timetableQuery.data?.value?.slots ?? []

  const selectWeek = (week: string) => {
    const next = new URLSearchParams(searchParams)
    next.set("week", week)
    setSearchParams(next, { replace: true })
  }

  const loading = optionsLoading || overviewQuery.isLoading

  return (
    <div className="space-y-6">
      <PageHeader
        title={teacher ? `${teacher.name} · Timetable` : "Teacher timetable"}
        description={`${currentTermName ?? "Current term"} · weekly teaching schedule`}
        onBack={() => navigate(DashboardRoutes.toELearning(productId ?? ""))}
        backLabel="Back to overview"
        actions={
          teacher ? (
            <Button
              variant="outline"
              className="h-9 gap-2 rounded-lg"
              onClick={() =>
                navigate(
                  DashboardRoutes.toELearningTeacherCourses(
                    productId ?? "",
                    teacher.subUserId
                  )
                )
              }
            >
              <BookOpen className="size-4" />
              View courses
            </Button>
          ) : undefined
        }
      />

      <div className={`${dashboardCardSurface} p-4`}>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            size="icon-sm"
            disabled={selectedIndex <= 0}
            onClick={() => selectWeek(weeks[selectedIndex - 1])}
            aria-label="Previous week"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Select value={selectedWeek} onValueChange={selectWeek}>
            <SelectTrigger className="w-64">
              <CalendarDays className="size-4 text-indigo-500" />
              <SelectValue placeholder="Select week" />
            </SelectTrigger>
            <SelectContent>
              {weeks.map((week, index) => (
                <SelectItem key={week} value={week}>
                  Week {index + 1} · {weekLabel(week)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon-sm"
            disabled={selectedIndex < 0 || selectedIndex >= weeks.length - 1}
            onClick={() => selectWeek(weeks[selectedIndex + 1])}
            aria-label="Next week"
          >
            <ChevronRight className="size-4" />
          </Button>
          <span className="ml-auto text-xs text-muted-foreground">
            {slots.length} period{slots.length === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      {loading || timetableQuery.isLoading ? (
        <div className="flex justify-center py-20">
          <Spinner className="size-6" />
        </div>
      ) : timetableQuery.isError ? (
        <div className="rounded-2xl border border-red-100 bg-red-50 px-6 py-12 text-center text-sm text-red-700">
          This teacher’s timetable could not be loaded.
        </div>
      ) : slots.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
          <CalendarDays className="mx-auto size-8 text-slate-300" />
          <p className="mt-3 text-sm font-semibold text-slate-700">
            No assigned timetable periods this week
          </p>
        </div>
      ) : (
        <section className={dashboardCardSurface}>
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="font-semibold text-slate-900">
              Week {selectedIndex + 1}
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {weekLabel(selectedWeek)}
            </p>
          </div>
          <div>
            {slots.map((slot) => (
              <TimetableRow key={slot.id} slot={slot} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
