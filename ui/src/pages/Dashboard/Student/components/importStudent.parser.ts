import type { ParsedRow } from "./importStudent.validation"

export function parseCSV(text: string): ParsedRow[] {
  const records: { cells: string[]; line: number }[] = []
  let cells: string[] = [],
    cell = "",
    quoted = false,
    closed = false,
    line = 1,
    start = 1
  text = text.replace(/^\uFEFF/, "")
  for (let i = 0; i <= text.length; i++) {
    const char = text[i]
    if (quoted) {
      if (char === undefined) throw new Error("Unclosed quoted field in CSV.")
      if (char === '"') {
        if (text[i + 1] === '"') {
          cell += '"'
          i++
        } else {
          quoted = false
          closed = true
        }
      } else {
        cell += char
        if (char === "\n") line++
      }
      continue
    }
    if (char === '"' && !cell && !closed) {
      quoted = true
      continue
    }
    if (char === "," || char === "\n" || char === "\r" || char === undefined) {
      cells.push(cell.trim())
      cell = ""
      closed = false
      if (char !== ",") {
        if (cells.some(Boolean)) records.push({ cells, line: start })
        cells = []
        if (char === "\r" && text[i + 1] === "\n") i++
        start = ++line
      }
    } else if (closed && char.trim())
      throw new Error(`Unexpected text after quoted field on line ${line}.`)
    else if (!closed) cell += char
  }
  if (records.length < 2)
    throw new Error("The CSV needs a header and at least one student row.")
  const headers = records.shift()!.cells.map((h) => h.toLowerCase())
  if (headers.some((h) => !h) || new Set(headers).size !== headers.length)
    throw new Error("CSV headers must be unique and nonempty.")
  return records.map((row) => {
    if (row.cells.length !== headers.length)
      throw new Error(
        `Line ${row.line} has ${row.cells.length} columns; expected ${headers.length}.`,
      )
    return {
      rowNumber: row.line,
      data: Object.fromEntries(headers.map((h, i) => [h, row.cells[i]])),
    }
  })
}
