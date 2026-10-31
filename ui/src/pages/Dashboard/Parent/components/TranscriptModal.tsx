import { useState } from "react"
import { Building2, ChevronDown, Send, User, X } from "lucide-react"
import type {
  TranscriptDelivery,
  TranscriptPurpose,
  TranscriptRequest,
} from "@/store/transcript.store"
import type { Parent } from "@/types/parent"

const PURPOSE_OPTIONS: TranscriptPurpose[] = [
  "University Admission",
  "Transfer to Another School",
  "Scholarship Application",
  "Employment Verification",
  "Personal Records",
  "Other",
]

const inputCls =
  "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-gray-100"

interface FormState {
  studentId: string
  deliveryType: TranscriptDelivery
  institutionName: string
  institutionAddress: string
  contactPerson: string
  contactEmail: string
  purpose: string
  notes: string
}

export function TranscriptModal({
  parent,
  onClose,
  onSubmit,
}: {
  parent: Parent
  onClose: () => void
  onSubmit: (
    data: Omit<
      TranscriptRequest,
      "id" | "serialNumber" | "status" | "createdAt"
    >
  ) => void
}) {
  const [form, setForm] = useState<FormState>({
    studentId: parent.children[0]?.id ?? "",
    deliveryType: "self",
    institutionName: "",
    institutionAddress: "",
    contactPerson: "",
    contactEmail: "",
    purpose: "",
    notes: "",
  })
  const [errors, setErrors] = useState<
    Partial<Record<keyof FormState, string>>
  >({})

  const selectedChild = parent.children.find((c) => c.id === form.studentId)

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((p) => ({ ...p, [key]: value }))
    if (errors[key]) setErrors((p) => ({ ...p, [key]: undefined }))
  }

  function validate(): boolean {
    const e: Partial<Record<keyof FormState, string>> = {}
    if (!form.purpose) e.purpose = "Purpose is required"
    if (form.deliveryType === "official") {
      if (!form.institutionName.trim())
        e.institutionName = "Institution name is required"
      if (!form.institutionAddress.trim())
        e.institutionAddress = "Institution address is required"
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit() {
    if (!validate()) return
    onSubmit({
      parentId: parent.id,
      parentName: `${parent.firstName} ${parent.lastName}`,
      parentEmail: parent.email,
      studentId: form.studentId,
      studentName: selectedChild?.name ?? "",
      studentClass: selectedChild?.class ?? "",
      deliveryType: form.deliveryType,
      institutionName:
        form.deliveryType === "official"
          ? form.institutionName.trim()
          : undefined,
      institutionAddress:
        form.deliveryType === "official"
          ? form.institutionAddress.trim()
          : undefined,
      contactPerson: form.contactPerson.trim() || undefined,
      contactEmail: form.contactEmail.trim() || undefined,
      purpose: form.purpose as TranscriptPurpose,
      notes: form.notes.trim() || undefined,
    })
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Request transcript"
      tabIndex={-1}
      onKeyDown={(event) => event.key === "Escape" && onClose()}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
    >
      <div className="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-white/10 dark:bg-gray-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-white/5">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Request Academic Transcript
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 hover:bg-gray-100 dark:hover:bg-white/10"
          >
            <X size={15} className="text-gray-400" />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
          {/* Child selector */}
          {parent.children.length > 1 && (
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-400">
                Student <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                {parent.children.map((child) => (
                  <button
                    key={child.id}
                    type="button"
                    onClick={() => set("studentId", child.id)}
                    className={`flex w-full items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left transition-all ${
                      form.studentId === child.id
                        ? "border-blue-500 bg-blue-50 dark:border-blue-500/50 dark:bg-blue-900/20"
                        : "border-gray-200 bg-white hover:border-gray-300 dark:border-white/10 dark:bg-white/3"
                    }`}
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                      {child.avatarInitials}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-900 dark:text-gray-100">
                        {child.name}
                      </p>
                      <p className="text-[11px] text-gray-400">{child.class}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Delivery type */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-400">
              Send transcript to <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={form.deliveryType}
                onChange={(e) =>
                  set("deliveryType", e.target.value as TranscriptDelivery)
                }
                className={`${inputCls} appearance-none pr-9`}
              >
                <option value="self">Send to Self — Personal copy</option>
                <option value="official">Send to Official Institution</option>
              </select>
              <ChevronDown
                size={14}
                className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-400"
              />
            </div>

            {/* Delivery type info card */}
            <div
              className={`mt-2 flex items-start gap-2.5 rounded-lg px-3 py-2.5 text-xs ${
                form.deliveryType === "official"
                  ? "bg-purple-50 text-purple-700 dark:bg-purple-900/10 dark:text-purple-400"
                  : "bg-blue-50 text-blue-700 dark:bg-blue-900/10 dark:text-blue-400"
              }`}
            >
              {form.deliveryType === "official" ? (
                <Building2 size={13} className="mt-0.5 shrink-0" />
              ) : (
                <User size={13} className="mt-0.5 shrink-0" />
              )}
              <p>
                {form.deliveryType === "official"
                  ? "An official stamped transcript will be addressed and sent to the specified institution. Suitable for admissions, transfers and scholarships."
                  : "A personal copy of the academic transcript will be issued for your own records. Not for official submissions."}
              </p>
            </div>
          </div>

          {/* Official delivery fields */}
          {form.deliveryType === "official" && (
            <>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-400">
                  Institution name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.institutionName}
                  onChange={(e) => set("institutionName", e.target.value)}
                  placeholder="e.g. University of Lagos"
                  className={inputCls}
                />
                {errors.institutionName && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.institutionName}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-400">
                  Institution address <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={form.institutionAddress}
                  onChange={(e) => set("institutionAddress", e.target.value)}
                  placeholder="Full address of the receiving institution"
                  className={`${inputCls} resize-none`}
                />
                {errors.institutionAddress && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.institutionAddress}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-400">
                    Contact person (optional)
                  </label>
                  <input
                    type="text"
                    value={form.contactPerson}
                    onChange={(e) => set("contactPerson", e.target.value)}
                    placeholder="e.g. Admissions Officer"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-400">
                    Contact email (optional)
                  </label>
                  <input
                    type="email"
                    value={form.contactEmail}
                    onChange={(e) => set("contactEmail", e.target.value)}
                    placeholder="admissions@uni.edu"
                    className={inputCls}
                  />
                </div>
              </div>
            </>
          )}

          {/* Purpose */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-400">
              Purpose <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={form.purpose}
                onChange={(e) => set("purpose", e.target.value)}
                className={`${inputCls} appearance-none pr-9`}
              >
                <option value="">Select purpose</option>
                {PURPOSE_OPTIONS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-400"
              />
            </div>
            {errors.purpose && (
              <p className="mt-1 text-xs text-red-500">{errors.purpose}</p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-400">
              Additional notes (optional)
            </label>
            <textarea
              rows={2}
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Any special instructions or requirements…"
              className={`${inputCls} resize-none`}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 border-t border-gray-100 px-5 py-4 dark:border-white/5">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm text-gray-600 hover:bg-gray-50 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Send size={14} />
            Submit Request
          </button>
        </div>
      </div>
    </div>
  )
}
