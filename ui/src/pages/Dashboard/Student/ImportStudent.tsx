import { useEffect, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router"
import { useQueryClient } from "@tanstack/react-query"
import { Download, FileText } from "lucide-react"
import apiClient from "@/api/api"
import { normalizeResponse } from "@/utils/apiResponse"
import { genderToApi } from "@/utils/studentEnums"
import { queryKeys } from "@/utils/queryKeys"
import { useSchoolId } from "@/contexts/SchoolContext"
import { useGetAllSchoolSessions } from "@/hooks/userMgt"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/general/PageHeader"
import { DashboardRoutes } from "@/routes"
import type { ValidRow, InvalidRow } from "./components/importStudent.types"
import { validateRow, isValidRow } from "./components/importStudent.validation"
import { parseCSV } from "./components/importStudent.parser"
import { downloadTemplate } from "./components/importStudent.template"
import { UploadZone } from "./components/UploadZone"
import { SummaryBanner } from "./components/SummaryBanner"
import { InvalidRowsAccordion } from "./components/InvalidRowsAccordion"
import { ValidRowsTable } from "./components/ValidRowsTable"

type RowResult = {
  rowNumber: number
  status:
    | "imported"
    | "alreadyImported"
    | "needsEnrollment"
    | "rejected"
    | "unknown"
  studentId?: string
  message: string
}
type Preview = { valid: ValidRow[]; invalid: InvalidRow[]; fileName: string }
export default function ImportStudentsPage() {
  const navigate = useNavigate(),
    { productId } = useParams(),
    schoolId = useSchoolId(),
    client = useQueryClient()
  const {
    sessions,
    isError: sessionsError,
    refetch,
  } = useGetAllSchoolSessions({ schoolId, pageSize: 100 })
  const [sessionId, setSessionId] = useState(""),
    [termId, setTermId] = useState("")
  const session = sessions.find((s) => s.Id === sessionId)
  const [isDragging, setIsDragging] = useState(false),
    [preview, setPreview] = useState<Preview | null>(null)
  const [results, setResults] = useState<RowResult[]>([]),
    [error, setError] = useState(""),
    [importing, setImporting] = useState(false)
  const running = useRef(false),
    stop = useRef(false)
  useEffect(
    () => () => {
      stop.current = true
    },
    [],
  )
  useEffect(() => {
    const leave = (event: BeforeUnloadEvent) => {
      if (running.current) {
        event.preventDefault()
        event.returnValue = ""
      }
    }
    window.addEventListener("beforeunload", leave)
    return () => window.removeEventListener("beforeunload", leave)
  }, [])
  async function handleFile(file: File) {
    if (running.current) return
    setError("")
    setResults([])
    try {
      if (!/\.csv$/i.test(file.name) || file.size > 1024 * 1024)
        throw new Error("Choose a CSV file of 1 MB or less.")
      const parsed = parseCSV(await file.text())
      if (parsed.length > 100)
        throw new Error("Import up to 100 rows per file.")
      const ids = new Set<string>(),
        emails = new Set<string>()
      const checked = parsed.map((row) => {
        const valid = validateRow(row)
        if (!isValidRow(valid)) return valid
        const id = valid.studentId.toLowerCase(),
          email = valid.email.toLowerCase()
        if (ids.has(id) || emails.has(email))
          return {
            rowNumber: row.rowNumber,
            data: row.data,
            errors: ["Duplicate student ID or email in this file."],
          }
        ids.add(id)
        emails.add(email)
        return valid
      })
      setPreview({
        fileName: file.name,
        valid: checked.filter(isValidRow),
        invalid: checked.filter((r): r is InvalidRow => !isValidRow(r)),
      })
    } catch (e) {
      setPreview(null)
      setError(e instanceof Error ? e.message : "Could not read the CSV.")
    }
  }
  async function handleImport() {
    if (
      !preview ||
      running.current ||
      !session ||
      !session.Terms.some((t) => t.Id === termId)
    )
      return
    running.current = true
    stop.current = false
    setImporting(true)
    setError("")
    const completed = new Set(
      results
        .filter((r) => ["imported", "alreadyImported"].includes(r.status))
        .map((r) => r.rowNumber),
    )
    try {
      for (const row of preview.valid.filter(
        (r) => !completed.has(r.rowNumber),
      )) {
        if (stop.current) break
        let result: RowResult
        try {
          const response = normalizeResponse<{
            isSuccess: boolean
            value: Omit<RowResult, "rowNumber">
          }>(
            await apiClient.post("/Student/ImportRow", {
              schoolId,
              schoolSessionId: sessionId,
              schoolSessionTermId: termId,
              studentGivenId: row.studentId,
              firstname: row.firstName,
              lastname: row.lastName,
              middleName: row.middleName,
              dateofBirth: row.dob,
              gender: genderToApi(row.gender),
              email: row.email,
              className: row.class,
              armName: row.arm,
              guardianName: row.guardianName,
              guardianEmail: row.guardianEmail,
              guardianPhone: row.guardianPhone,
              guardianRelationship: row.guardianRelationship,
              guardianAddress: row.guardianAddress,
            }),
          )
          result = { ...response.value, rowNumber: row.rowNumber }
        } catch (e) {
          result = {
            rowNumber: row.rowNumber,
            status: "unknown",
            message: `${e instanceof Error ? e.message : "Request failed"} Check Student List before retrying; the server may have saved this row.`,
          }
          stop.current = true
        }
        setResults((prev) =>
          [...prev.filter((r) => r.rowNumber !== row.rowNumber), result].sort(
            (a, b) => a.rowNumber - b.rowNumber,
          ),
        )
      }
    } finally {
      running.current = false
      setImporting(false)
      for (const key of [
        queryKeys.schoolStudents,
        queryKeys.studentDashboardOverview,
        queryKeys.studentById,
        queryKeys.studentDetail,
      ])
        void client.invalidateQueries({ queryKey: [key] })
    }
  }
  function downloadResults() {
    const escape = (s: unknown) =>
      '"' +
      String(s ?? "")
        .replace(/^[=+@-]/, "'$&")
        .replaceAll('"', '""') +
      '"'
    const rows = [
      ...results.map((r) => [r.rowNumber, r.status, r.studentId, r.message]),
      ...(preview?.invalid ?? []).map((r) => [
        r.rowNumber,
        "invalid",
        "",
        r.errors.join("; "),
      ]),
    ]
    const url = URL.createObjectURL(
      new Blob(
        [
          [["Row", "Status", "Student ID", "Message"], ...rows]
            .map((row) => row.map(escape).join(","))
            .join("\r\n"),
        ],
        { type: "text/csv" },
      ),
    )
    const a = document.createElement("a")
    a.href = url
    a.download = "student-import-results.csv"
    a.click()
    URL.revokeObjectURL(url)
  }
  const saved = results.filter((r) =>
    ["imported", "alreadyImported"].includes(r.status),
  ).length
  return (
    <div className="space-y-6">
      <PageHeader
        title="Import Students"
        description="Preview your CSV, then save students and their class enrollments to the school."
        onBack={() => navigate(DashboardRoutes.toStudentList(productId!))}
        backLabel="Back to Students"
        actions={
          <Button variant="outline" onClick={downloadTemplate}>
            <Download className="size-4" />
            Download Template
          </Button>
        }
      />
      <div className="rounded-2xl border border-gray-100 bg-white p-6 space-y-6">
        <p className="text-sm text-gray-600">
          Up to 100 students per file. Use existing class and arm names, a
          unique student ID, and valid student and guardian emails. New accounts
          receive the normal EM360 onboarding emails. Existing school guardians
          are reused. Credentials are generated securely by the server.
        </p>
        {error && (
          <p role="alert" className="rounded-lg bg-red-50 p-4 text-red-700">
            {error}
          </p>
        )}
        {sessionsError ? (
          <div role="alert">
            Sessions could not be loaded.{" "}
            <Button variant="outline" onClick={() => void refetch()}>
              Retry sessions
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm">
              Academic session
              <select
                aria-label="Academic session"
                className="block w-full rounded-lg border p-2"
                disabled={importing || results.length > 0}
                value={sessionId}
                onChange={(e) => {
                  setSessionId(e.target.value)
                  setTermId("")
                }}
              >
                <option value="">Select session</option>
                {sessions.map((s) => (
                  <option key={s.Id} value={s.Id}>
                    {s.SessionName}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2 text-sm">
              Term
              <select
                aria-label="Term"
                className="block w-full rounded-lg border p-2"
                disabled={importing || results.length > 0}
                value={termId}
                onChange={(e) => setTermId(e.target.value)}
              >
                <option value="">Select term</option>
                {session?.Terms.map((t) => (
                  <option key={t.Id} value={t.Id}>
                    {t.TermName}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}
        {!preview ? (
          <UploadZone
            onFile={handleFile}
            isDragging={isDragging}
            setIsDragging={setIsDragging}
          />
        ) : (
          <>
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 font-medium">
                <FileText className="size-4" />
                {preview.fileName}
              </span>
              <Button
                variant="outline"
                disabled={importing}
                onClick={() => {
                  setPreview(null)
                  setResults([])
                  setError("")
                }}
              >
                Upload a different file
              </Button>
            </div>
            <SummaryBanner
              valid={preview.valid.length}
              invalid={preview.invalid.length}
            />
            <InvalidRowsAccordion rows={preview.invalid} />
            <ValidRowsTable rows={preview.valid} />
            {results.length > 0 && (
              <section aria-label="Import results" className="space-y-3">
                <h2 className="font-semibold">
                  {saved} of {preview.valid.length} students fully imported
                </h2>
                <p className="text-sm text-gray-500">
                  Rows marked “needsEnrollment” have a saved student record. Fix
                  the reported enrollment issue and retry the remaining rows.
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr>
                        <th className="p-2">Row</th>
                        <th>Status</th>
                        <th>Result</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((r) => (
                        <tr className="border-t" key={r.rowNumber}>
                          <td className="p-2">{r.rowNumber}</td>
                          <td className="pr-4">{r.status}</td>
                          <td>
                            {r.message}
                            {r.studentId && (
                              <Button
                                variant="link"
                                onClick={() =>
                                  navigate(
                                    DashboardRoutes.toStudentProfile(
                                      productId!,
                                      r.studentId!,
                                    ),
                                  )
                                }
                              >
                                View student
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Button variant="outline" onClick={downloadResults}>
                  Download results
                </Button>
              </section>
            )}
            <div className="flex flex-wrap justify-end gap-3">
              {importing ? (
                <>
                  <p role="status" className="self-center text-sm">
                    Importing… {results.length} rows processed
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      stop.current = true
                    }}
                  >
                    Stop after current row
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={() =>
                      navigate(DashboardRoutes.toStudentList(productId!))
                    }
                  >
                    Go to Students
                  </Button>
                  <Button
                    variant="primary"
                    disabled={
                      !sessionId || !termId || saved === preview.valid.length
                    }
                    onClick={() => void handleImport()}
                  >
                    {results.length
                      ? "Retry remaining rows"
                      : `Import ${preview.valid.length} Students`}
                  </Button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
