// WordPress version: only roles with Create on the calendar can add events.
import { useCallback, useMemo, useState } from "react"
import {
  CalendarCheck2,
  CalendarDays,
  Clock3,
  List as ListIcon,
  Loader2,
  Plus,
  Search,
  Users,
} from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useSchoolId, useSchoolTimeZone } from "@/contexts/SchoolContext"
import { useGetCalendarEvents } from "@/hooks/calendar"
import { usePermissions } from "@/hooks/usePermissions"
import {
  getEventColor,
  toDisplayEvents,
  type DisplayCalendarEvent,
} from "@/data/calendarEvents"
import type { CalendarEventI } from "@/api/calendar.api/types"
import { AgendaList } from "@/pages/Dashboard/Timetable/components/AgendaList"
import { CalendarEventFormDialog } from "@/pages/Dashboard/Timetable/components/CalendarEventFormDialog"
import { EVENT_TYPES } from "@/pages/Dashboard/Timetable/components/CalendarEventSchema"
import { MonthCalendarGrid } from "@/pages/Dashboard/Timetable/components/MonthCalendarGrid"
import { dateISOInTimeZone } from "@/lib/schoolDate"

type View = "month" | "agenda"
const ALL_TYPES = "all"

export default function SchoolCalendarPage() {
  const schoolId = useSchoolId()
  const canCreate = usePermissions().canCreate("/dashboard/timetable/calendar")
  const timeZone = useSchoolTimeZone()
  const { events, isLoading, isError, refetch } = useGetCalendarEvents({
    schoolId,
  })

  const [view, setView] = useState<View>("month")
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState(ALL_TYPES)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<CalendarEventI | null>(null)
  const [prefillDate, setPrefillDate] = useState<string | undefined>(undefined)

  const allDisplayEvents = useMemo(() => {
    return toDisplayEvents(events)
  }, [events])

  const filteredDisplayEvents = useMemo(() => {
    const term = search.trim().toLowerCase()
    const selectedType = EVENT_TYPES.find(
      (type) => String(type.value) === typeFilter
    )?.label.toLowerCase()

    return allDisplayEvents
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
  }, [allDisplayEvents, search, typeFilter])

  const filteredStoredEvents = useMemo(() => {
    const visibleIds = new Set(filteredDisplayEvents.map((event) => event.id))
    return events.filter((event) => visibleIds.has(event.id))
  }, [events, filteredDisplayEvents])

  const today = dateISOInTimeZone(timeZone)
  const thisMonth = today.slice(0, 7)
  const upcoming = allDisplayEvents.filter(
    (event) => (event.endDate ?? event.date) >= today
  )
  const nextEvent = [...upcoming].sort((a, b) =>
    a.date.localeCompare(b.date)
  )[0]
  const stats = [
    {
      label: "Upcoming",
      value: upcoming.length,
      icon: Clock3,
      tone: "bg-blue-50 text-blue-600",
    },
    {
      label: "This month",
      value: allDisplayEvents.filter((event) =>
        event.date.startsWith(thisMonth)
      ).length,
      icon: CalendarCheck2,
      tone: "bg-violet-50 text-violet-600",
    },
    {
      label: "School-wide",
      value: events.filter((event) => event.affectsAllClasses).length,
      icon: Users,
      tone: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Class-specific",
      value: events.filter((event) => !event.affectsAllClasses).length,
      icon: CalendarDays,
      tone: "bg-amber-50 text-amber-600",
    },
  ]

  const openAdd = useCallback(
    (dateISO?: string) => {
      if (!canCreate) return
      setEditingEvent(null)
      setPrefillDate(dateISO)
      setDialogOpen(true)
    },
    [canCreate],
  )

  const openEdit = useCallback((event: DisplayCalendarEvent) => {
    setEditingEvent(event.source)
    setPrefillDate(undefined)
    setDialogOpen(true)
  }, [])

  return (
    <div className="space-y-6 pb-8">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 px-6 py-7 text-white shadow-sm sm:px-8">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div className="max-w-2xl">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20">
              <CalendarDays className="size-5" />
            </div>
            <h1 className="text-2xl font-semibold sm:text-3xl">
              School Calendar
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-blue-100">
              Publish school-wide or class-specific dates once. Students,
              parents, staff and future notification services share the same
              calendar source.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row lg:items-center">
            {nextEvent && (
              <div className="min-w-60 rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/15 backdrop-blur-sm">
                <p className="text-[11px] font-medium tracking-wider text-blue-100 uppercase">
                  Next up
                </p>
                <p className="mt-1 truncate text-sm font-semibold">
                  {nextEvent.title}
                </p>
                <p className="mt-0.5 text-xs text-blue-100">
                  {format(
                    new Date(`${nextEvent.date}T00:00:00`),
                    "EEE, d MMM yyyy"
                  )}
                  {nextEvent.startTime
                    ? ` · ${nextEvent.startTime}`
                    : " · All day"}
                </p>
              </div>
            )}
            <Button
              disabled={!canCreate}
              onClick={() => openAdd()}
              className="h-11 bg-white px-5 text-blue-700 hover:bg-blue-50"
            >
              <Plus className="size-4" />
              Add Event
            </Button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, tone }) => (
          <div
            key={label}
            className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-gray-500">{label}</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">
                  {value}
                </p>
              </div>
              <div
                className={`flex size-10 items-center justify-center rounded-xl ${tone}`}
              >
                <Icon className="size-4" />
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex w-fit gap-1 rounded-xl bg-gray-100 p-1">
            {(
              [
                { key: "month", label: "Month", icon: CalendarDays },
                { key: "agenda", label: "Agenda", icon: ListIcon },
              ] as { key: View; label: string; icon: typeof CalendarDays }[]
            ).map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setView(key)}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-medium transition-all ${
                  view === key
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>

          <div className="flex flex-1 flex-col gap-2 sm:flex-row xl:max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search title or description"
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
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-gray-100 px-1 pt-3">
          {EVENT_TYPES.map((type) => (
            <div key={type.value} className="flex items-center gap-1.5">
              <span
                className={`h-2 w-2 rounded-full ${
                  getEventColor(type.label).split(" ")[0]
                }`}
              />
              <span className="text-[11px] text-gray-500">{type.label}</span>
            </div>
          ))}
        </div>
      </section>

      {isLoading ? (
        <div className="flex items-center justify-center rounded-2xl border border-gray-200 bg-white py-24">
          <Loader2 className="size-6 animate-spin text-gray-400" />
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
          <p className="text-sm font-medium text-red-700">
            We could not load the school calendar.
          </p>
          <p className="mt-1 text-xs text-red-600">
            Check your connection. Your events have not been changed.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => void refetch()}
          >
            Try Again
          </Button>
        </div>
      ) : view === "month" ? (
        <MonthCalendarGrid
          events={filteredStoredEvents}
          onDayClick={openAdd}
          onEventClick={openEdit}
        />
      ) : (
        <AgendaList events={filteredDisplayEvents} onEdit={openEdit} />
      )}

      <CalendarEventFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialEvent={editingEvent}
        initialDate={prefillDate}
      />
    </div>
  )
}
