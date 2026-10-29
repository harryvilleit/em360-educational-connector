// WordPress version: server-side teacher search with paging.
import { useEffect, useState, useMemo } from "react"
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
  CheckSquare,
  Loader2,
  Search,
  Square,
  User,
  Users,
  X,
} from "lucide-react"
import { useExamTeachers } from "../../../../../exams/hooks"
import {
  useGetClassTeachers,
  useAssignTeacherToClass,
  useRemoveTeacherFromClass,
} from "@/hooks/examAndRecords"

interface AssignTeacherToClassModalProps {
  open: boolean
  onClose: () => void
  classId: string
  className: string
  schoolId: string
}

export default function AssignTeacherToClassModal({
  open,
  onClose,
  classId,
  className,
  schoolId,
}: AssignTeacherToClassModalProps) {
  // Searched and paged on the server, 20 teachers at a time (the WordPress gateway caps page sizes).
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const {
    teachers,
    isLoading: loadingTeachers,
    pagination,
  } = useExamTeachers(schoolId, search, page, 20)
  const {
    classTeachers,
    isLoading: loadingAssigned,
    refetch: refetchClassTeachers,
  } = useGetClassTeachers({
    classId,
    schoolId,
  })
  const { assignTeacherToClassAsync, isPending: assigning } =
    useAssignTeacherToClass()
  const { removeTeacherFromClass, isPending: removing } =
    useRemoveTeacherFromClass()

  const [selectedIds, setSelectedIds] = useState<string[]>([])

  /**
   * Re-read the assigned list every time the modal opens. The query carries a
   * 60s staleTime, so reopening inside that window previously rendered from
   * cache without issuing a request — showing assignments as they were before
   * the last save, or before another admin's change.
   */
  useEffect(() => {
    if (!open || !classId) return
    void refetchClassTeachers()
  }, [open, classId, refetchClassTeachers])

  // IDs already assigned to this class (SubUserClass stores the
  // school-scoped productUserSubUserId in its subUserId field)
  const assignedProductUserSubUserIds = useMemo(
    () => new Set(classTeachers.map((ct) => ct.subUserId)),
    [classTeachers]
  )

  const isLoading = loadingTeachers || loadingAssigned

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return teachers.filter((t) => {
      if (!q) return true
      const name = `${t.firstName} ${t.lastName}`.toLowerCase()
      return name.includes(q) || (t.email ?? "").toLowerCase().includes(q)
    })
  }, [teachers, search])

  const unassignedFiltered = useMemo(
    () =>
      filtered.filter(
        (t) => !assignedProductUserSubUserIds.has(t.productUserSubUserId)
      ),
    [filtered, assignedProductUserSubUserIds]
  )
  const allFilteredSelected =
    unassignedFiltered.length > 0 &&
    unassignedFiltered.every((t) => selectedIds.includes(t.productUserSubUserId))

  function toggleTeacher(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    )
  }

  function toggleSelectAll() {
    if (allFilteredSelected) {
      setSelectedIds((prev) =>
        prev.filter(
          (id) => !unassignedFiltered.some((t) => t.productUserSubUserId === id)
        )
      )
    } else {
      const newIds = unassignedFiltered.map((t) => t.productUserSubUserId)
      setSelectedIds((prev) => Array.from(new Set([...prev, ...newIds])))
    }
  }

  async function handleAssign() {
    if (selectedIds.length === 0) return
    // One API call per teacher (API assigns one teacher → many classes)
    await Promise.all(
      selectedIds.map((subUserId) =>
        assignTeacherToClassAsync({ subUserId, classIds: [classId], schoolId })
      )
    )
    setSelectedIds([])
  }

  function handleClose() {
    setSearch("")
    setSelectedIds([])
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Assign Teachers</DialogTitle>
          <DialogDescription>
            Select one or more teachers to assign to{" "}
            <span className="font-semibold text-gray-900">{className}</span>
          </DialogDescription>
        </DialogHeader>

        {/* Currently assigned */}
        {classTeachers.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
              Currently Assigned
            </p>
            <div className="flex flex-wrap gap-2">
              {classTeachers.map((ct) => (
                <span
                  key={ct.id}
                  className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700"
                >
                  <User className="size-3" />
                  {ct.subUserName}
                  <button
                    type="button"
                    disabled={removing}
                    onClick={() => removeTeacherFromClass(ct.id)}
                    className="ml-0.5 rounded-full text-green-700/60 hover:text-green-900 disabled:opacity-50"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search teachers…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="border-gray-200 pl-9"
          />
        </div>

        {/* List */}
        <div className="flex max-h-72 flex-col overflow-y-auto rounded-xl border border-gray-100">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Loading teachers…
            </div>
          ) : teachers.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
              <Users className="size-8 text-gray-300" />
              <p className="text-sm text-muted-foreground">
                No teachers found.
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No teachers match "{search}"
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

              {/* Teacher rows */}
              {filtered.map((teacher) => {
                const alreadyAssigned = assignedProductUserSubUserIds.has(
                  teacher.productUserSubUserId
                )
                const selected = selectedIds.includes(
                  teacher.productUserSubUserId
                )

                return (
                  <button
                    key={teacher.productUserSubUserId}
                    type="button"
                    disabled={alreadyAssigned}
                    onClick={() =>
                      !alreadyAssigned &&
                      toggleTeacher(teacher.productUserSubUserId)
                    }
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
                        <User className="size-3.5 text-blue-600" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">
                          {teacher.firstName} {teacher.lastName}
                        </span>
                        {teacher.email && (
                          <span className="text-xs text-muted-foreground">
                            {teacher.email}
                          </span>
                        )}
                      </div>
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
            <span className="font-semibold text-blue-600">
              {selectedIds.length}
            </span>{" "}
            teacher{selectedIds.length > 1 ? "s" : ""} selected
          </p>
        )}

        <div className="flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={page <= 1 || loadingTeachers}
            onClick={() => setPage(page - 1)}
          >
            Previous teachers
          </Button>
          <span>
            Page {page} of {pagination?.totalPages || 1}
          </span>
          <Button
            type="button"
            variant="outline"
            disabled={page >= (pagination?.totalPages || 1) || loadingTeachers}
            onClick={() => setPage(page + 1)}
          >
            Next teachers
          </Button>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={assigning}>
            Close
          </Button>
          <Button
            onClick={handleAssign}
            disabled={assigning || selectedIds.length === 0}
            className="bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {assigning ? (
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
