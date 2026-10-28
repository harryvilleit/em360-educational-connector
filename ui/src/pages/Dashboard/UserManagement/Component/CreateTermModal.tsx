import { useEffect, useRef, useState } from "react"
import { BookOpen, Loader2, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useCreateSchoolTerm } from "@/hooks/userMgt"

const inputCls =
  "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"

interface TermRow {
  id: string
  name: string
}

function emptyRow(): TermRow {
  return { id: crypto.randomUUID(), name: "" }
}

interface CreateTermModalProps {
  open: boolean
  onClose: () => void
  schoolId: string
}

export default function CreateTermModal({
  open,
  onClose,
  schoolId,
}: CreateTermModalProps) {
  const { createSchoolTermAsync } = useCreateSchoolTerm()

  const [rows, setRows] = useState<TermRow[]>([emptyRow()])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({})
  const pendingFocusId = useRef<string | null>(null)

  // Newly added rows render below the fold of the scrollable list, so
  // without this the row appears with nothing indicating where to type.
  useEffect(() => {
    if (!pendingFocusId.current) return
    const el = inputRefs.current[pendingFocusId.current]
    el?.focus()
    el?.scrollIntoView({ block: "nearest", behavior: "smooth" })
    pendingFocusId.current = null
  }, [rows])

  function updateRow(id: string, value: string) {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, name: value } : r))
    )
    setErrors((prev) => ({ ...prev, [id]: "" }))
  }

  function addRow() {
    const row = emptyRow()
    pendingFocusId.current = row.id
    setRows((prev) => [...prev, row])
  }

  function removeRow(id: string) {
    setRows((prev) => prev.filter((r) => r.id !== id))
  }

  function validate(): boolean {
    const newErrors: Record<string, string> = {}
    const usedNames = new Set<string>()

    rows.forEach((row) => {
      const name = row.name.trim()
      if (!name) {
        newErrors[row.id] = "Term name is required"
      } else if (usedNames.has(name.toLowerCase())) {
        newErrors[row.id] = "Duplicate term name"
      } else {
        usedNames.add(name.toLowerCase())
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSave() {
    if (!validate()) return

    setSaving(true)
    try {
      await Promise.all(
        rows.map((row) =>
          createSchoolTermAsync({ termName: row.name.trim(), schoolId })
        )
      )
      handleClose()
    } catch {
      // hook handles toast
    } finally {
      setSaving(false)
    }
  }

  function handleClose() {
    setRows([emptyRow()])
    setErrors({})
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-semibold">
            <BookOpen className="size-4 text-purple-600" />
            Setup Term
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
            {rows.map((row, idx) => (
              <div key={row.id} className="flex items-start gap-2">
                <div className="flex-1">
                  <Label className="mb-1 block text-xs font-medium text-gray-500">
                    Term Name *
                  </Label>
                  <input
                    ref={(el) => {
                      inputRefs.current[row.id] = el
                    }}
                    type="text"
                    value={row.name}
                    onChange={(e) => updateRow(row.id, e.target.value)}
                    placeholder={`e.g. Term ${idx + 1}`}
                    className={`${inputCls} ${errors[row.id] ? "border-red-400" : ""}`}
                    autoFocus={idx === 0}
                  />
                  {errors[row.id] && (
                    <p className="mt-0.5 text-[11px] text-red-500">
                      {errors[row.id]}
                    </p>
                  )}
                </div>

                {/* Remove */}
                <button
                  type="button"
                  disabled={rows.length === 1}
                  onClick={() => removeRow(row.id)}
                  className="mt-6 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Add another row */}
          <button
            type="button"
            onClick={addRow}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-gray-200 py-2 text-xs font-medium text-gray-500 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
          >
            <Plus className="size-3.5" />
            Add Another Term
          </button>
        </div>

        <div className="flex gap-3 pt-1">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={saving}
            className="flex-1 rounded-xl"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
          >
            {saving ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Saving…
              </>
            ) : (
              <>
                <BookOpen className="size-4" />
                Save {rows.length > 1 ? `${rows.length} Terms` : "Term"}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
