import { useState } from "react"
import { PageHeader } from "@/components/general/PageHeader"
import { useSchoolId } from "@/contexts/SchoolContext"
import { LeaveCalendarTab } from "./LeaveCalendarTab"
import { MyLeaveTab } from "./MyLeaveTab"

type MyLeaveView = "leave" | "calendar"

const VIEWS: { value: MyLeaveView; label: string }[] = [
  { value: "leave", label: "My Leave" },
  { value: "calendar", label: "Leave Calendar" },
]

export default function MyLeavePage() {
  const schoolId = useSchoolId()
  const [view, setView] = useState<MyLeaveView>("leave")

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Leave"
        description="Check your balances, apply for leave and see who is away"
      />

      <div
        role="tablist"
        className="flex w-fit gap-1 rounded-xl border border-gray-200 bg-white p-1"
      >
        {VIEWS.map((v) => (
          <button
            key={v.value}
            type="button"
            role="tab"
            aria-selected={view === v.value}
            onClick={() => setView(v.value)}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium whitespace-nowrap transition-colors ${
              view === v.value
                ? "bg-chart-2 text-white"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      {view === "leave" && <MyLeaveTab schoolId={schoolId} />}
      {view === "calendar" && <LeaveCalendarTab schoolId={schoolId} />}
    </div>
  )
}
