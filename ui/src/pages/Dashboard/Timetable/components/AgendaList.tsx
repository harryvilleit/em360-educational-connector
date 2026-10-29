import { Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getEventColor, type DisplayCalendarEvent } from "@/data/calendarEvents"

export function AgendaList({
  events,
  onEdit,
}: {
  events: DisplayCalendarEvent[]
  onEdit: (event: DisplayCalendarEvent) => void
}) {
  if (events.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 py-16 text-center text-sm text-muted-foreground">
        No calendar events published yet.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {events.map((event) => (
        <div
          key={event.id}
          className="flex items-start justify-between gap-4 rounded-xl border border-gray-200 bg-white px-5 py-4"
        >
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-gray-900">
                {event.title}
              </p>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${getEventColor(event.type)}`}
              >
                {event.typeLabel}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-gray-400">
              {event.date}
              {event.endDate && ` – ${event.endDate}`}
            </p>
            <p className="mt-1.5 text-xs text-gray-600">{event.description}</p>
            <p className="mt-1.5 text-[11px] text-gray-400">
              {event.affectsAll
                ? "Affects all classes"
                : `Affects: ${event.affectedClasses?.join(", ") ?? "—"}`}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-blue-500 hover:bg-blue-50 hover:text-blue-600"
              onClick={() => onEdit(event)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
