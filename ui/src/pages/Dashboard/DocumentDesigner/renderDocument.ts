import { renderCanvasDocument } from "./renderCanvasDocument"
import type { jsPDF } from "jspdf"
import type {
  DocumentData,
  DocumentKind,
  DocumentLayout,
} from "@/api/schoolDocuments.api"
import sans from "@/assets/document-fonts/DejaVuSans.ttf?url"
import sansBold from "@/assets/document-fonts/DejaVuSans-Bold.ttf?url"
import serif from "@/assets/document-fonts/DejaVuSerif.ttf?url"
import serifBold from "@/assets/document-fonts/DejaVuSerif-Bold.ttf?url"

export type DrawCommand =
  | {
      type: "text"
      elementId?: string
      x: number
      y: number
      value: string
      size: number
      bold: boolean
      colour: string
      align: "left" | "center" | "right"
      font?: string
    }
  | {
      type: "rect"
      elementId?: string
      x: number
      y: number
      width: number
      height: number
      fill: string | null
      stroke: string | null
      strokeWidth?: number
      shape?: "rectangle" | "ellipse" | "line"
    }
  | {
      type: "image"
      elementId?: string
      x: number
      y: number
      width: number
      height: number
      url: string
    }
export interface RenderedDocument {
  pdf: jsPDF
  pages: DrawCommand[][]
  width: number
  height: number
  font: string
}
const mm = 25.4 / 72
const fonts = new Map<string, Promise<string>>()
export async function fontData(url: string) {
  if (!fonts.has(url))
    fonts.set(
      url,
      (async () => {
        const r = await fetch(url)
        if (!r.ok)
          throw new Error(
            "The document font could not be loaded. Refresh and try again."
          )
        const bytes = new Uint8Array(await r.arrayBuffer())
        let binary = ""
        for (let i = 0; i < bytes.length; i += 8192)
          binary += String.fromCharCode(...bytes.subarray(i, i + 8192))
        return btoa(binary)
      })().catch((e) => {
        fonts.delete(url)
        throw e
      })
    )
  return fonts.get(url)!
}
export const fieldNames = [
  "SchoolName",
  "RecipientName",
  "ClassName",
  "SessionName",
  "TermName",
  "AwardTitle",
  "AwardDate",
  "DocumentNumber",
  "IssueDate",
  "Comment",
  "SchoolAddress",
  "AdmissionNumber",
  "AverageScore",
  "TotalScore",
  "Position",
  "SubjectCount",
  "AttendancePresent",
  "AttendanceAbsent",
  "AttendanceLate",
  "AttendanceExcused",
  "AttendanceRecorded",
]
export function substitute(text: string, data: DocumentData) {
  const fields: Record<string, string> = {
    SchoolName: data.schoolName,
    RecipientName: data.recipientName,
    ClassName: data.className,
    SessionName: data.sessionName,
    TermName: data.termName,
    AwardTitle: data.awardTitle,
    AwardDate: data.awardDate,
    DocumentNumber: data.documentNumber,
    IssueDate: data.issueDate,
    Comment: data.comment,
    SchoolAddress: data.schoolAddress,
    AdmissionNumber: data.admissionNumber,
    AverageScore: Number(data.averageScore).toFixed(2),
    TotalScore: String(data.totalScore),
    Position: String(data.position || "—"),
    SubjectCount: String(data.subjectCount),
    AttendancePresent: String(data.attendancePresent ?? "—"),
    AttendanceAbsent: String(data.attendanceAbsent ?? "—"),
    AttendanceLate: String(data.attendanceLate ?? "—"),
    AttendanceExcused: String(data.attendanceExcused ?? "—"),
    AttendanceRecorded: String(data.attendanceRecorded ?? "—"),
  }
  return text.replace(
    /\{\{([^{}]+)\}\}/g,
    (token, key: string) => fields[key] ?? token
  )
}
export const resultLabels: Record<string, string> = {
  subject: "Subject",
  assessments: "Assessments",
  score: "Score",
  maxScore: "Max score",
  grade: "Grade",
  remark: "Remark",
}
export async function renderDocument(
  kind: DocumentKind,
  layout: DocumentLayout,
  data: DocumentData,
  status: "sample" | "preview" | "issued" | "revoked" = "sample"
): Promise<RenderedDocument> {
  if (layout.schemaVersion === 2)
    return renderCanvasDocument(kind, layout, data, status)
  const { jsPDF: Pdf } = await import("jspdf")
  const pdf = new Pdf({
    unit: "mm",
    format: layout.paper.toLowerCase(),
    orientation: layout.orientation,
    putOnlyUsedFonts: true,
    compress: true,
  })
  const family = layout.font === "serif" ? "DocumentSerif" : "DocumentSans"
  const [regular, bold] = await Promise.all([
    fontData(layout.font === "serif" ? serif : sans),
    fontData(layout.font === "serif" ? serifBold : sansBold),
  ])
  pdf.addFileToVFS("document-regular.ttf", regular)
  pdf.addFont("document-regular.ttf", family, "normal")
  pdf.addFileToVFS("document-bold.ttf", bold)
  pdf.addFont("document-bold.ttf", family, "bold")
  const width = pdf.internal.pageSize.getWidth(),
    height = pdf.internal.pageSize.getHeight()
  const margin = layout.marginMm,
    content = width - margin * 2,
    bottom = height - margin - 9
  const pages: DrawCommand[][] = [[]]
  let current = pages[0],
    y = margin
  const accent = /^#[0-9a-f]{6}$/i.test(layout.accentColor)
    ? layout.accentColor
    : "#1e40af"
  const textColour = "#172033",
    muted = "#526078"
  const rect = (
    x: number,
    py: number,
    w: number,
    h: number,
    fill: string | null,
    stroke: string | null = null
  ) =>
    current.push({ type: "rect", x, y: py, width: w, height: h, fill, stroke })
  function decorate() {
    if (layout.style === "modern") rect(0, 0, width, 3, accent)
    if (layout.style === "classic") {
      rect(6, 6, width - 12, height - 12, null, accent)
      rect(8, 8, width - 16, height - 16, null, accent)
    }
  }
  decorate()
  function nextPage() {
    if (pages.length >= 100)
      throw new Error(
        "This document is too long. Reduce the message text or result columns."
      )
    current = []
    pages.push(current)
    y = margin
    decorate()
  }
  function room(h: number) {
    if (y + h > bottom) nextPage()
  }
  function lines(
    value: string,
    size = layout.fontSize,
    bold = false,
    w = content
  ) {
    pdf.setFont(family, bold ? "bold" : "normal")
    pdf.setFontSize(size)
    return pdf.splitTextToSize(String(value || ""), Math.max(8, w)) as string[]
  }
  function text(
    value: string,
    size = layout.fontSize,
    bold = false,
    colour = textColour,
    align: "left" | "center" = layout.alignment
  ) {
    const lh = size * mm * 1.4
    for (const line of lines(value, size, bold)) {
      room(lh)
      current.push({
        type: "text",
        x: align === "center" ? width / 2 : margin,
        y: y + size * mm,
        value: line,
        size,
        bold,
        colour,
        align,
      })
      y += lh
    }
    y += 2
  }
  function image(url: string, maxW: number, maxH: number) {
    const props = pdf.getImageProperties(url),
      scale = Math.min(maxW / props.width, maxH / props.height)
    const w = props.width * scale,
      h = props.height * scale
    room(h + 3)
    current.push({
      type: "image",
      x: layout.alignment === "center" ? (width - w) / 2 : margin,
      y,
      width: w,
      height: h,
      url,
    })
    y += h + 3
  }
  function results() {
    const columns = layout.resultColumns.filter((c) => resultLabels[c]),
      weights: Record<string, number> = {
        subject: 3,
        assessments: 3,
        score: 1,
        maxScore: 1.2,
        grade: 1,
        remark: 2.6,
      }
    const totalWeight = columns.reduce((sum, c) => sum + weights[c], 0)
    const widths = columns.map((c) => (content * weights[c]) / totalWeight),
      size = Math.max(7, layout.fontSize - 2),
      lh = size * mm * 1.35
    const headLines = columns.map((c, i) =>
      lines(resultLabels[c], size, true, widths[i] - 4)
    )
    const headH = Math.max(...headLines.map((x) => x.length)) * lh + 4
    function header() {
      room(headH + lh + 4)
      rect(margin, y, content, headH, accent)
      let x = margin
      columns.forEach((_, i) => {
        headLines[i].forEach((line, n) =>
          current.push({
            type: "text",
            x: x + 2,
            y: y + 2 + size * mm + n * lh,
            value: line,
            size,
            bold: true,
            colour: "#ffffff",
            align: "left",
          })
        )
        x += widths[i]
      })
      y += headH
    }
    header()
    data.results.forEach((row, index) => {
      const cells = columns.map((c, i) =>
        lines(
          String(row[c as keyof typeof row] ?? ""),
          size,
          false,
          widths[i] - 4
        )
      )
      const count = Math.max(1, ...cells.map((c) => c.length))
      // Keep ordinary subject rows together; split only rows taller than a page.
      const rowHeight = count * lh + 4
      if (y + rowHeight > bottom && rowHeight <= bottom - margin - headH) {
        nextPage()
        header()
      }
      let from = 0
      while (from < count) {
        if (y + lh + 4 > bottom) {
          nextPage()
          header()
        }
        const take = Math.min(
            count - from,
            Math.max(1, Math.floor((bottom - y - 4) / lh))
          ),
          h = take * lh + 4
        rect(
          margin,
          y,
          content,
          h,
          index % 2 ? "#f3f5fa" : "#ffffff",
          "#e2e6ee"
        )
        let x = margin
        cells.forEach((cell, i) => {
          cell.slice(from, from + take).forEach((line, n) =>
            current.push({
              type: "text",
              x: x + 2,
              y: y + 2 + size * mm + n * lh,
              value: line,
              size,
              bold: false,
              colour: textColour,
              align: "left",
            })
          )
          x += widths[i]
        })
        y += h
        from += take
        if (from < count) {
          nextPage()
          header()
        }
      }
    })
    y += 6
  }
  for (const block of layout.blocks.filter((b) => b.enabled)) {
    switch (block.type) {
      case "header":
        if (layout.logoDataUrl) image(layout.logoDataUrl, 28, 22)
        text(data.schoolName, kind === "certificate" ? 21 : 19, true, accent)
        text(layout.heading, kind === "certificate" ? 24 : 16, true)
        if (layout.subtitle)
          text(substitute(layout.subtitle, data), layout.fontSize, false, muted)
        if (data.schoolAddress) text(data.schoolAddress, 9, false, muted)
        y += 4
        break
      case "identity":
        text(data.recipientName, 15, true)
        text(
          `Admission: ${data.admissionNumber || "—"}    Class: ${data.className || "—"}`,
          layout.fontSize,
          false,
          muted,
          "left"
        )
        text(
          `Session: ${data.sessionName || "—"}    Term: ${data.termName || "—"}`,
          layout.fontSize,
          false,
          muted,
          "left"
        )
        break
      case "summary":
        text(
          `Average: ${Number(data.averageScore).toFixed(2)}%    Total: ${data.totalScore}    Position: ${data.position || "—"}    Subjects: ${data.subjectCount}`,
          layout.fontSize,
          true,
          accent,
          "left"
        )
        break
      case "results":
        if (block.label && block.label !== "results")
          text(block.label, layout.fontSize, true)
        results()
        break
      case "award":
        y += 5
        text("This certificate is presented to", layout.fontSize, false, muted)
        text(data.recipientName, 26, true, accent)
        text("For", layout.fontSize, false, muted)
        text(data.awardTitle || "Achievement title", 17, true)
        text(
          `Award date: ${data.awardDate || "—"}`,
          layout.fontSize,
          false,
          muted
        )
        y += 5
        break
      case "text":
        if (block.label) text(block.label, layout.fontSize, true)
        if (block.text) text(substitute(block.text, data))
        y += 3
        break
      case "signatures":
        room(24)
        if (layout.signatureDataUrl) image(layout.signatureDataUrl, 40, 16)
        if (layout.signatoryName)
          text(layout.signatoryName, layout.fontSize, true)
        text(layout.signatoryTitle, 9, false, muted)
        break
      case "footer":
        if (layout.footer)
          text(substitute(layout.footer, data), 8, false, muted)
        break
    }
  }
  pages.forEach((page, i) => {
    const marker =
      status === "revoked"
        ? "REVOKED"
        : status === "sample"
          ? "SAMPLE · NOT ISSUED"
          : status === "preview"
            ? "PREVIEW · NOT ISSUED"
            : ""
    if (marker)
      page.push({
        type: "text",
        x: width / 2,
        y: height - margin - 5,
        value: marker,
        size: 9,
        bold: true,
        colour: status === "revoked" ? "#b91c1c" : muted,
        align: "center",
      })
    page.push({
      type: "text",
      x: margin,
      y: height - margin + 1,
      value: `${data.documentNumber} · ${data.issueDate} · Page ${i + 1} of ${pages.length}`,
      size: 7,
      bold: false,
      colour: muted,
      align: "left",
    })
    if (i) pdf.addPage()
    for (const c of page) {
      if (c.type === "text") {
        pdf.setFont(family, c.bold ? "bold" : "normal")
        pdf.setFontSize(c.size)
        pdf.setTextColor(c.colour)
        pdf.text(c.value, c.x, c.y, { align: c.align })
      } else if (c.type === "image")
        pdf.addImage(c.url, "PNG", c.x, c.y, c.width, c.height)
      else {
        if (c.fill) pdf.setFillColor(c.fill)
        if (c.stroke) {
          pdf.setDrawColor(c.stroke)
          pdf.setLineWidth(0.2)
        }
        pdf.rect(
          c.x,
          c.y,
          c.width,
          c.height,
          c.fill ? (c.stroke ? "FD" : "F") : "S"
        )
      }
    }
  })
  pdf.setProperties({
    title: `${data.schoolName} — ${layout.heading}`,
    subject: data.documentNumber,
    creator: "EM360 Document Designer",
  })
  return { pdf, pages, width, height, font: family }
}
export function sampleData(kind: DocumentKind): DocumentData {
  return {
    attendancePresent: 52,
    attendanceAbsent: 2,
    attendanceLate: 1,
    attendanceExcused: 0,
    attendanceRecorded: 55,
    schoolName: "Your School",
    schoolAddress: "Your school address",
    recipientName: "Alex Morgan",
    admissionNumber: "STU-001",
    className: "Year 8",
    sessionName: "2026 / 2027",
    termName: "First Term",
    averageScore: 83.5,
    totalScore: 167,
    position: 3,
    subjectCount: 2,
    results: [
      {
        subject: "Mathematics",
        score: 87,
        maxScore: 100,
        grade: "A",
        remark: "Excellent",
        assessments: "Coursework: 27/30; Examination: 60/70",
        assessmentScores: [
          { name: "Coursework", score: 27, maxScore: 30 },
          { name: "Examination", score: 60, maxScore: 70 },
        ],
      },
      {
        subject: "English Language",
        score: 80,
        maxScore: 100,
        grade: "A",
        remark: "Very good",
        assessments: "Coursework: 25/30; Examination: 55/70",
        assessmentScores: [
          { name: "Coursework", score: 25, maxScore: 30 },
          { name: "Examination", score: 55, maxScore: 70 },
        ],
      },
    ],
    awardTitle: kind === "certificate" ? "Outstanding achievement" : "",
    awardDate: "2026-10-05",
    documentNumber: "SAMPLE",
    issueDate: "2026-10-05",
    comment: "A positive term of learning and steady progress.",
  }
}
