import { useState } from "react"
import { X, Loader2 } from "lucide-react"
import { useSchoolId } from "@/contexts/SchoolContext"
import { useAuthStore } from "@/store/auth.store"
import { useGetAllClasses } from "@/hooks/examAndRecords"
import { useCreateConsentRequest } from "@/hooks/consent"
import { ConsentCategory, ConsentTargetType } from "@/api/consent.api/types"
import type { CreateConsentRequestPayloadI } from "@/api/consent.api/types"
import { CONSENT_CATEGORY_OPTIONS } from "@/utils/consent"

interface NewConsentModalProps {
  onClose: () => void
}

export function NewConsentModal({ onClose }: NewConsentModalProps) {
  const schoolId = useSchoolId()
  const user = useAuthStore((s) => s.user)
  const { classes: classItems, isLoading: classesLoading } = useGetAllClasses({
    schoolId,
    pageSize: 100,
  })
  const { createConsentRequestAsync, isPending } = useCreateConsentRequest({
    onSuccess: onClose,
  })

  const [form, setForm] = useState<{
    title: string
    description: string
    category: ConsentCategory
    responseDue: string
    sentBy: string
    targetType: ConsentTargetType
    classIds: string[]
    isUrgent: boolean
  }>({
    title: "",
    description: "",
    category: ConsentCategory.Medical,
    responseDue: "",
    sentBy: user?.name ?? "School Admin",
    targetType: ConsentTargetType.AllStudents,
    classIds: [],
    isUrgent: false,
  })
  const [error, setError] = useState("")

  function toggleClass(id: string) {
    setForm((p) => ({
      ...p,
      classIds: p.classIds.includes(id)
        ? p.classIds.filter((c) => c !== id)
        : [...p.classIds, id],
    }))
  }

  async function submit() {
    if (!form.title.trim()) {
      setError("Title is required")
      return
    }
    if (!form.description.trim()) {
      setError("Description is required")
      return
    }
    if (!form.responseDue) {
      setError("Response due date is required")
      return
    }
    if (
      form.targetType === ConsentTargetType.SpecificClasses &&
      form.classIds.length === 0
    ) {
      setError("Select at least one class")
      return
    }

    const payload: Omit<CreateConsentRequestPayloadI, "schoolId"> = {
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      responseDue: new Date(form.responseDue).toISOString(),
      sentByUserId: user?.id ?? "",
      sentBy: form.sentBy.trim() || "School Admin",
      targetType: form.targetType,
      classIds:
        form.targetType === ConsentTargetType.SpecificClasses
          ? form.classIds
          : [],
      isUrgent: form.isUrgent,
    }
    if (isPending) return
    try {
      await createConsentRequestAsync({ schoolId, ...payload })
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Unable to send consent request."
      )
    }
  }

  const inputCls =
    "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-gray-100"

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Create consent request"
      tabIndex={-1}
      onKeyDown={(event) => event.key === "Escape" && onClose()}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
    >
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-white/10 dark:bg-gray-900">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-white/5">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              New Consent Request
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 hover:bg-gray-100 dark:hover:bg-white/10"
          >
            <X size={15} className="text-gray-400" />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
          {/* Title */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-400">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) =>
                setForm((p) => ({ ...p, title: e.target.value }))
              }
              placeholder="e.g. Hepatitis B Vaccination Programme"
              className={inputCls}
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-400">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={5}
              value={form.description}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
              placeholder="Provide all details parents need to make an informed decision..."
              className={`${inputCls} resize-none`}
            />
            <p className="mt-1 text-[11px] text-gray-400 dark:text-gray-500">
              This message will appear in the parent's notification inbox.
            </p>
          </div>

          {/* Category + Due date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-400">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={form.category}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    category: Number(e.target.value) as ConsentCategory,
                  }))
                }
                className={inputCls}
              >
                {CONSENT_CATEGORY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-400">
                Response Due <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={form.responseDue}
                onChange={(e) =>
                  setForm((p) => ({ ...p, responseDue: e.target.value }))
                }
                className={inputCls}
              />
            </div>
          </div>

          {/* Sent by */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-400">
              Sent by
            </label>
            <input
              type="text"
              value={form.sentBy}
              onChange={(e) =>
                setForm((p) => ({ ...p, sentBy: e.target.value }))
              }
              className={inputCls}
            />
          </div>

          {/* Scope */}
          <div>
            <label className="mb-2 block text-xs font-medium text-gray-600 dark:text-gray-400">
              Send to
            </label>
            <div className="flex gap-2">
              <button
                onClick={() =>
                  setForm((p) => ({
                    ...p,
                    targetType: ConsentTargetType.AllStudents,
                  }))
                }
                className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-all ${form.targetType === ConsentTargetType.AllStudents ? "border-blue-600 bg-blue-600 text-white" : "border-gray-200 bg-white text-gray-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-300"}`}
              >
                Parents
              </button>
              <button
                onClick={() =>
                  setForm((p) => ({
                    ...p,
                    targetType: ConsentTargetType.SpecificClasses,
                  }))
                }
                className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-all ${form.targetType === ConsentTargetType.SpecificClasses ? "border-blue-600 bg-blue-600 text-white" : "border-gray-200 bg-white text-gray-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-300"}`}
              >
                Select Classes
              </button>
            </div>

            {form.targetType === ConsentTargetType.SpecificClasses && (
              <div className="mt-3 max-h-40 overflow-y-auto rounded-lg border border-gray-200 p-2 dark:border-white/10">
                {classesLoading ? (
                  <p className="px-2 py-2 text-xs text-gray-400">
                    Loading classes…
                  </p>
                ) : classItems.length === 0 ? (
                  <p className="px-2 py-2 text-xs text-gray-400">
                    No classes found
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-1.5">
                    {classItems.map((c) => (
                      <label
                        key={c.Id}
                        className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/5"
                      >
                        <input
                          type="checkbox"
                          checked={form.classIds.includes(c.Id)}
                          onChange={() => toggleClass(c.Id)}
                          className="rounded border-gray-300"
                        />
                        {c.ClsName}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Urgent toggle */}
          <div className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3 dark:border-white/10">
            <div>
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Mark as Urgent
              </p>
              <p className="text-[11px] text-gray-400 dark:text-gray-500">
                Highlighted in the parent's notification inbox
              </p>
            </div>
            <button
              onClick={() => setForm((p) => ({ ...p, isUrgent: !p.isUrgent }))}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${form.isUrgent ? "bg-orange-500" : "bg-gray-200 dark:bg-white/20"}`}
            >
              <span
                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${form.isUrgent ? "translate-x-4" : "translate-x-0.5"}`}
              />
            </button>
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </p>
          )}
        </div>

        <div className="flex gap-3 border-t border-gray-100 px-5 py-4 dark:border-white/5">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm text-gray-600 hover:bg-gray-50 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={isPending}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isPending && <Loader2 size={14} className="animate-spin" />}
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
