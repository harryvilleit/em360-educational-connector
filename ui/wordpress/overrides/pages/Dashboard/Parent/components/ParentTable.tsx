import { usePermissions } from "@/hooks/usePermissions"
import { managementRouteAvailable } from "@/lib/management-route"
import React from "react"
import { useNavigate } from "react-router"
import {
  Users,
  MoreHorizontal,
  Pencil,
  Eye,
  FileText,
  CalendarCheck2,
  Wallet,
  CalendarDays,
  ShieldCheck,
  DoorOpen,
  Activity,
  Building2,
  GraduationCap,
} from "lucide-react"
import { DashboardRoutes } from "@/routes"
import type { SchoolParentItemI } from "@/api/guardian.api/types"
import { initialsOfName } from "@/utils/guardianAdapter"
import { EmptyState } from "@/components/ui/empty-state"
import { DataTable, type DataTableColumn } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ActionItem {
  label: string
  icon: React.ElementType
  onClick: () => void
}

interface ParentTableProps {
  parents: SchoolParentItemI[]
  productId: string
  onViewDetails: (parent: SchoolParentItemI) => void
}

const AVATAR_COLORS = [
  "bg-blue-100 text-blue-600",
  "bg-emerald-100 text-emerald-600",
  "bg-violet-100 text-violet-600",
  "bg-amber-100 text-amber-600",
  "bg-rose-100 text-rose-600",
  "bg-cyan-100 text-cyan-600",
  "bg-orange-100 text-orange-600",
  "bg-indigo-100 text-indigo-600",
]

function avatarColor(name: string) {
  const index = name.charCodeAt(0) % AVATAR_COLORS.length
  return AVATAR_COLORS[index]
}

export function ParentTable({
  parents,
  productId,
  onViewDetails,
}: ParentTableProps) {
  const navigate = useNavigate(),
    permissions = usePermissions()

  const columns: DataTableColumn<SchoolParentItemI>[] = [
    {
      key: "parent",
      header: "Parent",
      render: (parent) => (
        <div className="flex items-center gap-3">
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${avatarColor(parent.fullName)}`}
          >
            {initialsOfName(parent.fullName)}
          </div>
          <div>
            <p className="font-medium text-gray-900">{parent.fullName}</p>
          </div>
        </div>
      ),
    },
    {
      key: "contact",
      header: "Contact",
      render: (parent) => (
        <>
          <p className="text-gray-700">{parent.email || "—"}</p>
          <p className="text-xs text-gray-400">{parent.phoneNumber}</p>
        </>
      ),
    },
    {
      key: "children",
      header: "Children",
      render: (parent) => (
        <div className="flex items-center gap-1.5 text-gray-600">
          <Users size={13} className="text-gray-400" />
          <span>{parent.childrenCount}</span>
          <span className="text-gray-400">
            {parent.childrenCount === 1 ? "child" : "children"}
          </span>
        </div>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (parent) => (
        <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
          <ActionMenu
            parent={parent}
            productId={productId}
            onViewDetails={() => onViewDetails(parent)}
          />
        </div>
      ),
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={parents}
      getRowKey={(parent) => parent.guardianId}
      onRowClick={(parent) =>
        navigate(DashboardRoutes.toParentProfile(productId, parent.guardianId))
      }
      emptyState={
        <EmptyState
          icon={Users}
          title="No parents found"
          description="Try adjusting your search"
          size="sm"
          iconContainerClassName="bg-gray-50"
        />
      }
    />
  )
}

// ─── Action menu ─────────────────────────────────────────────────────────────────

function ActionMenu({
  parent,
  productId,
  onViewDetails,
}: {
  parent: SchoolParentItemI
  productId: string
  onViewDetails: () => void
}) {
  const navigate = useNavigate(),
    permissions = usePermissions()

  const items: ActionItem[] = [
    {
      label: "View details",
      icon: Eye,
      onClick: onViewDetails,
    },
    {
      label: "Edit parent details",
      icon: Pencil,
      onClick: () =>
        navigate(DashboardRoutes.toParentEdit(productId, parent.guardianId)),
    },
    {
      label: "View result record",
      icon: FileText,
      onClick: () =>
        navigate(DashboardRoutes.toParentResults(productId, parent.guardianId)),
    },
    {
      label: "View Attendance",
      icon: CalendarCheck2,
      onClick: () =>
        navigate(
          DashboardRoutes.toParentAttendance(productId, parent.guardianId)
        ),
    },
    {
      label: "School Fees",
      icon: Wallet,
      onClick: () =>
        navigate(DashboardRoutes.toParentFees(productId, parent.guardianId)),
    },
    {
      label: "Timetable & Calendar",
      icon: CalendarDays,
      onClick: () =>
        navigate(
          DashboardRoutes.toParentTimetable(productId, parent.guardianId)
        ),
    },
    {
      label: "Consent",
      icon: ShieldCheck,
      onClick: () =>
        navigate(
          DashboardRoutes.toParentNotificationsDetail(
            productId,
            parent.guardianId
          )
        ),
    },
    {
      label: "Request Visit",
      icon: DoorOpen,
      onClick: () =>
        navigate(
          DashboardRoutes.toParentVisitation(productId, parent.guardianId)
        ),
    },
    {
      label: "View Health",
      icon: Activity,
      onClick: () => navigate(`/dashboard/${productId}/health-records`),
    },
    {
      label: "View Hostel record",
      icon: Building2,
      onClick: () => navigate(DashboardRoutes.toHostel(productId)),
    },
    {
      label: "Request Transcript",
      icon: GraduationCap,
      onClick: () =>
        navigate(
          DashboardRoutes.toParentTranscript(productId, parent.guardianId)
        ),
    },
  ]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          aria-label={`Actions for ${parent.fullName}`}
          className="h-8 w-8 p-0 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <MoreHorizontal size={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52 rounded-xl py-1">
        {items
          .filter((item) => {
            if (item.label === "Edit parent details")
              return permissions.canUpdate("/dashboard/parents/list")
            const menu = (
              {
                "School Fees": "fees",
                Consent: "consent",
                "Request Visit": "visitation",
                "Request Transcript": "transcript",
              } as Record<string, string>
            )[item.label]
            if (menu) return permissions.canView("/dashboard/parents/" + menu)
            if (
              item.label === "View Health" ||
              item.label === "View Hostel record"
            )
              return managementRouteAvailable(
                `/dashboard/${productId}/health-records`
              )
            return true
          })
          .map((item, i) => (
            <React.Fragment key={item.label}>
              {i > 0 && <DropdownMenuSeparator />}
              <DropdownMenuItem
                className="cursor-pointer gap-2 text-xs"
                onClick={item.onClick}
              >
                <item.icon size={13} className="text-gray-400" />
                {item.label}
              </DropdownMenuItem>
            </React.Fragment>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
