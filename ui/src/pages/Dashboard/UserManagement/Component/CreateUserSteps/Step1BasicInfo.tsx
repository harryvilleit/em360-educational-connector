import { useMemo } from "react"
import { Controller } from "react-hook-form"
import type { UseFormReturn } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { PhoneInput } from "@/components/ui/phone-input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AlertTriangle, X } from "lucide-react"
import type { CreateUserSchema } from "@/schema/user.schema"
import type { JobRoleItem } from "@/api/userMgt.api/types"

interface Step1Props {
  form: UseFormReturn<CreateUserSchema>
  jobRoles: JobRoleItem[]
  onNext: () => void
  onClose: () => void
}

export default function Step1BasicInfo({
  form,
  jobRoles,
  onNext,
  onClose,
}: Step1Props) {
  const handleNext = async () => {
    const valid = await form.trigger([
      "firstName",
      "lastName",
      "email",
      "phoneNumber",
      "jobRoles",
      "staffId",
      "gender",
      "dateOfBirth",
      "employmentType",
      "qualification",
    ])
    if (valid) onNext()
  }

  const jobRolesById = useMemo(
    () => new Map(jobRoles.map((r) => [r.Id, r])),
    [jobRoles]
  )

  return (
    <FieldGroup>
      <p className="text-xs text-muted-foreground">
        All fields below are required.
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Controller
          name="firstName"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>
                First Name<span className="text-destructive"> *</span>
              </FieldLabel>
              <Input
                {...field}
                placeholder="Taiwo"
                className="border-gray-200 py-5"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />
        <Controller
          name="lastName"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>
                Last Name<span className="text-destructive"> *</span>
              </FieldLabel>
              <Input
                {...field}
                placeholder="Adeyemi"
                className="border-gray-200 py-5"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>
                Email Address<span className="text-destructive"> *</span>
              </FieldLabel>
              <Input
                {...field}
                type="email"
                placeholder="taiwo@school.edu.ng"
                className="border-gray-200 py-5"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />
        <Controller
          name="phoneNumber"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>
                Phone Number<span className="text-destructive"> *</span>
              </FieldLabel>
              <PhoneInput
                value={field.value ?? ""}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={fieldState.invalid}
                className="border-gray-200 py-5"
              />
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />
      </div>

      {/* Job Role(s) */}
      <Controller
        name="jobRoles"
        control={form.control}
        render={({ field, fieldState }) => {
          const selectedIds = field.value ?? []

          const toggleRole = (id: string) => {
            field.onChange(
              selectedIds.includes(id)
                ? selectedIds.filter((r) => r !== id)
                : [...selectedIds, id]
            )
          }

          return (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>
                Job Role(s)<span className="text-destructive"> *</span>
              </FieldLabel>

              {selectedIds.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-1.5">
                  {selectedIds.map((id) => {
                    const role = jobRolesById.get(id)
                    if (!role) return null
                    return (
                      <span
                        key={id}
                        className="flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 capitalize"
                      >
                        {role.Name}
                        <button
                          type="button"
                          onClick={() => toggleRole(id)}
                          className="rounded-full p-0.5 hover:bg-blue-100"
                        >
                          <X className="size-3" />
                        </button>
                      </span>
                    )
                  })}
                </div>
              )}

              <div
                className="max-h-40 space-y-1 overflow-y-auto rounded-xl border border-gray-200 p-2"
                aria-invalid={fieldState.invalid}
              >
                {jobRoles.length === 0 ? (
                  <p className="flex items-center gap-1.5 px-2 py-1.5 text-xs text-amber-600">
                    <AlertTriangle className="size-3.5 shrink-0" />
                    No job roles found. Please create roles first.
                  </p>
                ) : (
                  jobRoles.map((role) => (
                    <label
                      key={role.Id}
                      className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-gray-50"
                    >
                      <Checkbox
                        checked={selectedIds.includes(role.Id)}
                        onCheckedChange={() => toggleRole(role.Id)}
                      />
                      <span className="text-sm text-gray-700 capitalize">
                        {role.Name}
                      </span>
                    </label>
                  ))
                )}
              </div>

              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )
        }}
      />

      <Controller
        name="staffId"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>
              Staff ID<span className="text-destructive"> *</span>
            </FieldLabel>
            <Input
              {...field}
              placeholder="e.g. STF-001"
              className="border-gray-200 py-5"
              aria-invalid={fieldState.invalid}
            />
            {fieldState.invalid && (
              <FieldError errors={[fieldState.error]} />
            )}
          </Field>
        )}
      />

      <div className="rounded-xl border border-gray-200 p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Controller
            name="gender"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>
                  Gender<span className="text-destructive"> *</span>
                </FieldLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full border-gray-200 py-5">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="dateOfBirth"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>
                  Date of Birth<span className="text-destructive"> *</span>
                </FieldLabel>
                <Input
                  {...field}
                  type="date"
                  className="border-gray-200 py-5"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="employmentType"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>
                  Employment Type<span className="text-destructive"> *</span>
                </FieldLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full border-gray-200 py-5">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">Full-time</SelectItem>
                    <SelectItem value="part-time">Part-time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                  </SelectContent>
                </Select>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="qualification"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>
                  Qualification<span className="text-destructive"> *</span>
                </FieldLabel>
                <Input
                  {...field}
                  placeholder="e.g. B.Ed. Mathematics Education"
                  className="border-gray-200 py-5"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </div>
      </div>

      <div className="flex w-full gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1 rounded-xl py-5"
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          type="button"
          className="flex-1 rounded-xl bg-blue-600 py-5 text-white hover:bg-blue-700"
          onClick={handleNext}
        >
          Next
        </Button>
      </div>
    </FieldGroup>
  )
}
