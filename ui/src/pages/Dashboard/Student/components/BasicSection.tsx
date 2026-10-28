import { toast } from "sonner"
import { useMemo } from "react"
import { Loader2, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Combobox } from "@/components/ui/combobox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { COUNTRIES } from "@/data/countries"
import type { BasicSectionProps, Gender } from "@/types/student"
import NaijaStates from "naija-state-local-government"
import {
  GeneratedEmailField,
  GeneratedPasswordField,
} from "@/components/ui/generated-credential-field"
import { FieldError } from "./FieldError"
import { GuardianSelector } from "./GuardianSelector"

// Static — computed once at module load rather than on every render.
const ALL_STATES: string[] = NaijaStates.states()

export function BasicSection({
  studentId,
  firstName,
  lastName,
  middleName,
  email,
  isDefaultEmail,
  onDefaultEmailChange,
  password,
  gender,
  dob,
  nationality,
  stateOfOrigin,
  lgaOfOrigin,
  passport,
  onPassportChange,
  selectedGuardian,
  onGuardianChange,
  errors,
  onStudentIdChange,
  onFirstNameChange,
  onLastNameChange,
  onMiddleNameChange,
  onGenerateEmail,
  onEmailChange,
  onGeneratePassword,
  onGenderChange,
  onDobChange,
  onNationalityChange,
  onStateOfOriginChange,
  onLgaOfOriginChange,
  clearError,
  onSave,
  onCancel,
  existingStudentQuery,
  onExistingStudentQueryChange,
  existingStudentResults,
  existingStudentLoading,
  linkedExistingStudent,
  onSelectExistingStudent,
  onClearExistingStudent,
}: BasicSectionProps) {
  const canGenerateCredentials = !!firstName.trim() && !!lastName.trim()
  const lgas = useMemo(
    () => (stateOfOrigin ? (NaijaStates.lgas(stateOfOrigin)?.lgas ?? []) : []),
    [stateOfOrigin],
  )
  const isNigeria = nationality === "Nigeria"

  return (
    <div className="space-y-6 px-4 pb-6 sm:px-6">
      {/* ── Link existing student ── */}
      <div>
        <p className="mb-3 text-xs font-semibold tracking-widest text-gray-400 uppercase">
          Link Existing Student{" "}
          <span className="font-normal text-gray-400 normal-case">
            (optional enroll a student already registered at another school)
          </span>
        </p>
        {linkedExistingStudent ? (
          <div className="flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {linkedExistingStudent.firstname}{" "}
                {linkedExistingStudent.lastname}
              </p>
              <p className="text-xs text-gray-400">
                Existing student fields below were prefilled and can still be
                edited
              </p>
            </div>
            <button
              type="button"
              onClick={onClearExistingStudent}
              className="rounded-md p-1 text-gray-400 hover:bg-white hover:text-gray-600"
              title="Unlink student"
            >
              <X className="size-4" />
            </button>
          </div>
        ) : (
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
            <Input
              value={existingStudentQuery}
              onChange={(e) => onExistingStudentQueryChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key !== "Enter") return
                e.preventDefault()
                if (existingStudentResults.length > 0) {
                  onSelectExistingStudent(existingStudentResults[0])
                }
              }}
              placeholder="Search by name to link an existing student..."
              className="rounded-md border-gray-200 pl-9"
            />
            {existingStudentQuery && existingStudentLoading && (
              <Loader2 className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-gray-400" />
            )}
            {existingStudentQuery && !existingStudentLoading && (
              <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-gray-100 bg-white shadow-lg">
                {existingStudentResults.length > 0 ? (
                  <div className="max-h-56 overflow-y-auto">
                    {existingStudentResults.map((r) => (
                      <button
                        key={r.studentId}
                        type="button"
                        onClick={() => onSelectExistingStudent(r)}
                        className="flex w-full flex-col items-start px-4 py-3 text-left transition-colors hover:bg-gray-50"
                      >
                        <p className="text-sm font-medium text-gray-900">
                          {r.firstname} {r.lastname}
                        </p>
                        <p className="text-xs text-gray-400">{r.email}</p>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="px-4 py-3 text-sm text-gray-400">
                    {existingStudentQuery.trim().length < 3
                      ? "Enter at least three characters to search."
                      : `No eligible student found matching "${existingStudentQuery}"`}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Passport photo ── */}
      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-gray-700">
          Passport Photo
        </Label>
        <div className="flex items-center gap-4">
          {passport && (
            <img
              src={passport}
              alt="Passport preview"
              className="size-16 rounded-full border border-gray-200 object-cover"
            />
          )}
          <label className="cursor-pointer rounded-md border border-dashed border-gray-300 px-4 py-2 text-sm text-gray-500 transition-colors hover:border-blue-400 hover:text-blue-500">
            {passport ? "Change photo" : "Upload photo (optional)"}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (!file) return
                if (
                  file.size > 5 * 1024 * 1024 ||
                  ![
                    "image/png",
                    "image/jpeg",
                    "image/webp",
                    "image/gif",
                  ].includes(file.type)
                ) {
                  toast.error(
                    "Choose a PNG, JPEG, WebP or GIF image of 5 MB or less.",
                  )
                  return
                }
                const reader = new FileReader()
                reader.onload = () => onPassportChange(reader.result as string)
                reader.readAsDataURL(file)
              }}
            />
          </label>
          {passport && (
            <button
              type="button"
              onClick={() => onPassportChange(null)}
              className="text-xs text-red-400 hover:text-red-600"
            >
              Remove
            </button>
          )}
        </div>
      </div>

      <div>
        <p className="mb-3 text-xs font-semibold tracking-widest text-gray-400 uppercase">
          Student Identity
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-700">
              Student ID <span className="text-red-500">*</span>
            </Label>
            <Input
              value={studentId}
              onChange={(e) => {
                onStudentIdChange(e.target.value)
                clearError("studentId")
              }}
              placeholder="e.g. STU-2025-001"
              className={`h-11 rounded-md ${errors.studentId ? "border-red-400" : "border-gray-200"}`}
            />
            <FieldError message={errors.studentId} />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-700">
              Gender <span className="text-red-500">*</span>
            </Label>
            <Select
              value={gender}
              onValueChange={(v) => {
                onGenderChange(v as Gender)
                clearError("gender")
              }}
            >
              <SelectTrigger
                className={`w-full rounded-md ${errors.gender ? "border-red-400" : "border-gray-200"}`}
              >
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                {["Male", "Female"].map((g) => (
                  <SelectItem key={g} value={g}>
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError message={errors.gender} />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-700">
              First Name <span className="text-red-500">*</span>
            </Label>
            <Input
              value={firstName}
              onChange={(e) => {
                onFirstNameChange(e.target.value)
                clearError("firstName")
              }}
              placeholder="First name"
              className={`h-11 rounded-md ${errors.firstName ? "border-red-400" : "border-gray-200"}`}
            />
            <FieldError message={errors.firstName} />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-700">
              Last Name <span className="text-red-500">*</span>
            </Label>
            <Input
              value={lastName}
              onChange={(e) => {
                onLastNameChange(e.target.value)
                clearError("lastName")
              }}
              placeholder="Last name"
              className={`h-11 rounded-md ${errors.lastName ? "border-red-400" : "border-gray-200"}`}
            />
            <FieldError message={errors.lastName} />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-700">
              Middle Name
            </Label>
            <Input
              value={middleName}
              onChange={(e) => onMiddleNameChange(e.target.value)}
              placeholder="Middle name (optional)"
              className="h-11 rounded-md border-gray-200"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-700">
              Date of Birth <span className="text-red-500">*</span>
            </Label>
            <Input
              type="date"
              value={dob}
              onChange={(e) => {
                onDobChange(e.target.value)
                clearError("dob")
              }}
              className={`h-11 w-full rounded-md ${errors.dob ? "border-red-400" : "border-gray-200"}`}
            />
            <FieldError message={errors.dob} />
          </div>
        </div>
      </div>

      <div>
        <p className="mb-3 text-xs font-semibold tracking-widest text-gray-400 uppercase">
          Login Credentials
        </p>
        {!canGenerateCredentials && (
          <p className="mb-3 text-xs text-gray-400">
            Enter the student's first and last name above to generate{" "}
            {isDefaultEmail ? "an email and password." : "a password."}
          </p>
        )}
        <div className="mb-4 flex items-center gap-2">
          <Checkbox
            id="use-default-student-email"
            checked={isDefaultEmail}
            onCheckedChange={(checked) =>
              onDefaultEmailChange(checked === true)
            }
          />
          <Label
            htmlFor="use-default-student-email"
            className="text-sm text-gray-700"
          >
            Use Default/System Generated Email
          </Label>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label
              htmlFor="student-email"
              className="text-sm font-medium text-gray-700"
            >
              Email <span className="text-red-500">*</span>
            </Label>
            <GeneratedEmailField
              id="student-email"
              isDefaultEmail={isDefaultEmail}
              error={errors.email}
              value={email}
              onGenerate={onGenerateEmail}
              onChange={onEmailChange}
              disabled={!canGenerateCredentials}
            />
            <div id="student-email-error">
              <FieldError message={errors.email} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-700">
              Password <span className="text-red-500">*</span>
            </Label>
            <GeneratedPasswordField
              value={password}
              onGenerate={onGeneratePassword}
              disabled={!canGenerateCredentials}
            />
            <FieldError message={errors.password} />
          </div>
        </div>
      </div>

      <div>
        <p className="mb-3 text-xs font-semibold tracking-widest text-gray-400 uppercase">
          Nationality & Origin
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Nationality */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-700">
              Nationality <span className="text-red-500">*</span>
            </Label>
            <Combobox
              value={nationality}
              onValueChange={(value) => {
                onNationalityChange(value)
                if (value !== nationality) {
                  onStateOfOriginChange("")
                  onLgaOfOriginChange("")
                }
                clearError("nationality")
              }}
              options={COUNTRIES}
              placeholder="Select country"
              searchPlaceholder="Search countries..."
              className={`h-11 ${errors.nationality ? "border-red-400" : ""}`}
            />
            <FieldError message={errors.nationality} />
          </div>

          {/* State of Origin */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-700">
              {isNigeria ? "State of Origin" : "State / Province / Region"}{" "}
              <span className="text-red-500">*</span>
            </Label>
            {isNigeria ? (
              <Select
                value={stateOfOrigin}
                onValueChange={(value) => {
                  onStateOfOriginChange(value)
                  onLgaOfOriginChange("")
                  clearError("stateOfOrigin")
                }}
              >
                <SelectTrigger
                  className={`w-full rounded-md ${errors.stateOfOrigin ? "border-red-400" : "border-gray-200"}`}
                >
                  <SelectValue placeholder="Select a state" />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  {ALL_STATES.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                value={stateOfOrigin}
                onChange={(e) => {
                  onStateOfOriginChange(e.target.value)
                  clearError("stateOfOrigin")
                }}
                placeholder="e.g. State, province or region"
                className={`h-11 rounded-md ${errors.stateOfOrigin ? "border-red-400" : "border-gray-200"}`}
              />
            )}
            <FieldError message={errors.stateOfOrigin} />
          </div>

          {/* LGA */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-700">
              {isNigeria ? "Local Government Area" : "City / District"}{" "}
              <span className="text-red-500">*</span>
            </Label>
            {isNigeria ? (
              <Select
                value={lgaOfOrigin}
                onValueChange={(value) => {
                  onLgaOfOriginChange(value)
                  clearError("lgaOfOrigin")
                }}
                disabled={!stateOfOrigin}
              >
                <SelectTrigger
                  className={`w-full rounded-md disabled:opacity-50 ${errors.lgaOfOrigin ? "border-red-400" : "border-gray-200"}`}
                >
                  <SelectValue
                    placeholder={
                      stateOfOrigin
                        ? "Select a local government area"
                        : "Select a state first"
                    }
                  />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  {lgas.map((lga) => (
                    <SelectItem key={lga} value={lga}>
                      {lga}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                value={lgaOfOrigin}
                onChange={(e) => {
                  onLgaOfOriginChange(e.target.value)
                  clearError("lgaOfOrigin")
                }}
                placeholder="e.g. City or district"
                className={`h-11 rounded-md ${errors.lgaOfOrigin ? "border-red-400" : "border-gray-200"}`}
              />
            )}
            <FieldError message={errors.lgaOfOrigin} />
          </div>
        </div>
      </div>

      <div>
        <p className="mb-3 text-xs font-semibold tracking-widest text-gray-400 uppercase">
          Guardian / Parent <span className="text-red-500">*</span>
        </p>
        <GuardianSelector
          value={selectedGuardian}
          onChange={(g) => {
            onGuardianChange(g)
            clearError("guardian")
          }}
          studentLastName={lastName}
          error={errors.guardian}
        />
      </div>

      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="w-full rounded-md border-gray-200 sm:w-auto"
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={onSave}
          className="w-full rounded-md bg-blue-600 text-white hover:bg-blue-700 sm:w-auto"
        >
          Continue
        </Button>
      </div>
    </div>
  )
}
