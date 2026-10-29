import jsPDF from "jspdf"
import type { HostelAttendanceStudentRecordI } from "@/api/hostel.api/types"
import {
  ATTENDANCE_PERIOD_OPTIONS,
  attendanceStatusLabel,
} from "@/schema/hostelAttendance.schema"

export interface HostelAttendanceSession {
  hostelName: string
  date: string
  period: number
  records: HostelAttendanceStudentRecordI[]
  presentCount: number
  absentCount: number
}

export function downloadHostelAttendancePdf(session: HostelAttendanceSession) {
  const doc = new jsPDF()

  doc.setFontSize(16)
  doc.text("Hostel Attendance Roll Call", 14, 18)
  doc.setFontSize(10)
  doc.text(`Hostel: ${session.hostelName}`, 14, 28)
  doc.text(
    `Date: ${session.date}  |  Period: ${
      ATTENDANCE_PERIOD_OPTIONS.find((o) => o.value === session.period)
        ?.label ?? session.period
    }`,
    14,
    34
  )
  doc.text(
    `Present: ${session.presentCount}  |  Absent: ${session.absentCount}  |  Total: ${session.records.length}`,
    14,
    40
  )

  // Draw table manually
  const cols = [8, 60, 30, 25, 22, 35] // column widths
  const headers = ["#", "Student", "Room/Bed", "Class", "Status", "Remarks"]
  const rowH = 7
  let y = 48

  // Header row
  doc.setFillColor(37, 99, 235)
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(8)
  doc.setFont("helvetica", "bold")
  let x = 14
  cols.forEach((w, i) => {
    doc.rect(x, y, w, rowH, "F")
    doc.text(headers[i], x + 1, y + 4.5)
    x += w
  })
  y += rowH

  doc.setTextColor(30, 30, 30)
  doc.setFont("helvetica", "normal")
  session.records.forEach((c, i) => {
    if (y > 270) {
      doc.addPage()
      y = 20
    }
    if (i % 2 === 0) {
      doc.setFillColor(248, 250, 252)
      doc.rect(14, y, cols.reduce((a, b) => a + b, 0), rowH, "F")
    }
    const row = [
      String(i + 1),
      c.studentName,
      c.bedName ? `${c.roomName}·${c.bedName}` : c.roomName,
      c.className,
      attendanceStatusLabel(c.status),
      c.remarks ?? "",
    ]
    x = 14
    cols.forEach((w, j) => {
      doc.text(
        String(row[j] ?? "").slice(0, Math.floor(w / 1.8)),
        x + 1,
        y + 4.5
      )
      x += w
    })
    y += rowH
  })

  doc.save(
    `attendance_${session.hostelName.replace(/\s+/g, "_")}_${session.date}_${session.period}.pdf`
  )
}
