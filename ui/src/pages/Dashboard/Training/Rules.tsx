import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  Loader2,
  Pause,
  Play,
  Plus,
  Settings2,
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
import { StatCard } from "@/components/general/StatCard"
import { useSchoolId } from "@/contexts/SchoolContext"
import { usePermissions } from "@/hooks/usePermissions"
import { trainingMenus } from "@/api/training.api"
import {
  trainingRuleApi,
  type TrainingRule,
  type TrainingRulePreview,
  type TrainingRuleSettings,
} from "@/api/trainingRules.api"
import {
  AccessDenied,
  Empty,
  Field,
  LoadError,
  input,
  panel,
  message,
} from "./shared"
const initial = (): TrainingRuleSettings => ({
  revision: "",
  name: "",
  courseId: "",
  audience: "allStaff",
  targetIds: [],
  includeExistingStaff: true,
  deadlineDays: 14,
  enabled: false,
})
const audienceNames = {
  allStaff: "All active staff",
  jobRoles: "Selected job roles",
  departments: "Selected departments",
}
function RuleStatus({ value }: { value: string }) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${value === "paused" ? "bg-slate-100 text-slate-600" : value === "blocked" || value === "failed" ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}
    >
      {value === "applied" ? "active" : value === "waiting" ? "ready" : value}
    </span>
  )
}

export default function TrainingRules() {
  const schoolId = useSchoolId(),
    permissions = usePermissions(),
    cache = useQueryClient()
  const view = permissions.canView(trainingMenus.rules),
    canCreate = permissions.canCreate(trainingMenus.rules),
    canUpdate = permissions.canUpdate(trainingMenus.rules),
    canDelete = permissions.canDelete(trainingMenus.rules),
    assignView = permissions.canView(trainingMenus.assignments),
    assignCreate = permissions.canCreate(trainingMenus.assignments)
  const [open, setOpen] = useState(false),
    [editing, setEditing] = useState<TrainingRule | null>(null),
    [form, setForm] = useState<TrainingRuleSettings>(initial),
    [preview, setPreview] = useState<TrainingRulePreview | null>(null),
    [dirty, setDirty] = useState(false),
    [conflict, setConflict] = useState(false),
    [reloading, setReloading] = useState(false)
  const key = ["training-rules", schoolId]
  const query = useQuery({
    queryKey: key,
    queryFn: () => trainingRuleApi.list(schoolId),
    enabled: !!schoolId && view,
    refetchInterval: open ? false : 30_000,
  })
  const options = useQuery({
    queryKey: ["training-rule-options", schoolId],
    queryFn: () => trainingRuleApi.options(schoolId),
    enabled: !!schoolId && view && assignView,
  })
  const refresh = () => {
    void cache.invalidateQueries({ queryKey: key })
    void cache.invalidateQueries({
      queryKey: ["training-assignments", schoolId],
    })
    void cache.invalidateQueries({ queryKey: ["my-training", schoolId] })
  }
  const changed = (patch: Partial<TrainingRuleSettings>) => {
    setForm((f) => ({ ...f, ...patch }))
    setPreview(null)
    setDirty(true)
  }
  const errors = (e: unknown) => {
    toast.error(message(e))
    if ((e as { status?: number })?.status === 409) setConflict(true)
    refresh()
  }
  const previewMutation = useMutation({
    mutationFn: () =>
      trainingRuleApi.preview(schoolId, form, editing?.id ?? null),
    onSuccess: setPreview,
    onError: (e) => toast.error(message(e)),
  })
  const save = useMutation({
    mutationFn: () => trainingRuleApi.save(schoolId, form, editing?.id ?? null),
    onSuccess: () => {
      toast.success(
        form.enabled
          ? "Training rule saved. Matching staff will receive the course automatically."
          : "Paused training rule saved."
      )
      setOpen(false)
      setDirty(false)
      refresh()
    },
    onError: errors,
  })
  const toggle = useMutation({
    mutationFn: (r: TrainingRule) =>
      trainingRuleApi.save(
        schoolId,
        { ...r.settings, enabled: !r.settings.enabled },
        r.id
      ),
    onSuccess: (r) => {
      toast.success(
        r.settings.enabled
          ? "Training rule enabled."
          : "Training rule paused. Existing progress is retained."
      )
      refresh()
    },
    onError: (e) => {
      toast.error(message(e))
      refresh()
    },
  })
  const apply = useMutation({
    mutationFn: (r: TrainingRule) => trainingRuleApi.apply(schoolId, r),
    onSuccess: (result) => {
      toast.success(
        `${result.message}${result.remainingStaff ? ` ${result.remainingStaff} more staff will be processed automatically.` : ""}`
      )
      refresh()
    },
    onError: (e) => {
      toast.error(message(e))
      refresh()
    },
  })
  const remove = useMutation({
    mutationFn: (r: TrainingRule) => trainingRuleApi.remove(schoolId, r),
    onSuccess: () => {
      toast.success("Rule deleted. Existing training records were retained.")
      refresh()
    },
    onError: (e) => {
      toast.error(message(e))
      refresh()
    },
  })
  const busy = save.isPending || previewMutation.isPending || reloading,
    rowBusy = toggle.isPending || apply.isPending || remove.isPending
  const close = () => {
    if (
      !busy &&
      (!dirty || window.confirm("Discard your unsaved training rule changes?"))
    )
      setOpen(false)
  }
  const start = (r: TrainingRule | null) => {
    setEditing(r)
    setForm(r ? structuredClone(r.settings) : initial())
    setPreview(null)
    setConflict(false)
    setDirty(false)
    setOpen(true)
    void options.refetch()
  }
  const reload = async () => {
    if (
      !editing ||
      !window.confirm(
        "Reload the latest rule and discard your unsaved changes?"
      )
    )
      return
    setReloading(true)
    try {
      const result = await query.refetch()
      if (result.error) throw result.error
      const current = result.data?.find((r) => r.id === editing.id)
      if (!current) throw new Error("This rule no longer exists.")
      setEditing(current)
      setForm(structuredClone(current.settings))
      setDirty(false)
      setConflict(false)
      setPreview(null)
    } catch (e) {
      toast.error(message(e))
    } finally {
      setReloading(false)
    }
  }
  if (!view) return <AccessDenied />
  const rules = query.data ?? [],
    canSave = editing ? canUpdate : canCreate
  const targets =
    form.audience === "jobRoles"
      ? (options.data?.jobRoles ?? [])
      : (options.data?.departments ?? [])
  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        title="Training Rules"
        description="Keep staff learning up to date as people join your organisation or change roles."
        icon={<Settings2 className="size-6 text-blue-600" />}
        badge="Training & Development"
        actions={
          canCreate &&
          assignView &&
          assignCreate && (
            <Button onClick={() => start(null)}>
              <Plus className="size-4" />
              Create rule
            </Button>
          )
        }
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Enabled rules"
          value={rules.filter((r) => r.settings.enabled).length}
          icon={Play}
          color="green"
        />
        <StatCard
          label="Paused rules"
          value={rules.filter((r) => !r.settings.enabled).length}
          icon={Pause}
          color="gray"
        />
        <StatCard
          label="Need attention"
          value={
            rules.filter((r) => r.status === "blocked" || r.status === "failed")
              .length
          }
          icon={AlertCircle}
          color="amber"
        />
      </div>
      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm leading-relaxed text-blue-900">
        Rules add missing assignments for matching staff. Existing deadlines,
        course content and progress stay intact. Staff still need View access to
        the Training menu through their assigned role.
      </div>
      {!assignView && (
        <p className="text-sm text-slate-500">
          Ask your administrator for Assignments & Progress access to preview
          staff and configure rules.
        </p>
      )}
      {query.isPending && <p role="status">Loading training rules…</p>}
      {query.isError && (
        <LoadError error={query.error} retry={() => void query.refetch()} />
      )}
      {query.isSuccess && !rules.length && (
        <Empty title="Make staff training automatic">
          Create an onboarding or role-based training rule. Preview the matching
          staff, choose a deadline and enable the rule when you are ready.
        </Empty>
      )}
      <div className="grid gap-4 lg:grid-cols-2">
        {rules.map((r) => (
          <article key={r.id} className={panel + " space-y-4"}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-lg font-semibold text-slate-900">
                  {r.settings.name}
                </h2>
                <p className="mt-1 text-sm text-slate-500">{r.courseTitle}</p>
              </div>
              <RuleStatus value={r.status} />
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-slate-600">
              <span className="rounded-full bg-slate-100 px-3 py-1">
                {audienceNames[r.settings.audience]}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1">
                {r.settings.deadlineDays} days to complete
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1">
                {r.settings.includeExistingStaff
                  ? "Existing and future staff"
                  : "Future staff only"}
              </span>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
              <p>{r.lastMessage}</p>
              {r.lastRunAtUtc && (
                <p className="mt-2 text-xs text-slate-400">
                  Last checked: {new Date(r.lastRunAtUtc).toLocaleString()}
                </p>
              )}
              {r.lastRemainingCount > 0 && (
                <p className="mt-1 text-xs">
                  {r.lastRemainingCount} matching staff are waiting for the next
                  run.
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {canUpdate && assignView && (
                <Button
                  variant="outline"
                  disabled={rowBusy}
                  onClick={() => start(r)}
                >
                  Edit rule
                </Button>
              )}
              {canUpdate &&
                (r.settings.enabled || (assignCreate && assignView)) && (
                  <Button
                    variant="outline"
                    disabled={rowBusy}
                    onClick={() => {
                      if (
                        !r.settings.enabled &&
                        !window.confirm(
                          "Enable this rule and automatically assign the course to matching staff?"
                        )
                      )
                        return
                      toggle.mutate(r)
                    }}
                  >
                    {r.settings.enabled ? (
                      <Pause className="size-4" />
                    ) : (
                      <Play className="size-4" />
                    )}
                    {r.settings.enabled ? "Pause rule" : "Enable rule"}
                  </Button>
                )}
              {canUpdate &&
                assignCreate &&
                assignView &&
                r.settings.enabled && (
                  <Button
                    variant="outline"
                    disabled={rowBusy || r.status === "running"}
                    onClick={() => apply.mutate(r)}
                  >
                    {apply.isPending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="size-4" />
                    )}
                    Apply now
                  </Button>
                )}
              {canDelete && !r.settings.enabled && (
                <Button
                  variant="outline"
                  disabled={rowBusy}
                  onClick={() => {
                    if (
                      window.confirm(
                        "Delete this paused rule? Existing assignments and progress will be retained."
                      )
                    )
                      remove.mutate(r)
                  }}
                >
                  <Trash2 className="size-4" />
                  Delete rule
                </Button>
              )}
            </div>
          </article>
        ))}
      </div>
      <Dialog open={open} onOpenChange={(o) => !o && close()}>
        <DialogContent
          className="max-h-[92vh] overflow-y-auto sm:max-w-2xl"
          onEscapeKeyDown={(e) => {
            if (busy || dirty) e.preventDefault()
          }}
          onInteractOutside={(e) => {
            if (busy || dirty) e.preventDefault()
          }}
        >
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit training rule" : "Create training rule"}
            </DialogTitle>
            <DialogDescription>
              Choose who needs this course and how long they have to complete
              it. Preview matching staff before enabling automatic assignments.
            </DialogDescription>
          </DialogHeader>
          {options.isError && (
            <LoadError
              error={options.error}
              retry={() => void options.refetch()}
            />
          )}
          {conflict && (
            <div
              role="alert"
              className="space-y-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-900"
            >
              <p>
                This rule changed while you were working. Reload the latest
                version before saving.
              </p>
              <Button
                variant="outline"
                disabled={busy}
                onClick={() => void reload()}
              >
                Reload latest rule
              </Button>
            </div>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              save.mutate()
            }}
            className="space-y-5"
          >
            <fieldset disabled={busy || !canSave} className="min-w-0 space-y-5">
              <Field
                label="Rule name"
                value={form.name}
                onChange={(v) => changed({ name: v })}
              />
              <label className="block space-y-1.5 text-sm font-medium">
                Published course
                <select
                  aria-label="Published course"
                  required
                  className={input}
                  value={form.courseId}
                  disabled={!!editing || options.isPending || options.isError}
                  onChange={(e) => changed({ courseId: e.target.value })}
                >
                  <option value="">Choose a reviewed course</option>
                  {editing &&
                    !options.data?.courses.some(
                      (c) => c.id === form.courseId
                    ) && (
                      <option value={form.courseId}>
                        {editing.courseTitle} (currently unpublished)
                      </option>
                    )}
                  {(options.data?.courses ?? []).map((c) => (
                    <option value={c.id} key={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
              {editing && (
                <p className="text-xs text-slate-500">
                  Create a new rule to assign a different course.
                </p>
              )}
              <label className="block space-y-1.5 text-sm font-medium">
                Assign to
                <select
                  aria-label="Assign to"
                  className={input}
                  value={form.audience}
                  onChange={(e) =>
                    changed({
                      audience: e.target
                        .value as TrainingRuleSettings["audience"],
                      targetIds: [],
                    })
                  }
                >
                  {Object.entries(audienceNames).map(([key, name]) => (
                    <option value={key} key={key}>
                      {name}
                    </option>
                  ))}
                </select>
              </label>
              {form.audience !== "allStaff" && (
                <fieldset className="space-y-2 rounded-xl border border-slate-200 p-3">
                  <legend className="px-1 text-sm font-medium">
                    {form.audience === "jobRoles" ? "Job roles" : "Departments"}
                  </legend>
                  <div className="max-h-44 space-y-1 overflow-y-auto">
                    {targets.map((t) => (
                      <label
                        key={t.id}
                        className="flex cursor-pointer items-center gap-3 rounded-lg p-2 text-sm hover:bg-blue-50"
                      >
                        <input
                          type="checkbox"
                          checked={form.targetIds.includes(t.id)}
                          onChange={(e) =>
                            changed({
                              targetIds: e.target.checked
                                ? [...form.targetIds, t.id]
                                : form.targetIds.filter((id) => id !== t.id),
                            })
                          }
                        />
                        {t.name}
                      </label>
                    ))}
                    {!targets.length && (
                      <p className="text-sm text-slate-500">
                        Add{" "}
                        {form.audience === "jobRoles"
                          ? "job roles"
                          : "active departments"}{" "}
                        in User Management first.
                      </p>
                    )}
                    {form.targetIds.some(
                      (id) => !targets.some((t) => t.id === id)
                    ) && (
                      <p className="text-xs text-amber-700">
                        Some previous selections are no longer available. Update
                        the audience before enabling this rule.
                      </p>
                    )}
                  </div>
                </fieldset>
              )}
              <Field
                label="Days to complete after assignment"
                type="number"
                min={1}
                max={365}
                value={form.deadlineDays}
                onChange={(v) => changed({ deadlineDays: Number(v) })}
              />
              <label className="flex items-start gap-3 rounded-xl bg-slate-50 p-4 text-sm">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={form.includeExistingStaff}
                  onChange={(e) =>
                    changed({ includeExistingStaff: e.target.checked })
                  }
                />
                <span>
                  <span className="block font-medium">
                    Include existing staff
                  </span>
                  <span className="mt-1 block text-slate-500">
                    When unchecked, only staff added after this rule was created
                    receive new assignments.
                  </span>
                </span>
              </label>
              <label className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={form.enabled}
                  disabled={!assignCreate}
                  onChange={(e) => changed({ enabled: e.target.checked })}
                />
                <span>
                  <span className="block font-medium">
                    Enable automatic assignments
                  </span>
                  <span className="mt-1 block text-slate-500">
                    Matching staff receive this course automatically. You can
                    pause the rule at any time.
                  </span>
                </span>
              </label>
            </fieldset>
            <Button
              type="button"
              variant="outline"
              disabled={
                busy || !form.name.trim() || !form.courseId || !assignView
              }
              onClick={() => previewMutation.mutate()}
            >
              {previewMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Eye className="size-4" />
              )}
              Preview matching staff
            </Button>
            {preview && (
              <section
                aria-label="Matching staff preview"
                className="space-y-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-4"
              >
                <h3 className="flex items-center gap-2 font-semibold text-emerald-900">
                  <UsersRound className="size-4" />
                  Matching staff preview
                </h3>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-xl font-bold">{preview.matchingStaff}</p>
                    <p className="text-xs">Matching staff</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold">
                      {preview.alreadyAssigned}
                    </p>
                    <p className="text-xs">Already assigned</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold">
                      {preview.newAssignments}
                    </p>
                    <p className="text-xs">New assignments</p>
                  </div>
                </div>
                <p className="text-xs leading-relaxed text-emerald-800">
                  {preview.message}
                </p>
                {!!preview.sample.length && (
                  <div className="border-t border-emerald-100 pt-3">
                    <p className="mb-2 text-xs font-medium">
                      Sample of staff who will receive the course
                    </p>
                    {preview.sample.map((s) => (
                      <p
                        key={s.userId}
                        className="text-sm break-words text-emerald-900"
                      >
                        {s.name}{" "}
                        <span className="text-xs text-emerald-700">
                          {s.email}
                        </span>
                      </p>
                    ))}
                  </div>
                )}
              </section>
            )}
            {form.enabled && !preview && (
              <p className="text-xs text-slate-500">
                Preview the matching staff before saving an enabled rule.
              </p>
            )}
            <div className="flex justify-end gap-2 border-t pt-4">
              <Button
                variant="outline"
                type="button"
                disabled={busy}
                onClick={close}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  busy ||
                  !canSave ||
                  !form.name.trim() ||
                  !form.courseId ||
                  (form.enabled && (!preview || !assignCreate)) ||
                  conflict ||
                  options.isError
                }
              >
                {save.isPending && <Loader2 className="size-4 animate-spin" />}
                {editing ? "Save rule" : "Create rule"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
