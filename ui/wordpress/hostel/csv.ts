export function parseAssignments(text: string) {
  const rows = text
    .replace(/^\uFEFF/, "")
    .trim()
    .split(/\r?\n/)
    .map((l) => l.split(",").map((v) => v.trim().replace(/^"([^"]*)"$/, "$1")))
  if (rows.shift()?.join(",") !== "studentId,bedSpaceId")
    throw Error("Use the CSV headers studentId,bedSpaceId.")
  if (!rows.length || rows.length > 500)
    throw Error("Provide between 1 and 500 assignments.")
  const students = new Set(),
    beds = new Set(),
    id = /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i
  return rows.map((r, i) => {
    if (r.length !== 2 || !r.every((v) => id.test(v)))
      throw Error("Row " + (i + 2) + ": enter valid student and bed IDs.")
    if (students.has(r[0].toLowerCase()) || beds.has(r[1].toLowerCase()))
      throw Error("Row " + (i + 2) + ": duplicate student or bed.")
    students.add(r[0].toLowerCase())
    beds.add(r[1].toLowerCase())
    return { studentId: r[0].toLowerCase(), bedSpaceId: r[1].toLowerCase() }
  })
}
