import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { FormDraftBanner } from "@/components/general/FormDraftBanner"
import { useFormDraft } from "@/hooks/useFormDraft"
import { CheckCircle2, ChevronRight } from "lucide-react"
import { CreateUserSchema } from "@/schema/user.schema"
import { STEPS } from "@/data"
import { useCreateSubUser, useGetAllJobRolesById } from "@/hooks/userMgt"
import type { CreateUserModalProps } from "@/types/user-management"
import { useProductStore } from "@/store/product.store"
import { useSchoolId } from "@/contexts/SchoolContext"
import { getErrorMessage } from "@/utils"
import Step1BasicInfo from "./CreateUserSteps/Step1BasicInfo"
import Step3Review from "./CreateUserSteps/Step3Review"

const GENDER_TO_API: Record<NonNullable<CreateUserSchema["gender"]>, number> = {
  male: 1,
  female: 2,
  other: 3,
}

export default function CreateUserModal({
  open,
  onClose,
  onSuccess,
}: CreateUserModalProps) {
  const schoolId = useSchoolId()
  const generalProductId = useProductStore((s) => s.generalProductId)
  const { allJobRoles } = useGetAllJobRolesById(schoolId)
  const jobRoles = allJobRoles?.Value ?? []

  const { createSubUserAsync, isPending } = useCreateSubUser()
  const [submitError, setSubmitError] = useState("")

  const [currentStep, setCurrentStep] = useState(1)

  const form = useForm<CreateUserSchema>({
    resolver: zodResolver(CreateUserSchema),
    defaultValues: {
      jobRoles: [],
      staffId: "",
      dateOfBirth: "",
      qualification: "",
    },
    mode: "onChange",
  })

  // CreateUserSchema has no password/credential field — the backend emails
  // generated credentials to the new user, so the full watched form values
  // are safe to persist as an autosave draft.
  const watchedAll = useWatch({ control: form.control })

  const {
    hasDraft,
    draftValues,
    draftSavedAt,
    acknowledgeDraft,
    discardDraft,
    clearDraft,
  } = useFormDraft<CreateUserSchema>({
    formKey: "user-mgt-user-create",
    values: watchedAll as CreateUserSchema,
    enabled: open,
  })

  function handleRestoreDraft() {
    if (!draftValues) return
    form.reset(draftValues)
    acknowledgeDraft()
  }

  const onSubmit = async (data: CreateUserSchema) => {
    setSubmitError("")
    try {
      await createSubUserAsync({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        address: "",
        productId: generalProductId,
        schoolId,
        jobRoleIds: data.jobRoles,
        staffId: data.staffId,
        qualification: data.qualification || undefined,
        employmentType: data.employmentType,
        dateOfBirth: data.dateOfBirth || undefined,
        gender: data.gender ? GENDER_TO_API[data.gender] : undefined,
      })

      form.reset()
      clearDraft()
      setCurrentStep(1)
      onClose()
      onSuccess?.({
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        // CreateSubUser no longer returns a generated password in its
        // response (see CreateSubUserResponseI) — the backend presumably
        // emails credentials directly to the new user now.
        password: "",
      })
    } catch (error) {
      setSubmitError(
        getErrorMessage(error, "Unable to create this user. Please try again."),
      )
    }
  }

  const handleClose = () => {
    form.reset()
    setSubmitError("")
    setCurrentStep(1)
    onClose()
  }

  const stepDescriptions = [
    "Enter the user's basic information.",
    "Review the details before creating the user.",
  ]

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl p-6 sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">
            Add User
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {stepDescriptions[currentStep - 1]}
          </DialogDescription>
        </DialogHeader>

        {hasDraft && draftSavedAt && (
          <FormDraftBanner
            savedAt={draftSavedAt}
            onRestore={handleRestoreDraft}
            onDiscard={discardDraft}
          />
        )}

        {/* Step indicator */}
        <div className="flex items-center gap-2 py-2">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => currentStep > step.id && setCurrentStep(step.id)}
                className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                  currentStep === step.id
                    ? "bg-blue-600 text-white"
                    : currentStep > step.id
                      ? "cursor-pointer bg-green-50 text-green-700 hover:bg-green-100"
                      : "cursor-not-allowed bg-gray-100 text-gray-400"
                }`}
              >
                {currentStep > step.id ? (
                  <CheckCircle2 className="size-3.5" />
                ) : (
                  <step.icon className="size-3.5" />
                )}
                {step.label}
              </button>
              {index < STEPS.length - 1 && (
                <ChevronRight className="size-3.5 text-gray-300" />
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-2">
          {submitError && (
            <p
              role="alert"
              className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
            >
              {submitError}
            </p>
          )}
          {currentStep === 1 && (
            <Step1BasicInfo
              form={form}
              jobRoles={jobRoles}
              onNext={() => setCurrentStep(2)}
              onClose={handleClose}
            />
          )}

          {currentStep === 2 && (
            <Step3Review
              form={form}
              jobRoles={jobRoles}
              isPending={isPending}
              onBack={() => setCurrentStep(1)}
            />
          )}
        </form>
      </DialogContent>
    </Dialog>
  )
}
