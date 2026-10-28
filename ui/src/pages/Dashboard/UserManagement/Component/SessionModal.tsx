import { useState } from "react"
import { AlertTriangle, BookOpen, CalendarDays, CheckSquare, Loader2, Square, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { SchoolSessionItem, SchoolTermItem } from "@/api/userMgt.api/types"

export interface SessionTermDates {
  id: string
  startDate: string
  endDate: string
}

interface SessionModalProps {
  onClose: () => void
  onSave: (data: {
    sessionId?: string
    sessionName: string
    setAsCurrent: boolean
    selectedTerms: SessionTermDates[]
    activeTermId: string | null
  }) => void
  isSaving?: boolean
  availableTerms: SchoolTermItem[]
  session?: SchoolSessionItem
}

const inputCls =
  "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"

export default function SessionModal({
  onClose,
  onSave,
  isSaving = false,
  availableTerms,
  session,
}: SessionModalProps) {
  const isEdit = Boolean(session)

  const [name, setName] = useState(session?.SessionName ?? "")
  const [setAsCurrent, setSetAsCurrent] = useState(false)
  const [selectedTermIds, setSelectedTermIds] = useState<string[]>(
    session?.Terms.map((t) => t.SchoolTermId) ?? []
  )
  const [termDates, setTermDates] = useState<Record<string, { startDate: string; endDate: string }>>(
    () =>
      Object.fromEntries(
        (session?.Terms ?? []).map((t) => [
          t.SchoolTermId,
          { startDate: t.StartDate.split("T")[0], endDate: t.EndDate.split("T")[0] },
        ])
      )
  )
  const [activeTermId, setActiveTermId] = useState<string | null>(
    session?.Terms.find((t) => t.IsCurrent)?.SchoolTermId ?? null
  )
  const [error, setError] = useState("")

  // In edit mode the term list is fixed to whatever is already assigned to the
  // session, since updating relies on each term's existing session-term id.
  const termsToShow = isEdit
    ? availableTerms.filter((t) => selectedTermIds.includes(t.Id))
    : availableTerms

  const allSelected =
    termsToShow.length > 0 &&
    termsToShow.every((t) => selectedTermIds.includes(t.Id))

  function toggleTerm(id: string) {
    if (isEdit) return
    setSelectedTermIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    )
    if (activeTermId === id) setActiveTermId(null)
    setError("")
  }

  function toggleAll() {
    if (isEdit) return
    if (allSelected) {
      setSelectedTermIds([])
      setActiveTermId(null)
    } else {
      setSelectedTermIds(termsToShow.map((t) => t.Id))
    }
    setError("")
  }

  function updateTermDate(id: string, field: "startDate" | "endDate", value: string) {
    setTermDates((prev) => ({
      ...prev,
      [id]: {
        startDate: prev[id]?.startDate ?? "",
        endDate: prev[id]?.endDate ?? "",
        [field]: value,
      },
    }))
    setError("")
  }

  function handleSave() {
    if (!name.trim()) { setError("Session name is required"); return }

    for (const id of selectedTermIds) {
      const dates = termDates[id]
      const term = termsToShow.find((t) => t.Id === id)
      if (!dates?.startDate || !dates?.endDate) {
        setError(`Set start and end dates for "${term?.TermName}"`)
        return
      }
      if (dates.endDate <= dates.startDate) {
        setError(`End date must be after start date for "${term?.TermName}"`)
        return
      }
    }

    onSave({
      sessionId: session?.Id,
      sessionName: name.trim(),
      setAsCurrent,
      selectedTerms: selectedTermIds.map((id) => ({
        id,
        startDate: termDates[id].startDate,
        endDate: termDates[id].endDate,
      })),
      activeTermId,
    })
  }

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-semibold">
            
            {isEdit ? "Edit Academic Session" : "New Academic Session"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Session name */}
          <div>
            <Label className="mb-1.5 block text-xs font-medium text-gray-600">
              Session Name <span className="text-red-500">*</span>
            </Label>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setError("") }}
              placeholder="e.g. 2025/2026"
              autoFocus
              className={inputCls}
            />
            <p className="mt-1 text-[11px] text-gray-400">
              Usually formatted as the academic year, e.g. "2025/2026"
            </p>
          </div>

          {/* Terms multi-select */}
          <div>
            <Label className="mb-1.5 block text-xs font-medium text-gray-600">
              Terms
            </Label>

            {termsToShow.length === 0 ? (
              <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-500" />
                <div>
                  <p className="text-xs font-semibold text-amber-800">
                    No terms created yet
                  </p>
                  <p className="mt-0.5 text-xs text-amber-700">
                    Use <span className="font-medium">"Setup Term"</span> to create
                    terms before creating a session, or create the session now and
                    add terms later.
                  </p>
                </div>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-gray-200">
                {/* Select all row */}
                {!isEdit && (
                  <button
                    type="button"
                    onClick={toggleAll}
                    className="flex w-full items-center gap-3 border-b border-gray-100 bg-gray-50 px-4 py-2.5 text-left hover:bg-gray-100"
                  >
                    {allSelected ? (
                      <CheckSquare className="size-4 shrink-0 text-blue-600" />
                    ) : (
                      <Square className="size-4 shrink-0 text-gray-400" />
                    )}
                    <span className="text-xs font-semibold text-gray-600">
                      {allSelected ? "Deselect all" : "Select all"}
                    </span>
                    <span className="ml-auto text-[11px] text-muted-foreground">
                      {termsToShow.length} term{termsToShow.length !== 1 ? "s" : ""}
                    </span>
                  </button>
                )}

                {/* Term rows */}
                <div className="max-h-72 divide-y divide-gray-100 overflow-y-auto">
                  {termsToShow.map((term) => {
                    const selected = selectedTermIds.includes(term.Id)
                    const dates = termDates[term.Id]
                    return (
                      <div key={term.Id} className={selected ? "bg-blue-50/40" : ""}>
                        <button
                          type="button"
                          onClick={() => toggleTerm(term.Id)}
                          disabled={isEdit}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-gray-50 disabled:cursor-default disabled:hover:bg-transparent"
                        >
                          {selected ? (
                            <CheckSquare className="size-4 shrink-0 text-blue-600" />
                          ) : (
                            <Square className="size-4 shrink-0 text-gray-300" />
                          )}
                          <div className="flex items-center gap-2">
                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-purple-100">
                              <BookOpen className="size-3 text-purple-600" />
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              {term.TermName}
                            </span>
                          </div>
                        </button>

                        {selected && (
                          <div className="space-y-2 px-4 pb-3 pl-11">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <Label className="mb-1 block text-[10px] font-medium text-gray-500">
                                  Start Date *
                                </Label>
                                <input
                                  type="date"
                                  value={dates?.startDate ?? ""}
                                  onChange={(e) => updateTermDate(term.Id, "startDate", e.target.value)}
                                  className={`${inputCls} text-xs`}
                                />
                              </div>
                              <div>
                                <Label className="mb-1 block text-[10px] font-medium text-gray-500">
                                  End Date *
                                </Label>
                                <input
                                  type="date"
                                  value={dates?.endDate ?? ""}
                                  min={dates?.startDate || undefined}
                                  onChange={(e) => updateTermDate(term.Id, "endDate", e.target.value)}
                                  className={`${inputCls} text-xs`}
                                />
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                const next = activeTermId === term.Id ? null : term.Id
                                setActiveTermId(next)
                                // A term can only be current inside the active session
                                // (SetCurrentTerm returns 422 otherwise).
                                if (next && !isEdit) setSetAsCurrent(true)
                              }}
                              className={`flex w-fit items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                                activeTermId === term.Id
                                  ? "border-amber-200 bg-amber-50 text-amber-700"
                                  : "border-gray-200 text-gray-500 hover:bg-gray-50"
                              }`}
                            >
                              <Star className={`size-3 ${activeTermId === term.Id ? "fill-current" : ""}`} />
                              {activeTermId === term.Id ? "Active term for this session" : "Set as active term"}
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {selectedTermIds.length > 0 && (
              <p className="mt-1.5 text-[11px] text-muted-foreground">
                <span className="font-semibold text-blue-600">{selectedTermIds.length}</span>{" "}
                term{selectedTermIds.length > 1 ? "s" : ""} selected
              </p>
            )}
          </div>

          {/* Set as current */}
          {!isEdit && (
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 px-4 py-3 transition-colors hover:bg-gray-50">
              <input
                type="checkbox"
                checked={setAsCurrent}
                onChange={(e) => {
                  setSetAsCurrent(e.target.checked)
                  if (!e.target.checked) setActiveTermId(null)
                }}
                className="mt-0.5 accent-blue-600"
              />
              <div>
                <p className="text-sm font-medium text-gray-800">
                  Set as current session
                </p>
                <p className="text-xs text-muted-foreground">
                  The existing active session will be unset
                </p>
              </div>
            </label>
          )}

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
              {error}
            </p>
          )}
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSaving}
            className="flex-1 rounded-xl"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
          >
            {isSaving ? (
              <><Loader2 className="size-4 animate-spin" /> {isEdit ? "Saving…" : "Creating…"}</>
            ) : (
              <> {isEdit ? "Save Changes" : "Create Session"}</>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
