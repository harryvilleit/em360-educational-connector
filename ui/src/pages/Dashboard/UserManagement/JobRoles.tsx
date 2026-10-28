import { useState } from "react"

import { type JobRoleSchema } from "@/schema/jobRoles.schema"
import type { JobRoleItem } from "@/api/jobRoles.api/types"
import {
  useGetJobRolesBySchool,
  useCreateJobRole,
  useUpdateJobRole,
  useDeleteJobRole,
  useGetSystemJobRoles,
} from "@/hooks/jobRoles"
import ConfirmModal from "./Component/ConfirmModal"
import JobRolesHeader from "./Component/JobRolesHeader"
import JobRolesTable from "./Component/JobRolesTable"
import JobRoleFormModal from "./Component/JobRoleFormModal"
import RolePermissionBuilder from "./Component/RolePermissionBuilder"
import { Button } from "@/components/ui/button"
import { useBackfillLegacyAccess } from "@/hooks/userMgt"
import { Loader2, DatabaseZap } from "lucide-react"
import { useSchoolId } from "@/contexts/SchoolContext"

export default function JobRolesPage() {
  const schoolId = useSchoolId()

  const { jobRoles, isLoading } = useGetJobRolesBySchool(schoolId)
  const { systemJobRoles } = useGetSystemJobRoles()

  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<JobRoleItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<JobRoleItem | null>(null)
  const [permissionsTarget, setPermissionsTarget] = useState<JobRoleItem | null>(null)

  const { backfillLegacyAccessAsync, isPending: isBackfilling } =
    useBackfillLegacyAccess()

  const { createJobRoleAsync, isPending: isCreating } = useCreateJobRole({
    onSuccess: () => setCreateOpen(false),
  })

  const { updateJobRoleAsync, isPending: isUpdating } = useUpdateJobRole({
    onSuccess: () => setEditTarget(null),
  })

  const { deleteJobRoleAsync } = useDeleteJobRole({
    onSuccess: () => setDeleteTarget(null),
  })

  const resolveSystemJobRoleValue = (
    raw: string | number
  ): number | undefined => {
    if (typeof raw === "number" && raw !== 0) return raw
    if (typeof raw === "string" && raw !== "0" && raw !== "") {
      return systemJobRoles.find((r) => r.Name === raw)?.Value
    }
    return undefined
  }

  const handleCreate = async (data: JobRoleSchema) => {
    if (!data.systemJobRole) return
    await createJobRoleAsync({
      name: data.name,
      description: data.description ?? "",
      systemJobRole: data.systemJobRole,
      schoolId,
    })
  }

  const handleEdit = async (data: JobRoleSchema) => {
    if (!editTarget) return
    await updateJobRoleAsync({
      id: editTarget.Id,
      name: data.name,
      description: data.description ?? "",
      systemJobRole: data.systemJobRole,
    })
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    await deleteJobRoleAsync(deleteTarget.Id)
  }

  const editDefaultValues = editTarget
    ? {
        name: editTarget.Name,
        description: editTarget.Description ?? "",
        systemJobRole: resolveSystemJobRoleValue(editTarget.SystemJobRole),
      }
    : undefined

  return (
    <div className="space-y-6">
      <JobRolesHeader onAddClick={() => setCreateOpen(true)} />

    

      <JobRolesTable
        jobRoles={jobRoles}
        isLoading={isLoading}
        onEdit={setEditTarget}
        onDelete={setDeleteTarget}
        onManagePermissions={setPermissionsTarget}
      />

      <JobRoleFormModal
        mode="create"
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreate}
        isPending={isCreating}
      />

      <JobRoleFormModal
        mode="edit"
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        onSubmit={handleEdit}
        isPending={isUpdating}
        defaultValues={editDefaultValues}
      />

      <RolePermissionBuilder
        open={!!permissionsTarget}
        roleId={permissionsTarget?.Id ?? ""}
        roleName={permissionsTarget?.Name ?? ""}
        onClose={() => setPermissionsTarget(null)}
      />

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        variant="delete"
        userName={deleteTarget?.Name ?? ""}
      />
    </div>
  )
}
