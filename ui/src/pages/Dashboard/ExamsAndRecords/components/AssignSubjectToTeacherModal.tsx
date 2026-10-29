import { useState, useMemo, useEffect, useRef } from "react"
import {
  CheckSquare,
  ChevronDown,
  ChevronRight,
  Loader2,
  Search,
  Square,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useSchoolId } from "@/contexts/SchoolContext"
import {
  useGetAllSubjects,
  useGetTeacherSubjects,
  useAssignTeacherSubjects,
  useRemoveTeacherSubject,
  useGetClassesBySubject,
} from "@/hooks/examAndRecords"

interface AssignSubjectModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  teacherName: string
  teacherId: string
}

/** Selection key — a subject is only ever ticked FOR a class. */
const pairKey = (subjectId: string, classId: string) =>
  `${subjectId}::${classId}`

/** Stable reference so an empty picker doesn't re-render on every parent tick. */
const NO_CLASSES: string[] = []

/**
 * Renders the classes a subject is assigned to (via ClassSubjects) as a
 * checkable sub-list. Mounted only when its parent subject row is expanded,
 * so `useGetClassesBySubject` fires lazily per subject.
 */
function SubjectClassPicker({
  subjectId,
  schoolId,
  selectedClassIds,
  onToggleClass,
}: {
  subjectId: string
  schoolId: string
  /** Classes ticked FOR THIS SUBJECT only. */
  selectedClassIds: string[]
  onToggleClass: (classId: string) => void
}) {
  const { subjectClasses, isLoading } = useGetClassesBySubject({
    subjectId,
    schoolId,
  })

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-2 pl-10 text-xs text-gray-400">
        <Loader2 className="size-3.5 animate-spin" /> Loading classes…
      </div>
    )
  }

  if (subjectClasses.length === 0) {
    return (
      <p className="py-2 pl-10 text-xs text-gray-400">
        This subject isn&apos;t assigned to any class yet.
      </p>
    )
  }

  return (
    <div className="space-y-0.5 py-1 pl-10 pr-3">
      {subjectClasses.map((sc) => {
        const selected = selectedClassIds.includes(sc.classId)
        return (
          <button
            key={sc.id}
            type="button"
            onClick={() => onToggleClass(sc.classId)}
            className={`flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-gray-50 ${
              selected ? "bg-blue-50/40" : ""
            }`}
          >
            {selected ? (
              <CheckSquare className="size-3.5 shrink-0 text-blue-600" />
            ) : (
              <Square className="size-3.5 shrink-0 text-gray-300" />
            )}
            <span className="text-xs font-medium text-gray-700">
              {sc.className}
            </span>
          </button>
        )
      })}
    </div>
  )
}

export default function AssignSubjectModal({
  open,
  onOpenChange,
  teacherName,
  teacherId,
}: AssignSubjectModalProps) {
  const schoolId = useSchoolId()
  const { subjects, isLoading: loadingSubjects } = useGetAllSubjects(schoolId)
  const { teacherSubjects, isLoading: loadingAssigned } =
    useGetTeacherSubjects(teacherId)
  const { assignTeacherSubjectsAsync, isPending: savingSubjects } =
    useAssignTeacherSubjects()
  const { removeTeacherSubjectAsync, isPending: removingSubject } =
    useRemoveTeacherSubject()

  const saving = savingSubjects || removingSubject

  const [search, setSearch] = useState("")
  const [expandedSubjectIds, setExpandedSubjectIds] = useState<string[]>([])

  /** Set of `${subjectId}::${classId}`. */
  const [selectedPairs, setSelectedPairs] = useState<Set<string>>(
    () => new Set()
  )

  /**
   * The teacher's current assignments, straight from the server.
   *
   * Rows with a null classId are legacy (written before assignments were
   * class-scoped). They're excluded from the baseline entirely: including them
   * would make the modal offer to "remove" a row it can't render a tick for.
   */
  const originalPairs = useMemo(
    () =>
      teacherSubjects
        .filter((ts) => Boolean(ts.classId))
        .map((ts) => ({
          key: pairKey(ts.subjectId, ts.classId as string),
          rowId: ts.id,
        })),
    [teacherSubjects]
  )

  const originalPairKeys = useMemo(
    () => originalPairs.map((p) => p.key),
    [originalPairs]
  )

  const rowIdByPair = useMemo(
    () => new Map(originalPairs.map((p) => [p.key, p.rowId])),
    [originalPairs]
  )

  const legacyRowCount = useMemo(
    () => teacherSubjects.filter((ts) => !ts.classId).length,
    [teacherSubjects]
  )

  // Seed from the server once per open. Every subject in the school is listed —
  // the assigned ones simply arrive pre-checked. The old code filtered assigned
  // subjects OUT of the list, which made it impossible to add a second class to
  // a subject the teacher already taught.
  const seededRef = useRef(false)
  useEffect(() => {
    if (!open) {
      seededRef.current = false
      return
    }
    if (seededRef.current) return
    if (loadingAssigned) return

    setSelectedPairs(new Set(originalPairKeys))
    setExpandedSubjectIds([])
    seededRef.current = true
  }, [open, loadingAssigned, originalPairKeys])

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return q ? subjects.filter((s) => s.Name.toLowerCase().includes(q)) : subjects
  }, [subjects, search])

  /** subjectId → class ids ticked under it. Each picker reads its own slice. */
  const classIdsBySubject = useMemo(() => {
    const map = new Map<string, string[]>()
    for (const key of selectedPairs) {
      const [subjectId, classId] = key.split("::")
      const existing = map.get(subjectId)
      if (existing) existing.push(classId)
      else map.set(subjectId, [classId])
    }
    return map
  }, [selectedPairs])

  const diff = useMemo(() => {
    const original = new Set(originalPairKeys)
    return {
      toAssign: Array.from(selectedPairs).filter((k) => !original.has(k)),
      toRemove: originalPairKeys.filter((k) => !selectedPairs.has(k)),
    }
  }, [originalPairKeys, selectedPairs])

  const hasChanges = diff.toAssign.length > 0 || diff.toRemove.length > 0

  function toggleExpanded(id: string) {
    setExpandedSubjectIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  function togglePair(subjectId: string, classId: string) {
    const key = pairKey(subjectId, classId)
    setSelectedPairs((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  async function handleSave() {
    if (!hasChanges) return

    if (diff.toAssign.length > 0) {
      const pairs = diff.toAssign.map((key) => {
        const [subjectId, classId] = key.split("::")
        return { subjectId, classId }
      })
      await assignTeacherSubjectsAsync({
        subUserId: teacherId,
        schoolId,
        // New backend reads assignments (class-scoped pairs).
        assignments: pairs,
        // Old backend reads subjectIds (fallback, ignored by new backend).
        subjectIds: [...new Set(pairs.map((p) => p.subjectId))],
      })
    }

    await Promise.all(
      diff.toRemove
        .map((key) => rowIdByPair.get(key))
        .filter((rowId): rowId is string => Boolean(rowId))
        .map((rowId) => removeTeacherSubjectAsync(rowId))
    )

    reset()
    onOpenChange(false)
  }

  function reset() {
    setSelectedPairs(new Set())
    setExpandedSubjectIds([])
    setSearch("")
    seededRef.current = false
  }

  function handleClose() {
    reset()
    onOpenChange(false)
  }

  const isLoading = loadingSubjects || loadingAssigned

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Assign Subject</DialogTitle>
          <DialogDescription>
            Select subjects for <strong>{teacherName}</strong>. Expand a subject
            to reveal the classes it&apos;s taught in, then choose the ones this
            teacher will take.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search subjects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="size-5 animate-spin text-gray-400" />
            </div>
          ) : subjects.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-400">
              No subjects have been created for this school yet.
            </p>
          ) : (
            <div className="max-h-72 overflow-y-auto rounded-xl border border-gray-200">
              {filtered.length === 0 ? (
                <p className="px-4 py-4 text-sm text-gray-400">
                  No subjects found.
                </p>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filtered.map((subject) => {
                    const ticked = classIdsBySubject.get(subject.Id) ?? NO_CLASSES
                    const expanded = expandedSubjectIds.includes(subject.Id)
                    const hasAny = ticked.length > 0
                    return (
                      <div key={subject.Id}>
                        <button
                          type="button"
                          onClick={() => toggleExpanded(subject.Id)}
                          className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-gray-50 ${
                            hasAny ? "bg-blue-50/40" : ""
                          }`}
                        >
                          {hasAny ? (
                            <CheckSquare className="size-4 shrink-0 text-blue-600" />
                          ) : (
                            <Square className="size-4 shrink-0 text-gray-300" />
                          )}
                          <span className="flex-1 text-sm font-medium text-gray-900">
                            {subject.Name}
                          </span>
                          {hasAny && (
                            <span className="text-[11px] font-medium text-blue-600">
                              {ticked.length} class
                              {ticked.length !== 1 ? "es" : ""}
                            </span>
                          )}
                          {expanded ? (
                            <ChevronDown className="size-4 shrink-0 text-gray-400" />
                          ) : (
                            <ChevronRight className="size-4 shrink-0 text-gray-300" />
                          )}
                        </button>

                        {expanded && (
                          <div className="border-t border-dashed border-gray-100 bg-gray-50/50">
                            <SubjectClassPicker
                              subjectId={subject.Id}
                              schoolId={schoolId}
                              selectedClassIds={ticked}
                              onToggleClass={(classId) =>
                                togglePair(subject.Id, classId)
                              }
                            />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {hasChanges && (
            <p className="text-[11px] text-muted-foreground">
              {diff.toAssign.length > 0 && (
                <span className="text-emerald-600">
                  +{diff.toAssign.length} assignment
                  {diff.toAssign.length !== 1 ? "s" : ""}
                </span>
              )}
              {diff.toRemove.length > 0 && (
                <span className="ml-2 text-rose-600">
                  −{diff.toRemove.length} assignment
                  {diff.toRemove.length !== 1 ? "s" : ""}
                </span>
              )}
            </p>
          )}

          {legacyRowCount > 0 && (
            <p className="text-[11px] text-amber-600">
              {legacyRowCount} older assignment
              {legacyRowCount !== 1 ? "s" : ""} on this teacher have no class
              recorded and aren&apos;t shown. Re-assign the subject to a class
              here to replace them.
            </p>
          )}
        </div>

        <DialogFooter className="gap-3 sm:space-x-0">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={saving}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
          >
            {saving ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Saving…
              </>
            ) : (
              "Save changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
