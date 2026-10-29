// Result exports for the WordPress portal: PDF/CSV downloads and printing from a hidden frame,
// with class results read 200 rows at a time (the gateway's page-size limit).
import { getClassResultDetailsApi } from "@/api/examAndRecords.api"
import type { LookupStudentResultValueI } from "@/api/examAndRecords.api/types"

interface Printable {
  title: string
  subtitle: string
  header: string[]
  rows: string[][]
}

const safeName = (name: string) => name.replace(/[^a-zA-Z0-9_-]+/g, "_").slice(0, 100)

/** Prints a simple A4 table from an off-screen frame, so the portal page itself is not printed. */
async function printTable(doc: Printable) {
  const frame = document.createElement("iframe")
  frame.title = "Print academic results"
  frame.style.cssText = "position:fixed;width:1px;height:1px;left:-10000px;top:0;border:0"
  document.body.appendChild(frame)
  try {
    const page = frame.contentDocument,
      win = frame.contentWindow
    if (!page || !win) throw new Error("Unable to prepare printing")
    page.title = doc.title
    const style = page.createElement("style")
    style.textContent =
      "@page{size:A4;margin:15mm}body{font:12px Arial;color:#172554}table{border-collapse:collapse;width:100%}td,th{padding:8px;border:1px solid #cbd5e1;text-align:left}thead{display:table-header-group}tr{break-inside:avoid}th{background:#eff6ff}"
    page.head.appendChild(style)
    for (const [tag, text] of [
      ["h1", doc.title],
      ["p", doc.subtitle],
    ]) {
      const el = page.createElement(tag)
      el.textContent = text
      page.body.appendChild(el)
    }
    const table = page.createElement("table"),
      head = page.createElement("thead"),
      body = page.createElement("tbody")
    const row = (cells: string[], heading: boolean) => {
      const tr = page.createElement("tr")
      for (const cell of cells) {
        const td = page.createElement(heading ? "th" : "td")
        td.textContent = cell
        tr.appendChild(td)
      }
      return tr
    }
    head.appendChild(row(doc.header, true))
    doc.rows.forEach((r) => body.appendChild(row(r, false)))
    table.append(head, body)
    page.body.appendChild(table)
    await page.fonts.ready
    win.addEventListener("afterprint", () => frame.remove(), { once: true })
    win.focus()
    win.print()
    setTimeout(() => frame.remove(), 300000)
  } catch (error) {
    frame.remove()
    throw error
  }
}

/** One student's term result as a PDF download, or printed when `print` is true. */
export async function exportStudentResult(result: LookupStudentResultValueI, print = false) {
  const { studentInfo: info, academicSummary: summary } = result
  const doc: Printable = {
    title: `${info.studentName} — Academic result`,
    subtitle: `${info.admissionNumber} | ${info.className} | ${info.termName} | ${info.sessionName}`,
    header: ["Subject", "Score", "Grade"],
    rows: result.subjectBreakdown.map((s) => [s.subjectName, String(s.totalScore), s.grade]),
  }
  doc.rows.push(
    ["Total", String(summary.totalScore), ""],
    ["Average", String(summary.averageScore), ""],
    ["Position", String(summary.position), ""],
  )
  if (print) return printTable(doc)
  const { downloadReportPdf } = await import("@/lib/reportPdf")
  downloadReportPdf(`${safeName(info.studentName)}_result.pdf`, doc.title, doc.subtitle, [
    { heading: "Subject results", header: doc.header, rows: doc.rows },
  ])
}

/** Every student in a class result as CSV, or printed when `print` is true. */
export async function exportClassResults(classCummaltiveResultId: string, print = false) {
  const students: {
    position: number
    studentName: string
    admissionNumber: string
    totalScore: number
    averageScore: number
    status: string
  }[] = []
  let pageNumber = 1,
    totalPages = 1,
    title = "Class results",
    subtitle = ""
  do {
    const response = await getClassResultDetailsApi({ classCummaltiveResultId, pageNumber, pageSize: 200 })
    if (!response.isSuccess || !response.value?.students) throw new Error("Unable to load all class results")
    const { header, students: page } = response.value
    title = `${header.className} — Class results`
    subtitle = `${header.termName} | ${header.sessionName}`
    totalPages = page.totalPages || 1
    if (pageNumber < totalPages && !page.items.length) throw new Error("The result export is incomplete. Please retry.")
    students.push(...page.items)
    pageNumber++
  } while (pageNumber <= totalPages)
  const doc: Printable = {
    title,
    subtitle,
    header: ["Position", "Student", "Admission number", "Total", "Average", "Status"],
    rows: students.map((s) => [
      String(s.position),
      s.studentName,
      s.admissionNumber,
      String(s.totalScore),
      String(s.averageScore),
      s.status,
    ]),
  }
  if (print) return printTable(doc)
  // Cells that start like a formula are prefixed so spreadsheets do not run them.
  const cell = (v: string) => '"' + (/^[\s]*[=+@-]/.test(v) ? "'" + v : v).replaceAll('"', '""') + '"'
  const csv = "﻿" + [doc.header, ...doc.rows].map((r) => r.map(cell).join(",")).join("\r\n")
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }))
  const link = document.createElement("a")
  link.href = url
  link.download = `${safeName(title)}.csv`
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
