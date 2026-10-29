import { useState, useMemo, useEffect, useCallback } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
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
import {
  CheckSquare,
  ChevronDown,
  ChevronRight,
  Loader2,
  Search,
  Square,
} from "lucide-react"
import {
  useGetAllClasses,
  useAssignTeacherToClass,
  useAssignTeacherSubjects,
  useRemoveTeacherFromClass,
  useRemoveTeacherSubject,
  useGetTeacherClasses,
  useGetTeacherSubjects,
  useGetSubjectsByClass,
} from "@/hooks/examAndRecords"
import { queryKeys } from "@/utils/queryKeys"

interface AssignClassToTeacherModalProps {
  open: boolean
  onClose: () => void
  teacherId: string
  teacherName: string
  schoolId: string
}

/** Selection key — a subject is only ever ticked FOR a class. */
const pairKey = (classId: string, subjectId: string) =>
  `${classId}::${subjectId}`

/** Stable reference so an empty picker doesn't re-render on every parent tick. */
const NO_SUBJECTS: string[] = []

/**
 * Renders the subjects assigned to a class (via ClassSubjects) as a checkable
 * sub-list. Mounted only when its parent class row is expanded, so
 * `useGetSubjectsByClass` fires lazily per class.
 */
function ClassSubjectPicker({
  classId,
  schoolId,
  selectedSubjectIds,
  onToggleSubject,
}: {
  classId: string
  schoolId: string
  /** Subjects ticked FOR THIS CLASS only. */
  selectedSubjectIds: string[]
  onToggleSubject: (subjectId: string) => void
}) {
  const { classSubjects, isLoading } = useGetSubjectsByClass({
    classId,
    schoolId,
  })

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-2 pl-10 text-xs text-gray-400">
        <Loader2 className="size-3.5 animate-spin" /> Loading subjects…
      </div>
    )
  }

  if (classSubjects.length === 0) {
    return (
      <p className="py-2 pl-10 text-xs text-gray-400">
        No subjects assigned to this class yet.
      </p>
    )
  }

  return (
    <div className="space-y-0.5 py-1 pl-10 pr-3">
      {classSubjects.map((cs) => {
        const selected = selectedSubjectIds.includes(cs.subjectId)
        return (
          <button
            key={cs.id}
            type="button"
            onClick={() => onToggleSubject(cs.subjectId)}
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
              {cs.subjectName}
            </span>
          </button>
        )
      })}
    </div>
  )
}

export default function AssignClassToTeacherModal({
  open,
  onClose,
  teacherId,
  teacherName,
  schoolId,
}: AssignClassToTeacherModalProps) {
  const { classes, isLoading: loadingClasses } = useGetAllClasses({
    schoolId,
    pageSize: 200,
  })
  const {
    teacherClasses,
    isLoading: loadingAssignedClasses,
    refetch: refetchTeacherClasses,
  } = useGetTeacherClasses(teacherId)
  const {
    teacherSubjects,
    isLoading: loadingAssignedSubjects,
    refetch: refetchTeacherSubjects,
  } = useGetTeacherSubjects(teacherId)

  const queryClient = useQueryClient()

  // All four run `silent`: one user action can fire up to four mutations, and
  // each would otherwise raise its own toast and its own refetch. The modal
  // shows a single toast and refreshes the cache once, in handleSave.
  const { assignTeacherToClassAsync, isPending: savingClasses } =
    useAssignTeacherToClass({ silent: true })
  const { assignTeacherSubjectsAsync, isPending: savingSubjects } =
    useAssignTeacherSubjects({ silent: true })
  const { removeTeacherFromClassAsync, isPending: removingClass } =
    useRemoveTeacherFromClass({ silent: true })
  const { removeTeacherSubjectAsync, isPending: removingSubject } =
    useRemoveTeacherSubject({ silent: true })

  /**
   * Covers the cache refresh that runs after the writes land, not just the
   * writes themselves — otherwise the Save button goes idle for the duration of
   * the refetch and invites a second click.
   */
  const [isRefreshing, setIsRefreshing] = useState(false)

  const saving =
    savingClasses ||
    savingSubjects ||
    removingClass ||
    removingSubject ||
    isRefreshing

  const [search, setSearch] = useState("")
  const [expandedClassIds, setExpandedClassIds] = useState<string[]>([])
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([])

  /** Set of `${classId}::${subjectId}`. */
  const [selectedPairs, setSelectedPairs] = useState<Set<string>>(
    () => new Set()
  )

  // ── Server baseline ────────────────────────────────────────────────────────
  const originalClassIds = useMemo(
    () => teacherClasses.map((tc) => tc.classId),
    [teacherClasses]
  )

  /**
   * Real (class, subject) pairs — no cross-product reconstruction needed now
   * that SubUserSubject carries ClassId. Legacy rows (null classId) are left
   * out of the baseline so the modal never offers to remove something it can't
   * render a tick for.
   */
  const originalPairs = useMemo(
    () =>
      teacherSubjects
        .filter((ts) => Boolean(ts.classId))
        .map((ts) => ({
          key: pairKey(ts.classId as string, ts.subjectId),
          rowId: ts.id,
        })),
    [teacherSubjects]
  )

  const originalPairKeys = useMemo(
    () => originalPairs.map((p) => p.key),
    [originalPairs]
  )

  const classRowIdByClassId = useMemo(
    () => new Map(teacherClasses.map((tc) => [tc.classId, tc.id])),
    [teacherClasses]
  )

  const subjectRowIdByPair = useMemo(
    () => new Map(originalPairs.map((p) => [p.key, p.rowId])),
    [originalPairs]
  )

  const legacyRowCount = useMemo(
    () => teacherSubjects.filter((ts) => !ts.classId).length,
    [teacherSubjects]
  )

  /**
   * Signature of the server baseline currently reflected in the checkboxes.
   *
   * Seeding "once per open" was not enough. Reopening the modal right after a
   * save paints from whatever is in the react-query cache, and if a refetch is
   * still in flight that is the PRE-save data — `isPending` is false for a
   * background refetch of cached data, so the old guard let it through and the
   * one-shot flag then blocked the correction when fresh data landed. That is
   * why the ticks looked wrong until a full page reload.
   *
   * Keying the seed on the data itself fixes both directions: paint
   * immediately from cache (no empty flash), then re-seed automatically when
   * the fetch resolves to something different — unless the user has already
   * started editing, in which case their in-progress selection is preserved.
   */
  const [seededSignature, setSeededSignature] = useState<string | null>(null)
  /**
   * State, not a ref: the reseed decision below is made during render, and a
   * ref read at render time is both a lint error and genuinely unreliable —
   * React would not re-render when it changed.
   */
  const [isDirty, setIsDirty] = useState(false)

  const baselineSignature = useMemo(
    () =>
      JSON.stringify({
        classes: [...originalClassIds].sort(),
        pairs: [...originalPairKeys].sort(),
      }),
    [originalClassIds, originalPairKeys]
  )

  /**
   * Seeding happens during render, not in an effect. React's documented
   * "adjusting state when a prop changes" pattern: it re-runs the component
   * immediately with the corrected state and never commits the intermediate
   * UI, so there is no flash of wrong checkboxes and no cascading-render lint
   * violation. The `seededSignature` guard is what makes it terminate.
   */
  const baselineIsLoaded = !loadingAssignedClasses && !loadingAssignedSubjects
  const shouldReseed =
    open &&
    baselineIsLoaded &&
    !isDirty &&
    seededSignature !== baselineSignature

  if (shouldReseed) {
    setSeededSignature(baselineSignature)
    setSelectedClassIds(originalClassIds)
    setSelectedPairs(new Set(originalPairKeys))
  }

  // Belt and braces: if the parent closes the modal without going through
  // handleClose, drop the seed so the next open re-reads the server baseline.
  if (!open && seededSignature !== null) {
    setSeededSignature(null)
    setIsDirty(false)
  }

  /**
   * Pull the authoritative assignments whenever the modal is opened. Both
   * queries carry a 60s staleTime, so without this an admin reopening the
   * modal inside that window — or after another admin changed something — was
   * shown cached ticks with no request made at all.
   */
  useEffect(() => {
    if (!open || !teacherId) return
    void refetchTeacherClasses()
    void refetchTeacherSubjects()
  }, [open, teacherId, refetchTeacherClasses, refetchTeacherSubjects])

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return q
      ? classes.filter((c) => c.ClsName.toLowerCase().includes(q))
      : classes
  }, [classes, search])

  /** classId → subject ids ticked under it. Each picker reads its own slice. */
  const subjectIdsByClass = useMemo(() => {
    const map = new Map<string, string[]>()
    for (const key of selectedPairs) {
      const [classId, subjectId] = key.split("::")
      const existing = map.get(classId)
      if (existing) existing.push(subjectId)
      else map.set(classId, [subjectId])
    }
    return map
  }, [selectedPairs])

  function toggleExpanded(id: string) {
    setExpandedClassIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  function toggleClass(id: string) {
    setIsDirty(true)
    const isSelected = selectedClassIds.includes(id)
    setSelectedClassIds((prev) =>
      isSelected ? prev.filter((x) => x !== id) : [...prev, id]
    )

    if (isSelected) {
      // Unchecking a class discards the subject ticks made under it.
      setSelectedPairs((prev) => {
        const next = new Set(prev)
        for (const key of prev) {
          if (key.startsWith(`${id}::`)) next.delete(key)
        }
        return next
      })
    } else {
      // Checking a class also expands it so its subjects are reachable.
      setExpandedClassIds((e) => (e.includes(id) ? e : [...e, id]))
    }
  }

  function togglePair(classId: string, subjectId: string) {
    setIsDirty(true)
    const key = pairKey(classId, subjectId)
    const isTicking = !selectedPairs.has(key)

    setSelectedPairs((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })

    /**
     * Teaching a subject IN a class implies being attached to that class, so
     * ticking a subject ticks its class too.
     *
     * This is the data-entry half of the bug behind "no live classes match":
     * the two checkboxes were fully independent, so an admin could save
     * English-in-Jss-2 with the Jss 2 box clear. That wrote a SubUserSubject
     * row and no SubUserClass row, and every consumer that reads classes — the
     * class→teachers list, the student portal, worksheets — then had no idea
     * the teacher was involved with Jss 2 at all.
     */
    if (isTicking) {
      setSelectedClassIds((prev) =>
        prev.includes(classId) ? prev : [...prev, classId]
      )
    }
  }

  // ── Diffs vs the server baseline ───────────────────────────────────────────
  const diff = useMemo(() => {
    const origClass = new Set(originalClassIds)
    const selClass = new Set(selectedClassIds)
    const origPairs = new Set(originalPairKeys)

    return {
      classesToAssign: selectedClassIds.filter((id) => !origClass.has(id)),
      classesToUnassign: originalClassIds.filter((id) => !selClass.has(id)),
      pairsToAssign: Array.from(selectedPairs).filter((k) => !origPairs.has(k)),
      pairsToUnassign: originalPairKeys.filter((k) => !selectedPairs.has(k)),
    }
  }, [originalClassIds, selectedClassIds, originalPairKeys, selectedPairs])

  const hasChanges =
    diff.classesToAssign.length > 0 ||
    diff.classesToUnassign.length > 0 ||
    diff.pairsToAssign.length > 0 ||
    diff.pairsToUnassign.length > 0

  /**
   * Every list that could be showing this teacher's assignments. Refreshed once
   * after a save instead of once per mutation — a four-mutation save used to
   * fire four rounds of invalidation, each re-requesting the same two lists.
   */
  const refreshAssignmentCaches = useCallback(async () => {
    await Promise.all([
      refetchTeacherClasses(),
      refetchTeacherSubjects(),
      // Other screens read the same assignments from the opposite direction
      // (class → teachers, subject → teachers) plus the teacher detail header.
      queryClient.invalidateQueries({ queryKey: [queryKeys.classTeachers] }),
      queryClient.invalidateQueries({ queryKey: [queryKeys.subjectTeachers] }),
      queryClient.invalidateQueries({ queryKey: [queryKeys.teacherDetails] }),
      // The teacher's own timetable/live-classes views are derived from these
      // assignments server-side, so they are stale the moment we change them.
      queryClient.invalidateQueries({ queryKey: [queryKeys.timetable] }),
      queryClient.invalidateQueries({
        queryKey: [queryKeys.timetableOverview],
      }),
    ])
  }, [queryClient, refetchTeacherClasses, refetchTeacherSubjects])

  async function handleSave() {
    if (!hasChanges) return

    try {
      // Assign newly-checked. Classes and subjects are independent writes, so
      // they go out together rather than one after the other.
      const assignments: Promise<unknown>[] = []

      if (diff.classesToAssign.length > 0) {
        assignments.push(
          assignTeacherToClassAsync({
            subUserId: teacherId,
            classIds: diff.classesToAssign,
            schoolId,
          })
        )
      }

      if (diff.pairsToAssign.length > 0) {
        const pairs = diff.pairsToAssign.map((key) => {
          const [classId, subjectId] = key.split("::")
          return { classId, subjectId }
        })
        assignments.push(
          assignTeacherSubjectsAsync({
            subUserId: teacherId,
            schoolId,
            // New backend reads assignments (class-scoped pairs).
            assignments: pairs,
            // Old backend reads subjectIds (fallback, ignored by new backend).
            subjectIds: [...new Set(pairs.map((p) => p.subjectId))],
          })
        )
      }

      // Remove unchecked (by assignment row id).
      const removals: Promise<unknown>[] = [
        ...diff.classesToUnassign
          .map((classId) => classRowIdByClassId.get(classId))
          .filter((rowId): rowId is string => Boolean(rowId))
          .map((rowId) => removeTeacherFromClassAsync(rowId)),
        ...diff.pairsToUnassign
          .map((key) => subjectRowIdByPair.get(key))
          .filter((rowId): rowId is string => Boolean(rowId))
          .map((rowId) => removeTeacherSubjectAsync(rowId)),
      ]

      // Assignments before removals: if a class is being unassigned while a
      // subject is being added under another, the add must not race the delete.
      await Promise.all(assignments)
      await Promise.all(removals)

      // Wait for the refreshed baseline BEFORE closing, so reopening the modal
      // reads post-save data from the cache rather than the pre-save snapshot.
      setIsRefreshing(true)
      await refreshAssignmentCaches()

      toast.success(`Assignments updated for ${teacherName}`)
      handleClose()
    } catch (err) {
      // The hooks run silent, so this is the only error surface. Keep the modal
      // open with the user's selection intact so they can retry, and re-read
      // the baseline in case some of the writes did land.
      toast.error(
        err instanceof Error && err.message
          ? err.message
          : "Some changes could not be saved. Please try again."
      )
      void refreshAssignmentCaches()
    } finally {
      setIsRefreshing(false)
    }
  }

  function handleClose() {
    setSelectedClassIds([])
    setSelectedPairs(new Set())
    setExpandedClassIds([])
    setSearch("")
    setSeededSignature(null)
    setIsDirty(false)
    onClose()
  }

  const isLoading =
    loadingClasses || loadingAssignedClasses || loadingAssignedSubjects

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Assign Classes &amp; Subjects</DialogTitle>
          <DialogDescription>
            Manage classes and subjects for <strong>{teacherName}</strong>. Check
            to assign, uncheck to remove. Expand a class to manage its subjects.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search classes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="size-5 animate-spin text-gray-400" />
            </div>
          ) : classes.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-400">
              No classes found for this school.
            </p>
          ) : (
            <div className="max-h-72 overflow-y-auto rounded-xl border border-gray-200">
              {filtered.length === 0 ? (
                <p className="px-4 py-4 text-sm text-gray-400">
                  No classes match your search.
                </p>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filtered.map((cls) => {
                    const selected = selectedClassIds.includes(cls.Id)
                    const expanded = expandedClassIds.includes(cls.Id)
                    const ticked =
                      subjectIdsByClass.get(cls.Id) ?? NO_SUBJECTS
                    return (
                      <div key={cls.Id}>
                        <div className="flex w-full items-center gap-1">
                          {/* Check / uncheck the class */}
                          <button
                            type="button"
                            onClick={() => toggleClass(cls.Id)}
                            className={`flex flex-1 items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-gray-50 ${
                              selected ? "bg-blue-50/40" : ""
                            }`}
                          >
                            {selected ? (
                              <CheckSquare className="size-4 shrink-0 text-blue-600" />
                            ) : (
                              <Square className="size-4 shrink-0 text-gray-300" />
                            )}
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {cls.ClsName}
                              </p>
                              <p className="text-xs text-gray-400">
                                {cls.CategoryName}
                              </p>
                            </div>
                            {ticked.length > 0 && (
                              <span className="text-[11px] font-medium text-blue-600">
                                {ticked.length} subject
                                {ticked.length !== 1 ? "s" : ""}
                              </span>
                            )}
                          </button>
                          {/* Expand to manage subjects (independent of the checkbox) */}
                          <button
                            type="button"
                            onClick={() => toggleExpanded(cls.Id)}
                            aria-label={expanded ? "Collapse subjects" : "Expand subjects"}
                            className="px-3 py-2.5 text-gray-400 hover:text-gray-600"
                          >
                            {expanded ? (
                              <ChevronDown className="size-4" />
                            ) : (
                              <ChevronRight className="size-4" />
                            )}
                          </button>
                        </div>

                        {expanded && (
                          <div className="border-t border-dashed border-gray-100 bg-gray-50/50">
                            <ClassSubjectPicker
                              classId={cls.Id}
                              schoolId={schoolId}
                              selectedSubjectIds={ticked}
                              onToggleSubject={(subjectId) =>
                                togglePair(cls.Id, subjectId)
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
              {diff.classesToAssign.length + diff.pairsToAssign.length > 0 && (
                <span className="text-emerald-600">
                  +{diff.classesToAssign.length} class
                  {diff.classesToAssign.length !== 1 ? "es" : ""}, +
                  {diff.pairsToAssign.length} subject
                  {diff.pairsToAssign.length !== 1 ? "s" : ""}
                </span>
              )}
              {(diff.classesToUnassign.length + diff.pairsToUnassign.length > 0) && (
                <span className="ml-2 text-rose-600">
                  −{diff.classesToUnassign.length} class
                  {diff.classesToUnassign.length !== 1 ? "es" : ""}, −
                  {diff.pairsToUnassign.length} subject
                  {diff.pairsToUnassign.length !== 1 ? "s" : ""}
                </span>
              )}
            </p>
          )}

          {legacyRowCount > 0 && (
            <p className="text-[11px] text-amber-600">
              {legacyRowCount} older assignment
              {legacyRowCount !== 1 ? "s" : ""} on this teacher have no class
              recorded and aren&apos;t shown.
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
