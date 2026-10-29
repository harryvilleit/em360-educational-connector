import { useState } from "react"
import { PageHeader } from "@/components/general/PageHeader"
import { useSchoolId } from "@/contexts/SchoolContext"
import { useDebouncedValue } from "@/hooks/useDebouncedValue"
import { useRead, type Row } from "../rebuilt/service"
import { QueryState, Pager, Field, inputClass } from "../rebuilt/shared"
export default function Health() {
  const schoolId = useSchoolId(),
    [hostelId, setHostel] = useState(""),
    [search, setSearch] = useState(""),
    [page, setPage] = useState(1)
  const hostels = useRead("/Hostel/GetAll", { schoolId, pageSize: 100 })
  const q = useRead("/WordPressHostel/Health", {
    ...(hostelId ? { hostelId } : {}),
    search: useDebouncedValue(search, 250),
    page,
  })
  return (
    <div className="space-y-6">
      <PageHeader
        title="Hostel health records"
        description="Resident health information permitted for your role"
      />
      <div className="grid gap-4 rounded-xl border bg-white p-4 sm:grid-cols-2">
        <Field label="Hostel">
          <select
            className={inputClass}
            value={hostelId}
            onChange={(e) => {
              setHostel(e.target.value)
              setPage(1)
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
        <Field label="Search residents">
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
      <QueryState query={q}>
        <div className="overflow-x-auto rounded-xl border bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50">
              <tr>
                {[
                  "Student",
                  "Class",
                  "Blood group",
                  "Allergies",
                  "Medical conditions",
                ].map((s) => (
                  <th className="p-4" key={s}>
                    {s}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {q.data?.items?.map((r: Row) => (
                <tr className="border-t" key={r.id || r.studentSchoolId}>
                  <td className="p-4 font-medium">{r.studentName}</td>
                  <td className="p-4">{r.className || "—"}</td>
                  <td className="p-4">{r.bloodGroup || "—"}</td>
                  <td className="p-4">{r.allergies || "—"}</td>
                  <td className="p-4">
                    {r.medicalConditions || r.chronicConditions || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!q.data?.items?.length && (
            <p className="p-6">No resident records available.</p>
          )}
        </div>
        <Pager page={page} total={q.data?.totalPages || 1} setPage={setPage} />
      </QueryState>
    </div>
  )
}
