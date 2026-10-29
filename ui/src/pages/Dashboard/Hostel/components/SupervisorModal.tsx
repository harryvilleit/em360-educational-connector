import { useEffect, useMemo } from "react"
import { useParams } from "react-router"
import { useForm, Controller, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FormDraftBanner } from "@/components/general/FormDraftBanner"
import { useFormDraft } from "@/hooks/useFormDraft"
import { useSchoolId } from "@/contexts/SchoolContext"
import { useGetMySubUsers } from "@/hooks/userMgt"
import { useGetJobRolesBySchool } from "@/hooks/jobRoles"
import { useGetAllHostels, useAssignHostelSupervisor } from "@/hooks/hostel"
import { supervisorSchema, type SupervisorFormData } from "@/schema/hostelSupervisor.schema"
import { DashboardRoutes } from "@/routes"
import { RequiredDataNotice } from "./RequiredDataNotice"

// ── Props ─────────────────────────────────────────────────────────────────────

interface SupervisorModalProps {
  open: boolean
  onClose: () => void
  defaultHostelId?: string
}

// Job roles counted as hostel-supervision staff, matched against each
// school job role's SystemJobRoleName (mirrors ManageTeachers' TEACHER_SYSTEM_ROLES filter)
const HOSTEL_ROLE_KEYWORDS = ["house", "hostel", "warden", "matron"]

function isHostelSupervisionRole(systemJobRoleName?: string) {
  const name = (systemJobRoleName ?? "").toLowerCase()
  return HOSTEL_ROLE_KEYWORDS.some((keyword) => name.includes(keyword))
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
      <AlertCircle className="h-3 w-3 shrink-0" />
      {message}
    </p>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

export function SupervisorModal({
  open,
  onClose,
  defaultHostelId,
}: SupervisorModalProps) {
  const schoolId = useSchoolId()
  const { productId } = useParams<{ productId: string }>()
  const p = productId ?? ""
  const { hostels } = useGetAllHostels({ schoolId, pageSize: 100 })
  const { subUsers } = useGetMySubUsers({ schoolId })
  const { jobRoles } = useGetJobRolesBySchool(schoolId)

  const hostelJobRoleIds = useMemo(
    () =>
      jobRoles
        .filter((r) => isHostelSupervisionRole(r.SystemJobRoleName))
        .map((r) => r.Id),
    [jobRoles]
  )

  const eligibleStaff = useMemo(
    () =>
      subUsers.filter((u) =>
        u.JobRoles.some((jr) => hostelJobRoleIds.includes(jr.SchoolJobRoleId))
      ),
    [subUsers, hostelJobRoleIds]
  )

  const { assignHostelSupervisorAsync, isPending } = useAssignHostelSupervisor(
    { onSuccess: () => { onClose(); clearDraft() } }
  )

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SupervisorFormData>({
    resolver: zodResolver(supervisorSchema),
    defaultValues: {
      hostelId: defaultHostelId ?? "",
      subUserId: "",
    },
  })

  const watchedAll = useWatch({ control })

  const {
    hasDraft,
    draftValues,
    draftSavedAt,
    acknowledgeDraft,
    discardDraft,
    clearDraft,
  } = useFormDraft<SupervisorFormData>({
    formKey: "hostel-supervisor-assign",
    values: watchedAll as SupervisorFormData,
    enabled: open,
  })

  function handleRestoreDraft() {
    if (!draftValues) return
    reset(draftValues)
    acknowledgeDraft()
  }

  useEffect(() => {
    if (open) {
      reset({
        hostelId: defaultHostelId ?? "",
        subUserId: "",
      })
    }
  }, [open, defaultHostelId, reset])

  const onSubmit = async (data: SupervisorFormData) => {
    await assignHostelSupervisorAsync({
      hostelId: data.hostelId,
      supervisorId: data.subUserId,
    })
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Hostel Supervisor</DialogTitle>
        </DialogHeader>

        {hasDraft && draftSavedAt && (
          <FormDraftBanner
            savedAt={draftSavedAt}
            onRestore={handleRestoreDraft}
            onDiscard={discardDraft}
          />
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Hostel */}
          <div className="space-y-1.5">
            <Label>
              Hostel <span className="text-red-500">*</span>
            </Label>
            <Controller
              control={control}
              name="hostelId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    className={errors.hostelId ? "border-red-400" : " w-full"}
                  >
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
              )}
            />
            <FieldError message={errors.hostelId?.message} />
            {hostels.length === 0 && (
              <RequiredDataNotice
                itemLabel="a hostel"
                pageLabel="Hostel Types"
                to={DashboardRoutes.toHostelTypes(p)}
              />
            )}
          </div>

          {/* Staff member */}
          <div className="space-y-1.5">
            <Label>
              Staff Member <span className="text-red-500">*</span>
            </Label>
            <Controller
              control={control}
              name="subUserId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    className={errors.subUserId ? "border-red-400" : " w-full"}
                  >
                    <SelectValue placeholder="Select staff member" />
                  </SelectTrigger>
                  <SelectContent>
                    {eligibleStaff.map((u) => (
                      <SelectItem key={u.SubUserId} value={u.SubUserId}>
                        {u.FirstName} {u.LastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError message={errors.subUserId?.message} />
            {eligibleStaff.length === 0 && (
              <RequiredDataNotice
                itemLabel="a staff member with a hostel supervision job role (e.g. House Master, House Mistress, Warden, Matron)"
                pageLabel="Job Roles"
                to={DashboardRoutes.toJobRoles(p)}
              />
            )}
          </div>

          <div className="flex w-full gap-2 pt-4">
            <Button type="button" onClick={onClose} className="w-1/2" variant="secondary">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isPending}
              className="w-1/2"
              variant="primary"
            >
              {isPending ? "Assigning…" : "Assign Supervisor"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
