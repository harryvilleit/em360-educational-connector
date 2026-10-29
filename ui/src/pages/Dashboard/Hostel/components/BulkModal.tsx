import { useMemo, useState } from "react"
import { Upload, AlertCircle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useHostelStore } from "@/store/hostel.store"
import type { Gender, StudentBasic } from "@/types/hostel"

interface BulkUploadModalProps {
  hostelId: string
  gender: Gender
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface ParsedRecord {
  studentId: string
  roomId: string
  student?: StudentBasic
  error?: string
}

const MOCK_STUDENTS_MAP = new Map<string, StudentBasic>([
  [
    "STU001",
    {
      id: "STU001",
      firstName: "Chukwu",
      lastName: "Okafor",
      className: "JSS 1A",
      admissionNumber: "EM-2024-001",
    },
  ],
  [
    "STU002",
    {
      id: "STU002",
      firstName: "Amara",
      lastName: "Nwosu",
      className: "JSS 1B",
      admissionNumber: "EM-2024-002",
    },
  ],
  [
    "STU009",
    {
      id: "STU009",
      firstName: "Emmanuel",
      lastName: "Obi",
      className: "JSS 1A",
      admissionNumber: "EM-2024-009",
    },
  ],
  [
    "STU010",
    {
      id: "STU010",
      firstName: "Grace",
      lastName: "Adekunle",
      className: "JSS 1B",
      admissionNumber: "EM-2024-010",
    },
  ],
])

export default function BulkUploadModal({
  hostelId,
  open,
  onOpenChange,
}: BulkUploadModalProps) {
  const hostels = useHostelStore((s) => s.hostels)
  const bulkAssignStudents = useHostelStore((s) => s.bulkAssignStudents)
  const [csvContent, setCsvContent] = useState("")
  const [parsedRecords, setParsedRecords] = useState<ParsedRecord[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null
    message: string
  }>({ type: null, message: "" })

  const hostel = useMemo(
    () => Array.from(hostels.values()).find((h) => h.id === hostelId),
    [hostels, hostelId]
  )
  const roomMap = useMemo(
    () => new Map(hostel?.rooms.map((r) => [r.roomNumber, r.id]) || []),
    [hostel]
  )

  const parseCSV = () => {
    const lines = csvContent
      .trim()
      .split("\n")
      .filter((line) => line.length > 0)

    if (lines.length === 0) {
      setSubmitStatus({ type: "error", message: "CSV is empty" })
      return
    }

    const records: ParsedRecord[] = []
    let validCount = 0
    const startIndex = lines[0].toLowerCase().includes("studentid") ? 1 : 0

    for (let i = startIndex; i < lines.length; i++) {
      const [studentId, roomNumber] = lines[i]
        .trim()
        .split(",")
        .map((s) => s.trim())

      if (!studentId || !roomNumber) {
        records.push({
          studentId: studentId || "MISSING",
          roomId: "",
          error: "Invalid format: missing StudentID or RoomNumber",
        })
        continue
      }

      const student = MOCK_STUDENTS_MAP.get(studentId)
      if (!student) {
        records.push({
          studentId,
          roomId: "",
          error: `Student ${studentId} not found`,
        })
        continue
      }

      const roomId = roomMap.get(roomNumber)
      if (!roomId) {
        records.push({
          studentId,
          roomId: "",
          student,
          error: `Room ${roomNumber} not found`,
        })
        continue
      }

      const room = hostel?.rooms.find((r) => r.id === roomId)
      if (!room || room.availableSpots === 0) {
        records.push({
          studentId,
          roomId,
          student,
          error: `Room ${roomNumber} has no available spots`,
        })
        continue
      }

      records.push({ studentId, roomId, student })
      validCount++
    }

    setParsedRecords(records)
    setSubmitStatus({
      type: validCount > 0 ? "success" : "error",
      message:
        validCount > 0
          ? `Ready to assign ${validCount} student${validCount !== 1 ? "s" : ""}`
          : "No valid records to assign",
    })
  }

  const onSubmit = async () => {
    const validRecords = parsedRecords.filter((r) => !r.error && r.student)
    if (validRecords.length === 0) return

    try {
      setIsSubmitting(true)
      bulkAssignStudents(
        validRecords.map((r) => ({
          studentId: r.studentId,
          roomId: r.roomId,
          student: r.student!,
        }))
      )
      setSubmitStatus({
        type: "success",
        message: `Successfully assigned ${validRecords.length} student${validRecords.length !== 1 ? "s" : ""}`,
      })
      setTimeout(() => onOpenChange(false), 1500)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-screen overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Bulk Assign Students</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
            <p className="text-sm text-blue-800">
              Upload a CSV file with columns: StudentID, RoomNumber (one per
              line)
            </p>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="csv-content"
              className="text-sm font-medium text-gray-700"
            >
              CSV Content
            </Label>
            <textarea
              id="csv-content"
              value={csvContent}
              onChange={(e) => setCsvContent(e.target.value)}
              placeholder="StudentID,RoomNumber&#10;STU001,B101&#10;STU002,G101"
              className="h-40 w-full rounded-lg border border-gray-300 p-3 font-mono text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <Button
            onClick={parseCSV}
            variant="outline"
            className="w-full"
            disabled={!csvContent.trim()}
          >
            <Upload className="mr-2 h-4 w-4" />
            Parse CSV
          </Button>

          {submitStatus.type && (
            <div
              className={`flex gap-2 rounded-lg border p-4 ${
                submitStatus.type === "error"
                  ? "border-red-200 bg-red-50"
                  : "border-green-200 bg-green-50"
              }`}
            >
              {submitStatus.type === "success" ? (
                <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
              ) : (
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
              )}
              <p
                className={`text-sm ${
                  submitStatus.type === "success"
                    ? "text-green-800"
                    : "text-red-800"
                }`}
              >
                {submitStatus.message}
              </p>
            </div>
          )}

          {parsedRecords.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-900">Preview</h3>
              <div className="max-h-60 space-y-1 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-3">
                {parsedRecords.map((record, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start gap-2 rounded px-2 py-1 text-xs ${
                      record.error
                        ? "bg-red-50 text-red-800"
                        : "bg-green-50 text-green-800"
                    }`}
                  >
                    {record.error ? (
                      <AlertCircle className="mt-0.5 size-3 shrink-0" />
                    ) : (
                      <CheckCircle className="mt-0.5 size-3 shrink-0" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">
                        {record.student?.firstName} {record.student?.lastName} (
                        {record.studentId})
                      </p>
                      {record.error ? (
                        <p className="text-xs opacity-75">{record.error}</p>
                      ) : (
                        <p className="text-xs opacity-75">
                          → Room {record.roomId}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col-reverse gap-2 pt-4 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={onSubmit}
              disabled={
                isSubmitting ||
                parsedRecords.filter((r) => !r.error).length === 0
              }
              className="w-full bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 sm:w-auto"
            >
              {isSubmitting ? "Assigning..." : "Assign All Valid Records"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
