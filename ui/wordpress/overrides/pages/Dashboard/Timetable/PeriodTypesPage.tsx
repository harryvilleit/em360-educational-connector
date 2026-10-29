// WordPress version: Create/Update/Delete permissions, activate/deactivate, and load errors.
import { useState } from "react"
import { Lock, Loader2, MoreVertical, Pencil, Plus, Tag, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PageHeader } from "@/components/general/PageHeader"
import { useSchoolId } from "@/contexts/SchoolContext"
import { usePermissions } from "@/hooks/usePermissions"
import {
  useCreatePeriodType,
  useDeletePeriodType,
  useGetPeriodTypesBySchool,
  useTogglePeriodTypeStatus,
  useUpdatePeriodType,
} from "@/hooks/timetablePeriodType"
import type { PeriodTypeI } from "@/api/timetablePeriodType.api/types"
import { EditPeriodTypeDialog } from "@/pages/Dashboard/Timetable/components/EditPeriodTypeDialog"
import { DeletePeriodTypeDialog } from "@/pages/Dashboard/Timetable/components/DeletePeriodTypeDialog"

export default function PeriodTypesPage() {
  const schoolId = useSchoolId()
  const permissions = usePermissions()
  const canCreate = permissions.canCreate("/dashboard/timetable/period-types")
  const canUpdate = permissions.canUpdate("/dashboard/timetable/period-types")
  const canDelete = permissions.canDelete("/dashboard/timetable/period-types")
  const { togglePeriodTypeStatus, isPending: isToggling } = useTogglePeriodTypeStatus()
  const { periodTypes, isLoading, isError, refetch } = useGetPeriodTypesBySchool({ schoolId })
  const { createPeriodTypeAsync, isPending: isCreating } = useCreatePeriodType()
  const { updatePeriodTypeAsync, isPending: isSaving } = useUpdatePeriodType()
  const { deletePeriodTypeAsync } = useDeletePeriodType()

  const [draft, setDraft] = useState("")
  const [editingType, setEditingType] = useState<PeriodTypeI | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<PeriodTypeI | null>(null)

  async function handleAdd() {
    if (!draft.trim()) return
    await createPeriodTypeAsync({ schoolId, name: draft.trim() })
    setDraft("")
  }

  async function handleSaveEdit(name: string) {
    if (!editingType) return
    await updatePeriodTypeAsync({ id: editingType.id, schoolId, name })
    setEditingType(null)
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return
    await deletePeriodTypeAsync({ id: deleteTarget.id, schoolId })
    setDeleteTarget(null)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Period Types"
        description="Manage the period types available when building a class timetable."
      />

      {canCreate && (
      <div className="rounded-2xl border border-gray-100 bg-white p-6">
        <h2 className="mb-4 text-sm font-semibold text-gray-700">
          Add a Period Type
        </h2>
        <div className="flex items-center gap-2">
          <Input
            placeholder="e.g. Prep Time, Chapel, Double Period..."
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                handleAdd().catch(() => {})
              }
            }}
            className="rounded-xl border-gray-200"
          />
          <Button
            className="shrink-0 gap-2 rounded-xl bg-blue-600 text-sm text-white hover:bg-blue-700"
            onClick={() => {
              handleAdd().catch(() => {})
            }}
            disabled={isCreating}
          >
            <Plus className="size-4" />
            Add
          </Button>
        </div>
      </div>
      )}

      <div className="rounded-2xl border border-gray-100 bg-white">
        <div className="border-b border-gray-100 px-6 py-4">
          <h2 className="text-sm font-semibold text-gray-700">
            Configured Period Types
          </h2>
        </div>
        {isError ? (
          <div role="alert" className="p-5">
            Unable to load period types.{" "}
            <Button
              onClick={() => {
                void refetch()
              }}
            >
              Try Again
            </Button>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="size-5 animate-spin text-gray-400" />
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {periodTypes.map((type) => (
              <li
                key={type.id}
                className="flex items-center justify-between gap-3 px-6 py-3.5"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                    <Tag className="size-4 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {type.name}
                    </p>
                  </div>
                  {type.isBuiltIn && (
                    <span className="flex shrink-0 items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">
                      <Lock className="size-2.5" />
                      Predefined
                    </span>
                  )}
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      type.statusName === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {type.statusName}
                  </span>
                </div>

                {!type.isBuiltIn && (canUpdate || canDelete) && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 shrink-0 p-0 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                        aria-label="More options"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem
                        disabled={!canUpdate || isToggling}
                        onClick={() => togglePeriodTypeStatus({ schoolId, id: type.id })}
                      >
                        {type.statusName === "Active" ? "Deactivate" : "Activate"}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer gap-2"
                        disabled={!canUpdate}
                        onClick={() => setEditingType(type)}
                      >
                        <Pencil className="h-4 w-4 text-gray-400" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer gap-2 text-red-600 focus:text-red-600"
                        disabled={!canDelete}
                        onClick={() => setDeleteTarget(type)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <EditPeriodTypeDialog
        key={editingType?.id ?? "none"}
        open={!!editingType}
        onOpenChange={(v) => !v && setEditingType(null)}
        initialName={editingType?.name ?? ""}
        isSaving={isSaving}
        onSave={(name) => handleSaveEdit(name).catch(() => {})}
      />

      <DeletePeriodTypeDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        periodTypeName={deleteTarget?.name}
        onConfirm={() => handleConfirmDelete().catch(() => {})}
      />
    </div>
  )
}
