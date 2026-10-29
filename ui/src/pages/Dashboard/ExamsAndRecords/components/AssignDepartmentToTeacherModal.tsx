import { useState, useMemo } from "react"
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
import { CheckCircle2, Circle, Loader2, Search } from "lucide-react"
import {
  useGetDepartmentsBySchool,
  useAssignTeacherDepartment,
  useGetTeacherDepartments,
} from "@/hooks/examAndRecords"

interface AssignDepartmentToTeacherModalProps {
  open: boolean
  onClose: () => void
  teacherId: string
  teacherName: string
  schoolId: string
}

export default function AssignDepartmentToTeacherModal({
  open,
  onClose,
  teacherId,
  teacherName,
  schoolId,
}: AssignDepartmentToTeacherModalProps) {
  const { departments, isLoading: loadingDepts } = useGetDepartmentsBySchool(schoolId)
  const { teacherDepartments, isLoading: loadingAssigned } = useGetTeacherDepartments(teacherId)
  const { assignTeacherDepartmentAsync, isPending: saving } = useAssignTeacherDepartment()

  const [search, setSearch] = useState("")
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const assignedDeptIds = useMemo(
    () => new Set(teacherDepartments.map((td) => td.departmentId)),
    [teacherDepartments]
  )

  const unassigned = useMemo(
    () => departments.filter((d) => !assignedDeptIds.has(d.Id)),
    [departments, assignedDeptIds]
  )

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return q ? unassigned.filter((d) => d.Name.toLowerCase().includes(q)) : unassigned
  }, [unassigned, search])

  async function handleSave() {
    if (!selectedId) return
    await assignTeacherDepartmentAsync({ subUserId: teacherId, departmentId: selectedId })
    setSelectedId(null)
    setSearch("")
    onClose()
  }

  function handleClose() {
    setSelectedId(null)
    setSearch("")
    onClose()
  }

  const isLoading = loadingDepts || loadingAssigned

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Department</DialogTitle>
          <DialogDescription>
            Select a department to assign to <strong>{teacherName}</strong>.
            Already-assigned departments are hidden.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search departments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="size-5 animate-spin text-gray-400" />
            </div>
          ) : unassigned.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-400">
              {departments.length === 0
                ? "No departments have been created for this school yet."
                : "All departments are already assigned to this teacher."}
            </p>
          ) : (
            <div className="overflow-hidden rounded-xl border border-gray-200">
              <div className="max-h-60 divide-y divide-gray-100 overflow-y-auto">
                {filtered.length === 0 ? (
                  <p className="px-4 py-4 text-sm text-gray-400">No departments found.</p>
                ) : (
                  filtered.map((dept) => {
                    const selected = selectedId === dept.Id
                    return (
                      <button
                        key={dept.Id}
                        type="button"
                        onClick={() => setSelectedId(selected ? null : dept.Id)}
                        className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 ${selected ? "bg-blue-50/40" : ""}`}
                      >
                        {selected ? (
                          <CheckCircle2 className="size-4 shrink-0 text-blue-600" />
                        ) : (
                          <Circle className="size-4 shrink-0 text-gray-300" />
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900">{dept.Name}</p>
                          {dept.Description && (
                            <p className="text-xs text-gray-400">{dept.Description}</p>
                          )}
                        </div>
                      </button>
                    )
                  })
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-3 sm:space-x-0">
          <Button variant="outline" onClick={handleClose} disabled={saving} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !selectedId}
            className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
          >
            {saving ? (
              <><Loader2 className="size-4 animate-spin" /> Saving…</>
            ) : (
              "Assign Department"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
