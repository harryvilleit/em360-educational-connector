import { useState } from "react"
import { useParams } from "react-router"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSchoolId } from "@/contexts/SchoolContext"
import { useGetAllHostels, useDeleteHostel } from "@/hooks/hostel"
import { DashboardRoutes } from "@/routes"
import { PageHeader } from "@/components/general/PageHeader"
import { hostelTypeToGender } from "@/schema/hostelType.schema"
import type { HostelItemI } from "@/api/hostel.api/types"
import { HostelModal } from "./components/HostelModal"
import { HostelTable } from "./components/HostelTable"
import { ConfirmDialog } from "./components/ConfirmDialog"

export default function HostelTypePage() {
  const { productId } = useParams<{ productId: string }>()
  const p = productId ?? ""
  const schoolId = useSchoolId()

  const { hostels, isLoading } = useGetAllHostels({ schoolId, pageSize: 100 })

  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<HostelItemI | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<HostelItemI | null>(null)

  const { deleteHostel, isPending: isDeleting } = useDeleteHostel({
    onSuccess: () => setDeleteTarget(null),
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hostel Type"
        description="Manage Boys and Girls hostel types"
        actions={
          <Button
            variant="primary"
            
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="size-3.5" />
            Create Hostel Type
          </Button>
        }
      />

      <div className="rounded-xl border border-gray-200 bg-white ">
        <HostelTable
          hostels={hostels}
          isLoading={isLoading}
          onCreateHostel={() => setCreateOpen(true)}
          onEdit={setEditTarget}
          onDelete={setDeleteTarget}
          toRooms={(hostel) =>
            DashboardRoutes.toHostelRooms(p) +
            `?gender=${hostelTypeToGender(hostel.categoryName)}`
          }
          toCreateRoom={(hostel) =>
            DashboardRoutes.toHostelCreateRoom(p) +
            `?gender=${hostelTypeToGender(hostel.categoryName)}`
          }
        />
      </div>

      <HostelModal
        open={createOpen || !!editTarget}
        onClose={() => {
          setCreateOpen(false)
          setEditTarget(null)
        }}
        hostel={editTarget}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Delete hostel type?"
        description={`This will permanently delete "${deleteTarget?.name}". This action cannot be undone.`}
        confirmLabel={isDeleting ? "Deleting…" : "Delete"}
        onConfirm={() => deleteTarget && deleteHostel(deleteTarget.id)}
      />
    </div>
  )
}
