import {
  BedDouble,
  Edit2,
  Eye,
  MoreVertical,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EmptyState } from "@/components/ui/empty-state"
import { DataTable, type DataTableColumn } from "@/components/ui/data-table"
import { useState } from "react"
import { useDeleteBedSpace } from "@/hooks/hostel"
import type { BedSpaceItemI } from "@/api/hostel.api/types"
import { isBedSpaceOccupied } from "@/schema/bedSpace.schema"
import { StatusBadge } from "./StatusBadge"
import { ConfirmDialog } from "./ConfirmDialog"
import { BedSpaceModal } from "./BedSpaceModal"

// ── Detail modal ──────────────────────────────────────────────────────────────

function BedSpaceDetailModal({
  bed,
  onClose,
}: {
  bed: BedSpaceItemI
  onClose: () => void
}) {
  const occupied = isBedSpaceOccupied(bed.status)

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Bed Space Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Bed label badge */}
          <div className="flex items-center gap-3">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-xl text-sm font-bold ${
                occupied
                  ? "bg-blue-100 text-blue-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {bed.bedLabel.replace("Bed ", "")}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{bed.bedLabel}</p>
              <StatusBadge variant={occupied ? "info" : "success"} dot>
                {occupied ? "Occupied" : "Available"}
              </StatusBadge>
            </div>
          </div>

          {/* Info rows */}
          <div className="space-y-2 rounded-xl bg-gray-50 p-4 text-sm">
            <Row
              label="Room"
              value={
                bed.roomNumber
                  ? `${bed.roomNumber}${bed.roomName ? ` — ${bed.roomName}` : ""}`
                  : "—"
              }
            />
            <Row label="Hostel" value={bed.hostelName ?? "—"} />
            {occupied && (
              <>
                <div className="my-1 border-t border-gray-200" />
                <Row label="Student" value={bed.studentName ?? "—"} />
                <Row label="Admission #" value={bed.admissionNumber ?? "—"} />
              </>
            )}
            <div className="my-1 border-t border-gray-200" />
            <Row
              label="Created"
              value={new Date(bed.dateCreated).toLocaleDateString("en-NG")}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="shrink-0 text-gray-400">{label}</span>
      <span className="text-right font-medium text-gray-800">{value}</span>
    </div>
  )
}

// ── Table ─────────────────────────────────────────────────────────────────────

interface BedSpaceTableProps {
  bedSpaces: BedSpaceItemI[]
  isLoading?: boolean
  emptyDescription: string
  onCreateBedSpace?: () => void
}

export function BedSpaceTable({
  bedSpaces,
  isLoading,
  emptyDescription,
  onCreateBedSpace,
}: BedSpaceTableProps) {
  const { deleteBedSpace } = useDeleteBedSpace()

  const [viewBed, setViewBed] = useState<BedSpaceItemI | null>(null)
  const [editBed, setEditBed] = useState<BedSpaceItemI | null>(null)
  const [deleteBed, setDeleteBed] = useState<BedSpaceItemI | null>(null)

  const columns: DataTableColumn<BedSpaceItemI>[] = [
    {
      key: "bedSpace",
      header: "Bed Space",
      render: (bed) => {
        const occupied = isBedSpaceOccupied(bed.status)
        return (
          <div className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold ${
                occupied
                  ? "bg-blue-100 text-blue-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {bed.bedLabel.replace("Bed ", "")}
            </div>
            <span className="font-medium text-gray-800">{bed.bedLabel}</span>
          </div>
        )
      },
    },
    {
      key: "room",
      header: "Room",
      cellClassName: "font-medium text-gray-700",
      render: (bed) =>
        bed.roomNumber
          ? `${bed.roomNumber}${bed.roomName ? ` – ${bed.roomName}` : ""}`
          : "—",
    },
    {
      key: "hostel",
      header: "Hostel",
      render: (bed) =>
        bed.hostelName ? (
          <StatusBadge variant="neutral">{bed.hostelName}</StatusBadge>
        ) : (
          <span className="text-gray-400">—</span>
        ),
    },
    {
      key: "status",
      header: "Status",
      render: (bed) => {
        const occupied = isBedSpaceOccupied(bed.status)
        return (
          <StatusBadge variant={occupied ? "info" : "success"} dot>
            {occupied ? "Occupied" : "Available"}
          </StatusBadge>
        )
      },
    },
    {
      key: "assignedStudent",
      header: "Assigned Student",
      cellClassName: "font-medium text-gray-800",
      render: (bed) =>
        bed.studentName ?? <span className="text-gray-400">—</span>,
    },
    {
      key: "admissionNumber",
      header: "Admission #",
      cellClassName: "font-mono text-xs text-gray-400",
      render: (bed) => bed.admissionNumber ?? "—",
    },
    {
      key: "actions",
      header: "Actions",
      headerClassName: "text-right",
      cellClassName: "text-right",
      render: (bed) => (
        <div onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                aria-label="More options"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem
                onClick={() => setViewBed(bed)}
                className="cursor-pointer gap-2"
              >
                <Eye className="h-4 w-4 text-gray-400" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setEditBed(bed)}
                className="cursor-pointer gap-2"
              >
                <Edit2 className="h-4 w-4 text-gray-400" />
                Edit
              </DropdownMenuItem>
              {!isBedSpaceOccupied(bed.status) && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setDeleteBed(bed)}
                    className="cursor-pointer gap-2 text-red-600 focus:bg-red-50 focus:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ]

  return (
    <>
      <DataTable
        columns={columns}
        data={bedSpaces}
        getRowKey={(bed) => bed.id}
        isLoading={isLoading}
        onRowClick={(bed) => setViewBed(bed)}
        emptyState={
          <EmptyState
            icon={BedDouble}
            title="No bed spaces found"
            description={emptyDescription}
            action={
              onCreateBedSpace
                ? { label: "Create Bed Space", onClick: onCreateBedSpace }
                : undefined
            }
          />
        }
      />

      {/* Modals */}
      {viewBed && (
        <BedSpaceDetailModal bed={viewBed} onClose={() => setViewBed(null)} />
      )}

      {editBed && (
        <BedSpaceModal
          open
          onClose={() => setEditBed(null)}
          editing={editBed}
        />
      )}

      <ConfirmDialog
        open={!!deleteBed}
        onOpenChange={(v) => !v && setDeleteBed(null)}
        title="Delete Bed Space?"
        description={`Delete "${deleteBed?.bedLabel}"? This removes the bed from the room and reduces the room capacity by 1.`}
        confirmLabel="Delete"
        onConfirm={() => {
          if (deleteBed) deleteBedSpace(deleteBed.id)
          setDeleteBed(null)
        }}
      />
    </>
  )
}
