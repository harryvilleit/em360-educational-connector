import { useState, type ElementType, type ReactNode } from "react"
import {
  AlertCircle,
  Building2,
  CalendarDays,
  ClipboardList,
  Gift,
  School,
  Users,
  User,
  X,
} from "lucide-react"
import { HOSTEL_ENROLLMENTS, isHostelBoarder } from "@/data/hostelEnrollments"
import type { VisitLocation, VisitationRequest } from "@/store/visitation.store"
import type { Parent } from "@/types/parent"

const RELATIONSHIP_OPTIONS = [
  "Father",
  "Mother",
  "Uncle",
  "Aunt",
  "Guardian",
  "Sibling",
  "Grandparent",
  "Other",
]

const PURPOSE_OPTIONS = [
  "Routine check-in",
  "Health concern",
  "Collect / drop off items",
  "Academic support discussion",
  "Birthday visit",
  "Emergency visit",
  "Other",
]

const inputCls =
  "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-gray-100"

interface FormState {
  studentId: string
  location: VisitLocation
  visitorFirstName: string
  visitorLastName: string
  visitorRelationship: string
  visitDate: string
  checkInTime: string
  checkOutTime: string
  purpose: string
  notes: string
  extraVisitorsCount: string
  extraVisitorsNames: string
  bringsItems: "yes" | "no"
  itemsDescription: string
}

export function NewVisitModal({
  parent,
  onClose,
  onSubmit,
}: {
  parent: Parent
  onClose: () => void
  onSubmit: (
    data: Omit<VisitationRequest, "id" | "status" | "createdAt">
  ) => void
}) {
  const allChildren = parent.children

  const [form, setForm] = useState<FormState>({
    studentId: allChildren[0]?.id ?? "",
    location: "school",
    visitorFirstName: parent.firstName,
    visitorLastName: parent.lastName,
    visitorRelationship: parent.relationship,
    visitDate: "",
    checkInTime: "",
    checkOutTime: "",
    purpose: "",
    notes: "",
    extraVisitorsCount: "0",
    extraVisitorsNames: "",
    bringsItems: "no",
    itemsDescription: "",
  })
  const [errors, setErrors] = useState<
    Partial<Record<keyof FormState, string>>
  >({})

  const selectedChild = allChildren.find((c) => c.id === form.studentId)
  const canVisitHostel = isHostelBoarder(form.studentId)
  const enrollment = HOSTEL_ENROLLMENTS.find(
    (e) => e.studentId === form.studentId
  )

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((p) => ({ ...p, [key]: value }))
    if (errors[key]) setErrors((p) => ({ ...p, [key]: undefined }))
  }

  function setStudent(id: string) {
    const canHostel = isHostelBoarder(id)
    setForm((p) => ({
      ...p,
      studentId: id,
      location: canHostel ? p.location : "school",
    }))
  }

  function validate(): boolean {
    const e: Partial<Record<keyof FormState, string>> = {}
    if (!form.visitorFirstName.trim())
      e.visitorFirstName = "First name is required"
    if (!form.visitorLastName.trim())
      e.visitorLastName = "Last name is required"
    if (!form.visitorRelationship)
      e.visitorRelationship = "Relationship is required"
    if (!form.visitDate) e.visitDate = "Visit date is required"
    if (!form.checkInTime) e.checkInTime = "Check-in time is required"
    if (!form.checkOutTime) e.checkOutTime = "Check-out time is required"
    if (!form.purpose) e.purpose = "Purpose is required"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit() {
    if (!validate()) return
    onSubmit({
      parentId: parent.id,
      parentName: `${parent.firstName} ${parent.lastName}`,
      parentPhone: parent.phone,
      visitorName: `${form.visitorFirstName.trim()} ${form.visitorLastName.trim()}`,
      visitorRelationship: form.visitorRelationship,
      studentId: form.studentId,
      studentName: selectedChild?.name ?? "",
      studentClass: selectedChild?.class ?? "",
      location: form.location,
      visitDate: form.visitDate,
      visitTime: form.checkInTime,
      checkInTime: form.checkInTime,
      checkOutTime: form.checkOutTime,
      purpose: form.purpose,
      notes: form.notes.trim() || undefined,
      extraVisitorsCount: parseInt(form.extraVisitorsCount) || 0,
      extraVisitorsNames: form.extraVisitorsNames.trim() || undefined,
      bringsItems: form.bringsItems === "yes",
      itemsDescription:
        form.bringsItems === "yes"
          ? form.itemsDescription.trim() || undefined
          : undefined,
    })
  }

  const extraCount = parseInt(form.extraVisitorsCount) || 0

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Create visitation request"
      tabIndex={-1}
      onKeyDown={(event) => event.key === "Escape" && onClose()}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
    >
      <div className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-white/10 dark:bg-gray-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-white/5">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Request a Visit
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 hover:bg-gray-100 dark:hover:bg-white/10"
          >
            <X size={15} className="text-gray-400" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
          {/* ── Visitor information ─────────────────────────────────────── */}
          <FormSection icon={User} title="Visitor Information">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <FieldLabel text="First name" required />
                <input
                  type="text"
                  value={form.visitorFirstName}
                  onChange={(e) => set("visitorFirstName", e.target.value)}
                  placeholder="e.g. Chukwuemeka"
                  className={inputCls}
                />
                <FieldError msg={errors.visitorFirstName} />
              </div>
              <div>
                <FieldLabel text="Last name" required />
                <input
                  type="text"
                  value={form.visitorLastName}
                  onChange={(e) => set("visitorLastName", e.target.value)}
                  placeholder="e.g. Okafor"
                  className={inputCls}
                />
                <FieldError msg={errors.visitorLastName} />
              </div>
              <div className="col-span-2">
                <FieldLabel text="Relationship to student" required />
                <select
                  value={form.visitorRelationship}
                  onChange={(e) => set("visitorRelationship", e.target.value)}
                  className={inputCls}
                >
                  <option value="">Select relationship</option>
                  {RELATIONSHIP_OPTIONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
                <FieldError msg={errors.visitorRelationship} />
              </div>
            </div>
          </FormSection>

          {/* ── Student & location ──────────────────────────────────────── */}
          <FormSection icon={School} title="Who are you visiting?">
            {/* Child cards */}
            <div className="space-y-2">
              {allChildren.map((child) => {
                const inHostel = isHostelBoarder(child.id)
                const enroll = HOSTEL_ENROLLMENTS.find(
                  (e) => e.studentId === child.id
                )
                return (
                  <button
                    key={child.id}
                    type="button"
                    onClick={() => setStudent(child.id)}
                    className={`flex w-full items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left transition-all ${
                      form.studentId === child.id
                        ? "border-blue-500 bg-blue-50 dark:border-blue-500/50 dark:bg-blue-900/20"
                        : "border-gray-200 bg-white hover:border-gray-300 dark:border-white/10 dark:bg-white/3"
                    }`}
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                      {child.avatarInitials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-gray-900 dark:text-gray-100">
                        {child.name}
                      </p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">
                        {child.class}
                        {inHostel && enroll && (
                          <span className="ml-2 rounded-full bg-purple-100 px-1.5 py-0.5 text-[10px] font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                            Hostel · Room {enroll.roomNumber}
                          </span>
                        )}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Location */}
            <div className="mt-3">
              <FieldLabel text="Visit location" required />
              <div className="flex gap-2">
                <ToggleBtn
                  active={form.location === "school"}
                  onClick={() => set("location", "school")}
                  icon={<School size={13} />}
                  label="School"
                />
                <ToggleBtn
                  active={form.location === "hostel"}
                  onClick={() => canVisitHostel && set("location", "hostel")}
                  icon={<Building2 size={13} />}
                  label="Hostel"
                  disabled={!canVisitHostel}
                  disabledHint="Only available for boarders"
                />
              </div>
              {form.location === "hostel" && enrollment && (
                <div className="mt-2 flex items-center gap-2 rounded-lg bg-purple-50 px-3 py-2 text-xs text-purple-700 dark:bg-purple-900/10 dark:text-purple-400">
                  <Building2 size={12} />
                  {enrollment.hostelName} · Room {enrollment.roomNumber} ·
                  Supervisor: {enrollment.supervisorName}
                </div>
              )}
            </div>
          </FormSection>

          {/* ── Date & time ─────────────────────────────────────────────── */}
          <FormSection icon={CalendarDays} title="Date & Time">
            <div>
              <FieldLabel text="Visit date" required />
              <input
                type="date"
                value={form.visitDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => set("visitDate", e.target.value)}
                className={inputCls}
              />
              <FieldError msg={errors.visitDate} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <FieldLabel text="Check-in time" required />
                <input
                  type="time"
                  value={form.checkInTime}
                  onChange={(e) => set("checkInTime", e.target.value)}
                  className={inputCls}
                />
                <FieldError msg={errors.checkInTime} />
              </div>
              <div>
                <FieldLabel text="Expected check-out" required />
                <input
                  type="time"
                  value={form.checkOutTime}
                  onChange={(e) => set("checkOutTime", e.target.value)}
                  className={inputCls}
                />
                <FieldError msg={errors.checkOutTime} />
              </div>
            </div>
          </FormSection>

          {/* ── Purpose ─────────────────────────────────────────────────── */}
          <FormSection icon={ClipboardList} title="Purpose">
            <div>
              <FieldLabel text="Reason for visit" required />
              <select
                value={form.purpose}
                onChange={(e) => set("purpose", e.target.value)}
                className={inputCls}
              >
                <option value="">Select a purpose</option>
                {PURPOSE_OPTIONS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
              <FieldError msg={errors.purpose} />
            </div>
            <div>
              <FieldLabel text="Additional notes" />
              <textarea
                rows={2}
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
                placeholder="Any other information for the school…"
                className={`${inputCls} resize-none`}
              />
            </div>
          </FormSection>

          {/* ── Additional visitors ──────────────────────────────────────── */}
          <FormSection icon={Users} title="Additional Visitors">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <FieldLabel text="Number of extra persons" />
                <input
                  type="number"
                  min="0"
                  value={form.extraVisitorsCount}
                  onChange={(e) => set("extraVisitorsCount", e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <FieldLabel text="Their names (optional)" />
                <input
                  type="text"
                  value={form.extraVisitorsNames}
                  onChange={(e) => set("extraVisitorsNames", e.target.value)}
                  placeholder="e.g. Mrs. Ada, John"
                  disabled={extraCount === 0}
                  className={`${inputCls} disabled:cursor-not-allowed disabled:opacity-40`}
                />
              </div>
            </div>
            {extraCount > 0 && (
              <p className="text-xs text-blue-600 dark:text-blue-400">
                {extraCount} extra person{extraCount > 1 ? "s" : ""}{" "}
                accompanying
              </p>
            )}
          </FormSection>

          {/* ── Items / Package ──────────────────────────────────────────── */}
          <FormSection icon={Gift} title="Gift / Package">
            <div>
              <FieldLabel text="Are you bringing items for the student?" />
              <div className="flex gap-2">
                <ToggleBtn
                  active={form.bringsItems === "yes"}
                  onClick={() => set("bringsItems", "yes")}
                  label="Yes"
                />
                <ToggleBtn
                  active={form.bringsItems === "no"}
                  onClick={() => set("bringsItems", "no")}
                  label="No"
                />
              </div>
            </div>
            {form.bringsItems === "yes" && (
              <div>
                <FieldLabel text="Describe the items" />
                <textarea
                  rows={2}
                  value={form.itemsDescription}
                  onChange={(e) => set("itemsDescription", e.target.value)}
                  placeholder="e.g. Food items, clothing, books, toiletries…"
                  className={`${inputCls} resize-none`}
                />
              </div>
            )}
          </FormSection>

          {/* Notice */}
          <div className="flex items-start gap-2.5 rounded-xl bg-blue-50 px-3.5 py-3 dark:bg-blue-900/10">
            <AlertCircle size={14} className="mt-0.5 shrink-0 text-blue-500" />
            <p className="text-xs text-blue-700 dark:text-blue-400">
              Your request will be reviewed by the school admin. You will be
              notified once a decision is made. All hostel visits are subject to
              approved visiting hours.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 border-t border-gray-100 px-5 py-4 dark:border-white/5">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm text-gray-600 transition-colors hover:bg-gray-50 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            <CalendarDays size={14} />
            Submit Request
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Small reusable form helpers ────────────────────────────────────────────────

function FormSection({
  icon: Icon,
  title,
  children,
}: {
  icon: ElementType
  title: string
  children: ReactNode
}) {
  return (
    <div className="space-y-3 rounded-xl border border-gray-100 p-4 dark:border-white/5">
      <div className="flex items-center gap-2">
        <Icon size={14} className="text-gray-400" />
        <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
          {title}
        </p>
      </div>
      {children}
    </div>
  )
}

function FieldLabel({ text, required }: { text: string; required?: boolean }) {
  return (
    <label className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-400">
      {text}
      {required && <span className="ml-0.5 text-red-500">*</span>}
    </label>
  )
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null
  return <p className="mt-1 text-xs text-red-500">{msg}</p>
}

function ToggleBtn({
  active,
  onClick,
  icon,
  label,
  disabled,
  disabledHint,
}: {
  active: boolean
  onClick: () => void
  icon?: ReactNode
  label: string
  disabled?: boolean
  disabledHint?: string
}) {
  return (
    <div className="flex-1">
      <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        className={`flex w-full items-center justify-center gap-2 rounded-lg border py-2.5 text-xs font-medium transition-all disabled:cursor-not-allowed disabled:opacity-40 ${
          active
            ? "border-blue-600 bg-blue-600 text-white"
            : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 dark:border-white/10 dark:bg-white/5 dark:text-gray-300"
        }`}
      >
        {icon}
        {label}
      </button>
      {disabled && disabledHint && (
        <p className="mt-0.5 text-center text-[10px] text-gray-400">
          {disabledHint}
        </p>
      )}
    </div>
  )
}
