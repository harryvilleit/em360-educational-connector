import { useState, useMemo } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CheckSquare, GraduationCap, Loader2, Search, Square } from "lucide-react"
import {
  useGetAllClasses,
  useGetClassesBySubject,
  useAssignClassSubject,
} from "@/hooks/examAndRecords"
import { SUBJECT_REQUIREMENT } from "@/utils/subjectRequirement.utils"

interface AssignClassesToSubjectModalProps {
  open: boolean
  onClose: () => void
  subjectId: string
  subjectName: string
  schoolId: string
}

export default function AssignClassesToSubjectModal({
  open,
  onClose,
  subjectId,
  subjectName,
  schoolId,
}: AssignClassesToSubjectModalProps) {
  const { classes, isLoading: loadingClasses } = useGetAllClasses({
    schoolId,
    pageSize: 200,
  })
  const { subjectClasses, isLoading: loadingAssigned } = useGetClassesBySubject({
    subjectId,
    schoolId,
  })
  const { assignClassSubjectAsync, isPending: saving } = useAssignClassSubject()

  const [search, setSearch] = useState("")
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [requirement, setRequirement] = useState<number>(SUBJECT_REQUIREMENT.Mandatory)

  // IDs already assigned to this subject
  const assignedClassIds = useMemo(
    () => new Set(subjectClasses.map((cs) => cs.classId)),
    [subjectClasses]
  )

  const isLoading = loadingClasses || loadingAssigned

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return classes.filter((c) => !q || c.ClsName.toLowerCase().includes(q))
  }, [classes, search])

  const unassignedFiltered = useMemo(
    () => filtered.filter((c) => !assignedClassIds.has(c.Id)),
    [filtered, assignedClassIds]
  )
  const allFilteredSelected =
    unassignedFiltered.length > 0 &&
    unassignedFiltered.every((c) => selectedIds.includes(c.Id))

  function toggleClass(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    )
  }

  function toggleSelectAll() {
    if (allFilteredSelected) {
      setSelectedIds((prev) =>
        prev.filter((id) => !unassignedFiltered.some((c) => c.Id === id))
      )
    } else {
      const newIds = unassignedFiltered.map((c) => c.Id)
      setSelectedIds((prev) => Array.from(new Set([...prev, ...newIds])))
    }
  }

  async function handleAssign() {
    if (selectedIds.length === 0) return
    await assignClassSubjectAsync({
      classIds: selectedIds,
      subjectId,
      schoolId,
      requirement,
    })
    handleClose()
  }

  function handleClose() {
    setSearch("")
    setSelectedIds([])
    setRequirement(SUBJECT_REQUIREMENT.Mandatory)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Assign Classes</DialogTitle>
          <DialogDescription>
            Select classes to assign{" "}
            <span className="font-semibold text-gray-900">{subjectName}</span>{" "}
            to
          </DialogDescription>
        </DialogHeader>

        {/* Requirement type — applies to every class selected below */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-500">
            Requirement Type
          </label>
          <Select
            value={String(requirement)}
            onValueChange={(v) => setRequirement(Number(v))}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={String(SUBJECT_REQUIREMENT.Mandatory)}>
                Mandatory — compulsory for all enrolled students
              </SelectItem>
              <SelectItem value={String(SUBJECT_REQUIREMENT.Optional)}>
                Optional — elective / subscription-based
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search classes…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-gray-200 pl-9"
          />
        </div>

        {/* List */}
        <div className="flex max-h-72 flex-col overflow-y-auto rounded-xl border border-gray-100">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Loading classes…
            </div>
          ) : classes.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
              <GraduationCap className="size-8 text-gray-300" />
              <p className="text-sm text-muted-foreground">
                No classes found. Create classes first.
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No classes match "{search}"
            </p>
          ) : (
            <>
              {/* Select-all row (only for unassigned) */}
              {unassignedFiltered.length > 0 && (
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="flex items-center gap-3 border-b border-gray-100 bg-gray-50 px-4 py-2.5 text-left hover:bg-gray-100"
                >
                  {allFilteredSelected ? (
                    <CheckSquare className="size-4 shrink-0 text-blue-600" />
                  ) : (
                    <Square className="size-4 shrink-0 text-gray-400" />
                  )}
                  <span className="text-xs font-semibold text-gray-600">
                    {allFilteredSelected ? "Deselect all" : "Select all"}
                  </span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {unassignedFiltered.length} available
                  </span>
                </button>
              )}

              {/* Class rows */}
              {filtered.map((cls) => {
                const alreadyAssigned = assignedClassIds.has(cls.Id)
                const selected = selectedIds.includes(cls.Id)

                return (
                  <button
                    key={cls.Id}
                    type="button"
                    disabled={alreadyAssigned}
                    onClick={() => !alreadyAssigned && toggleClass(cls.Id)}
                    className={`flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                      alreadyAssigned
                        ? "cursor-not-allowed opacity-60"
                        : selected
                          ? "bg-blue-50/50 hover:bg-blue-50"
                          : "hover:bg-gray-50"
                    }`}
                  >
                    {alreadyAssigned ? (
                      <CheckSquare className="size-4 shrink-0 text-green-500" />
                    ) : selected ? (
                      <CheckSquare className="size-4 shrink-0 text-blue-600" />
                    ) : (
                      <Square className="size-4 shrink-0 text-gray-300" />
                    )}
                    <div className="flex flex-1 items-center gap-2">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-100">
                        <GraduationCap className="size-3.5 text-blue-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {cls.ClsName}
                      </span>
                    </div>
                    {alreadyAssigned && (
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">
                        Assigned
                      </span>
                    )}
                  </button>
                )
              })}
            </>
          )}
        </div>

        {selectedIds.length > 0 && (
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-blue-600">{selectedIds.length}</span>{" "}
            class{selectedIds.length > 1 ? "es" : ""} selected
          </p>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={saving || selectedIds.length === 0}
            className="bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <Loader2 className="size-4 animate-spin" />
                Assigning…
              </span>
            ) : (
              `Assign${selectedIds.length > 0 ? ` (${selectedIds.length})` : ""}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
