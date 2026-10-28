import { format } from "date-fns"
import { localSchoolRoute } from "@/lib/portal-navigation"
import { Calendar } from "lucide-react"

import { Link, useParams } from "react-router"
import { parseISO, isValid } from "date-fns"
import type { SchoolUpcomingEvent } from "@/types/schoolOverview"
const tagColors: Record<SchoolUpcomingEvent["eventType"], string> = {
  Academic: "bg-blue-50 text-blue-700",
  Meeting: "bg-purple-50 text-purple-700",
  Sports: "bg-green-50 text-green-700",
  Exam: "bg-amber-50 text-amber-700",
  Finance: "bg-orange-50 text-orange-700",
  Event: "bg-gray-100 text-gray-700",
}
export default function UpcomingEvents({
  events,
}: {
  events: SchoolUpcomingEvent[]
}) {
  const { productId } = useParams<{ productId: string }>()
  const calendarPath = localSchoolRoute(
    `/dashboard/${productId}/timetable/calendar`,
  )
  return (
    <div className="flex flex-col rounded-2xl border border-gray-100 bg-white p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-gray-900">Upcoming Events</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Institutional event calendar
          </p>
        </div>
        {calendarPath && (
          <Link
            to={calendarPath}
            className="text-xs font-medium text-blue-600 hover:underline"
          >
            View calendar
          </Link>
        )}
      </div>

      <div className="space-y-3">
        {events.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No upcoming events.
          </p>
        )}
        {events.map((event) => {
          const date = parseISO(event.startDate)
          return (
            <div
              key={event.id}
              className="flex items-start gap-3 rounded-xl border border-gray-100 p-3 transition-colors hover:border-blue-100 hover:bg-blue-50/30"
            >
              {/* Date badge */}
              <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl bg-blue-600 text-center text-white">
                <span className="text-[10px] leading-none font-semibold uppercase opacity-80">
                  {isValid(date) ? format(date, "MMM") : event.formattedDate}
                </span>
                <span className="text-lg leading-tight font-bold">
                  {isValid(date) ? format(date, "d") : ""}
                </span>
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm leading-tight font-semibold text-gray-800">
                    {event.title}
                  </p>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${tagColors[event.eventType] ?? tagColors.Event}`}
                  >
                    {event.eventType}
                  </span>
                </div>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {event.description}
                </p>
              </div>

              {/* Calendar icon */}
              <Calendar className="mt-0.5 size-4 shrink-0 text-gray-300" />
            </div>
          )
        })}
      </div>
    </div>
  )
}
