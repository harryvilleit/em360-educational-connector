import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  ClipboardList,
  Loader2,
  Plus,
  Search,
  Trash2,
  UsersRound,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { PageHeader } from "@/components/general/PageHeader"
import { useSchoolId } from "@/contexts/SchoolContext"
import { usePermissions } from "@/hooks/usePermissions"
import {
  trainingApi,
  trainingMenus,
  type TrainingAssignment,
} from "@/api/training.api"
import {
  AccessDenied,
  Empty,
  Field,
  LoadError,
  Progress,
  Status,
  input,
  panel,
  message,
} from "./shared"

export default function TrainingAssignments() {
  const schoolId = useSchoolId(),
    permissions = usePermissions(),
    cache = useQueryClient()
  const view = permissions.canView(trainingMenus.assignments),
    create = permissions.canCreate(trainingMenus.assignments),
    remove = permissions.canDelete(trainingMenus.assignments)
  const [open, setOpen] = useState(false),
    [courseId, setCourseId] = useState(""),
    [selected, setSelected] = useState<string[]>([]),
    [due, setDue] = useState(""),
    [search, setSearch] = useState(""),
    [staffSearch, setStaffSearch] = useState("")
  const key = ["training-assignments", schoolId]
  const query = useQuery({
    queryKey: key,
    queryFn: () => trainingApi.assignments(schoolId, false),
    enabled: !!schoolId && view,
  })
  const staff = useQuery({
    queryKey: ["training-staff", schoolId],
    queryFn: () => trainingApi.staff(schoolId),
    enabled: !!schoolId && view,
  })
  const courses = useQuery({
    queryKey: ["training-assignment-courses", schoolId],
    queryFn: () => trainingApi.courses(schoolId, true),
    enabled: !!schoolId && view,
  })
  const assign = useMutation({
    mutationFn: () =>
      trainingApi.assign(
        schoolId,
        courseId,
        selected,
        new Date(due).toISOString()
      ),
    onSuccess: (count) => {
      toast.success(
        `${count} new assignments created. Existing progress was retained.`
      )
      setOpen(false)
      setSelected([])
      setCourseId("")
      setDue("")
      void cache.invalidateQueries({ queryKey: key })
      void cache.invalidateQueries({ queryKey: ["my-training", schoolId] })
    },
    onError: (e) => toast.error(message(e)),
  })
  const cancel = useMutation({
    mutationFn: (a: TrainingAssignment) => trainingApi.cancel(schoolId, a),
    onSuccess: () => {
      toast.success("Assignment removed.")
      void cache.invalidateQueries({ queryKey: key })
      void cache.invalidateQueries({ queryKey: ["my-training", schoolId] })
    },
    onError: (e) => toast.error(message(e)),
  })
  if (!view) return <AccessDenied />
  const names = new Map(
    (staff.data ?? []).map((s) => [s.userId, s.name || s.email])
  )
  const items = (query.data ?? []).filter((a) =>
    `${a.courseTitle} ${names.get(a.userId) ?? ""} ${a.status}`
      .toLowerCase()
      .includes(search.toLowerCase())
  )
  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        title="Assignments & Progress"
        description="Assign reviewed training to staff and follow completion against each deadline."
        icon={<ClipboardList className="size-6 text-blue-600" />}
        badge="Training & Development"
        actions={
          create && (
            <Button onClick={() => setOpen(true)}>
              <Plus className="size-4" />
              Assign training
            </Button>
          )
        }
      />
      <div className="relative max-w-md">
        <Search className="absolute top-3 left-3 size-4 text-slate-400" />
        <input
          aria-label="Search training assignments"
          placeholder="Search course, staff or status"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={input + " pl-10"}
        />
      </div>
      {query.isPending && <p role="status">Loading training assignments…</p>}
      {query.isError && (
        <LoadError error={query.error} retry={() => void query.refetch()} />
      )}
      {staff.isError && (
        <LoadError error={staff.error} retry={() => void staff.refetch()} />
      )}
      {query.isSuccess && !items.length && (
        <Empty title="No training assignments yet">
          Publish a course in the Course Library, then assign it to your staff
          with a deadline.
        </Empty>
      )}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((a) => (
          <article key={a.id} className={panel + " space-y-4"}>
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-semibold text-slate-900">{a.courseTitle}</h2>
              <Status value={a.status} />
            </div>
            <p className="flex items-center gap-2 text-sm text-slate-600">
              <UsersRound className="size-4" />
              {names.get(a.userId) ?? "Former staff member"}
            </p>
            <p className="text-xs text-slate-500">
              Due {new Date(a.dueAtUtc).toLocaleString()}
              {a.completedAtUtc &&
                ` · Completed ${new Date(a.completedAtUtc).toLocaleDateString()}`}
            </p>
            {a.sourceRuleName && (
              <p className="text-xs text-blue-600">
                Automatic assignment · {a.sourceRuleName}
              </p>
            )}
            <Progress value={a.progressPercent} />
            {remove && !a.completedAtUtc && (
              <Button
                variant="outline"
                disabled={cancel.isPending}
                onClick={() => {
                  if (
                    window.confirm(
                      `Remove ${a.courseTitle} for ${names.get(a.userId) ?? "this staff member"}? Their saved progress will be removed.`
                    )
                  )
                    cancel.mutate(a)
                }}
              >
                <Trash2 className="size-4" />
                Remove assignment
              </Button>
            )}
          </article>
        ))}
      </div>
      <Dialog open={open} onOpenChange={(o) => !assign.isPending && setOpen(o)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Assign staff training</DialogTitle>
            <DialogDescription>
              Only published courses can be assigned. Staff also need View
              access to the Training menu through their admin-assigned role.
            </DialogDescription>
          </DialogHeader>
          {courses.isError && (
            <LoadError
              error={courses.error}
              retry={() => void courses.refetch()}
            />
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              assign.mutate()
            }}
            className="space-y-5"
          >
            <fieldset disabled={assign.isPending} className="min-w-0 space-y-5">
              <label className="block space-y-1.5 text-sm font-medium">
                Published course
                <select
                  className={input}
                  required
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  disabled={courses.isPending || courses.isError}
                >
                  <option value="">Choose a course</option>
                  {(courses.data ?? []).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </label>
              {courses.isSuccess && !courses.data.length && (
                <p className="text-sm text-amber-700">
                  Publish a reviewed course in the Course Library first.
                </p>
              )}
              <Field
                label="Deadline (your local time)"
                type="datetime-local"
                value={due}
                onChange={setDue}
              />
              <Field
                label="Find staff"
                value={staffSearch}
                onChange={setStaffSearch}
              />
              <div className="max-h-60 space-y-2 overflow-y-auto rounded-xl border border-slate-200 p-3">
                {staff.isPending && <p className="text-sm">Loading staff…</p>}
                {(staff.data ?? [])
                  .filter((s) =>
                    `${s.name} ${s.email}`
                      .toLowerCase()
                      .includes(staffSearch.toLowerCase())
                  )
                  .map((s) => (
                    <label
                      key={s.userId}
                      className="flex cursor-pointer items-start gap-3 rounded-lg p-2 hover:bg-blue-50"
                    >
                      <input
                        type="checkbox"
                        checked={selected.includes(s.userId)}
                        onChange={(e) =>
                          setSelected((ids) =>
                            e.target.checked
                              ? [...ids, s.userId]
                              : ids.filter((id) => id !== s.userId)
                          )
                        }
                        className="mt-1"
                      />
                      <span className="min-w-0 text-sm">
                        <span className="block font-medium">{s.name}</span>
                        <span className="block text-xs break-all text-slate-500">
                          {s.email}
                        </span>
                      </span>
                    </label>
                  ))}
                {staff.isSuccess && !staff.data.length && (
                  <p className="text-sm text-slate-500">
                    Add active staff through User Management first.
                  </p>
                )}
              </div>
              <p className="text-xs text-slate-500">
                {selected.length} staff selected. Existing assignments and
                progress will be retained.
              </p>
            </fieldset>
            <Button
              type="submit"
              disabled={
                assign.isPending ||
                !courseId ||
                !due ||
                !selected.length ||
                selected.length > 100 ||
                courses.isError ||
                staff.isError
              }
            >
              {assign.isPending && <Loader2 className="size-4 animate-spin" />}
              Assign course
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
