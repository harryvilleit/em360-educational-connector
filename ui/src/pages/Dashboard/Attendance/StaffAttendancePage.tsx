import { useState } from "react"
import { PageHeader } from "@/components/general/PageHeader"
import AttendanceSummaryPanel from "./components/attendance/AttendanceSummaryPanel"
import MyAttendanceCard from "./components/attendance/MyAttendanceCard"

type StaffAttendanceTab = "daily" | "summary"

const tabs: Array<{ id: StaffAttendanceTab; label: string }> = [
  { id: "daily", label: "Daily attendance" },
  { id: "summary", label: "Summary" },
]

export default function StaffAttendancePage() {
  const [tab, setTab] = useState<StaffAttendanceTab>("daily")

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-5">
        <PageHeader
          title="Staff attendance"
          description="Record your daily arrival and departure from school."
        />
        <div className="mt-4 flex flex-wrap gap-2">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                tab === item.id
                  ? "bg-blue-600 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {tab === "daily" ? <MyAttendanceCard /> : <AttendanceSummaryPanel />}
    </div>
  )
}
