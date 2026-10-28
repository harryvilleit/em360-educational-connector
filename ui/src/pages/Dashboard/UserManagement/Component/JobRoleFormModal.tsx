import { useEffect, useState } from "react"
import { getErrorMessage } from "@/utils"
import { Controller, useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FormDraftBanner } from "@/components/general/FormDraftBanner"
import { useFormDraft } from "@/hooks/useFormDraft"
import { Loader2 } from "lucide-react"
import { JobRoleSchema } from "@/schema/jobRoles.schema"
import { useGetSystemJobRoles } from "@/hooks/jobRoles"

interface JobRoleFormModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: JobRoleSchema) => void | Promise<void>
  defaultValues?: JobRoleSchema
  mode: "create" | "edit"
  isPending?: boolean
  /** The role's id — scopes the edit-mode autosave draft to this specific record. */
  jobRoleId?: string
}

const LABELS = {
  create: {
    title: "Add Job Role",
    description: "Create a new job role for your school staff.",
    submit: "Add Role",
  },
  edit: {
    title: "Edit Job Role",
    description: "Update the name or description of this role.",
    submit: "Save Changes",
  },
}

export default function JobRoleFormModal({
  open,
  onClose,
  onSubmit,
  defaultValues,
  mode,
  isPending = false,
  jobRoleId,
}: JobRoleFormModalProps) {
  const [submitError, setSubmitError] = useState("")
  const { systemJobRoles, isPending: isLoadingSystemRoles } =
    useGetSystemJobRoles()

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<JobRoleSchema>({
    resolver: zodResolver(JobRoleSchema),
    defaultValues: defaultValues ?? {
      name: "",
      description: "",
      systemJobRole: undefined,
    },
  })

  useEffect(() => {
    if (open) {
      setSubmitError("")
      reset(
        defaultValues ?? {
          name: "",
          description: "",
          systemJobRole: undefined,
        },
      )
    }
  }, [open, defaultValues, reset])

  const watchedAll = useWatch({ control })

  // Falls back to a key derived from the role's name/type when the caller
  // doesn't (yet) pass an explicit id, so drafts for different roles edited
  // in sequence don't collide.
  const formKey =
    mode === "edit"
      ? `user-mgt-job-role-edit-${
          jobRoleId ??
          `${defaultValues?.name ?? ""}-${defaultValues?.systemJobRole ?? ""}`
        }`
      : "user-mgt-job-role-create"

  const {
    hasDraft,
    draftValues,
    draftSavedAt,
    acknowledgeDraft,
    discardDraft,
    clearDraft,
  } = useFormDraft<JobRoleSchema>({
    formKey,
    values: watchedAll as JobRoleSchema,
    enabled: open,
  })

  function handleRestoreDraft() {
    if (!draftValues) return
    reset(draftValues)
    acknowledgeDraft()
  }

  const labels = LABELS[mode]

  const handleCancel = () => {
    onClose()
    reset()
  }

  const handleFormSubmit = async (data: JobRoleSchema) => {
    setSubmitError("")
    try {
      await onSubmit(data)
      clearDraft()
    } catch (error) {
      setSubmitError(
        getErrorMessage(
          error,
          "The role could not be saved. Please try again.",
        ),
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleCancel()}>
      <DialogContent className="rounded-2xl p-6 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">
            {labels.title}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {labels.description}
          </DialogDescription>
        </DialogHeader>

        {submitError && (
          <p role="alert" className="text-sm text-red-700">
            {submitError}
          </p>
        )}
        {hasDraft && draftSavedAt && (
          <FormDraftBanner
            savedAt={draftSavedAt}
            onRestore={handleRestoreDraft}
            onDiscard={discardDraft}
          />
        )}

        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="space-y-4 pt-2"
        >
          <FieldGroup>
            <Field data-invalid={!!errors.systemJobRole}>
              <FieldLabel>
                Job Role Type
                <span className="text-destructive ml-0.5">*</span>
              </FieldLabel>
              <Controller
                name="systemJobRole"
                control={control}
                render={({ field }) => (
                  <Select
                    value={
                      isLoadingSystemRoles
                        ? ""
                        : (field.value?.toString() ?? "")
                    }
                    onValueChange={(v) => field.onChange(Number(v))}
                    disabled={isLoadingSystemRoles}
                  >
                    <SelectTrigger className="border-gray-200 py-5">
                      <SelectValue
                        placeholder={
                          isLoadingSystemRoles
                            ? "Loading roles..."
                            : "Select a role type"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {systemJobRoles.map((role) => (
                        <SelectItem
                          key={role.Value}
                          value={role.Value.toString()}
                        >
                          {role.Name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.systemJobRole && (
                <FieldError errors={[errors.systemJobRole]} />
              )}
            </Field>

            <Field data-invalid={!!errors.name}>
              <FieldLabel>
                Role Name
                <span className="text-destructive ml-0.5">*</span>
              </FieldLabel>
              <Input
                {...register("name")}
                placeholder="e.g. Mathematics Teacher"
                className="border-gray-200 py-5"
              />
              {errors.name && <FieldError errors={[errors.name]} />}
            </Field>

            <Field data-invalid={!!errors.description}>
              <FieldLabel>Description</FieldLabel>
              <Input
                {...register("description")}
                placeholder="Brief description of this role"
                className="border-gray-200 py-5"
              />
            </Field>
          </FieldGroup>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 rounded-xl py-5"
              onClick={handleCancel}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 rounded-xl bg-blue-600 py-5 text-white hover:bg-blue-700 disabled:opacity-60"
              disabled={isPending}
            >
              {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              {isPending ? "Saving..." : labels.submit}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
