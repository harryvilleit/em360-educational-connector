import { useMemo, useState } from "react"
import {
  CalendarDays,
  CalendarRange,
  Clock3,
  Info,
  Loader2,
  Search,
  Users,
} from "lucide-react"
import { format } from "date-fns"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useSchoolId, useSchoolTimeZone } from "@/contexts/SchoolContext"
import { useGetCalendarEvents } from "@/hooks/calendar"
import { getEventColor, toDisplayEvents } from "@/data/calendarEvents"
import { EVENT_TYPES } from "./CalendarEventSchema"
import { dateISOInTimeZone } from "@/lib/schoolDate"

interface SchoolCalendarViewerProps {
  studentClass: string
  classId?: string
  studentId?: string
  startDate?: string
  endDate?: string
}

const ALL_TYPES = "all"

export function SchoolCalendarViewer({
  studentClass,
  classId,
  studentId,
  startDate,
  endDate,
}: SchoolCalendarViewerProps) {
  const schoolId = useSchoolId()
  const timeZone = useSchoolTimeZone()
  const { events, isLoading, isError, refetch } = useGetCalendarEvents({
    schoolId,
    classId,
    studentId,
    startDate,
    endDate,
  })
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState(ALL_TYPES)
  const [showPast, setShowPast] = useState(false)
  const today = dateISOInTimeZone(timeZone)

  const displayEvents = useMemo(() => {
    return toDisplayEvents(events)
  }, [events])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    const selectedType = EVENT_TYPES.find(
      (type) => String(type.value) === typeFilter
    )?.label.toLowerCase()

    return displayEvents
      .filter((event) => showPast || (event.endDate ?? event.date) >= today)
      .filter(
        (event) => typeFilter === ALL_TYPES || event.type === selectedType
      )
      .filter(
        (event) =>
          !term ||
          event.title.toLowerCase().includes(term) ||
          event.description.toLowerCase().includes(term)
      )
      .sort((a, b) => a.date.localeCompare(b.date))
  }, [displayEvents, search, showPast, today, typeFilter])

  const nextEvent = displayEvents
    .filter((event) => (event.endDate ?? event.date) >= today)
    .sort((a, b) => a.date.localeCompare(b.date))[0]

  if (isLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center rounded-2xl border border-gray-200 bg-white">
        <Loader2 className="size-6 animate-spin text-blue-500" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-sm font-medium text-red-700">
          We could not load the school calendar.
        </p>
        <p className="mt-1 text-xs text-red-600">
          Check your connection and try again.
        </p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => void refetch()}
        >
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 px-6 py-6 text-white shadow-sm sm:px-8">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div>
            <p className="text-xs font-medium tracking-wider text-blue-200 uppercase">
              Shared school calendar
            </p>
            <h2 className="mt-1 text-xl font-semibold sm:text-2xl">
              Dates that matter, in one place
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
              Showing school-wide dates and events relevant to{" "}
              {studentClass || "this student"}.
            </p>
          </div>

          {nextEvent ? (
            <div className="rounded-2xl bg-white/10 px-5 py-4 ring-1 ring-white/15 backdrop-blur-sm lg:min-w-72">
              <p className="text-[11px] font-medium tracking-wider text-blue-200 uppercase">
                Next event
              </p>
              <p className="mt-1 text-sm font-semibold">{nextEvent.title}</p>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-300">
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="size-3.5" />
                  {formatDate(nextEvent.date)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock3 className="size-3.5" />
                  {nextEvent.startTime ?? "All day"}
                </span>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl bg-white/10 px-5 py-4 text-sm text-slate-300 ring-1 ring-white/15">
              No upcoming events have been published.
            </div>
          )}
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <SummaryCard
          label="Upcoming"
          value={
            displayEvents.filter(
              (event) => (event.endDate ?? event.date) >= today
            ).length
          }
          icon={CalendarRange}
          tone="bg-blue-50 text-blue-600"
        />
        <SummaryCard
          label="School-wide"
          value={displayEvents.filter((event) => event.affectsAll).length}
          icon={Users}
          tone="bg-emerald-50 text-emerald-600"
        />
        <SummaryCard
          label="For this class"
          value={displayEvents.filter((event) => !event.affectsAll).length}
          icon={CalendarDays}
          tone="bg-violet-50 text-violet-600"
          className="col-span-2 sm:col-span-1"
        />
      </section>

      <section className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search calendar"
            className="h-10 w-full border-gray-200 pl-9"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="h-10 w-full border-gray-200 sm:w-44">
            <SelectValue placeholder="All event types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_TYPES}>All event types</SelectItem>
            {EVENT_TYPES.map((type) => (
              <SelectItem key={type.value} value={String(type.value)}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <button
          type="button"
          onClick={() => setShowPast((value) => !value)}
          className={`h-10 rounded-lg border px-4 text-xs font-medium transition-colors ${
            showPast
              ? "border-blue-200 bg-blue-50 text-blue-700"
              : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
          }`}
        >
          {showPast ? "Hide past" : "Show past"}
        </button>
      </section>

      <section className="space-y-3">
        {filtered.map((event) => {
          const isPast = (event.endDate ?? event.date) < today
          const isOngoing =
            event.date <= today && (event.endDate ?? event.date) >= today

          return (
            <article
              key={event.id}
              className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition-shadow hover:shadow-md ${
                isOngoing ? "border-emerald-200" : "border-gray-200"
              } ${isPast ? "opacity-70" : ""}`}
            >
              <div className="flex items-stretch">
                <div className="flex w-20 shrink-0 flex-col items-center justify-center border-r border-gray-100 bg-gray-50 px-2 py-5">
                  <p className="text-2xl leading-none font-semibold text-gray-900">
                    {event.date.split("-")[2]}
                  </p>
                  <p className="mt-1 text-[11px] font-medium tracking-wide text-gray-500 uppercase">
                    {format(new Date(`${event.date}T00:00:00`), "MMM")}
                  </p>
                </div>

                <div className="min-w-0 flex-1 px-5 py-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-gray-900">
                      {event.title}
                    </h3>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${getEventColor(event.type)}`}
                    >
                      {event.typeLabel}
                    </span>
                    {isOngoing && (
                      <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-medium text-emerald-700">
                        Happening now
                      </span>
                    )}
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <CalendarDays className="size-3.5" />
                      {formatDate(event.date)}
                      {event.endDate ? ` – ${formatDate(event.endDate)}` : ""}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock3 className="size-3.5" />
                      {event.startTime
                        ? `${event.startTime}${event.endTime ? ` – ${event.endTime}` : ""}`
                        : "All day"}
                    </span>
                  </div>

                  {event.description && (
                    <p className="mt-3 text-xs leading-5 text-gray-600">
                      {event.description}
                    </p>
                  )}

                  <div className="mt-3 flex items-center gap-1.5 text-[11px] text-gray-400">
                    <Users className="size-3" />
                    {event.affectsAll
                      ? "Everyone in the school"
                      : event.affectedClasses?.join(", ") || studentClass}
                  </div>
                </div>
              </div>
            </article>
          )
        })}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white py-20 text-center">
            <CalendarDays size={36} className="mb-3 text-gray-300" />
            <p className="text-sm font-medium text-gray-600">
              No matching calendar events
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Try changing the event type, search or past-event filter.
            </p>
          </div>
        )}
      </section>

      <div className="flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
        <Info className="mt-0.5 size-4 shrink-0 text-blue-500" />
        <p className="text-xs leading-5 text-blue-700">
          This is the same school calendar used by staff, students and parents.
          Class-specific dates are filtered securely for the selected student.
        </p>
      </div>
    </div>
  )
}

function SummaryCard({
  label,
  value,
  icon: Icon,
  tone,
  className = "",
}: {
  label: string
  value: number
  icon: typeof CalendarDays
  tone: string
  className?: string
}) {
  return (
    <div
      className={`rounded-2xl border border-gray-200 bg-white p-4 shadow-sm ${className}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs text-gray-500">{label}</p>
          <p className="mt-1 text-xl font-semibold text-gray-900">{value}</p>
        </div>
        <div
          className={`flex size-9 items-center justify-center rounded-xl ${tone}`}
        >
          <Icon className="size-4" />
        </div>
      </div>
    </div>
  )
}

function formatDate(iso: string) {
  return format(new Date(`${iso}T00:00:00`), "EEE, d MMM yyyy")
}
