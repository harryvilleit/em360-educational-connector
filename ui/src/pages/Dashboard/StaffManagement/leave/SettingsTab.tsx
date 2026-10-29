import { useState } from "react"
import { Plus, Settings2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Modal } from "@/components/ui/modal"
import { Textarea } from "@/components/ui/textarea"
import { EmptyState } from "@/components/ui/empty-state"
import { LeaveFilterSelect as FilterSelect } from "./LeaveFilterSelect"
import { DataTable, type DataTableColumn } from "@/components/ui/data-table"
import { useGetJobRolesBySchool } from "@/hooks/jobRoles"
import { useGetAllSchoolSessions } from "@/hooks/userMgt"
import {
  useDeleteLeaveType,
  useLeavePolicies,
  useLeaveTypes,
  useLeaveWorkingDays,
  useSaveLeavePolicy,
  useSaveLeaveType,
  useSaveLeaveWorkingDays,
} from "@/hooks/leaveManagement"
import {
  WorkingDaysPattern,
  type LeavePolicyDto,
  type LeaveTypeDto,
  type LeaveWorkingDaysConfigDto,
  type SaveLeavePolicyCommand,
} from "@/api/leaveManagement.api/types"
import { ErrorNote } from "./MyLeaveTab"

type SettingsView = "types" | "policies" | "working-days"

const VIEWS: { value: SettingsView; label: string }[] = [
  { value: "types", label: "Leave types" },
  { value: "policies", label: "Policies & entitlements" },
  { value: "working-days", label: "Working days" },
]

export function SettingsTab({ schoolId }: { schoolId: string }) {
  const [view, setView] = useState<SettingsView>("types")
  return (
    <div className="space-y-5">
      <div className="flex w-fit gap-1 rounded-xl border border-gray-200 bg-white p-1">
        {VIEWS.map((v) => (
          <button
            key={v.value}
            type="button"
            onClick={() => setView(v.value)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              view === v.value
                ? "bg-chart-2 text-white"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>
      {view === "types" && <LeaveTypesPanel schoolId={schoolId} />}
      {view === "policies" && <LeavePoliciesPanel schoolId={schoolId} />}
      {view === "working-days" && <WorkingDaysPanel schoolId={schoolId} />}
    </div>
  )
}

// ─── Leave types ──────────────────────────────────────────────────────────────

function LeaveTypesPanel({ schoolId }: { schoolId: string }) {
  const types = useLeaveTypes(schoolId, true, true)
  const remove = useDeleteLeaveType(schoolId)
  const [deleting, setDeleting] = useState<LeaveTypeDto | null>(null)
  const [editing, setEditing] = useState<LeaveTypeDto | "new" | null>(null)

  const columns: DataTableColumn<LeaveTypeDto>[] = [
    {
      key: "name",
      header: "Name",
      render: (t) => (
        <span className="font-medium text-gray-900">{t.name}</span>
      ),
    },
    { key: "code", header: "Code", render: (t) => t.code },
    {
      key: "paid",
      header: "Paid",
      render: (t) => (t.isPaid ? "Paid" : "Unpaid"),
    },
    {
      key: "attachment",
      header: "Attachment",
      render: (t) =>
        t.requiresAttachment
          ? t.attachmentRequiredAfterDays
            ? `After ${t.attachmentRequiredAfterDays} days`
            : "Always"
          : "Not required",
    },
    {
      key: "active",
      header: "Status",
      render: (t) => (t.isActive ? "Active" : "Inactive"),
    },
    {
      key: "actions",
      header: "",
      render: (t) => (
        <div className="flex justify-end">
          <Button size="sm" variant="outline" onClick={() => setEditing(t)}>
            Edit
          </Button>
          <Button size="sm" variant="outline" onClick={() => setDeleting(t)}>
            Delete
          </Button>
        </div>
      ),
    },
  ]

  const handleDelete = async () => {
    if (!deleting) return
    try {
      await remove.mutateAsync({ id: deleting.id, schoolId })
      toast.success("Leave type deleted.")
      setDeleting(null)
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not delete leave type."
      )
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button onClick={() => setEditing("new")}>
          <Plus className="size-4" />
          Add leave type
        </Button>
      </div>
      {types.isError ? (
        <ErrorNote
          message="Could not load leave types."
          onRetry={() => types.refetch()}
        />
      ) : (
        <DataTable
          columns={columns}
          data={types.data ?? []}
          getRowKey={(t) => t.id}
          isLoading={types.isPending}
          emptyState={
            <EmptyState
              icon={Settings2}
              title="No leave types yet"
              description="Add the leave types your school offers."
              size="sm"
            />
          }
        />
      )}
      {deleting && (
        <Modal
          title="Delete leave type"
          size="md"
          onClose={() => setDeleting(null)}
          footer={
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDeleting(null)}>
                Cancel
              </Button>
              <Button onClick={handleDelete} disabled={remove.isPending}>
                {remove.isPending ? "Deleting..." : "Delete"}
              </Button>
            </div>
          }
        >
          <p className="text-sm text-gray-600">
            Delete {deleting.name}? This can't be undone.
          </p>
        </Modal>
      )}
      {editing && (
        <LeaveTypeModal
          schoolId={schoolId}
          existing={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  )
}

function LeaveTypeModal({
  schoolId,
  existing,
  onClose,
}: {
  schoolId: string
  existing: LeaveTypeDto | null
  onClose: () => void
}) {
  const save = useSaveLeaveType(schoolId)
  const [name, setName] = useState(existing?.name ?? "")
  const [code, setCode] = useState(existing?.code ?? "")
  const [description, setDescription] = useState(existing?.description ?? "")
  const [isPaid, setIsPaid] = useState(existing?.isPaid ?? true)
  const [allowHalfDay, setAllowHalfDay] = useState(
    existing?.allowHalfDay ?? true
  )
  const [requiresAttachment, setRequiresAttachment] = useState(
    existing?.requiresAttachment ?? false
  )
  const [afterDays, setAfterDays] = useState(
    existing?.attachmentRequiredAfterDays?.toString() ?? ""
  )
  const [isActive, setIsActive] = useState(existing?.isActive ?? true)

  const valid = name.trim() && code.trim()

  const handleSave = async () => {
    try {
      await save.mutateAsync({
        id: existing?.id,
        schoolId,
        name: name.trim(),
        code: code.trim().toUpperCase(),
        description: description.trim() || undefined,
        isPaid,
        allowHalfDay,
        requiresAttachment,
        attachmentRequiredAfterDays:
          requiresAttachment && afterDays ? Number(afterDays) : null,
        isActive,
      })
      toast.success("Leave type saved.")
      onClose()
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not save leave type."
      )
    }
  }

  return (
    <Modal
      title={existing ? "Edit leave type" : "Add leave type"}
      size="lg"
      onClose={onClose}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!valid || save.isPending}>
            {save.isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <LabeledField label="Name">
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </LabeledField>
          <LabeledField label="Code">
            <Input value={code} onChange={(e) => setCode(e.target.value)} />
          </LabeledField>
        </div>
        <LabeledField label="Description">
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
          />
        </LabeledField>
        <Check label="Paid leave" checked={isPaid} onChange={setIsPaid} />
        <Check
          label="Half days allowed"
          checked={allowHalfDay}
          onChange={setAllowHalfDay}
        />
        <Check
          label="Requires supporting document"
          checked={requiresAttachment}
          onChange={setRequiresAttachment}
        />
        {requiresAttachment && (
          <LabeledField label="Required after (days, blank = always)">
            <Input
              type="number"
              min={0}
              value={afterDays}
              onChange={(e) => setAfterDays(e.target.value)}
            />
          </LabeledField>
        )}
        <Check label="Active" checked={isActive} onChange={setIsActive} />
      </div>
    </Modal>
  )
}

// ─── Policies ─────────────────────────────────────────────────────────────────

function LeavePoliciesPanel({ schoolId }: { schoolId: string }) {
  const policies = useLeavePolicies(schoolId)
  const [editing, setEditing] = useState<LeavePolicyDto | "new" | null>(null)

  const columns: DataTableColumn<LeavePolicyDto>[] = [
    {
      key: "name",
      header: "Policy",
      render: (p) => (
        <span className="font-medium text-gray-900">{p.name}</span>
      ),
    },
    {
      key: "role",
      header: "Applies to",
      render: (p) =>
        p.schoolJobRoleName ??
        p.schoolDepartmentName ??
        p.staffCategory ??
        "All staff",
    },
    {
      key: "session",
      header: "Session",
      render: (p) => p.schoolSessionName ?? "—",
    },
    {
      key: "rules",
      header: "Entitlements",
      render: (p) =>
        p.rules
          .map((r) => `${r.leaveTypeCode}: ${r.entitlementDays}`)
          .join(", "),
    },
    {
      key: "default",
      header: "Default",
      render: (p) => (p.isDefault ? "Yes" : "No"),
    },
    {
      key: "actions",
      header: "",
      render: (p) => (
        <div className="flex justify-end">
          <Button size="sm" variant="outline" onClick={() => setEditing(p)}>
            Edit
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button onClick={() => setEditing("new")}>
          <Plus className="size-4" />
          Add policy
        </Button>
      </div>
      {policies.isError ? (
        <ErrorNote
          message="Could not load leave policies."
          onRetry={() => policies.refetch()}
        />
      ) : (
        <DataTable
          columns={columns}
          data={policies.data ?? []}
          getRowKey={(p) => p.id}
          isLoading={policies.isPending}
          emptyState={
            <EmptyState
              icon={Settings2}
              title="No leave policies yet"
              description="Policies set entitlements per job role."
              size="sm"
            />
          }
        />
      )}
      {editing && (
        <LeavePolicyModal
          schoolId={schoolId}
          existing={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  )
}

type RuleDraft = SaveLeavePolicyCommand["rules"][number]

function LeavePolicyModal({
  schoolId,
  existing,
  onClose,
}: {
  schoolId: string
  existing: LeavePolicyDto | null
  onClose: () => void
}) {
  const save = useSaveLeavePolicy(schoolId)
  const { data: leaveTypes = [] } = useLeaveTypes(schoolId)
  const { jobRoles } = useGetJobRolesBySchool(schoolId)
  const { sessions } = useGetAllSchoolSessions({ schoolId, pageSize: 50 })

  const [name, setName] = useState(existing?.name ?? "")
  const [jobRoleId, setJobRoleId] = useState(existing?.schoolJobRoleId ?? "")
  const [sessionId, setSessionId] = useState(existing?.schoolSessionId ?? "")
  const [isDefault, setIsDefault] = useState(existing?.isDefault ?? false)
  const [rules, setRules] = useState<RuleDraft[]>(
    existing?.rules.map((r) => ({
      leaveTypeId: r.leaveTypeId,
      entitlementDays: r.entitlementDays,
      carryForwardEnabled: r.carryForwardEnabled,
      maxCarryForwardDays: r.maxCarryForwardDays,
      minimumNoticeDays: r.minimumNoticeDays,
      maxConsecutiveDays: r.maxConsecutiveDays,
    })) ?? []
  )

  const updateRule = (index: number, patch: Partial<RuleDraft>) =>
    setRules((prev) =>
      prev.map((r, i) => (i === index ? { ...r, ...patch } : r))
    )

  const usedTypeIds = new Set(rules.map((r) => r.leaveTypeId))
  const nextType = leaveTypes.find((t) => t.isActive && !usedTypeIds.has(t.id))

  const valid =
    name.trim() &&
    sessionId &&
    rules.length > 0 &&
    rules.every((r) => r.leaveTypeId)

  const handleSave = async () => {
    try {
      await save.mutateAsync({
        id: existing?.id,
        schoolId,
        name: name.trim(),
        schoolJobRoleId: jobRoleId || null,
        schoolDepartmentId: existing?.schoolDepartmentId ?? null,
        staffCategory: existing?.staffCategory ?? null,
        schoolSessionId: sessionId,
        isDefault,
        rules,
      })
      toast.success("Leave policy saved.")
      onClose()
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not save leave policy."
      )
    }
  }

  return (
    <Modal
      title={existing ? "Edit leave policy" : "Add leave policy"}
      size="xl"
      onClose={onClose}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!valid || save.isPending}>
            {save.isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <LabeledField label="Policy name">
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </LabeledField>
        <div className="grid grid-cols-2 gap-3">
          <LabeledField label="Job role (blank = all staff)">
            <FilterSelect
              value={jobRoleId}
              onChange={setJobRoleId}
              placeholder="All staff"
              className="w-full"
              options={[
                { value: "", label: "All staff" },
                ...jobRoles.map((r) => ({ value: r.Id, label: r.Name })),
              ]}
            />
          </LabeledField>
          <LabeledField label="Session">
            <FilterSelect
              value={sessionId}
              onChange={setSessionId}
              placeholder="Select session"
              className="w-full"
              options={sessions.map((s) => ({
                value: s.Id,
                label: s.SessionName,
              }))}
            />
          </LabeledField>
        </div>
        <Check
          label="Default policy"
          checked={isDefault}
          onChange={setIsDefault}
        />

        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-900">Entitlements</h3>
          {rules.map((rule, index) => (
            <div
              key={`${rule.leaveTypeId}-${index}`}
              className="space-y-3 rounded-xl border border-gray-100 p-3"
            >
              <div className="flex items-center gap-2">
                <FilterSelect
                  value={rule.leaveTypeId}
                  onChange={(v) => updateRule(index, { leaveTypeId: v })}
                  placeholder="Leave type"
                  className="w-full"
                  options={leaveTypes
                    .filter(
                      (t) => t.id === rule.leaveTypeId || !usedTypeIds.has(t.id)
                    )
                    .map((t) => ({ value: t.id, label: t.name }))}
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setRules((prev) => prev.filter((_, i) => i !== index))
                  }
                >
                  Remove
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <NumberField
                  label="Entitlement (days/yr)"
                  value={rule.entitlementDays}
                  onChange={(v) => updateRule(index, { entitlementDays: v })}
                />
                <NumberField
                  label="Minimum notice (days)"
                  value={rule.minimumNoticeDays}
                  onChange={(v) => updateRule(index, { minimumNoticeDays: v })}
                />
                <NumberField
                  label="Max consecutive (days)"
                  value={rule.maxConsecutiveDays ?? 0}
                  onChange={(v) =>
                    updateRule(index, { maxConsecutiveDays: v || null })
                  }
                />
                <NumberField
                  label="Max carry forward (days)"
                  value={rule.maxCarryForwardDays}
                  disabled={!rule.carryForwardEnabled}
                  onChange={(v) =>
                    updateRule(index, { maxCarryForwardDays: v })
                  }
                />
              </div>
              <Check
                label="Allow carry forward"
                checked={rule.carryForwardEnabled}
                onChange={(v) => updateRule(index, { carryForwardEnabled: v })}
              />
            </div>
          ))}
          <Button
            variant="outline"
            disabled={!nextType}
            onClick={() =>
              nextType &&
              setRules((prev) => [
                ...prev,
                {
                  leaveTypeId: nextType.id,
                  entitlementDays: 0,
                  carryForwardEnabled: false,
                  maxCarryForwardDays: 0,
                  minimumNoticeDays: 0,
                },
              ])
            }
          >
            <Plus className="size-4" />
            Add entitlement
          </Button>
        </div>
      </div>
    </Modal>
  )
}

// ─── Working days ─────────────────────────────────────────────────────────────

const DAY_KEYS = [
  ["monday", "Mon"],
  ["tuesday", "Tue"],
  ["wednesday", "Wed"],
  ["thursday", "Thu"],
  ["friday", "Fri"],
  ["saturday", "Sat"],
  ["sunday", "Sun"],
] as const

type DayKey = (typeof DAY_KEYS)[number][0]

const PATTERN_DAYS: Record<number, Record<DayKey, boolean>> = {
  [WorkingDaysPattern.MondayToFriday]: {
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: false,
    sunday: false,
  },
  [WorkingDaysPattern.MondayToSaturday]: {
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: true,
    sunday: false,
  },
}

function WorkingDaysPanel({ schoolId }: { schoolId: string }) {
  const config = useLeaveWorkingDays(schoolId)
  if (config.isError) {
    return (
      <ErrorNote
        message="Could not load working days."
        onRetry={() => config.refetch()}
      />
    )
  }
  if (!config.data) {
    return <div className="h-40 animate-pulse rounded-2xl bg-gray-100" />
  }
  return (
    <WorkingDaysForm
      key={config.dataUpdatedAt}
      schoolId={schoolId}
      initial={config.data}
    />
  )
}

function WorkingDaysForm({
  schoolId,
  initial,
}: {
  schoolId: string
  initial: LeaveWorkingDaysConfigDto
}) {
  const save = useSaveLeaveWorkingDays(schoolId)
  const [value, setValue] = useState(initial)

  const setPattern = (pattern: WorkingDaysPattern) =>
    setValue((prev) => ({
      ...prev,
      pattern,
      ...(PATTERN_DAYS[pattern] ?? {}),
    }))

  const handleSave = async () => {
    try {
      await save.mutateAsync({ ...value, schoolId })
      toast.success("Working days saved.")
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not save working days."
      )
    }
  }

  return (
    <div className="max-w-xl space-y-4 rounded-2xl border border-gray-100 bg-white p-5">
      <div className="space-y-2 text-sm text-gray-700">
        {(
          [
            [WorkingDaysPattern.MondayToFriday, "Monday – Friday"],
            [WorkingDaysPattern.MondayToSaturday, "Monday – Saturday"],
            [WorkingDaysPattern.Custom, "Custom"],
          ] as const
        ).map(([pattern, label]) => (
          <label key={pattern} className="flex items-center gap-2">
            <input
              type="radio"
              name="working-days-pattern"
              checked={value.pattern === pattern}
              onChange={() => setPattern(pattern)}
            />
            {label}
          </label>
        ))}
      </div>
      <div className="flex flex-wrap gap-4">
        {DAY_KEYS.map(([key, label]) => (
          <Check
            key={key}
            label={label}
            checked={value[key]}
            disabled={value.pattern !== WorkingDaysPattern.Custom}
            onChange={(checked) =>
              setValue((prev) => ({ ...prev, [key]: checked }))
            }
          />
        ))}
      </div>
      <Button onClick={handleSave} disabled={save.isPending}>
        {save.isPending ? "Saving..." : "Save working days"}
      </Button>
    </div>
  )
}

// ─── Shared form bits ─────────────────────────────────────────────────────────

function LabeledField({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      {children}
    </div>
  )
}

function Check({
  label,
  checked,
  onChange,
  disabled,
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-gray-700">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      {label}
    </label>
  )
}

function NumberField({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string
  value: number
  onChange: (value: number) => void
  disabled?: boolean
}) {
  return (
    <LabeledField label={label}>
      <Input
        type="number"
        min={0}
        step="0.5"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
      />
    </LabeledField>
  )
}
