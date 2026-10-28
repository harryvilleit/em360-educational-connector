import { toast } from "sonner"
import { useMemo, useState } from "react"
import { Check, Loader2, Search, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useDebouncedValue } from "@/hooks/useDebouncedValue"
import {
  useGetSchoolParents,
  useAssignGuardiansToStudent,
} from "@/hooks/guardian"
import { useSchoolId } from "@/contexts/SchoolContext"
import type { StudentListRow } from "@/utils/studentAdapter"

interface AssignGuardianModalProps {
  student: StudentListRow
  onClose: () => void
}

export function AssignGuardianModal({
  student,
  onClose,
}: AssignGuardianModalProps) {
  const schoolId = useSchoolId()
  const [query, setQuery] = useState("")
  const debouncedQuery = useDebouncedValue(query, 300)
  const { parents: guardians, isLoading: guardiansLoading } =
    useGetSchoolParents({
      schoolId,
      pageNumber: 1,
      pageSize: 20,
      search: debouncedQuery.trim(),
    })

  const existingGuardianIds = useMemo(
    () => new Set(student.guardians.map((g) => g.id)),
    [student.guardians],
  )
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const { assignGuardiansToStudent, isPending } = useAssignGuardiansToStudent({
    onSuccess: onClose,
    onError: (error) =>
      toast.error(error.message || "Unable to assign guardians."),
  })

  function toggle(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function handleSave() {
    if (selectedIds.size === 0) return
    // Existing guardians are re-sent alongside the new picks so this stays
    // additive even if the backend treats guardianIds as the full set
    // rather than a delta.
    assignGuardiansToStudent({
      studentId: student.id,
      guardianIds: [...existingGuardianIds, ...selectedIds],
    })
  }

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-semibold">
            <UserPlus className="size-4 text-blue-600" />
            Assign Another Guardian to Student
          </DialogTitle>
        </DialogHeader>

        <p className="-mt-2 text-sm text-muted-foreground">
          Link one or more parents/guardians to{" "}
          <span className="font-medium text-gray-700">
            {student.firstName} {student.lastName}
          </span>
          .
        </p>

        <div className="relative">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="email"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search parent by email address"
            className="rounded-lg pl-9"
          />
        </div>

        <div className="max-h-72 space-y-1 overflow-y-auto rounded-lg border border-gray-100 p-1">
          {guardiansLoading ? (
            <p className="py-6 text-center text-sm text-gray-400">
              Loading guardians...
            </p>
          ) : guardians.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-400">
              No guardians found.
            </p>
          ) : (
            guardians.map((g) => {
              const alreadyLinked = existingGuardianIds.has(g.guardianId)
              const checked = alreadyLinked || selectedIds.has(g.guardianId)
              return (
                <label
                  key={g.guardianId}
                  className={`flex items-center justify-between gap-3 rounded-lg px-3 py-2 ${
                    alreadyLinked
                      ? "opacity-60"
                      : "cursor-pointer hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={alreadyLinked}
                      onChange={() => toggle(g.guardianId)}
                      className="size-4 rounded border-gray-300"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {g.fullName}
                      </p>
                      <p className="text-xs text-gray-400">{g.email}</p>
                    </div>
                  </div>
                  {alreadyLinked && (
                    <span className="flex shrink-0 items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-medium text-green-700">
                      <Check className="size-3" />
                      Linked
                    </span>
                  )}
                </label>
              )
            })
          )}
        </div>

        <div className="flex gap-3 pt-1">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 rounded-xl"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isPending || selectedIds.size === 0}
            className="flex-1 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
          >
            {isPending ? <Loader2 className="size-4 animate-spin" /> : "Assign"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
