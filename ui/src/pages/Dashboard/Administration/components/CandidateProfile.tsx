import { useEffect, useId, useRef, useState } from "react"
import { getStudentByIdApi } from "@/api/studentPortal.api"
import type { StudentDetailI } from "@/api/studentPortal.api/types"
import { useGetSchoolStudents } from "@/hooks/studentPortal"
import { useDebouncedValue } from "@/hooks/useDebouncedValue"
import { useSchoolId } from "@/contexts/SchoolContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function CandidateProfile({
  onStudent,
  onBusyChange,
}: {
  onStudent: (student: StudentDetailI) => void
  onBusyChange: (busy: boolean) => void
}) {
  const id = useId()
  const schoolId = useSchoolId()
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [active, setActive] = useState(0)
  const keyword = useDebouncedValue(search.trim(), 300)
  const { students, pagination, isLoading, isError, refetch } =
    useGetSchoolStudents({
      schoolId: keyword ? schoolId : "",
      search: keyword,
      pageNumber: page,
      pageSize: 10,
    })
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  const operation = useRef(0)
  useEffect(
    () => () => {
      operation.current++
    },
    [schoolId]
  )
  const pending = isLoading || keyword !== search.trim()
  const visible = !!search.trim() && !pending && !isError && students.length > 0

  async function selectStudent(studentId: string) {
    if (busy || pending) return
    const request = ++operation.current
    setBusy(true)
    onBusyChange(true)
    setError("")
    try {
      const result = await getStudentByIdApi({ schoolId, studentId })
      if (request !== operation.current) return
      if (
        !result.isSuccess ||
        !result.value ||
        result.value.studentId !== studentId ||
        result.value.schoolId !== schoolId
      )
        throw new Error("Student profile unavailable")
      onStudent(result.value)
      setSearch("")
      setPage(1)
      setActive(0)
    } catch {
      if (request === operation.current)
        setError("Could not load the student profile. Please try again.")
    } finally {
      if (request === operation.current) {
        setBusy(false)
        onBusyChange(false)
      }
    }
  }

  return (
    <div className="space-y-3 rounded-lg border bg-white p-3">
      <Label htmlFor={id + "-search"}>
        Find registered student{" "}
        <span className="text-red-600" aria-hidden="true">
          *
        </span>
      </Label>
      <Input
        id={id + "-search"}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={visible}
        aria-controls={visible ? id + "-results" : undefined}
        aria-activedescendant={
          visible && students[active] ? id + "-option-" + active : undefined
        }
        aria-describedby={id + "-hint"}
        value={search}
        disabled={busy}
        placeholder="Search by name, student ID or email"
        onChange={(event) => {
          setSearch(event.target.value)
          setPage(1)
          setActive(0)
          setError("")
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault()
            if (visible && students[active])
              void selectStudent(students[active].studentId)
          } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault()
            if (visible)
              setActive(
                (current) =>
                  (current +
                    (event.key === "ArrowDown" ? 1 : -1) +
                    students.length) %
                  students.length
              )
          } else if (event.key === "Escape") {
            event.preventDefault()
            setSearch("")
          }
        }}
      />
      <p id={id + "-hint"} className="text-xs text-muted-foreground">
        Select a result or use the arrow keys and press Enter. Details come from
        student registration.
      </p>
      {search.trim() && (
        <div className="space-y-2">
          {pending ? (
            <p role="status">Searching students...</p>
          ) : isError ? (
            <p role="alert">
              Could not load students.{" "}
              <button
                type="button"
                className="underline"
                onClick={() => void refetch()}
              >
                Retry
              </button>
            </p>
          ) : !students.length ? (
            <p role="status">No matching students.</p>
          ) : (
            <ul
              id={id + "-results"}
              role="listbox"
              aria-label="Registered students"
              className="max-h-48 divide-y overflow-y-auto rounded-lg border border-chart-2/40"
            >
              {students.map((student, index) => (
                <li
                  key={student.studentId}
                  id={id + "-option-" + index}
                  role="option"
                  aria-selected={active === index}
                >
                  <button
                    type="button"
                    disabled={busy}
                    className={
                      "w-full p-2 text-left text-sm hover:bg-chart-2/10 focus-visible:outline-chart-2 disabled:opacity-50 " +
                      (active === index ? "bg-chart-2/20 text-blue-800" : "")
                    }
                    onClick={() => void selectStudent(student.studentId)}
                  >
                    <span className="block font-medium">
                      {student.firstname} {student.lastname}
                    </span>
                    <span className="block text-xs break-all text-muted-foreground">
                      {student.studentGivenId || student.studentId}
                      {student.email ? " � " + student.email : ""}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {!pending && !isError && pagination.totalPages > 1 && (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={page <= 1 || busy}
                onClick={() => {
                  setPage(page - 1)
                  setActive(0)
                }}
              >
                Previous
              </Button>
              <span className="text-xs">
                Page {page} of {pagination.totalPages}
              </span>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={page >= pagination.totalPages || busy}
                onClick={() => {
                  setPage(page + 1)
                  setActive(0)
                }}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}
      {busy && (
        <p role="status" className="text-xs">
          Loading student details...
        </p>
      )}
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}
