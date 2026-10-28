import jsPDF from "jspdf"

export interface ReportPdfSection {
  heading: string
  header?: string[]
  rows: string[][]
}

const LEFT = 14
const WIDTH = 182

export function downloadReportPdf(
  filename: string,
  title: string,
  subtitle: string,
  sections: ReportPdfSection[]
) {
  const doc = new jsPDF()
  let y = 20

  const ensure = (needed: number) => {
    if (y + needed > 284) {
      doc.addPage()
      y = 20
    }
  }

  doc.setFontSize(18)
  doc.text(title, LEFT, y)
  y += 8
  doc.setFontSize(10)
  doc.setTextColor(110)
  doc.text(subtitle, LEFT, y)
  doc.setTextColor(0)
  y += 12

  for (const section of sections) {
    ensure(20)
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.text(section.heading, LEFT, y)
    doc.setFont("helvetica", "normal")
    y += 7
    doc.setFontSize(9)

    const cols = Math.max(section.header?.length ?? 0, ...section.rows.map((r) => r.length), 1)
    const colWidth = WIDTH / cols
    const cell = (text: string, col: number) =>
      doc.text(doc.splitTextToSize(String(text ?? ""), colWidth - 2)[0] ?? "", LEFT + col * colWidth, y)

    if (section.header) {
      doc.setFont("helvetica", "bold")
      section.header.forEach((h, i) => cell(h, i))
      doc.setFont("helvetica", "normal")
      y += 5
      doc.line(LEFT, y - 3.5, LEFT + WIDTH, y - 3.5)
    }
    for (const row of section.rows) {
      ensure(6)
      row.forEach((c, i) => cell(c, i))
      y += 5.5
    }
    y += 6
  }

  doc.save(filename)
}
