import { useState } from "react"
import { useSchoolId, useSchoolTimeZone } from "@/contexts/SchoolContext"
import { usePermissions } from "@/hooks/usePermissions"
import { PageHeader } from "@/components/general/PageHeader"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useDebouncedValue } from "@/hooks/useDebouncedValue"
import { useRead, useSave, type Row } from "../rebuilt/service"
import { Field, Pager, QueryState, inputClass } from "../rebuilt/shared"
const MENU = "/dashboard/hostel/movement"
const reasons = [
  "Weekend visit",
  "Medical",
  "Holiday",
  "Emergency",
  "Other",
  "Class",
]
export default function Movement() {
  const school = useSchoolId(),
    timeZone = useSchoolTimeZone(),
    permissions = usePermissions()
  const [page, setPage] = useState(1),
    [status, setStatus] = useState(""),
    [search, setSearch] = useState(""),
    [hostel, setHostel] = useState("")
  const [open, setOpen] = useState(false),
    [error, setError] = useState(""),
    [studentSearch, setStudentSearch] = useState(""),
    [studentPage, setStudentPage] = useState(1)
  const [form, setForm] = useState({
    studentId: "",
    reason: 1,
    destination: "",
    expectedReturnTime: "",
    notes: "",
  })
  const hostels = useRead("/Hostel/GetAll", { schoolId: school, pageSize: 100 })
  const list = useRead("/WordPressHostel/Movements", {
    ...(hostel ? { hostelId: hostel } : {}),
    search: useDebouncedValue(search, 250),
    status,
    page,
  })
  const students = useRead(
    "/WordPressHostel/Students",
    {
      hostelId: hostel,
      search: useDebouncedValue(studentSearch, 250),
      page: studentPage,
    },
    open && !!hostel
  )
  const save = useSave()
  const fmt = (date?: string) =>
    date
      ? new Intl.DateTimeFormat(undefined, {
          dateStyle: "medium",
          timeStyle: "short",
          timeZone,
        }).format(new Date(date))
      : "—"
  const perform = async (path: string, body?: unknown) => {
    setError("")
    try {
      await save.mutateAsync({ path, body })
      return true
    } catch (e) {
      setError((e as Error).message)
      return false
    }
  }
  return (
    <div className="space-y-6">
      <PageHeader
        title="Sign In / Out"
        description="Track students leaving and returning to the hostel"
        actions={
          permissions.canCreate(MENU) && (
            <Button
              onClick={() => {
                setError("")
                setOpen(true)
              }}
            >
              Sign out student
            </Button>
          )
        }
      />
      <div className="grid gap-4 rounded-xl border bg-white p-4 md:grid-cols-3">
        <Field label="Hostel">
          <select
            className={inputClass}
            value={hostel}
            onChange={(e) => {
              setHostel(e.target.value)
              setPage(1)
              setForm({ ...form, studentId: "" })
            }}
          >
            <option value="">All hostels</option>
            {hostels.data?.items?.map((h: Row) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Status">
          <select
            className={inputClass}
            value={status}
            onChange={(e) => {
              setStatus(e.target.value)
              setPage(1)
            }}
          >
            <option value="">All movements</option>
            <option value="Out">Currently out</option>
            <option value="Returned">Returned</option>
            <option value="Overdue">Overdue</option>
          </select>
        </Field>
        <Field label="Search students">
          <input
            className={inputClass}
            maxLength={120}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
          />
        </Field>
      </div>
      {error && !open && (
        <p role="alert" className="text-red-700">
          {error}
        </p>
      )}
      <QueryState query={list}>
        <div className="overflow-x-auto rounded-xl border bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50">
              <tr>
                {[
                  "Student",
                  "Destination",
                  "Signed out",
                  "Expected return",
                  "Returned",
                  "Action",
                ].map((h) => (
                  <th key={h} className="p-4">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {list.data?.items?.map((row: Row) => (
                <tr key={row.id} className="border-t">
                  <td className="p-4 font-medium">
                    {row.studentName}
                    {row.overdue && (
                      <span className="ml-2 text-red-700">Overdue</span>
                    )}
                  </td>
                  <td className="p-4">{row.destination}</td>
                  <td className="p-4">{fmt(row.timeOut)}</td>
                  <td className="p-4">{fmt(row.expectedReturnTime)}</td>
                  <td className="p-4">{fmt(row.actualReturnTime)}</td>
                  <td className="p-4">
                    {!row.actualReturnTime && permissions.canUpdate(MENU) && (
                      <Button
                        variant="outline"
                        disabled={save.isPending}
                        onClick={() =>
                          void perform("/WordPressHostel/SignIn/" + row.id)
                        }
                      >
                        Record return
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!list.data?.items?.length && (
            <p className="p-6 text-slate-500">
              No movements match these filters.
            </p>
          )}
        </div>
        <Pager
          page={page}
          total={list.data?.totalPages || 1}
          setPage={setPage}
        />
      </QueryState>
      <Dialog
        open={open}
        onOpenChange={(v) => {
          if (!save.isPending) setOpen(v)
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Sign out student</DialogTitle>
          </DialogHeader>
          <form
            className="grid gap-4"
            onSubmit={async (e) => {
              e.preventDefault()
              if (
                await perform("/WordPressHostel/SignOut", {
                  ...form,
                  hostelId: hostel,
                  expectedReturnTime: new Date(
                    form.expectedReturnTime
                  ).toISOString(),
                })
              ) {
                setOpen(false)
                setForm({
                  studentId: "",
                  reason: 1,
                  destination: "",
                  expectedReturnTime: "",
                  notes: "",
                })
              }
            }}
          >
            <Field label="Hostel">
              <select
                className={inputClass}
                required
                value={hostel}
                onChange={(e) => {
                  setHostel(e.target.value)
                  setForm({ ...form, studentId: "" })
                  setStudentPage(1)
                }}
              >
                <option value="">Choose a hostel</option>
                {hostels.data?.items?.map((h: Row) => (
                  <option key={h.id} value={h.id}>
                    {h.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Find resident">
              <input
                className={inputClass}
                value={studentSearch}
                maxLength={120}
                onChange={(e) => {
                  setStudentSearch(e.target.value)
                  setStudentPage(1)
                }}
              />
            </Field>
            <Field label="Student">
              <select
                className={inputClass}
                required
                value={form.studentId}
                onChange={(e) =>
                  setForm({ ...form, studentId: e.target.value })
                }
              >
                <option value="">Choose a resident</option>
                {students.data?.items?.map((s: Row) => (
                  <option key={s.id} value={s.id}>
                    {s.name} — {s.className}
                  </option>
                ))}
              </select>
            </Field>
            {students.isError && <p role="alert">{students.error.message}</p>}
            {students.data?.totalPages > 1 && (
              <Pager
                page={studentPage}
                total={students.data.totalPages}
                setPage={setStudentPage}
              />
            )}
            <Field label="Reason">
              <select
                className={inputClass}
                value={form.reason}
                onChange={(e) =>
                  setForm({ ...form, reason: Number(e.target.value) })
                }
              >
                {reasons.map((r, i) => (
                  <option value={i + 1} key={r}>
                    {r}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Destination">
              <input
                className={inputClass}
                required
                maxLength={300}
                value={form.destination}
                onChange={(e) =>
                  setForm({ ...form, destination: e.target.value })
                }
              />
            </Field>
            <Field label="Expected return (your device's local time)">
              <input
                className={inputClass}
                type="datetime-local"
                required
                value={form.expectedReturnTime}
                onChange={(e) =>
                  setForm({ ...form, expectedReturnTime: e.target.value })
                }
              />
            </Field>
            <Field label="Notes">
              <textarea
                className={inputClass}
                maxLength={2000}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </Field>
            {error && (
              <p role="alert" className="text-red-700">
                {error}
              </p>
            )}
            <Button
              disabled={save.isPending || !hostel || !form.studentId}
              type="submit"
            >
              {save.isPending ? "Saving…" : "Record departure"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
