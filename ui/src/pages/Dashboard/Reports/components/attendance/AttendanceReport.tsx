import { formatDate } from "@/utils"
import { percentOf } from "../../reportFormat"
import type { ReportData } from "../../useReportData"
import { ReportSection, Tiles } from "../shared/ReportParts"

const num = (n: number) => n.toLocaleString()

export function AttendanceReport({
  data,
  date,
  onDateChange,
}: {
  data: ReportData
  date: string
  onDateChange: (value: string) => void
}) {
  const att = data.attendance.data
  const loading = data.attendance.state === "loading"
  const week = data.school.data?.weeklyAttendance.days ?? []
  const summary = att?.todaysSummary ?? []
  const pending = att?.classesNotYetMarked ?? []
  const shown = formatDate(`${date}T12:00:00`, "short")

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <label htmlFor="report-attendance-date">Class attendance for</label>
        <input
          id="report-attendance-date"
          type="date"
          value={date}
          max={formatDate(new Date(), "YYYY-MM-DD")}
          onChange={(e) => e.target.value && onDateChange(e.target.value)}
          className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
        />
      </div>
      <Tiles domain="attendance" data={data} />

      <ReportSection
        title="This Week"
        subtitle="School-wide attendance per day"
        columns={[
          { key: "d", header: "Day", render: (r) => r.dayName },
          {
            key: "dt",
            header: "Date",
            render: (r) => (r.date ? formatDate(r.date, "short") : "—"),
          },
          { key: "p", header: "Present", render: (r) => num(r.presentCount) },
          { key: "a", header: "Absent", render: (r) => num(r.absentCount) },
          {
            key: "r",
            header: "Attendance rate",
            render: (r) =>
              percentOf(r.presentCount, r.presentCount + r.absentCount),
          },
        ]}
        rows={week}
        rowKey={(r) => r.dayName + r.date}
        loading={data.school.state === "loading"}
        empty="No attendance recorded this week."
      />

      <ReportSection
        title={`By Class · ${shown}`}
        columns={[
          { key: "c", header: "Class", render: (r) => r.schoolClassName },
          { key: "t", header: "Students", render: (r) => r.totalStudents },
          { key: "p", header: "Present", render: (r) => r.presentCount },
          { key: "a", header: "Absent", render: (r) => r.absentCount },
          { key: "l", header: "Late", render: (r) => r.lateCount },
          { key: "e", header: "Excused", render: (r) => r.excusedCount },
          {
            key: "pc",
            header: "Present %",
            render: (r) => `${r.presentPercentage}%`,
          },
        ]}
        rows={summary}
        rowKey={(r) => r.schoolClassId}
        loading={loading}
        empty="No class was marked on this date."
      />

      {pending.length > 0 && (
        <ReportSection
          title="Classes Not Marked on This Date"
          columns={[
            { key: "c", header: "Class", render: (r) => r.schoolClassName },
            { key: "s", header: "Students", render: (r) => r.studentCount },
          ]}
          rows={pending}
          rowKey={(r) => r.schoolClassId}
          empty="All classes were marked."
        />
      )}
    </div>
  )
}
