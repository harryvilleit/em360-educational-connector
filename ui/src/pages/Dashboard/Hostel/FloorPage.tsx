import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSchoolId } from "@/contexts/SchoolContext"
import { useGetAllFloors, useDeleteFloor } from "@/hooks/floor"
import { PageHeader } from "@/components/general/PageHeader"
import type { FloorItemI } from "@/types/floor"
import { FloorModal } from "./components/FloorModal"
import { FloorTable } from "./components/FloorTable"
import { ConfirmDialog } from "./components/ConfirmDialog"

export default function FloorPage() {
  const schoolId = useSchoolId()
  const { floors, isLoading } = useGetAllFloors(schoolId)

  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<FloorItemI | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<FloorItemI | null>(null)

  const { deleteFloor } = useDeleteFloor({
    onSuccess: () => setDeleteTarget(null),
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Floors"
        description="Manage the floors used when creating hostel rooms"
        actions={
          <Button variant="primary" onClick={() => setCreateOpen(true)}>
            <Plus className="size-3.5" />
            Create Floor
          </Button>
        }
      />

      <div className="rounded-xl border border-gray-200 bg-white ">
        <FloorTable
          floors={floors}
          isLoading={isLoading}
          onCreateFloor={() => setCreateOpen(true)}
          onEdit={setEditTarget}
          onDelete={setDeleteTarget}
        />
      </div>

      <FloorModal
        open={createOpen || !!editTarget}
        onClose={() => {
          setCreateOpen(false)
          setEditTarget(null)
        }}
        floor={editTarget}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Delete floor?"
        description={`This will permanently delete "${deleteTarget?.name}". This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={() => deleteTarget && deleteFloor(deleteTarget.id)}
      />
    </div>
  )
}
