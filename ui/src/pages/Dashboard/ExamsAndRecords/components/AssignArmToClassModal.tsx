import { useState } from "react"
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
import { Badge } from "@/components/ui/badge"
import { Loader2, Search } from "lucide-react"
import {
  useClassArmAssignments,
  useUpdateClassArms,
} from "@/hooks/useClassArmAssignments"
import type { ClassArmAssignmentDto } from "@/api/classArmAssignments.api"

interface AssignArmToClassModalProps {
  open: boolean
  onClose: () => void
  classId: string
  className: string
  schoolId: string
}

export default function AssignArmToClassModal(
  props: AssignArmToClassModalProps
) {
  return props.open ? (
    <ManageClassArms key={`${props.schoolId}:${props.classId}`} {...props} />
  ) : null
}

function ManageClassArms({
  onClose,
  classId,
  className,
  schoolId,
}: AssignArmToClassModalProps) {
  const query = useClassArmAssignments(schoolId, classId)
  const mutation = useUpdateClassArms()
  const close = () => {
    if (!mutation.isPending) onClose()
  }
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) close()
      }}
    >
      <DialogContent
        className="sm:max-w-lg"
        onEscapeKeyDown={(event) => {
          if (mutation.isPending) event.preventDefault()
        }}
        onInteractOutside={(event) => {
          if (mutation.isPending) event.preventDefault()
        }}
      >
        <DialogHeader>
          <DialogTitle>Manage Arms</DialogTitle>
          <DialogDescription>
            Check or uncheck arms for{" "}
            <span className="font-semibold text-gray-900">{className}</span>.
          </DialogDescription>
        </DialogHeader>
        {query.isPending || query.isFetching ? (
          <div
            role="status"
            className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground"
          >
            <Loader2 className="size-4 animate-spin" />
            Loading arms...
          </div>
        ) : query.isError ? (
          <div role="alert">
            <p>{query.error.message}</p>
            <Button variant="outline" onClick={() => void query.refetch()}>
              Try again
            </Button>
          </div>
        ) : query.data ? (
          <ArmSelection
            assignments={query.data}
            saving={mutation.isPending}
            error={mutation.error?.message}
            onClose={close}
            onSave={async (armIds) => {
              try {
                await mutation.mutateAsync({ schoolId, classId, armIds })
                onClose()
              } catch {
                // The mutation error is displayed in ArmSelection; keep the dialog open.
              }
            }}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

function ArmSelection({
  assignments,
  saving,
  error,
  onClose,
  onSave,
}: {
  assignments: ClassArmAssignmentDto[]
  saving: boolean
  error?: string
  onClose: () => void
  onSave: (armIds: string[]) => Promise<void>
}) {
  const [search, setSearch] = useState("")
  const [selectedIds, setSelectedIds] = useState(() =>
    assignments.filter((arm) => arm.isAssigned).map((arm) => arm.armId)
  )
  const initialIds = assignments
    .filter((arm) => arm.isAssigned)
    .map((arm) => arm.armId)
  const dirty =
    selectedIds.length !== initialIds.length ||
    initialIds.some((id) => !selectedIds.includes(id))
  const filtered = assignments.filter((arm) =>
    arm.armName.toLowerCase().includes(search.trim().toLowerCase())
  )
  const allSelected =
    filtered.length > 0 &&
    filtered.every((arm) => selectedIds.includes(arm.armId))
  const protectedRemovals = assignments.filter(
    (arm) =>
      arm.isAssigned &&
      arm.activeStudentCount > 0 &&
      !selectedIds.includes(arm.armId)
  )

  return (
    <>
      <div className="relative">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
        <Input
          aria-label="Search arms"
          placeholder="Search arms..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="border-gray-200 pl-9"
        />
      </div>
      <div className="flex max-h-72 flex-col overflow-y-auto rounded-xl border border-gray-100">
        {filtered.length > 0 && (
          <button
            type="button"
            disabled={saving}
            onClick={() =>
              setSelectedIds((previous) =>
                allSelected
                  ? previous.filter(
                      (id) => !filtered.some((arm) => arm.armId === id)
                    )
                  : [
                      ...new Set([
                        ...previous,
                        ...filtered.map((arm) => arm.armId),
                      ]),
                    ]
              )
            }
            className="flex items-center gap-3 border-b border-gray-100 bg-gray-50 px-4 py-2.5 text-left text-xs font-semibold text-gray-600 hover:bg-gray-100"
          >
            {allSelected ? "Deselect all" : "Select all"}
            {search.trim() ? " matching arms" : ""}
          </button>
        )}
        {assignments.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            No arms found. Create arms first.
          </p>
        ) : filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No arms match your search.
          </p>
        ) : (
          filtered.map((arm) => (
            <label
              key={arm.armId}
              className="flex cursor-pointer items-center gap-3 px-4 py-3 text-left hover:bg-gray-50"
            >
              <input
                type="checkbox"
                checked={selectedIds.includes(arm.armId)}
                disabled={saving}
                onChange={() =>
                  setSelectedIds((previous) =>
                    previous.includes(arm.armId)
                      ? previous.filter((id) => id !== arm.armId)
                      : [...previous, arm.armId]
                  )
                }
                className="size-4 accent-blue-600"
              />
              <span className="min-w-0 flex-1">
                <span className="text-sm font-medium text-gray-900">
                  {arm.armName}
                </span>
                {arm.description && (
                  <span className="block text-xs text-muted-foreground">
                    {arm.description}
                  </span>
                )}
              </span>
              <Badge variant="outline">
                {arm.activeStudentCount} active students
              </Badge>
            </label>
          ))
        )}
      </div>
      {protectedRemovals.length > 0 && (
        <div role="status" className="text-sm text-amber-700">
          {protectedRemovals.map((arm) => (
            <p key={arm.armId}>
              {arm.armName} has {arm.activeStudentCount} active students.
              Transfer them through Promotion / Arm Transfer before removing
              this arm; otherwise the server will block removal.
            </p>
          ))}
        </div>
      )}
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
      <p className="text-xs text-muted-foreground">
        {selectedIds.length} arms selected
      </p>
      <DialogFooter>
        <Button variant="outline" disabled={saving} onClick={onClose}>
          Cancel
        </Button>
        <Button
          disabled={saving || !dirty}
          onClick={() => void onSave(selectedIds)}
        >
          {saving && <Loader2 className="size-4 animate-spin" />}
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </DialogFooter>
    </>
  )
}
