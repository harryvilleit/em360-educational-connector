import type { GuardianStudentResultI } from "@/api/guardian.api/types"
import { ordinal } from "@/utils/resultFormatting"

export async function downloadResult(result: GuardianStudentResultI, schoolName: string) {
  const { jsPDF } = await import("jspdf")
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })

  const pageW = doc.internal.pageSize.getWidth()
  const margin = 18
  const contentW = pageW - margin * 2
  let y = 18

  const { student, summary, subjectResults } = result

  // ── Header ──────────────────────────────────────────────────────────────────
  doc.setFillColor(30, 64, 175) // blue-800
  doc.rect(0, 0, pageW, 28, "F")

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(15)
  doc.setFont("helvetica", "bold")
  doc.text(schoolName, pageW / 2, 11, { align: "center" })

  doc.setFontSize(9)
  doc.setFont("helvetica", "normal")
  doc.text("Academic Result Sheet", pageW / 2, 18, { align: "center" })
  doc.text(`${student.termName}  ·  ${student.sessionName}`, pageW / 2, 24, {
    align: "center",
  })

  y = 36

  // ── Student info block ───────────────────────────────────────────────────────
  doc.setFillColor(248, 250, 252) // gray-50
  doc.setDrawColor(226, 232, 240) // gray-200
  doc.roundedRect(margin, y, contentW, 26, 2, 2, "FD")

  doc.setTextColor(100, 116, 139) // gray-500
  doc.setFontSize(7.5)
  doc.setFont("helvetica", "normal")

  const col1x = margin + 5
  const col2x = pageW / 2 + 4

  const infoRows: [string, string, string, string][] = [
    ["STUDENT", student.fullName, "TERM", student.termName],
    ["CLASS", student.className, "SESSION", student.sessionName],
    [
      "POSITION",
      `${summary.position}${ordinal(summary.position)} of ${summary.totalStudentsInClass}`,
      "AVERAGE",
      `${summary.averageScore}%`,
    ],
  ]

  let iy = y + 7
  for (const [l1, v1, l2, v2] of infoRows) {
    doc.setTextColor(100, 116, 139)
    doc.text(l1, col1x, iy)
    doc.setTextColor(15, 23, 42)
    doc.setFont("helvetica", "bold")
    doc.text(v1, col1x + 20, iy)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(100, 116, 139)
    doc.text(l2, col2x, iy)
    doc.setTextColor(15, 23, 42)
    doc.setFont("helvetica", "bold")
    doc.text(v2, col2x + 22, iy)
    doc.setFont("helvetica", "normal")
    iy += 7.5
  }

  y += 32

  // ── Subject results table ────────────────────────────────────────────────────
  doc.setFontSize(9)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(15, 23, 42)
  doc.text("SUBJECT RESULTS", margin, y)
  y += 5

  // Table header
  const colX = { subject: margin, score: margin + 98, grade: margin + 118, bar: margin + 132, remark: margin + 154 }
  const rowH = 8

  doc.setFillColor(30, 64, 175)
  doc.rect(margin, y, contentW, rowH, "F")
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(8)
  doc.setFont("helvetica", "bold")
  doc.text("Subject", colX.subject + 2, y + 5.5)
  doc.text("Score", colX.score, y + 5.5)
  doc.text("Grade", colX.grade, y + 5.5)
  doc.text("Performance", colX.bar, y + 5.5)
  doc.text("Remark", colX.remark, y + 5.5)
  y += rowH

  doc.setFont("helvetica", "normal")
  doc.setFontSize(8)

  subjectResults.forEach((s, idx) => {
    if(y + rowH > 260){doc.addPage();y=20;doc.setFontSize(8)}
    const bg = idx % 2 === 0 ? [255, 255, 255] : [248, 250, 252]
    doc.setFillColor(bg[0], bg[1], bg[2])
    doc.setDrawColor(226, 232, 240)
    doc.rect(margin, y, contentW, rowH, "FD")

    doc.setTextColor(15, 23, 42)
    doc.text(s.subjectName, colX.subject + 2, y + 5.5)
    doc.text(`${s.score}/${s.maxScore}`, colX.score, y + 5.5)

    // Grade badge colour
    const gradeRgb: Record<string, [number, number, number]> = {
      A: [22, 163, 74], B: [37, 99, 235], C: [202, 138, 4],
      D: [234, 88, 12], F: [220, 38, 38],
    }
    const [r, g, b] = gradeRgb[s.grade] ?? [100, 116, 139]
    doc.setTextColor(r, g, b)
    doc.setFont("helvetica", "bold")
    doc.text(s.grade, colX.grade + 1, y + 5.5)
    doc.setFont("helvetica", "normal")

    // Score bar
    const barW = 18
    const barH = 2.5
    const barY = y + rowH / 2 - barH / 2
    doc.setFillColor(226, 232, 240)
    doc.rect(colX.bar, barY, barW, barH, "F")
    doc.setFillColor(r, g, b)
    doc.rect(colX.bar, barY, Math.max(0,Math.min(1,s.score / (s.maxScore || 100))) * barW, barH, "F")

    doc.setTextColor(100, 116, 139)
    doc.text(s.remark, colX.remark, y + 5.5)

    y += rowH
  })

  if(y+rowH+45>280){doc.addPage();y=20}
  // Table footer
  doc.setFillColor(243, 244, 246)
  doc.setDrawColor(226, 232, 240)
  doc.rect(margin, y, contentW, rowH, "FD")
  doc.setFont("helvetica", "bold")
  doc.setTextColor(15, 23, 42)
  doc.setFontSize(8)
  doc.text("Overall Average", colX.subject + 2, y + 5.5)
  doc.setTextColor(30, 64, 175)
  doc.text(`${summary.averageScore}%`, colX.score, y + 5.5)
  doc.setTextColor(100, 116, 139)
  doc.setFont("helvetica", "normal")
  doc.text(
    `Position: ${summary.position}${ordinal(summary.position)} of ${summary.totalStudentsInClass}`,
    colX.remark,
    y + 5.5
  )
  y += rowH + 12

  // ── Signature lines ──────────────────────────────────────────────────────────
  doc.setDrawColor(203, 213, 225)
  doc.setLineWidth(0.3)

  const sigW = 55
  const sig1x = margin
  const sig2x = margin + sigW + 15
  const sig3x = pageW - margin - sigW

  for (const sx of [sig1x, sig2x, sig3x]) {
    doc.line(sx, y, sx + sigW, y)
  }

  doc.setFontSize(7.5)
  doc.setTextColor(100, 116, 139)
  doc.text("Class Teacher", sig1x, y + 4)
  doc.text("Principal / Head Teacher", sig2x, y + 4)
  doc.text("Date", sig3x, y + 4)

  y += 14

  // ── Footer ───────────────────────────────────────────────────────────────────
  doc.setFontSize(7)
  doc.setTextColor(148, 163, 184)
  doc.text(
    `Generated on ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}  ·  ${schoolName}`,
    pageW / 2, y, { align: "center" }
  )

  const filename = `Result_${student.fullName.replace(/\s+/g, "_")}_${student.termName.replace(/\s+/g, "_")}_${student.sessionName}.pdf`
  doc.save(filename)
}
