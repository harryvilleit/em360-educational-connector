import { useState } from "react"
import { useParams } from "react-router"
import {
  ActivitySquare,
  Mail,
  MoreVertical,
  Phone,
  ShieldAlert,
  UserCheck,
  User,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { EmptyState } from "@/components/ui/empty-state"
import { DataTable, type DataTableColumn } from "@/components/ui/data-table"
import {
  useReassignHostelSupervisor,
  useUnassignHostelSupervisor,
} from "./hooks"
import type { HostelSupervisorAssignmentI } from "@/api/hostel.api/types"
import { DashboardRoutes } from "@/routes"
import { StatusBadge } from "@/pages/Dashboard/Hostel/components/StatusBadge"
import { ConfirmDialog } from "@/pages/Dashboard/Hostel/components/ConfirmDialog"
import { Link } from "react-router"

// ── Reassign Modal ─────────────────────────────────────────────────────────────

function ReassignModal({
  supervisor,
  hostels,
  onClose,
}: {
  supervisor: EnrichedSupervisor
  hostels: { id: string; name: string }[]
  onClose: () => void
}) {
  const { reassignHostelSupervisorAsync, isPending } =
    useReassignHostelSupervisor({ onSuccess: onClose })

  const [targetHostelId, setTargetHostelId] = useState(supervisor.hostelId)

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Reassign Supervisor</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Reassigning <strong>{supervisor.fullName}</strong> from{" "}
            <strong>{supervisor.hostelName}</strong>.
          </p>

          <div className="space-y-1.5">
            <Label>Hostel</Label>
            <Select value={targetHostelId} onValueChange={setTargetHostelId}>
              <SelectTrigger>
                <SelectValue placeholder="Select hostel" />
              </SelectTrigger>
              <SelectContent>
                {hostels.map((h) => (
                  <SelectItem key={h.id} value={h.id}>
                    {h.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              disabled={
                !targetHostelId ||
                targetHostelId === supervisor.hostelId ||
                isPending
              }
              onClick={() =>
                reassignHostelSupervisorAsync({
                  oldHostelId: supervisor.hostelId,
                  newHostelId: targetHostelId,
                  supervisorId: supervisor.userId,
                  role:
                    (
                      {
                        HouseMaster: 1,
                        HouseMistress: 2,
                        Assistant: 3,
                      } as Record<string, number>
                    )[supervisor.role] ||
                    Number(supervisor.role) ||
                    1,
                })
              }
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isPending ? "Reassigning…" : "Reassign"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ── Table ─────────────────────────────────────────────────────────────────────

type EnrichedSupervisor = HostelSupervisorAssignmentI & {
  hostelGender: "male" | "female"
}

interface SupervisorTableProps {
  supervisors: EnrichedSupervisor[]
  hostels: { id: string; name: string }[]
  isLoading?: boolean
}

export function SupervisorTable({
  supervisors,
  hostels,
  isLoading,
}: SupervisorTableProps) {
  const { productId } = useParams<{ productId: string }>()
  const p = productId ?? ""
  const { unassignHostelSupervisor } = useUnassignHostelSupervisor()

  const [deleteTarget, setDeleteTarget] = useState<EnrichedSupervisor | null>(
    null
  )
  const [reassignTarget, setReassignTarget] =
    useState<EnrichedSupervisor | null>(null)

  const columns: DataTableColumn<EnrichedSupervisor>[] = [
    {
      key: "name",
      header: "Name",
      render: (sup) => (
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-100 text-xs font-bold text-purple-700">
            {sup.fullName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)}
          </div>
          <span className="font-medium text-gray-900">{sup.fullName}</span>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      render: (sup) => <StatusBadge variant="purple">{sup.role}</StatusBadge>,
    },
    {
      key: "hostel",
      header: "Hostel",
      render: (sup) => (
        <StatusBadge
          variant={sup.hostelGender === "male" ? "info" : "purple"}
          dot
        >
          {sup.hostelName}
        </StatusBadge>
      ),
    },
    {
      key: "contact",
      header: "Contact",
      render: (sup) => (
        <div className="space-y-0.5 text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <Phone className="h-3 w-3 shrink-0" />
            {sup.phoneNumber}
          </div>
          <div className="flex items-center gap-1.5">
            <Mail className="h-3 w-3 shrink-0" />
            <span className="truncate">{sup.email}</span>
          </div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (sup) => (
        <StatusBadge
          variant={
            String(sup.status).toLowerCase() === "active"
              ? "success"
              : "neutral"
          }
          dot
        >
          {sup.status}
        </StatusBadge>
      ),
    },
    {
      key: "date",
      header: "Date",
      cellClassName: "text-sm text-gray-500",
      render: (sup) => new Date(sup.dateAssigned).toLocaleDateString("en-NG"),
    },
    {
      key: "actions",
      header: "Actions",
      headerClassName: "text-right",
      cellClassName: "text-right",
      render: (sup) => (
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
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem asChild className="cursor-pointer gap-2">
                <Link
                  to={DashboardRoutes.toHostelSupervisorProfile(p, sup.userId)}
                >
                  <User className="h-4 w-4 text-gray-400" />
                  View Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setReassignTarget(sup)}
                className="cursor-pointer gap-2"
              >
                <UserCheck className="h-4 w-4 text-gray-400" />
                Reassign to Hostel
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="cursor-pointer gap-2">
                <Link
                  to={
                    DashboardRoutes.toHostelAttendance(p) +
                    `?hostelId=${sup.hostelId}`
                  }
                >
                  <ActivitySquare className="h-4 w-4 text-gray-400" />
                  Take Attendance
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="cursor-pointer gap-2">
                <Link
                  to={
                    DashboardRoutes.toHostelDamage(p) +
                    `?gender=${sup.hostelGender}`
                  }
                  className="text-orange-600 focus:text-orange-700"
                >
                  <ShieldAlert className="h-4 w-4" />
                  File a Report
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setDeleteTarget(sup)}
                className="cursor-pointer gap-2 text-red-600 focus:text-red-600"
              >
                Remove Supervisor
              </DropdownMenuItem>
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
        data={supervisors}
        getRowKey={(sup) => `${sup.hostelId}-${sup.userId}`}
        isLoading={isLoading}
        emptyState={
          <EmptyState
            icon={UserCheck}
            title="No supervisors assigned"
            description="Assign a House Master or Mistress to supervise a hostel."
          />
        }
      />

      {reassignTarget && (
        <ReassignModal
          supervisor={reassignTarget}
          hostels={hostels}
          onClose={() => setReassignTarget(null)}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Remove Supervisor?"
        description={`Remove ${deleteTarget?.fullName} from ${deleteTarget?.hostelName}? They can be re-added later.`}
        confirmLabel="Remove"
        onConfirm={() => {
          if (deleteTarget) {
            unassignHostelSupervisor({
              hostelId: deleteTarget.hostelId,
              supervisorId: deleteTarget.userId,
            })
          }
          setDeleteTarget(null)
        }}
      />
    </>
  )
}
