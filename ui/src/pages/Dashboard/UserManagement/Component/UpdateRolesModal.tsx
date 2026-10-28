import { useState, useEffect, useMemo } from "react"
import { Search, X, CheckCircle2, Loader2 } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import type { SubUserItem, JobRoleItem } from "@/api/userMgt.api/types"
import { useAssignMultipleRoles } from "@/hooks/userMgt"
import { useSchoolId } from "@/contexts/SchoolContext"

interface UpdateRolesModalProps {
  open: boolean
  onClose: () => void
  user: SubUserItem | null
  availableRoles: JobRoleItem[]
}

export default function UpdateRolesModal({
  open,
  onClose,
  user,
  availableRoles,
}: UpdateRolesModalProps) {
  const schoolId = useSchoolId()
  const { assignMultipleRolesAsync, isLoading } = useAssignMultipleRoles()

  const [search, setSearch] = useState("")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (open && user) {
      const current = new Set(user.JobRoles.map((r) => r.SchoolJobRoleId))
      setSelectedIds(current)
      setSearch("")
    }
  }, [open, user])

  const filtered = useMemo(
    () =>
      availableRoles.filter(
        (role) =>
          role.Name.toLowerCase().includes(search.toLowerCase()) ||
          role.Description?.toLowerCase().includes(search.toLowerCase())
      ),
    [availableRoles, search]
  )

  const currentRoleIds = useMemo(
    () => new Set(user?.JobRoles.map((r) => r.SchoolJobRoleId) ?? []),
    [user]
  )

  function toggle(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function selectAll() {
    setSelectedIds(new Set(filtered.map((r) => r.Id)))
  }

  function clearAll() {
    setSelectedIds(new Set())
  }

  async function handleSave() {
    if (!user) return
    if (selectedIds.size === 0) {
      toast.error("Please select at least one role")
      return
    }

    try {
      await assignMultipleRolesAsync({
        subUserId: user.SubUserId,
        schoolId,
        schoolJobRoleIds: Array.from(selectedIds),
      })
      toast.success(
        `${selectedIds.size} role${selectedIds.size > 1 ? "s" : ""} assigned to ${user.FirstName} ${user.LastName}`
      )
      onClose()
    } catch {
      toast.error("Failed to assign roles. Please try again.")
    }
  }

  const initials = user
    ? `${user.FirstName[0]}${user.LastName[0]}`.toUpperCase()
    : ""

  const selectedRoles = useMemo(
    () => availableRoles.filter((r) => selectedIds.has(r.Id)),
    [availableRoles, selectedIds]
  )

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl p-6 sm:max-w-2xl">
        <DialogHeader className="shrink-0 border-b border-gray-100 px-6 py-5">
          <DialogTitle className="flex items-center gap-3 text-base font-semibold text-gray-900">
            Update Roles
          </DialogTitle>

          {/* User identity strip */}
          {user && (
            <div className="mt-3 flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-3.5 py-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-gray-900">
                  {user.FirstName} {user.LastName}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {user.Email || user.email}
                </p>
              </div>
              <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                {user.JobRoles.length} current role{user.JobRoles.length !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </DialogHeader>

        {/* Body */}
        <div className="flex flex-1 flex-col gap-4 overflow-hidden px-6 py-4">

          {/* Selected roles preview */}
          {selectedIds.size > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {selectedRoles.map((role) => (
                <Badge
                  key={role.Id}
                  variant="secondary"
                  className="flex items-center gap-1 rounded-full bg-blue-50 pr-1 text-xs font-medium text-blue-700"
                >
                  {role.Name}
                  <button
                    onClick={() => toggle(role.Id)}
                    className="ml-0.5 rounded-full p-0.5 hover:bg-blue-100"
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {/* Search */}
          <div className="relative shrink-0">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search roles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border-gray-200 py-5 pl-9"
            />
          </div>

          {/* Select all / clear */}
          <div className="flex shrink-0 items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {selectedIds.size} of {availableRoles.length} selected
            </p>
            <div className="flex gap-3">
              <button
                onClick={selectAll}
                className="text-xs font-medium text-blue-600 hover:underline"
              >
                Select all
              </button>
              <button
                onClick={clearAll}
                className="text-xs font-medium text-gray-500 hover:underline"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Role list */}
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-10 text-center">
               
                <p className="text-sm text-muted-foreground">
                  {search ? "No roles match your search" : "No roles available"}
                </p>
              </div>
            ) : (
              filtered.map((role) => {
                const checked = selectedIds.has(role.Id)
                const isCurrentRole = currentRoleIds.has(role.Id)
                return (
                  <label
                    key={role.Id}
                    className={`flex cursor-pointer items-start gap-3.5 rounded-xl border px-4 py-3 transition-colors ${
                      checked
                        ? "border-blue-200 bg-blue-50"
                        : "border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => toggle(role.Id)}
                      className="mt-0.5 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-gray-900 capitalize">
                          {role.Name}
                        </p>
                        {isCurrentRole && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">
                            <CheckCircle2 className="size-2.5" />
                            Current
                          </span>
                        )}
                      </div>
                      {role.Description && (
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                          {role.Description}
                        </p>
                      )}
                    </div>
                  </label>
                )
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 flex gap-3 px-6 py-4">
          <Button
            variant="cancel"
            onClick={onClose}
            className="flex-1"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading || selectedIds.size === 0}
            variant="primary"
            className="flex-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
           
                Assign {selectedIds.size > 0 ? `${selectedIds.size} ` : ""}Role{selectedIds.size !== 1 ? "s" : ""}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
