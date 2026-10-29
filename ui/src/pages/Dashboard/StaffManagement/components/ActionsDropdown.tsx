import { Ban, EllipsisVertical, Eye, Pencil, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { StaffDirectoryItemI } from "@/api/staff.api/types"
import { isActiveStatusLabel } from "../types/normalize"

interface ActionsDropdownProps {
  staff: StaffDirectoryItemI
  onView: () => void
  onEdit: () => void
  onToggleStatus: () => void
  onDelete: () => void
}

/**
 * Row actions for the staff table.
 *
 * Built on the shared DropdownMenu rather than a hand-rolled absolutely
 * positioned div. The menu has to escape the table: DataTable wraps rows in
 * `overflow-hidden` plus an inner `overflow-x-auto`, so an absolutely
 * positioned panel — however high its z-index — was clipped to the row and
 * appeared to open *inside* the table. z-index cannot lift an element out of an
 * ancestor's overflow; only rendering outside that ancestor can, which is what
 * this menu's portal does.
 *
 * Coming along for free: Escape and outside-click closing (previously a manual
 * document listener), focus return to the trigger, arrow-key navigation, and
 * flipping the menu upwards when the row is near the bottom of the viewport —
 * which the old fixed `top-full` could not do.
 */
export function ActionsDropdown({
  staff,
  onView,
  onEdit,
  onToggleStatus,
  onDelete,
}: ActionsDropdownProps) {
  const isActive = isActiveStatusLabel(staff.statusLabel)

  return (
    // Row-level click handlers shouldn't fire when someone opens the menu.
    <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label={`Actions for ${staff.fullName ?? "staff member"}`}
          className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 data-[state=open]:bg-slate-100 data-[state=open]:text-slate-600"
        >
          <EllipsisVertical className="h-4 w-4" />
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          // The shared content matches the trigger's width by default, which on
          // an icon button is about 28px.
          className="w-44 min-w-44 py-1"
        >
          <DropdownMenuItem className="gap-2.5 px-3 py-2" onSelect={onView}>
            <Eye className="h-4 w-4" />
            View Profile
          </DropdownMenuItem>

          <DropdownMenuItem className="gap-2.5 px-3 py-2" onSelect={onEdit}>
            <Pencil className="h-4 w-4" />
            Edit Details
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            className={`gap-2.5 px-3 py-2 ${
              isActive ? "text-amber-600" : "text-emerald-600"
            }`}
            onSelect={onToggleStatus}
          >
            <Ban className="h-4 w-4" />
            {isActive ? "Deactivate" : "Activate"}
          </DropdownMenuItem>

          <DropdownMenuItem
            variant="destructive"
            className="gap-2.5 px-3 py-2"
            onSelect={onDelete}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
