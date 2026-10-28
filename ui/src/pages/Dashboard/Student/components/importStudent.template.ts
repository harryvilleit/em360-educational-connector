const TEMPLATE_HEADERS = [
  "studentId",
  "firstName",
  "lastName",
  "middleName",
  "gender",
  "dateOfBirth",
  "studentEmail",
  "class",
  "arm",
  "guardianName",
  "guardianRelationship",
  "guardianPhone",
  "guardianEmail",
  "guardianAddress",
]

export function downloadTemplate() {
  const exampleRow = [
    "STU001",
    "Ada",
    "Okoro",
    "Gift",
    "Female",
    "2010-04-15",
    "ada.student@example.com",
    "JSS 1",
    "A",
    "Mrs Okoro",
    "Mother",
    "08012345678",
    "okoro@example.com",
    "12 School Road",
  ]
  const csv = [TEMPLATE_HEADERS.join(","), exampleRow.join(",")].join("\n")
  const blob = new Blob([csv], { type: "text/csv" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = "student_import_template.csv"
  a.click()
  URL.revokeObjectURL(url)
}
