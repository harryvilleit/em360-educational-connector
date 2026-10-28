import { useState, useEffect, useRef } from "react"
import { Search, Plus, X, Check, UserCircle2, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useCreateGuardian, useGetGuardianByEmail } from "@/hooks/guardian"
import { getGuardianByEmailApi } from "@/api/guardian.api"
import { useDebouncedValue } from "@/hooks/useDebouncedValue"
import { getErrorMessage, isValidEmail, isValidPhoneNumber } from "@/utils"
import { generateRandomPassword } from "@/utils/credentialGenerator"
import { GeneratedPasswordField } from "@/components/ui/generated-credential-field"
import { Input } from "@/components/ui/input"
import { PhoneInput } from "@/components/ui/phone-input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FieldError } from "./FieldError"
import type { GuardianItemI } from "@/api/guardian.api/types"
import { useSchoolId } from "@/contexts/SchoolContext"

// ─── Relationships ────────────────────────────────────────────────────────────

const RELATIONSHIPS = [
  "Father",
  "Mother",
  "Guardian",
  "Uncle",
  "Aunt",
  "Sibling",
  "Other",
] as const

// ─── CreateGuardianModal ──────────────────────────────────────────────────────
// Private to this file. Owns its own form state and validation.
// Creates the guardian via the backend API, then emits the created object upward.

interface CreateGuardianModalProps {
  onCreated: (guardian: GuardianItemI) => void
  onClose: () => void
  prefillLastName?: string
}

function CreateGuardianModal({
  onCreated,
  onClose,
  prefillLastName = "",
}: CreateGuardianModalProps) {
  const { createGuardianAsync, isPending } = useCreateGuardian()
  const schoolId = useSchoolId()

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState(prefillLastName)
  const [relationship, setRelationship] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [address, setAddress] = useState("")
  const [occupation, setOccupation] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  function clearError(field: string) {
    setErrors((prev) => {
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  function handleGeneratePassword() {
    if (password) return
    setPassword(generateRandomPassword())
    clearError("password")
  }

  function validatePhone() {
    if (!phone.trim())
      setErrors((prev) => ({ ...prev, phone: "Phone number is required." }))
    else if (!isValidPhoneNumber(phone))
      setErrors((prev) => ({
        ...prev,
        phone: "Enter a valid Nigerian phone number",
      }))
  }

  async function handleSubmit() {
    const next: Record<string, string> = {}
    if (!firstName.trim()) next.firstName = "First name is required."
    if (!lastName.trim()) next.lastName = "Last name is required."
    if (!relationship) next.relationship = "Relationship is required."
    if (!phone.trim()) next.phone = "Phone number is required."
    else if (!isValidPhoneNumber(phone))
      next.phone = "Enter a valid Nigerian phone number"
    if (!email.trim())
      next.email = "Email is required — the parent needs it to sign in."
    else if (!isValidEmail(email)) next.email = "Enter a valid email address."
    if (!password)
      next.password = 'Click "Generate Password" to create a login password.'
    if (!address.trim()) next.address = "Address is required."
    setErrors(next)
    if (Object.keys(next).length > 0) {
      toast.error(
        "Please fill in all required fields before continuing — check the highlighted fields below.",
      )
      return
    }

    const trimmedFirstName = firstName.trim()
    const trimmedLastName = lastName.trim()
    const trimmedPhone = phone.trim()
    const trimmedEmail = email.trim()
    const trimmedAddress = address.trim()

    try {
      await createGuardianAsync({
        firstName: trimmedFirstName,
        lastName: trimmedLastName,
        relationship,
        phone: trimmedPhone,
        email: trimmedEmail,
        password,
        address: trimmedAddress,
        occupation: occupation.trim() || undefined,
        schoolId,
      })

      const lookup = await getGuardianByEmailApi({ email: trimmedEmail })
      const created = lookup.value

      if (!created) {
        toast.error(
          "Guardian was created but could not be linked automatically. Search for them above to link.",
        )
        onClose()
        return
      }

      onCreated(created)
    } catch (error) {
      toast.error(
        getErrorMessage(error, "Failed to create guardian. Please try again."),
      )
    }
  }

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [onClose])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Add parent or guardian"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal panel */}
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              Add Parent / Guardian
            </h2>
            <p className="text-xs text-gray-400">
              The guardian is registered now and linked when the student is
              saved.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Form body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">
                First Name <span className="text-red-500">*</span>
              </Label>
              <Input
                autoFocus
                value={firstName}
                onChange={(e) => {
                  setFirstName(e.target.value)
                  clearError("firstName")
                }}
                placeholder="e.g. Emeka"
                className={`rounded-md ${errors.firstName ? "border-red-400" : "border-gray-200"}`}
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
                  setLastName(e.target.value)
                  clearError("lastName")
                }}
                placeholder="e.g. Okonkwo"
                className={`rounded-md ${errors.lastName ? "border-red-400" : "border-gray-200"}`}
              />
              <FieldError message={errors.lastName} />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">
                Relationship <span className="text-red-500">*</span>
              </Label>
              <Select
                value={relationship}
                onValueChange={(v) => {
                  setRelationship(v)
                  clearError("relationship")
                }}
              >
                <SelectTrigger
                  className={`w-full rounded-md ${errors.relationship ? "border-red-400" : "border-gray-200"}`}
                >
                  <SelectValue placeholder="Select relationship" />
                </SelectTrigger>
                <SelectContent>
                  {RELATIONSHIPS.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError message={errors.relationship} />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">
                Phone <span className="text-red-500">*</span>
              </Label>
              <PhoneInput
                value={phone}
                onChange={(v) => {
                  setPhone(v)
                  clearError("phone")
                }}
                onBlur={validatePhone}
                error={!!errors.phone}
              />
              <FieldError message={errors.phone} />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  clearError("email")
                }}
                placeholder="e.g. parent@email.com"
                className={`rounded-md ${errors.email ? "border-red-400" : "border-gray-200"}`}
              />
              <FieldError message={errors.email} />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">
                Occupation{" "}
                <span className="text-xs font-normal text-gray-400">
                  (optional)
                </span>
              </Label>
              <Input
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                placeholder="optional"
                className="rounded-md border-gray-200"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-sm font-medium text-gray-700">
                Address <span className="text-red-500">*</span>
              </Label>
              <Input
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value)
                  clearError("address")
                }}
                placeholder="e.g. 12 Marina Road, Lagos"
                className={`rounded-md ${errors.address ? "border-red-400" : "border-gray-200"}`}
              />
              <FieldError message={errors.address} />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-sm font-medium text-gray-700">
                Password <span className="text-red-500">*</span>
              </Label>
              <GeneratedPasswordField
                value={password}
                onGenerate={handleGeneratePassword}
              />
              <FieldError message={errors.password} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-gray-100 px-6 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isPending}
            className="rounded-md border-gray-200"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isPending}
            className="gap-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700"
          >
            {isPending && <Loader2 className="size-4 animate-spin" />}
            Save & Link Guardian
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── GuardianSelector ─────────────────────────────────────────────────────────

interface GuardianSelectorProps {
  value: GuardianItemI | null
  onChange: (guardian: GuardianItemI | null) => void
  studentLastName?: string
  error?: string
}

export function GuardianSelector({
  value,
  onChange,
  studentLastName = "",
  error,
}: GuardianSelectorProps) {
  const [query, setQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const debouncedQuery = useDebouncedValue(query, 300)
  const isEmailQuery = isValidEmail(debouncedQuery)
  const { guardian: matchedGuardian, isLoading: guardianLoading } =
    useGetGuardianByEmail(debouncedQuery)

  // Close dropdown on outside click
  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleOutsideClick)
    return () => document.removeEventListener("mousedown", handleOutsideClick)
  }, [])

  // ── Confirmed state: guardian already selected ────────────────────────────
  if (value) {
    return (
      <div className="space-y-1.5">
        <div className="flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
          <div className="flex items-center gap-3">
            {/* Avatar initials */}
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-600">
              {value.firstName[0]}
              {value.lastName[0]}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {value.firstName} {value.lastName}
              </p>
              <p className="text-xs text-gray-400">
                {value.relationship} · {value.phone}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
              <Check className="size-3" />
              Confirmed
            </span>
            <button
              type="button"
              onClick={() => {
                onChange(null)
                setQuery("")
              }}
              className="rounded-md p-1 text-gray-400 hover:bg-white hover:text-gray-600"
              title="Change guardian"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Unselected state: search row + always-visible Add Parent button ────────
  return (
    <>
      <div className="space-y-3" ref={containerRef}>
        {/* Row: search input + Add Parent button (always visible) */}
        <div className="flex items-center gap-2">
          {/* Search input */}
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="email"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setIsOpen(true)
              }}
              onFocus={() => setIsOpen(true)}
              placeholder="Search by parent's email..."
              className={`rounded-md pl-9 ${error ? "border-red-400" : "border-gray-200"}`}
            />
            {guardianLoading && (
              <Loader2 className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-gray-400" />
            )}
          </div>

          <Button
            type="button"
            onClick={() => {
              setIsOpen(false)
              setShowCreateModal(true)
            }}
            className="shrink-0 gap-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700"
          >
            <Plus className="size-4" />
            Add Parent
          </Button>
        </div>

        {/* Dropdown: only shown when input is focused and there's a query */}
        {isOpen && (
          <div className="relative">
            <div className="absolute z-40 w-full overflow-hidden rounded-lg border border-gray-100 bg-white shadow-lg">
              {matchedGuardian ? (
                <div className="max-h-56 overflow-y-auto">
                  <button
                    type="button"
                    onClick={() => {
                      onChange(matchedGuardian)
                      setIsOpen(false)
                      setQuery("")
                    }}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50"
                  >
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-500">
                      {matchedGuardian.firstName[0]}
                      {matchedGuardian.lastName[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {matchedGuardian.firstName} {matchedGuardian.lastName}
                      </p>
                      <p className="truncate text-xs text-gray-400">
                        {matchedGuardian.relationship} · {matchedGuardian.email}
                      </p>
                    </div>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3 px-4 py-3">
                  <UserCircle2 className="size-5 shrink-0 text-gray-300" />
                  <p className="text-sm text-gray-400">
                    {!query.trim() ? (
                      "Type the parent's email to search."
                    ) : !isEmailQuery ? (
                      "Enter a complete email address to search."
                    ) : guardianLoading ? (
                      "Searching…"
                    ) : (
                      <>
                        No parent found with that email — use{" "}
                        <button
                          type="button"
                          onClick={() => {
                            setIsOpen(false)
                            setShowCreateModal(true)
                          }}
                          className="font-medium text-blue-600 hover:underline"
                        >
                          Add Parent
                        </button>{" "}
                        to register a new one.
                      </>
                    )}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        <FieldError message={error} />
      </div>

      {/* Create modal — rendered outside the ref container so outside-click
          detection on the search dropdown doesn't interfere with the modal */}
      {showCreateModal && (
        <CreateGuardianModal
          prefillLastName={studentLastName}
          onCreated={(guardian) => {
            onChange(guardian)
            setShowCreateModal(false)
          }}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </>
  )
}
