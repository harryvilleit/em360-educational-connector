import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useGetSchoolStudents } from "@/hooks/studentPortal"
import { useAssignGuardiansToStudent } from "@/hooks/guardian"
import { useSchoolId } from "@/contexts/SchoolContext"
import { useDebouncedValue } from "@/hooks/useDebouncedValue"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { queryKeys } from "@/utils/queryKeys"
export function LinkChildDialog({
  guardianId,
  linkedIds,
  onClose,
}: {
  guardianId: string
  linkedIds: string[]
  onClose: () => void
}) {
  const schoolId = useSchoolId(),
    client = useQueryClient()
  const [search, setSearch] = useState(""),
    [selected, setSelected] = useState("")
  const term = useDebouncedValue(search, 300)
  const query = useGetSchoolStudents({
    schoolId,
    pageNumber: 1,
    pageSize: 20,
    search: term || undefined,
  })
  const mutation = useAssignGuardiansToStudent()
  async function save() {
    try {
      await mutation.assignGuardiansToStudentAsync({
        studentId: selected,
        guardianIds: [guardianId],
      })
      await Promise.all([
        client.invalidateQueries({ queryKey: [queryKeys.guardianDetails] }),
        client.invalidateQueries({ queryKey: [queryKeys.schoolParents] }),
        client.invalidateQueries({ queryKey: ["parent-overview"] }),
      ])
      onClose()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Unable to link child.")
    }
  }
  return (
    <Dialog open onOpenChange={(v) => !v && !mutation.isPending && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Link a child</DialogTitle>
          <DialogDescription>
            Select an existing student in this school. Existing guardians remain
            linked.
          </DialogDescription>
        </DialogHeader>
        <Input
          aria-label="Search students"
          placeholder="Search students by name or student ID"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setSelected("")
          }}
        />
        {query.isLoading ? (
          <p>Loading students…</p>
        ) : query.isError ? (
          <p role="alert">
            Unable to load students.{" "}
            <button onClick={() => void query.refetch()}>Try again</button>
          </p>
        ) : (
          <div className="max-h-64 space-y-2 overflow-auto">
            {query.students.map((s) => (
              <label
                key={s.studentId}
                className="flex gap-3 rounded-lg border p-3"
              >
                <input
                  type="radio"
                  name="child"
                  value={s.studentId}
                  checked={selected === s.studentId}
                  disabled={linkedIds.includes(s.studentId)}
                  onChange={() => setSelected(s.studentId)}
                />
                <span>
                  {`${s.firstname} ${s.lastname}`} · {s.studentGivenId}
                  {linkedIds.includes(s.studentId) && " (already linked)"}
                </span>
              </label>
            ))}
            {!query.students.length && <p>No matching students.</p>}
          </div>
        )}
        <p className="text-xs text-slate-500">
          Showing up to 20 matches. Refine your search to find a student.
        </p>
        <Button
          disabled={!selected || mutation.isPending}
          onClick={() => void save()}
        >
          {mutation.isPending ? "Linking…" : "Link child"}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
