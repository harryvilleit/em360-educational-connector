import { mockSchoolInfo } from "@/data"
import { getStudentPortalResultsApi } from "@/api/studentPortal.api"
import type { TranscriptRequest } from "@/store/transcript.store"
import { fmtDate } from "@/utils"
import { ordinal } from "@/utils/resultFormatting"

export async function generateTranscriptPDF(
  req: TranscriptRequest,
  schoolId: string
) {
  const { jsPDF } = await import("jspdf")
  const resultResponse = await getStudentPortalResultsApi({
    studentId: req.studentId,
    schoolId,
  })
  const result = resultResponse.isSuccess ? resultResponse.value : undefined
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })

  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const margin = 20
  const contentW = pageW - margin * 2
  let y = 15

  const school = mockSchoolInfo

  // ── Header band ──────────────────────────────────────────────────────────────
  doc.setFillColor(15, 23, 42)   // slate-900
  doc.rect(0, 0, pageW, 38, "F")

  // Logo placeholder circle
  doc.setFillColor(255, 255, 255)
  doc.circle(margin + 10, 19, 9, "F")
  doc.setFontSize(7)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(15, 23, 42)
  doc.text("GA", margin + 10, 20.5, { align: "center" })

  // School name
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.text(school.name.toUpperCase(), margin + 24, 15)

  doc.setFontSize(7.5)
  doc.setFont("helvetica", "normal")
  doc.text(school.address, margin + 24, 21)
  doc.text(`Tel: ${school.phone}  ·  ${school.email}  ·  ${school.website}`, margin + 24, 27)
  doc.text(`Reg. No: ${school.registrationNumber}`, margin + 24, 33)

  y = 46

  // ── "Official" vs "Personal" watermark / banner ─────────────────────────────
  const isOfficial = req.deliveryType === "official"

  doc.setFillColor(isOfficial ? 91 : 37, isOfficial ? 33 : 99, isOfficial ? 182 : 235)
  doc.rect(margin, y, contentW, 8, "F")
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(8.5)
  doc.setFont("helvetica", "bold")
  doc.text(
    isOfficial ? "OFFICIAL ACADEMIC TRANSCRIPT" : "ACADEMIC TRANSCRIPT — PERSONAL COPY",
    pageW / 2, y + 5.5, { align: "center" }
  )
  y += 14

  // ── Official routing block ───────────────────────────────────────────────────
  if (isOfficial && req.institutionName) {
    doc.setTextColor(60, 60, 60)
    doc.setFontSize(8)
    doc.setFont("helvetica", "normal")
    doc.text(`TO:    ${req.institutionName}`, margin, y)
    y += 5
    if (req.institutionAddress) {
      doc.text(`       ${req.institutionAddress}`, margin, y)
      y += 5
    }
    if (req.contactPerson) {
      doc.text(`ATTN:  ${req.contactPerson}`, margin, y)
      y += 5
    }
    if (req.contactEmail) {
      doc.text(`       ${req.contactEmail}`, margin, y)
      y += 5
    }
    doc.text(`RE:    Academic Transcript for ${req.studentName}`, margin, y)
    y += 5
    if (req.purpose) {
      doc.text(`PURP:  ${req.purpose}`, margin, y)
      y += 5
    }

    doc.setDrawColor(220, 220, 220)
    doc.setLineWidth(0.3)
    doc.line(margin, y + 2, margin + contentW, y + 2)
    y += 8
  }

  // ── Student info grid ────────────────────────────────────────────────────────
  doc.setFillColor(248, 250, 252)
  doc.setDrawColor(226, 232, 240)
  doc.roundedRect(margin, y, contentW, 20, 2, 2, "FD")

  const col1 = margin + 4
  const col2 = pageW / 2 + 2
  const infoData: [string, string, string, string][] = [
    ["STUDENT", req.studentName, "PARENT / GUARDIAN", req.parentName],
    ["CLASS", req.studentClass, "ISSUE DATE", fmtDate(req.createdAt)],
    ["SERIAL NO.", req.serialNumber, "DOCUMENT TYPE", isOfficial ? "Official Transcript" : "Personal Copy"],
  ]
  let iy = y + 6
  doc.setFontSize(7.5)
  for (const [l1, v1, l2, v2] of infoData) {
    doc.setFont("helvetica", "normal")
    doc.setTextColor(120, 130, 150)
    doc.text(l1, col1, iy)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(15, 23, 42)
    doc.text(v1, col1 + 22, iy)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(120, 130, 150)
    doc.text(l2, col2, iy)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(15, 23, 42)
    doc.text(v2, col2 + 28, iy)
    iy += 5.5
  }
  y += 26

  // ── Academic records ─────────────────────────────────────────────────────────
  doc.setFontSize(8.5)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(15, 23, 42)
  doc.text("ACADEMIC PERFORMANCE", margin, y)
  y += 4

  const rowH = 7.5

  if (result) {
    // Table header
    const cols = {
      subject: margin,
      prev: margin + 90,
      curr: margin + 115,
      grade: margin + 138,
      remark: margin + 155,
    }

    doc.setFillColor(15, 23, 42)
    doc.rect(margin, y, contentW, rowH, "F")
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(7.5)
    doc.setFont("helvetica", "bold")
    doc.text("Subject", cols.subject + 2, y + 5)
    const previousTermName = result.termComparison[0]?.previousTermName ?? "Previous"
    const currentTermName = result.termComparison[0]?.currentTermName ?? result.student.termName
    const previousScores = new Map(
      result.termComparison.map((subject) => [subject.subjectName, subject.previousTermScore])
    )
    doc.text(`${previousTermName} Score`, cols.prev, y + 5)
    doc.text(`${currentTermName} Score`, cols.curr, y + 5)
    doc.text("Grade", cols.grade, y + 5)
    doc.text("Remark", cols.remark, y + 5)
    y += rowH

    doc.setFont("helvetica", "normal")
    doc.setFontSize(7.5)

    result.subjectResults.forEach((s, i) => {
      const bg = i % 2 === 0 ? [255, 255, 255] : [248, 250, 252]
      doc.setFillColor(bg[0], bg[1], bg[2])
      doc.setDrawColor(230, 230, 230)
      doc.rect(margin, y, contentW, rowH, "FD")

      doc.setTextColor(30, 30, 30)
      doc.text(s.subjectName, cols.subject + 2, y + 5)

      doc.setTextColor(100, 116, 139)
      doc.text(`${previousScores.get(s.subjectName) ?? "—"}`, cols.prev + 4, y + 5)

      doc.setTextColor(15, 23, 42)
      doc.setFont("helvetica", "bold")
      doc.text(`${s.score}`, cols.curr + 4, y + 5)
      doc.setFont("helvetica", "normal")

      // Grade with colour
      const gradeColors: Record<string, [number, number, number]> = {
        A: [22, 163, 74], B: [37, 99, 235], C: [202, 138, 4],
        D: [234, 88, 12], F: [220, 38, 38],
      }
      const [gr, gg, gb] = gradeColors[s.grade] ?? [100, 116, 139]
      doc.setTextColor(gr, gg, gb)
      doc.setFont("helvetica", "bold")
      doc.text(s.grade, cols.grade + 2, y + 5)
      doc.setFont("helvetica", "normal")

      doc.setTextColor(100, 116, 139)
      doc.text(s.remark, cols.remark, y + 5)

      y += rowH
    })

    // Summary row
    const avg = Math.round(
      result.summary.averageScore
    )
    doc.setFillColor(241, 245, 249)
    doc.setDrawColor(226, 232, 240)
    doc.rect(margin, y, contentW, rowH, "FD")
    doc.setTextColor(15, 23, 42)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(7.5)
    doc.text("Overall Average", cols.subject + 2, y + 5)
    doc.setTextColor(30, 64, 175)
    doc.text(`${avg}%`, cols.curr + 4, y + 5)
    doc.setTextColor(100, 116, 139)
    doc.setFont("helvetica", "normal")
    doc.text(
      `Position: ${result.summary.position}${ordinal(result.summary.position)} of ${result.summary.totalStudentsInClass} students`,
      cols.remark, y + 5
    )
    y += rowH + 10
  } else {
    doc.setTextColor(150, 150, 150)
    doc.setFontSize(8)
    doc.text("No academic records found for this student.", margin, y + 5)
    y += 14
  }

  // ── Certification block ──────────────────────────────────────────────────────
  doc.setFillColor(248, 250, 252)
  doc.setDrawColor(226, 232, 240)
  doc.roundedRect(margin, y, contentW, 22, 2, 2, "FD")
  doc.setTextColor(60, 80, 100)
  doc.setFontSize(7.5)
  doc.setFont("helvetica", "italic")
  const certText = isOfficial
    ? `This is to certify that ${req.studentName} is/was a bonafide student of ${school.name}. This transcript is issued in good faith from our official academic records and is considered authentic for the stated purpose.`
    : `This is a personal copy of the academic transcript for ${req.studentName}. It is not for official submission.`
  const splitText = doc.splitTextToSize(certText, contentW - 8)
  doc.text(splitText, margin + 4, y + 6)
  y += 28

  // ── Signature lines ──────────────────────────────────────────────────────────
  doc.setDrawColor(180, 180, 180)
  doc.setLineWidth(0.3)
  const sigW = 50
  const s1x = margin
  const s2x = pageW / 2 - sigW / 2
  const s3x = pageW - margin - sigW
  for (const sx of [s1x, s2x, s3x]) {
    doc.line(sx, y, sx + sigW, y)
  }
  doc.setFontSize(7)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(120, 130, 150)
  doc.text("Principal / Head Teacher", s1x, y + 4)
  doc.text("Class Teacher", s2x, y + 4)
  doc.text("Date", s3x, y + 4)

  y += 14

  // ── Official stamp placeholder ────────────────────────────────────────────────
  if (isOfficial) {
    doc.setDrawColor(30, 64, 175)
    doc.setLineWidth(0.5)
    doc.circle(pageW - margin - 20, y - 10, 16)
    doc.setFontSize(6)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(30, 64, 175)
    doc.text("OFFICIAL", pageW - margin - 20, y - 13, { align: "center" })
    doc.text("SEAL", pageW - margin - 20, y - 9, { align: "center" })
    doc.text(school.name.toUpperCase().split(" ").slice(0, 1).join(""), pageW - margin - 20, y - 5, { align: "center" })
  }

  // ── Footer ────────────────────────────────────────────────────────────────────
  doc.setFontSize(6.5)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(150, 150, 150)
  doc.text(
    `Generated: ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}  ·  Serial: ${req.serialNumber}  ·  ${school.name}  ·  ${school.website}`,
    pageW / 2, pageH - 8, { align: "center" }
  )

  const filename = `Transcript_${req.studentName.replace(/\s+/g, "_")}_${req.serialNumber}.pdf`
  doc.save(filename)
}
