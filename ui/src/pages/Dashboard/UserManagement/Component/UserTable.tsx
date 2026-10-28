import {
  MoreHorizontal,
  Users2,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- kept for the disabled Edit Modules action below
  Layout,
  UserCheck,
  UserX,
  ShieldPlus,
  KeyRound,
  MailPlus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
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
import { useParams } from "react-router"
import { format } from "date-fns"
import ConfirmModal from "./ConfirmModal"
import type { UserTableProps } from "@/types/user-management"
import type { SubUserItem } from "@/api/userMgt.api/types"
import { usePermissions } from "@/hooks/usePermissions"
import { DashboardRoutes } from "@/routes"

const SKELETON_ROWS = 6

export default function UserTable({
  users,
  hasFilters,
  isLoading,
  onViewDetails,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- kept for the disabled Edit Modules action below
  onEditModules,
  onAddMultipleRoles,
  onChangePassword,
  onResendRegistrationEmail,
  onActivate,
  onDeactivate,
  page,
  totalItems,
  pageSize,
  onPageChange,
}: UserTableProps) {
  const [pendingAction, setPendingAction] = useState<{
    user: SubUserItem
    type: "activate" | "deactivate"
  } | null>(null)
  const { productId } = useParams<{ productId: string }>()
  const { canUpdate } = usePermissions()
  const canManageUsers = canUpdate(DashboardRoutes.toManageUsers(productId ?? ""))

  const columns: DataTableColumn<SubUserItem>[] = [
    {
      key: "user",
      header: "User",
      render: (user) => {
        const initials =
          `${user.FirstName[0]}${user.LastName[0]}`.toUpperCase()
        return (
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
              {initials}
            </div>
            <div>
              <p className="font-semibold text-gray-900">
                {user.FirstName} {user.LastName}
              </p>
              <p className="text-xs text-muted-foreground">
                {user.Email || user.email || "—"}
              </p>
            </div>
          </div>
        )
      },
    },
    {
      key: "phone",
      header: "Phone",
      render: (user) => (
        <span className="rounded-lg px-2.5 py-1 text-xs font-medium text-gray-700">
          {user.PhoneNumber}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (user) => {
        const userStatus = user.Status || user.status || ""
        return (
          <span
            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              userStatus === "Active"
                ? "bg-green-50 text-green-700"
                : userStatus === "Inactive"
                  ? "bg-red-50 text-red-600"
                  : "bg-amber-50 text-amber-700"
            }`}
          >
            {userStatus || "Pending"}
          </span>
        )
      },
    },
    {
      key: "joined",
      header: "Joined",
      cellClassName: "text-xs text-muted-foreground",
      render: (user) => format(new Date(user.DateCreated), "MMM d, yyyy"),
    },
    {
      key: "actions",
      header: "",
      render: (user) => {
        const userStatus = user.Status || user.status || ""
        const canResendRegistrationEmail =
          userStatus.toLowerCase() === "pending" ||
          user.CanResendRegistrationEmail === true ||
          user.canResendRegistrationEmail === true
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" className="rounded-lg">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl">
              <DropdownMenuItem
                className="cursor-pointer gap-2 rounded-lg text-xs"
                onClick={() => onViewDetails(user)}
              >
                <Users2 className="size-3.5 text-gray-500" />
                View Details
              </DropdownMenuItem>
              {/* Edit Modules action disabled — code kept in place, not deleted
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer gap-2 rounded-lg text-xs"
                onClick={() => onEditModules(user)}
              >
                <Layout className="size-3.5 text-blue-500" />
                Edit Modules
              </DropdownMenuItem>
              */}
              {canManageUsers && onAddMultipleRoles && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer gap-2 rounded-lg text-xs"
                    onClick={() => onAddMultipleRoles(user)}
                  >
                    <ShieldPlus className="size-3.5 text-violet-500" />
                    Update Roles
                  </DropdownMenuItem>
                </>
              )}
              {canManageUsers && onChangePassword && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer gap-2 rounded-lg text-xs"
                    onClick={() => onChangePassword(user)}
                  >
                    <KeyRound className="size-3.5 text-amber-500" />
                    Change Password
                  </DropdownMenuItem>
                </>
              )}
              {canManageUsers &&
                canResendRegistrationEmail &&
                onResendRegistrationEmail && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="cursor-pointer gap-2 rounded-lg text-xs text-blue-600 focus:bg-blue-50 focus:text-blue-600"
                      onClick={() => onResendRegistrationEmail(user)}
                    >
                      <MailPlus className="size-3.5" />
                      Resend registration email
                    </DropdownMenuItem>
                  </>
                )}
              {canManageUsers && userStatus === "Active" && onDeactivate ? (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer gap-2 rounded-lg text-xs text-orange-600 focus:bg-orange-50 focus:text-orange-600"
                    onClick={() =>
                      setPendingAction({ user, type: "deactivate" })
                    }
                  >
                    <UserX className="size-3.5" />
                    Deactivate User
                  </DropdownMenuItem>
                </>
              ) : canManageUsers && userStatus === "Inactive" && onActivate ? (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer gap-2 rounded-lg text-xs text-green-600 focus:bg-green-50 focus:text-green-600"
                    onClick={() =>
                      setPendingAction({ user, type: "activate" })
                    }
                  >
                    <UserCheck className="size-3.5" />
                    Activate User
                  </DropdownMenuItem>
                </>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  return (
    <>
      <DataTable
        columns={columns}
        data={users}
        getRowKey={(user) => user.SubUserId}
        isLoading={isLoading}
        loadingRows={SKELETON_ROWS}
        pagination={{ page, total: totalItems, pageSize, onPageChange }}
        emptyState={
          <EmptyState
            icon={Users2}
            title="No users found"
            description={
              hasFilters
                ? "No users match your search or filter criteria"
                : "Create your first user to get started"
            }
            size="sm"
            iconContainerClassName="bg-gray-50"
          />
        }
      />

      <ConfirmModal
        open={!!pendingAction}
        onClose={() => setPendingAction(null)}
        variant={pendingAction?.type ?? "activate"}
        userName={
          pendingAction
            ? `${pendingAction.user.FirstName} ${pendingAction.user.LastName}`
            : ""
        }
        onConfirm={async () => {
          if (!pendingAction) return
          if (pendingAction.type === "activate" && onActivate) {
            await onActivate(pendingAction.user.SubUserId)
          } else if (pendingAction.type === "deactivate" && onDeactivate) {
            await onDeactivate(pendingAction.user.SubUserId)
          }
          setPendingAction(null)
        }}
      />

     
    </>
  )
}
