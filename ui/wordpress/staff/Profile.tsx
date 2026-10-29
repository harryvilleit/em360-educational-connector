import { useState } from "react"
import IdCardButton from "@/components/id-cards/IdCardButton"
import { useNavigate, useParams } from "react-router"
import { usePermissions } from "@/hooks/usePermissions"
import { PageHeader } from "@/components/general/PageHeader"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { PayrollSummary } from "@/pages/Dashboard/StaffManagement/components/PayrollSummary"
import AttendanceSummaryPanel from "./AttendanceSummary"
import { normalizeGenderLabel } from "@/pages/Dashboard/StaffManagement/types/normalize"
import {
  request,
  useRead,
  useSave,
  downloadPrivate,
  type Row,
} from "../rebuilt/service"
import { Field, QueryState, inputClass } from "../rebuilt/shared"
const MENU = "/dashboard/staff/list"
const fields = [
  ["qualification", "Qualification", "text"],
  ["employmentType", "Employment type", "text"],
  ["dateOfBirth", "Date of birth", "date"],
  ["stateOfOrigin", "State / region of origin", "text"],
  ["lgaOfOrigin", "Local area", "text"],
  ["town", "Town", "text"],
]
const governmentFields = [
  ["serviceNumber", "Service number", "text"],
  ["gradeLevel", "Grade level", "number"],
  ["step", "Step", "number"],
  ["dateOfFirstAppointment", "First appointment", "date"],
  ["dateOfPresentAppointment", "Present appointment", "date"],
  ["datePostedToSchool", "Posted to school", "date"],
]
function EditForm({
  value,
  publicSchool,
  id,
  done,
}: {
  value: Row
  publicSchool: boolean
  id: string
  done: () => void
}) {
  const [form, setForm] = useState<Row>(value),
    [error, setError] = useState("")
  const save = useSave()
  return (
    <form
      className="rounded-xl border bg-white p-6"
      onSubmit={async (e) => {
        e.preventDefault()
        setError("")
        try {
          await save.mutateAsync({
            path: "/WordPressStaff/Profile/" + id,
            method: "PUT",
            body: form,
          })
          done()
        } catch (e) {
          setError((e as Error).message)
        }
      }}
    >
      <div className="grid gap-5 md:grid-cols-2">
        {[...fields, ...(publicSchool ? governmentFields : [])].map(
          ([key, label, type]) => (
            <Field key={key} label={label}>
              <input
                className={inputClass}
                type={type}
                maxLength={300}
                min={type === "number" ? 0 : undefined}
                max={type === "number" ? 100 : undefined}
                value={
                  type === "date"
                    ? (form[key] || "").slice(0, 10)
                    : (form[key] ?? "")
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    [key]:
                      e.target.value === ""
                        ? null
                        : type === "number"
                          ? Number(e.target.value)
                          : e.target.value,
                  })
                }
              />
            </Field>
          )
        )}
        <Field label="Gender">
          <select
            className={inputClass}
            value={form.gender ?? ""}
            onChange={(e) =>
              setForm({
                ...form,
                gender: e.target.value ? Number(e.target.value) : null,
              })
            }
          >
            <option value="">Not specified</option>
            <option value={1}>Male</option>
            <option value={2}>Female</option>
            <option value={3}>Other</option>
          </select>
        </Field>
      </div>
      {error && (
        <p role="alert" className="mt-4 text-red-700">
          {error}
        </p>
      )}
      <div className="mt-6 flex gap-3">
        <Button disabled={save.isPending} type="submit">
          {save.isPending ? "Saving…" : "Save profile"}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={save.isPending}
          onClick={done}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
function Documents({ id }: { id: string }) {
  const q = useRead("/WordPressStaff/Staff/" + id + "/Documents"),
    save = useSave(),
    permissions = usePermissions()
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("")
  const upload = async (file?: File) => {
    if (!file) return
    setError("")
    if (
      !["application/pdf", "image/png", "image/jpeg"].includes(file.type) ||
      file.size > 5242880
    ) {
      setError("Choose a PDF, PNG or JPEG up to 5 MB.")
      return
    }
    setBusy(true)
    try {
      const body = new FormData()
      body.append("file", file)
      await request("/WordPressStaff/Staff/" + id + "/Documents", "POST", body)
      await q.refetch()
      toast.success("Document uploaded")
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }
  return (
    <section className="rounded-xl border bg-white p-6">
      <h2 className="mb-4 text-lg font-semibold">Staff documents</h2>
      {permissions.canUpdate(MENU) && (
        <Field label="Upload document (PDF, PNG or JPEG, up to 5 MB)">
          <input
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            disabled={busy}
            onChange={(e) => {
              void upload(e.target.files?.[0])
              e.target.value = ""
            }}
          />
        </Field>
      )}
      {error && (
        <p role="alert" className="mt-3 text-red-700">
          {error}
        </p>
      )}
      <QueryState query={q}>
        <ul className="mt-4 divide-y">
          {q.data?.map((d: Row) => (
            <li
              key={d.id}
              className="flex flex-wrap items-center justify-between gap-3 py-3"
            >
              <span>{d.fileName}</span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() =>
                    void downloadPrivate(
                      "/WordPressStaff/Documents/" + d.id
                    ).catch((e) => setError(e.message))
                  }
                >
                  Download
                </Button>
                {permissions.canDelete(MENU) && (
                  <Button
                    variant="outline"
                    disabled={save.isPending}
                    onClick={async () => {
                      if (!window.confirm("Delete this staff document?")) return
                      try {
                        await save.mutateAsync({
                          path: "/WordPressStaff/Documents/" + d.id,
                          method: "DELETE",
                        })
                      } catch (e) {
                        setError((e as Error).message)
                      }
                    }}
                  >
                    Delete
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
        {!q.data?.length && (
          <p className="mt-3 text-sm text-slate-500">No documents uploaded.</p>
        )}
      </QueryState>
    </section>
  )
}
export default function Profile({ editing = false }: { editing?: boolean }) {
  const { id = "", productId = "" } = useParams(),
    navigate = useNavigate(),
    permissions = usePermissions()
  const q = useRead("/WordPressStaff/Profile/" + id)
  const profilePath = "/dashboard/" + productId + "/staff/" + id
  return (
    <div className="space-y-6">
      <PageHeader
        title={
          editing
            ? "Edit staff profile"
            : q.data?.details?.fullName || "Staff profile"
        }
        description="School employment record"
        onBack={() => navigate("/dashboard/" + productId + "/staff/list")}
        backLabel="Staff directory"
      />
      <QueryState query={q}>
        {q.data && (
          <>
            {editing ? (
              <EditForm
                key={id}
                value={q.data.profile}
                publicSchool={q.data.publicSchool}
                id={id}
                done={() => navigate(profilePath)}
              />
            ) : (
              <>
                <section className="rounded-xl border bg-white p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-semibold">
                        {q.data.details.fullName}
                      </h2>
                      <p className="text-slate-500">{q.data.details.email}</p>
                      <p className="text-sm">
                        {q.data.details.role} · {q.data.details.department}
                      </p>
                    </div>
                    {permissions.canUpdate(MENU) && (
                      <Button onClick={() => navigate(profilePath + "/edit")}>
                        Edit profile
                      </Button>
                    )}
                  </div>
                  <dl className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {[
                      ...fields,
                      ...(q.data.publicSchool ? governmentFields : []),
                    ].map(([key, label]) => (
                      <div key={key}>
                        <dt className="text-sm text-slate-500">{label}</dt>
                        <dd>
                          {q.data.profile[key] == null ||
                          q.data.profile[key] === ""
                            ? "—"
                            : String(q.data.profile[key]).replace(
                                "T00:00:00",
                                ""
                              )}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </section>
                <section className="rounded-xl border bg-white p-6">
                  <h2 className="mb-4 text-lg font-semibold">
                    Employment and contact details
                  </h2>
                  <dl className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <dt>Status</dt>
                      <dd>{q.data.details.statusLabel || "—"}</dd>
                    </div>
                    <div>
                      <dt>Phone</dt>
                      <dd>{q.data.details.phone || "—"}</dd>
                    </div>
                    <div>
                      <dt>Gender</dt>
                      <dd>{normalizeGenderLabel(q.data.profile.gender)}</dd>
                    </div>
                    <div>
                      <dt>Role permissions</dt>
                      <dd>
                        {q.data.details.rolePermissions?.join(", ") ||
                          "No permissions assigned"}
                      </dd>
                    </div>
                  </dl>
                </section>
                <section className="rounded-xl border bg-white p-6">
                  <h2 className="mb-4 text-lg font-semibold">Attendance</h2>
                  <AttendanceSummaryPanel staffId={id} />
                </section>
                {permissions.canView("/dashboard/staff/payroll") && (
                  <section className="rounded-xl border bg-white p-6">
                    <h2 className="mb-4 text-lg font-semibold">Payroll</h2>
                    <PayrollSummary staffId={id} />
                  </section>
                )}
                {permissions.canView("/dashboard/staff/performance") && (
                  <Button
                    variant="outline"
                    onClick={() =>
                      navigate(
                        "/dashboard/" +
                          productId +
                          "/staff/performance?staffId=" +
                          id
                      )
                    }
                  >
                    Open performance reviews
                  </Button>
                )}
                <IdCardButton
                  card={{
                    kind: "staff",
                    schoolId: productId,
                    personId: id,
                    displayId: id,
                    name: q.data.details.fullName,
                    photo: q.data.details.profilePicture || undefined,
                    role: q.data.details.role,
                    department: q.data.details.department,
                  }}
                />
                <Documents id={id} />
              </>
            )}
          </>
        )}
      </QueryState>
    </div>
  )
}
