import { useMemo, useState } from "react"
import { CheckCircle2, Clock, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { HostelAttendanceStudentRecordI } from "@/api/hostel.api/types"
import {
  ATTENDANCE_PERIOD_OPTIONS,
  ATTENDANCE_STATUS_OPTIONS,
  ATTENDANCE_STATUS,
} from "@/schema/hostelAttendance.schema"

interface RollCallFormProps {
  records: HostelAttendanceStudentRecordI[]
  alreadyRecorded: boolean
  period: number
  isSubmitting: boolean
  onSubmit: (records: HostelAttendanceStudentRecordI[]) => void
}

export function RollCallForm({
  records: initialRecords,
  alreadyRecorded,
  period,
  isSubmitting,
  onSubmit,
}: RollCallFormProps) {
  const [checks, setChecks] = useState<
    Record<string, HostelAttendanceStudentRecordI>
  >(() => {
    const initial: Record<string, HostelAttendanceStudentRecordI> = {}
    initialRecords.forEach((r) => {
      initial[r.studentId] = r
    })
    return initial
  })

  const setStatus = (studentId: string, status: number) => {
    setChecks((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], status },
    }))
  }

  const setRemarks = (studentId: string, remarks: string) => {
    setChecks((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], remarks },
    }))
  }

  const records = useMemo(() => Object.values(checks), [checks])
  const presentCount = useMemo(
    () => records.filter((c) => c.status === ATTENDANCE_STATUS.Present).length,
    [records]
  )
  const absentCount = useMemo(
    () => records.filter((c) => c.status === ATTENDANCE_STATUS.Absent).length,
    [records]
  )

  if (records.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 py-12 text-center text-gray-400">
        No students currently assigned to this hostel
      </div>
    )
  }

  return (
    <>
      {alreadyRecorded && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-4 py-2.5 text-sm text-orange-700">
          <Clock className="h-4 w-4 shrink-0" />A{" "}
          {ATTENDANCE_PERIOD_OPTIONS.find((o) => o.value === period)?.label}{" "}
          session has already been recorded for this hostel today. Submitting
          again will update it.
        </div>
      )}

      {/* Progress */}
      <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-gray-50 px-5 py-3">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <span className="text-sm font-medium text-gray-700">
            {presentCount} Present
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <XCircle className="h-4 w-4 text-red-500" />
          <span className="text-sm font-medium text-gray-700">
            {absentCount} Absent
          </span>
        </div>
        <div className="ml-auto h-2 w-32 overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-green-500 transition-all"
            style={{
              width: `${Math.round((presentCount / records.length) * 100)}%`,
            }}
          />
        </div>
        <span className="text-xs text-gray-500">{records.length} total</span>
      </div>

      {/* Roll call table */}
      <div className="mt-4 rounded-xl border border-gray-200 bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>#</TableHead>
              <TableHead>Student</TableHead>
              <TableHead>Room / Bed</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Remarks</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((s, idx) => (
              <TableRow key={s.studentId}>
                <TableCell className="text-xs text-gray-400">
                  {idx + 1}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-700">
                      {s.studentName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {s.studentName}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-gray-500">
                  {s.roomName}
                  {s.bedName && (
                    <span className="ml-1 text-gray-400">· {s.bedName}</span>
                  )}
                </TableCell>
                <TableCell className="text-sm text-gray-600">
                  {s.className}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {ATTENDANCE_STATUS_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        data-active={s.status === opt.value}
                        onClick={() => setStatus(s.studentId, opt.value)}
                        className={`rounded border px-2 py-0.5 text-xs font-medium transition-colors ${opt.color}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <Input
                    placeholder="Optional remark…"
                    value={s.remarks ?? ""}
                    onChange={(e) => setRemarks(s.studentId, e.target.value)}
                    className="h-7 w-36 text-xs"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Submit */}
      <div className="mt-4 flex justify-end">
        <Button
          onClick={() => onSubmit(records)}
          disabled={isSubmitting}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isSubmitting ? "Submitting…" : "Submit Attendance"}
        </Button>
      </div>
    </>
  )
}
