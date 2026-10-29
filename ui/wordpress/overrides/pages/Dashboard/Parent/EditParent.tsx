import { QueryErrorPanel } from "@/components/general/QueryErrorPanel"
import { useRef, useState } from "react"
import { useNavigate, useParams } from "react-router"
import { toast } from "sonner"
import { Save } from "lucide-react"
import { DashboardRoutes } from "@/routes"
import { PageHeader } from "@/components/general/PageHeader"
import { useGetGuardianById, useUpdateGuardian } from "@/hooks/guardian"
import { getErrorMessage, isValidPhoneNumber } from "@/utils"
import { PhoneInput } from "@/components/ui/phone-input"
import { ParentFormField, inputClass } from "@/pages/Dashboard/Parent/components/ParentFormField"

interface FormState {
  firstName: string
  lastName: string
  relationship: "Father" | "Mother" | "Guardian" | ""
  email: string
  phone: string
  address: string
  occupation: string
}

type FormErrors = Partial<Record<keyof FormState, string>>

export default function EditParentPage() {
  const { productId, parentId } = useParams<{
    productId: string
    parentId: string
  }>()
  const navigate = useNavigate()

  const { guardian, isLoading, isError, error, refetch } = useGetGuardianById({
    id: parentId!,
  })
  const { updateGuardianAsync, isPending } = useUpdateGuardian()

  const [form, setForm] = useState<FormState>({
    firstName: "",
    lastName: "",
    relationship: "",
    email: "",
    phone: "",
    address: "",
    occupation: "",
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [loadedGuardianId, setLoadedGuardianId] = useState<string | null>(null)

  const lastNameRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const occupationRef = useRef<HTMLInputElement>(null)
  const addressRef = useRef<HTMLInputElement>(null)

  if (guardian && guardian.id !== loadedGuardianId) {
    setLoadedGuardianId(guardian.id)
    setForm({
      firstName: guardian.firstName,
      lastName: guardian.lastName,
      relationship:
        guardian.relationship === "Father" ||
        guardian.relationship === "Mother" ||
        guardian.relationship === "Guardian"
          ? guardian.relationship
          : "",
      email: guardian.email,
      phone: guardian.phone,
      address: guardian.address,
      occupation: guardian.occupation,
    })
  }

  if (isLoading) {
    return (
      <div className="p-6 text-center text-sm text-gray-400 dark:text-gray-500">
        Loading parent...
      </div>
    )
  }

  if (isError)
    return (
      <QueryErrorPanel
        title="Unable to load parent"
        message={error?.message || "Please try again."}
        onRetry={() => void refetch()}
      />
    )
  if (!guardian) {
    return (
      <div className="p-6 text-center text-sm text-gray-400 dark:text-gray-500">
        Parent not found.
      </div>
    )
  }

  const existing = guardian

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
    if (!form.relationship) newErrors.relationship = "Select a relationship"
    if (!form.phone.trim()) newErrors.phone = "Phone number is required"
    else if (!isValidPhoneNumber(form.phone))
      newErrors.phone = "Enter a valid phone number"
    if (!form.address.trim()) newErrors.address = "Home address is required"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit() {
    if (isPending || !validate()) return

    try {
      await updateGuardianAsync({
        id: parentId!,
        firstName: form.firstName,
        lastName: form.lastName,
        relationship: form.relationship,
        phone: form.phone,
        address: form.address,
        occupation: form.occupation,
      })
      navigate(DashboardRoutes.toParentProfile(productId!, parentId!))
    } catch (error) {
      toast.error(
        getErrorMessage(error, "Failed to update parent. Please try again.")
      )
    }
  }

  return (
    <div>
      <PageHeader
        title="Edit Parent"
        description={`Update details for ${existing.firstName} ${existing.lastName}`}
        onBack={() => navigate(-1)}
        className="mb-7"
      />

      <div className="space-y-6 rounded-xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-white/3">
        {/* Personal information */}
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
                onKeyDown={(e) =>
                  e.key === "Enter" && lastNameRef.current?.focus()
                }
                autoFocus
                tabIndex={1}
                className={inputClass(!!errors.firstName)}
              />
            </ParentFormField>

            <ParentFormField label="Last name" required error={errors.lastName}>
              <input
                ref={lastNameRef}
                type="text"
                placeholder="e.g. Okafor"
                value={form.lastName}
                onChange={(e) => update("lastName", e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && emailRef.current?.focus()
                }
                tabIndex={2}
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
                onChange={(e) =>
                  update(
                    "relationship",
                    e.target.value as FormState["relationship"]
                  )
                }
                tabIndex={3}
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
                ref={occupationRef}
                type="text"
                placeholder="e.g. Engineer"
                value={form.occupation}
                onChange={(e) => update("occupation", e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && emailRef.current?.focus()
                }
                tabIndex={4}
                className={inputClass(false)}
              />
            </ParentFormField>
          </div>
        </section>

        <hr className="border-gray-100 dark:border-white/5" />

        {/* Contact details */}
        <section>
          <h2 className="mb-4 text-sm font-medium text-gray-700 dark:text-gray-300">
            Contact details
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <ParentFormField label="Email address">
              <input
                ref={emailRef}
                type="email"
                value={form.email}
                disabled
                tabIndex={-1}
                className={`${inputClass(false)} cursor-not-allowed opacity-60`}
              />
              <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                Email address can&apos;t be changed here.
              </p>
            </ParentFormField>

            <ParentFormField label="Phone number" required error={errors.phone}>
              <PhoneInput
                value={form.phone}
                onChange={(v) => update("phone", v)}
                onBlur={validatePhone}
                onKeyDown={(e) =>
                  e.key === "Enter" && addressRef.current?.focus()
                }
                tabIndex={6}
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
                  ref={addressRef}
                  type="text"
                  placeholder="e.g. 14 Awolowo Road, Ikoyi, Lagos"
                  value={form.address}
                  onChange={(e) => update("address", e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  tabIndex={7}
                  className={inputClass(!!errors.address)}
                />
              </ParentFormField>
            </div>
          </div>
        </section>
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
          {isPending ? "Saving..." : "Save changes"}
        </button>
      </div>
    </div>
  )
}
