type Cell = string | number | null | undefined

export type ReportFormat = "pdf" | "excel" | "csv" | "json"

export interface DownloadTable {
  label: string
  header: string[]
  rows: Cell[][]
}

export interface DownloadPayload {
  title: string
  subtitle: string
  summary: [string, string][]
  tables: DownloadTable[]
}

function save(filename: string, mime: string, content: string) {
  const link = document.createElement("a")
  link.href = URL.createObjectURL(new Blob([content], { type: mime }))
  link.download = filename
  link.click()
  URL.revokeObjectURL(link.href)
}

const csvCell = (v: Cell) => `"${String(v ?? "").replaceAll('"', '""')}"`
const csvRow = (row: Cell[]) => row.map(csvCell).join(",")

// One file: summary first, then each table under its title, separated by a blank line
function toCsv({ title, subtitle, summary, tables }: DownloadPayload) {
  const blocks = [
    [csvRow([title]), csvRow([subtitle]), ...summary.map(csvRow)].join("\n"),
    ...tables.map((t) =>
      [csvRow([t.label]), csvRow(t.header), ...t.rows.map(csvRow)].join("\n")
    ),
  ]
  return blocks.join("\n\n")
}

const xml = (v: Cell) =>
  String(v ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")

function sheet(name: string, rows: Cell[][]) {
  const safeName = name.replace(/[[\]:*?/\\]/g, " ").slice(0, 31) || "Sheet"
  const body = rows
    .map(
      (row) =>
        `<Row>${row
          .map((c) =>
            typeof c === "number"
              ? `<Cell><Data ss:Type="Number">${c}</Data></Cell>`
              : `<Cell><Data ss:Type="String">${xml(c)}</Data></Cell>`
          )
          .join("")}</Row>`
    )
    .join("")
  return `<Worksheet ss:Name="${xml(safeName)}"><Table>${body}</Table></Worksheet>`
}

// Excel 2003 XML workbook (opens in Excel, Sheets and LibreOffice): one sheet per table
function toExcel({ title, subtitle, summary, tables }: DownloadPayload) {
  const sheets = [
    sheet("Summary", [[title], [subtitle], [], ...summary]),
    ...tables.map((t) => sheet(t.label, [t.header, ...t.rows])),
  ]
  return `<?xml version="1.0"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">${sheets.join("")}</Workbook>`
}

function toJson({ title, subtitle, summary, tables }: DownloadPayload) {
  return JSON.stringify(
    {
      title,
      subtitle,
      summary: Object.fromEntries(summary),
      tables: tables.map((t) => ({
        name: t.label,
        rows: t.rows.map((r) =>
          Object.fromEntries(t.header.map((h, i) => [h, r[i] ?? null]))
        ),
      })),
    },
    null,
    2
  )
}

export function downloadReport(
  format: Exclude<ReportFormat, "pdf">,
  baseName: string,
  payload: DownloadPayload
) {
  if (format === "csv") save(`${baseName}.csv`, "text/csv", toCsv(payload))
  else if (format === "excel")
    save(`${baseName}.xls`, "application/vnd.ms-excel", toExcel(payload))
  else save(`${baseName}.json`, "application/json", toJson(payload))
}
