import { useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router"
import { toast } from "sonner"
import { Save } from "lucide-react"
import { DashboardRoutes } from "@/routes"
import { PageHeader } from "@/components/general/PageHeader"
import { FormDraftBanner } from "@/components/general/FormDraftBanner"
import { useCreateGuardian } from "@/hooks/guardian"
import { useFormDraft } from "@/hooks/useFormDraft"
import { getErrorMessage, isValidPhoneNumber } from "@/utils"
import { generateRandomPassword } from "@/utils/credentialGenerator"
import { PhoneInput } from "@/components/ui/phone-input"
import { GeneratedPasswordField } from "@/components/ui/generated-credential-field"
import { ParentFormField, inputClass } from "@/pages/Dashboard/Parent/components/ParentFormField"
import { useSchoolId } from "@/contexts/SchoolContext"

interface FormState {
  firstName: string
  lastName: string
  email: string
  password: string
  phone: string
  address: string
  occupation: string
  relationship: "Father" | "Mother" | "Guardian" | ""
}

type FormErrors = Partial<Record<keyof FormState, string>>

// Same fields as FormState, minus `password` — a login credential, never
// persisted to a draft.
type AddParentDraftValues = Omit<FormState, "password">

const INITIAL_STATE: FormState = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  phone: "",
  address: "",
  occupation: "",
  relationship: "",
}

export default function AddParentPage() {
  const { productId } = useParams<{ productId: string }>()
  const navigate = useNavigate()
  const schoolId = useSchoolId()
  const [form, setForm] = useState<FormState>(INITIAL_STATE)
  const [errors, setErrors] = useState<FormErrors>({})
  const { createGuardianAsync, isPending } = useCreateGuardian()

  // This is a single-step form that submits everything at once (no
  // in-memory step-store to worry about leaving half-populated), so restore
  // is a direct field-for-field copy — see handleRestoreDraft.
  const currentDraftValues = useMemo<AddParentDraftValues>(
    () => ({
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phone: form.phone,
      address: form.address,
      occupation: form.occupation,
      relationship: form.relationship,
    }),
    [
      form.firstName,
      form.lastName,
      form.email,
      form.phone,
      form.address,
      form.occupation,
      form.relationship,
    ]
  )

  const {
    hasDraft,
    draftValues: savedDraftValues,
    draftSavedAt,
    acknowledgeDraft,
    discardDraft,
    clearDraft,
  } = useFormDraft<AddParentDraftValues>({
    formKey: "parent-add",
    values: currentDraftValues,
    enabled: !isPending,
  })

  function handleRestoreDraft() {
    if (!savedDraftValues) return
    setForm((prev) => ({ ...prev, ...savedDraftValues }))
    acknowledgeDraft()
    toast.success("Draft restored — review the details and continue.")
  }

  function update(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }))
  }

  function validatePhone() {
    if (!form.phone.trim())
      setErrors((prev) => ({ ...prev, phone: "Phone number is required" }))
    else if (!isValidPhoneNumber(form.phone))
      setErrors((prev) => ({
        ...prev,
        phone: "Enter a valid phone number",
      }))
  }

  function validate(): boolean {
    const newErrors: FormErrors = {}
    if (!form.firstName.trim()) newErrors.firstName = "First name is required"
    if (!form.lastName.trim()) newErrors.lastName = "Last name is required"
    if (!form.email.trim()) newErrors.email = "Email address is required"
    else if (!/\S+@\S+\.\S+/.test(form.email))
      newErrors.email = "Enter a valid email"
    if (!form.phone.trim()) newErrors.phone = "Phone number is required"
    else if (!isValidPhoneNumber(form.phone))
      newErrors.phone = "Enter a valid phone number"
    if (!form.relationship) newErrors.relationship = "Select a relationship"
    if (!form.address.trim()) newErrors.address = "Home address is required"
    if (!form.password)
      newErrors.password =
        'Click "Generate Password" to create a login password.'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function handleGeneratePassword() {
    if (form.password) return
    update("password", generateRandomPassword())
  }

  async function handleSubmit() {
    if (!validate()) return

    try {
      await createGuardianAsync({
        firstName: form.firstName,
        lastName: form.lastName,
        address: form.address,
        phone: form.phone,
        email: form.email || undefined,
        password: form.password,
        relationship: form.relationship,
        occupation: form.occupation || undefined,
        schoolId,
      })
      clearDraft()
      navigate(DashboardRoutes.toParentList(productId!))
    } catch (error) {
      toast.error(
        getErrorMessage(error, "Failed to save parent. Please try again.")
      )
    }
  }

  return (
    <div>
      <PageHeader
        title="Add Parent"
        description="Register a new parent or guardian"
        onBack={() => navigate(-1)}
        className="mb-7"
      />

      {hasDraft && draftSavedAt && (
        <div className="mb-7">
          <FormDraftBanner
            savedAt={draftSavedAt}
            onRestore={handleRestoreDraft}
            onDiscard={discardDraft}
          />
        </div>
      )}

      <div className="space-y-6 rounded-xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-white/3">
        {/* Personal info */}
        <section>
          <h2 className="mb-4 text-sm font-medium text-gray-700 dark:text-gray-300">
            Personal information
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <ParentFormField
              label="First name"
              required
              error={errors.firstName}
            >
              <input
                type="text"
                placeholder="e.g. Chukwuemeka"
                value={form.firstName}
                onChange={(e) => update("firstName", e.target.value)}
                className={inputClass(!!errors.firstName)}
              />
            </ParentFormField>
            <ParentFormField label="Last name" required error={errors.lastName}>
              <input
                type="text"
                placeholder="e.g. Okafor"
                value={form.lastName}
                onChange={(e) => update("lastName", e.target.value)}
                className={inputClass(!!errors.lastName)}
              />
            </ParentFormField>
            <ParentFormField
              label="Relationship to student"
              required
              error={errors.relationship}
            >
              <select
                value={form.relationship}
                onChange={(e) => update("relationship", e.target.value)}
                className={inputClass(!!errors.relationship)}
              >
                <option value="">Select relationship</option>
                <option value="Father">Father</option>
                <option value="Mother">Mother</option>
                <option value="Guardian">Guardian</option>
              </select>
            </ParentFormField>
            <ParentFormField label="Occupation" error={errors.occupation}>
              <input
                type="text"
                placeholder="e.g. Engineer"
                value={form.occupation}
                onChange={(e) => update("occupation", e.target.value)}
                className={inputClass(false)}
              />
            </ParentFormField>
          </div>
        </section>

        <hr className="border-gray-100 dark:border-white/5" />

        {/* Contact info */}
        <section>
          <h2 className="mb-4 text-sm font-medium text-gray-700 dark:text-gray-300">
            Contact details
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <ParentFormField
              label="Email address"
              required
              error={errors.email}
            >
              <input
                type="email"
                placeholder="e.g. parent@email.com"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                className={inputClass(!!errors.email)}
              />
            </ParentFormField>
            <ParentFormField label="Phone number" required error={errors.phone}>
              <PhoneInput
                value={form.phone}
                onChange={(v) => update("phone", v)}
                onBlur={validatePhone}
                error={!!errors.phone}
              />
            </ParentFormField>
            <div className="sm:col-span-2">
              <ParentFormField
                label="Home address"
                required
                error={errors.address}
              >
                <input
                  type="text"
                  placeholder="e.g. 14 Awolowo Road, Ikoyi, Lagos"
                  value={form.address}
                  onChange={(e) => update("address", e.target.value)}
                  className={inputClass(!!errors.address)}
                />
              </ParentFormField>
            </div>
          </div>
        </section>

        <hr className="border-gray-100 dark:border-white/5" />

        {/* Account credentials */}
        <section>
          <h2 className="mb-4 text-sm font-medium text-gray-700 dark:text-gray-300">
            Account credentials
          </h2>
          <div className="max-w-md">
            <ParentFormField label="Password" required error={errors.password}>
              <GeneratedPasswordField
                value={form.password}
                onGenerate={handleGeneratePassword}
              />
            </ParentFormField>
          </div>
        </section>

        {/* Note about children linking */}
        <div className="flex gap-3 rounded-lg bg-blue-50 p-3.5 dark:bg-blue-900/20">
          <span className="mt-0.5 text-lg leading-none text-blue-500">ℹ</span>
          <p className="text-xs leading-relaxed text-blue-700 dark:text-blue-300">
            After saving, open the parent profile and choose{" "}
            <strong>Link a child</strong> to associate existing students.
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-5 flex items-center justify-end gap-3">
        <button
          onClick={() => navigate(-1)}
          className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={isPending}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Save size={14} />
          {isPending ? "Saving..." : "Save parent"}
        </button>
      </div>
    </div>
  )
}
