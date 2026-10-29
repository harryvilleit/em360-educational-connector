import { useState } from "react"
import { useSearchParams } from "react-router"
import { CheckCircle2, ChevronRight, Download, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useSchoolId } from "@/contexts/SchoolContext"
import {
  useGetAllHostels,
  useGetRollCallSheet,
  useSubmitHostelAttendance,
} from "@/hooks/hostel"
import type { HostelAttendanceStudentRecordI } from "@/api/hostel.api/types"
import {
  ATTENDANCE_PERIOD_OPTIONS,
  ATTENDANCE_STATUS,
} from "@/schema/hostelAttendance.schema"
import { PageHeader } from "@/components/general/PageHeader"
import { Link, useNavigate, useParams } from "react-router"
import { DashboardRoutes } from "@/routes"
import {
  downloadHostelAttendancePdf,
  type HostelAttendanceSession,
} from "@/lib/hostelAttendancePdf"
import { RollCallForm } from "./components/RollCallForm"

export default function AttendancePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { productId } = useParams<{ productId: string }>()
  const p = productId ?? ""
  const schoolId = useSchoolId()

  const hostelIdParam = searchParams.get("hostelId") ?? ""

  const { hostels } = useGetAllHostels({ schoolId, pageSize: 100 })

  const [selectedHostelId, setSelectedHostelId] = useState(hostelIdParam)
  const [period, setPeriod] = useState<number>(
    ATTENDANCE_PERIOD_OPTIONS[0].value
  )
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [lastSession, setLastSession] =
    useState<HostelAttendanceSession | null>(null)

  const hostel = hostels.find((h) => h.id === selectedHostelId)

  const { rollCallSheet, isLoading } = useGetRollCallSheet({
    hostelId: selectedHostelId,
    date,
    period,
  })

  const { submitHostelAttendanceAsync, isPending: isSubmitting } =
    useSubmitHostelAttendance()

  // A session already exists for this hostel/date/period combo.
  const alreadyRecorded = !!rollCallSheet?.id

  const handleSubmit = async (records: HostelAttendanceStudentRecordI[]) => {
    if (!hostel) return
    await submitHostelAttendanceAsync({
      hostelId: hostel.id,
      date,
      period,
      studentRecords: records,
    })
    setLastSession({
      hostelName: hostel.name,
      date,
      period,
      records,
      presentCount: records.filter(
        (c) => c.status === ATTENDANCE_STATUS.Present
      ).length,
      absentCount: records.filter(
        (c) => c.status === ATTENDANCE_STATUS.Absent
      ).length,
    })
  }

  const submitted = !!lastSession

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance Roll Call"
        description={hostel?.name ?? ""}
        actions={
          <Link
            to={DashboardRoutes.toHostelAttendanceHistory(p)}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:underline"
          >
            View History <ChevronRight className="h-4 w-4" />
          </Link>
        }
      />

      {submitted && lastSession ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-green-200 bg-green-50 py-16 text-center">
          <CheckCircle2 className="h-12 w-12 text-green-500" />
          <h2 className="mt-4 text-lg font-bold text-green-800">
            Attendance Recorded!
          </h2>
          <p className="mt-1 text-sm text-green-600">
            {lastSession.presentCount} present · {lastSession.absentCount}{" "}
            absent
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button
              onClick={() => setLastSession(null)}
              variant="outline"
              size="sm"
            >
              New Roll Call
            </Button>
            <Button
              onClick={() => downloadHostelAttendancePdf(lastSession)}
              size="sm"
              className="bg-green-600 hover:bg-green-700"
            >
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
            <Button asChild className="bg-blue-600 hover:bg-blue-700" size="sm">
              <Link to={DashboardRoutes.toHostelAttendanceHistory(p)}>
                View History
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* Setup row */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500">Hostel</label>
              <Select value={selectedHostelId} onValueChange={setSelectedHostelId}>
                <SelectTrigger className="w-full border-gray-300">
                  <SelectValue placeholder="Select hostel" />
                </SelectTrigger>
                <SelectContent>
                  {hostels.map((h) => (
                    <SelectItem key={h.id} value={h.id}>
                      {h.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500">Period</label>
              <Select
                value={String(period)}
                onValueChange={(v) => setPeriod(Number(v))}
              >
                <SelectTrigger className="w-full border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ATTENDANCE_PERIOD_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={String(opt.value)}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500">Date</label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-6">
            {!selectedHostelId ? (
              <div className="rounded-xl border border-dashed border-gray-300 py-12 text-center text-gray-400">
                Select a hostel to start the roll call
              </div>
            ) : isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="size-6 animate-spin text-gray-400" />
              </div>
            ) : (
              rollCallSheet && (
                <RollCallForm
                  key={`${selectedHostelId}-${date}-${period}`}
                  records={rollCallSheet.studentRecords}
                  alreadyRecorded={alreadyRecorded}
                  period={period}
                  isSubmitting={isSubmitting}
                  onSubmit={handleSubmit}
                />
              )
            )}
          </div>
        </>
      )}
    </div>
  )
}
