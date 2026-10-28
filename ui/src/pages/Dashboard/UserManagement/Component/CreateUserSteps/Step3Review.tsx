import type { UseFormReturn } from "react-hook-form"
import { Button } from "@/components/ui/button"
import type { CreateUserSchema } from "@/schema/user.schema"
import type { JobRoleItem } from "@/api/userMgt.api/types"

const GENDER_LABELS: Record<string, string> = {
  male: "Male",
  female: "Female",
  other: "Prefer not to say",
}

const EMPLOYMENT_TYPE_LABELS: Record<string, string> = {
  "full-time": "Full-time",
  "part-time": "Part-time",
  contract: "Contract",
}

interface Step3Props {
  form: UseFormReturn<CreateUserSchema>
  jobRoles: JobRoleItem[]
  isPending: boolean
  onBack: () => void
}

export default function Step3Review({
  form,
  jobRoles,
  isPending,
  onBack,
}: Step3Props) {
  const formValues = form.watch()

  return (
    <div className="space-y-4">
      {/* User details */}
      <div className="space-y-3 rounded-xl border border-gray-100 bg-gray-50/50 p-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
          User Details
        </p>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Full Name</p>
            <p className="font-medium text-gray-900">
              {formValues.firstName} {formValues.lastName}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Email</p>
            <p className="font-medium text-gray-900">{formValues.email}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Phone</p>
            <p className="font-medium text-gray-900">{formValues.phoneNumber}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">
              Job Role{(formValues.jobRoles?.length ?? 0) > 1 ? "s" : ""}
            </p>
            <p className="font-medium text-gray-900 capitalize">
              {(formValues.jobRoles ?? [])
                .map((id) => jobRoles.find((r) => r.Id === id)?.Name ?? id)
                .join(", ") || "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Staff ID</p>
            <p className="font-medium text-gray-900">
              {formValues.staffId || "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Gender</p>
            <p className="font-medium text-gray-900">
              {(formValues.gender && GENDER_LABELS[formValues.gender]) || "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Date of Birth</p>
            <p className="font-medium text-gray-900">
              {formValues.dateOfBirth || "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Employment Type</p>
            <p className="font-medium text-gray-900">
              {(formValues.employmentType &&
                EMPLOYMENT_TYPE_LABELS[formValues.employmentType]) ||
                "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Qualification</p>
            <p className="font-medium text-gray-900">
              {formValues.qualification || "—"}
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1 rounded-xl py-5"
          onClick={onBack}
        >
          Back
        </Button>
        <Button
          type="submit"
          disabled={isPending}
          className="flex-1 rounded-xl bg-blue-600 py-5 text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {isPending ? "Creating..." : "Create User"}
        </Button>
      </div>
    </div>
  )
}
