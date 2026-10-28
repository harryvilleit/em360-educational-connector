import { useEffect, useRef, useState } from "react"
import { CalendarPlus, Loader2, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useUpdateSchoolSession } from "@/hooks/userMgt"
import type { SchoolSessionItem, SchoolTermItem } from "@/api/userMgt.api/types"

const inputCls =
  "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-400 "

/** Signals to the backend that this term row should be created rather than updated. */
const EMPTY_GUID = "00000000-0000-0000-0000-000000000000"

interface NewTermRow {
  id: string
  schoolTermId: string
  startDate: string
  endDate: string
}

function emptyRow(): NewTermRow {
  return {
    id: crypto.randomUUID(),
    schoolTermId: "",
    startDate: "",
    endDate: "",
  }
}

function toDateOnly(iso: string): string {
  return iso.split("T")[0]
}

function addDays(dateOnly: string, days: number): string {
  const d = new Date(`${dateOnly}T00:00:00`)
  d.setDate(d.getDate() + days)
  return d.toISOString().split("T")[0]
}

interface AddTermModalProps {
  open: boolean
  onClose: () => void
  session: SchoolSessionItem
  availableTerms: SchoolTermItem[]
  schoolId: string
}

export default function AddTermModal({
  open,
  onClose,
  session,
  availableTerms,
  schoolId,
}: AddTermModalProps) {
  const { updateSchoolSessionAsync, isLoading: saving } =
    useUpdateSchoolSession()

  const [rows, setRows] = useState<NewTermRow[]>([emptyRow()])
  const [errors, setErrors] = useState<Record<string, string>>({})

  const selectRefs = useRef<Record<string, HTMLSelectElement | null>>({})
  const pendingFocusId = useRef<string | null>(null)

  // Newly added rows render below the fold of the scrollable list, so
  // without this the row appears with nothing indicating where to type.
  useEffect(() => {
    if (!pendingFocusId.current) return
    const el = selectRefs.current[pendingFocusId.current]
    el?.focus()
    el?.scrollIntoView({ block: "nearest", behavior: "smooth" })
    pendingFocusId.current = null
  }, [rows])

  const assignedTermIds = new Set(session.Terms.map((t) => t.SchoolTermId))
  const selectableTerms = availableTerms.filter(
    (t) => !assignedTermIds.has(t.Id)
  )

  // A term already picked in another row of this form shouldn't be pickable
  // again — the row keeps its own current selection in the list, though.
  function selectableTermsForRow(rowId: string) {
    const pickedByOtherRows = new Set(
      rows
        .filter((r) => r.id !== rowId && r.schoolTermId)
        .map((r) => r.schoolTermId)
    )
    return selectableTerms.filter((t) => !pickedByOtherRows.has(t.Id))
  }

  function updateRow(
    id: string,
    field: keyof Omit<NewTermRow, "id">,
    value: string
  ) {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    )
    setErrors((prev) => ({ ...prev, [id]: "" }))
  }

  // The next term picked usually continues right after the latest term
  // already in play, so seed its start date instead of leaving the date
  // picker to default to today.
  function nextStartDate(): string {
    const endDates = [
      ...session.Terms.map((t) => toDateOnly(t.EndDate)),
      ...rows.map((r) => r.endDate).filter(Boolean),
    ]
    if (endDates.length === 0) return ""
    const latest = endDates.reduce((max, d) => (d > max ? d : max))
    return addDays(latest, 1)
  }

  function addRow() {
    const row = emptyRow()
    row.startDate = nextStartDate()
    pendingFocusId.current = row.id
    setRows((prev) => [...prev, row])
  }

  function removeRow(id: string) {
    setRows((prev) => prev.filter((r) => r.id !== id))
  }

  function validate(): boolean {
    const newErrors: Record<string, string> = {}
    const usedTermIds = new Set<string>()

    rows.forEach((row) => {
      if (!row.schoolTermId) {
        newErrors[row.id] = "Select a term"
      } else if (usedTermIds.has(row.schoolTermId)) {
        newErrors[row.id] = "Term already added in this list"
      } else if (!row.startDate || !row.endDate) {
        newErrors[row.id] = "Set start and end dates"
      } else if (row.endDate <= row.startDate) {
        newErrors[row.id] = "End date must be after start date"
      } else {
        usedTermIds.add(row.schoolTermId)
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSave() {
    if (!validate()) return

    try {
      await updateSchoolSessionAsync({
        id: session.Id,
        sessionName: session.SessionName,
        schoolId,
        terms: [
          ...session.Terms.map((t) => ({
            id: t.Id,
            schoolTermId: t.SchoolTermId,
            startDate: t.StartDate,
            endDate: t.EndDate,
          })),
          ...rows.map((r) => ({
            id: EMPTY_GUID,
            schoolTermId: r.schoolTermId,
            startDate: r.startDate,
            endDate: r.endDate,
          })),
        ],
      })
      handleClose()
    } catch {
      // hook handles toast
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
          <DialogTitle className="flex flex-col gap-1 text-base font-semibold">
            Add Term
            <p className="text-xs font-normal">
              You are about to add Term to "{session.SessionName}" session.
            </p>
          </DialogTitle>
        </DialogHeader>

        {selectableTerms.length === 0 ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-700">
            All available terms have already been added to this session. Use
            "Setup Term" to create a new term first.
          </div>
        ) : (
          <div className="space-y-3 py-2">
            <div className="max-h-72 space-y-3 overflow-y-auto pr-1">
              {rows.map((row, idx) => (
                <div key={row.id} className="flex items-start gap-2">
                  <div className="flex-1 space-y-2">
                    <div>
                      <Label className="mb-1 block text-xs font-medium text-gray-500">
                        Term *
                      </Label>
                      <select
                        ref={(el) => {
                          selectRefs.current[row.id] = el
                        }}
                        value={row.schoolTermId}
                        onChange={(e) =>
                          updateRow(row.id, "schoolTermId", e.target.value)
                        }
                        className={`${inputCls} ${errors[row.id] ? "border-red-400" : ""}`}
                        autoFocus={idx === 0}
                      >
                        <option value="">Select term…</option>
                        {selectableTermsForRow(row.id).map((term) => (
                          <option key={term.Id} value={term.Id}>
                            {term.TermName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="mb-1 block text-[10px] font-medium text-gray-500">
                          Start Date *
                        </Label>
                        <input
                          type="date"
                          value={row.startDate}
                          onChange={(e) =>
                            updateRow(row.id, "startDate", e.target.value)
                          }
                          className={`${inputCls} text-xs`}
                        />
                      </div>
                      <div>
                        <Label className="mb-1 block text-[10px] font-medium text-gray-500">
                          End Date *
                        </Label>
                        <input
                          type="date"
                          value={row.endDate}
                          min={row.startDate || undefined}
                          onChange={(e) =>
                            updateRow(row.id, "endDate", e.target.value)
                          }
                          className={`${inputCls} text-xs`}
                        />
                      </div>
                    </div>

                    {errors[row.id] && (
                      <p className="text-[11px] text-red-500">
                        {errors[row.id]}
                      </p>
                    )}
                  </div>

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

            <button
              type="button"
              onClick={addRow}
              disabled={rows.length >= selectableTerms.length}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-gray-200 py-2 text-xs font-medium text-gray-500 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Plus className="size-3.5" />
              Add Another Term
            </button>
          </div>
        )}

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
            disabled={saving || selectableTerms.length === 0}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
          >
            {saving ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Saving…
              </>
            ) : (
              <>
                <CalendarPlus className="size-4" />
                Add {rows.length > 1 ? `${rows.length} Terms` : "Term"}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
