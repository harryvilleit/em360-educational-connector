import { useEffect, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { useSchoolId } from "@/contexts/SchoolContext"
import {
  getMyAvailability,
  getSchoolAvailability,
  saveMyAvailability,
  type AvailabilityWindow,
} from "@/api/staffAvailability.api"
import { currentWeekMonday } from "@/pages/Dashboard/Timetable/timetable.utils"

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

function moveWeek(week: string, offset: number) {
  const date = new Date(`${week}T12:00:00`)
  date.setDate(date.getDate() + offset * 7)
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0")].join("-")
}

function WeekControls({ week, onChange }: { week: string; onChange: (week: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <Button type="button" size="icon-sm" variant="outline" aria-label="Previous week"
        onClick={() => onChange(moveWeek(week, -1))}><ChevronLeft className="size-4" /></Button>
      <span className="min-w-32 text-center text-sm font-medium text-gray-800">
        Week of {new Date(`${week}T12:00:00`).toLocaleDateString(undefined, {
          day: "numeric", month: "short", year: "numeric"
        })}
      </span>
      <Button type="button" size="icon-sm" variant="outline" aria-label="Next week"
        onClick={() => onChange(moveWeek(week, 1))}><ChevronRight className="size-4" /></Button>
    </div>
  )
}

export function MyStaffAvailability() {
  const schoolId = useSchoolId()
  const [week, setWeek] = useState(currentWeekMonday)
  const [windows, setWindows] = useState<AvailabilityWindow[]>([])
  const client = useQueryClient()
  const key = ["staff-availability", "mine", schoolId, week]
  const query = useQuery({
    queryKey: key,
    queryFn: () => getMyAvailability(schoolId, week),
    enabled: !!schoolId,
  })
  useEffect(() => setWindows(query.data?.windows ?? []), [query.data, week])

  const save = useMutation({
    mutationFn: () => saveMyAvailability(schoolId, week, windows),
    onSuccess: () => {
      toast.success("Availability saved")
      client.invalidateQueries({ queryKey: ["staff-availability"] })
    },
    onError: (error: Error) => toast.error(error.message),
  })

  function submit() {
    const sorted = [...windows].sort((a, b) =>
      a.dayOfWeek - b.dayOfWeek || a.startTime.localeCompare(b.startTime))
    if (sorted.some((slot, i) => !slot.startTime || !slot.endTime ||
        slot.startTime >= slot.endTime ||
        (i > 0 && sorted[i - 1].dayOfWeek === slot.dayOfWeek &&
          sorted[i - 1].endTime > slot.startTime))) {
      toast.error("Check the times: periods on the same day cannot overlap.")
      return
    }
    save.mutate()
  }

  function update(index: number, patch: Partial<AvailabilityWindow>) {
    setWindows((current) => current.map((slot, i) => i === index ? { ...slot, ...patch } : slot))
  }

  return (
    <section className="border-t border-gray-200 pt-5" aria-label="My weekly availability">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-gray-900">My weekly availability</h2>
          <p className="text-sm text-gray-500">Share available times with your timetable administrator.</p>
        </div>
        <WeekControls week={week} onChange={setWeek} />
      </div>

      {query.isPending ? <p className="py-5 text-sm text-gray-500">Loading availability...</p>
        : query.isError ? <p className="py-5 text-sm text-red-700">Could not load availability for this week.</p>
        : <>
          <div className="mt-4 divide-y divide-gray-100 border-y border-gray-100">
            {days.map((day, index) => {
              const dayWindows = windows.map((slot, i) => ({ slot, i }))
                .filter(({ slot }) => slot.dayOfWeek === index + 1)
              return (
                <div key={day} className="grid gap-2 py-3 sm:grid-cols-[9rem_1fr] sm:items-start">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-800">
                    <input type="checkbox" checked={dayWindows.length > 0}
                      onChange={(e) => setWindows((current) => e.target.checked
                        ? [...current, { dayOfWeek: index + 1, startTime: "09:00", endTime: "17:00" }]
                        : current.filter((slot) => slot.dayOfWeek !== index + 1))} />
                    {day}
                  </label>
                  <div className="space-y-2">
                    {dayWindows.map(({ slot, i }) => (
                      <div key={i} className="flex flex-wrap items-center gap-2">
                        <input aria-label={`${day} start time`} type="time" value={slot.startTime}
                          className="h-9 rounded border border-gray-300 px-2 text-sm"
                          onChange={(e) => update(i, { startTime: e.target.value })} />
                        <span className="text-sm text-gray-500">to</span>
                        <input aria-label={`${day} end time`} type="time" value={slot.endTime}
                          className="h-9 rounded border border-gray-300 px-2 text-sm"
                          onChange={(e) => update(i, { endTime: e.target.value })} />
                        <Button type="button" variant="ghost" size="icon-sm"
                          aria-label={`Remove ${day} period`}
                          onClick={() => setWindows((current) => current.filter((_, n) => n !== i))}>
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    ))}
                    {dayWindows.length > 0 && <Button type="button" variant="ghost" size="sm"
                      onClick={() => setWindows((current) => [...current,
                        { dayOfWeek: index + 1, startTime: "", endTime: "" }])}>
                      <Plus className="size-4" /> Add period
                    </Button>}
                  </div>
                </div>
              )
            })}
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-gray-500">
              {query.data?.submittedAtUtc ? "Submitted for this week" : "Not submitted for this week"}
            </p>
            <Button type="button" disabled={save.isPending} onClick={submit}>
              {save.isPending ? "Saving..." : windows.length ? "Save availability" : "Submit unavailable for this week"}
            </Button>
          </div>
        </>}
    </section>
  )
}

export function SchoolStaffAvailability({
  week, classId, termId, className,
}: { week: string; classId: string; termId: string; className: string }) {
  const schoolId = useSchoolId()
  const query = useQuery({
    queryKey: ["staff-availability", "school", schoolId, classId, termId, week],
    queryFn: () => getSchoolAvailability(schoolId, week, classId, termId),
    enabled: !!schoolId && !!classId && !!termId && !!week,
  })
  const staff = query.data ?? []
  const submitted = staff.filter((item) => item.submittedAtUtc).length

  return (
    <section className="border-y border-gray-200 py-4" aria-label="Staff availability for this week">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-gray-900">
          Staff availability for {className || "this class"}
        </h2>
        {!query.isError && !query.isPending &&
          <span className="text-xs text-gray-500">{submitted} of {staff.length} submitted</span>}
      </div>
      {query.isPending ? <p className="text-sm text-gray-500">Loading staff availability...</p>
        : query.isError ? <p className="text-sm text-red-700">Unable to load staff availability.</p>
        : staff.length === 0 ? <p className="text-sm text-gray-500">No staff assigned to this class for the selected term.</p>
        : <div className="max-h-72 divide-y divide-gray-100 overflow-auto">
          {staff.map((person) => (
            <div key={person.staffSubUserId} className="flex flex-wrap items-start gap-x-5 gap-y-1 py-2 text-sm">
              <span className="w-40 shrink-0 font-medium text-gray-800">{person.staffName || "Staff"}</span>
              <span className={person.submittedAtUtc ? "text-gray-700" : "text-amber-700"}>
                {!person.submittedAtUtc ? "Not submitted"
                  : person.windows.length === 0 ? "Unavailable this week"
                  : person.windows.map((slot) =>
                    `${days[slot.dayOfWeek - 1]?.slice(0, 3)} ${slot.startTime}-${slot.endTime}`).join(" · ")}
              </span>
            </div>
          ))}
        </div>}
    </section>
  )
}
