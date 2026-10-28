import { useState } from "react"
import { CreditCard, Landmark } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useSchoolId } from "@/contexts/SchoolContext"
import {
  defaultSchoolCurrency,
  SCHOOL_COUNTRY_OPTIONS,
  SCHOOL_CURRENCY_OPTIONS,
} from "@/data/schoolFinancialProfile"
import {
  useGetSchoolFinancialProfile,
  useGetSchoolPaymentProviderAccounts,
  useUpdateSchoolFinancialProfile,
} from "@/hooks/payment"
import SettingsCard from "./SettingsCard"
import SubscriptionPlanSettings from "./SubscriptionPlanSettings"
import VideoStorageSettings from "./VideoStorageSettings"

export default function BillingSettings() {
  const schoolId = useSchoolId()
  const { financialProfile, isLoading, isError } =
    useGetSchoolFinancialProfile(schoolId)
  const { accounts, isLoading: accountsLoading } =
    useGetSchoolPaymentProviderAccounts(schoolId)
  const { updateFinancialProfileAsync, isPending } =
    useUpdateSchoolFinancialProfile()
  const [draft, setDraft] = useState<{
    schoolId: string
    countryCode?: string
    currency?: string
  }>({ schoolId })
  const currentDraft = draft.schoolId === schoolId ? draft : null
  const countryCode =
    currentDraft?.countryCode ?? financialProfile?.countryCode ?? ""
  const currency =
    currentDraft?.currency ?? financialProfile?.baseCurrency ?? ""
  const setCountryCode = (value: string) =>
    setDraft(() => ({
      schoolId,
      countryCode: value,
      // Apply the platform market default. The owner can still select another
      // enabled settlement currency from the adjacent dropdown.
      currency: defaultSchoolCurrency(value),
    }))
  const setCurrency = (value: string) =>
    setDraft((current) => ({
      schoolId,
      countryCode:
        current.schoolId === schoolId ? current.countryCode : undefined,
      currency: value,
    }))

  async function save(event: React.FormEvent) {
    event.preventDefault()
    await updateFinancialProfileAsync({
      schoolId,
      countryCode: countryCode.trim().toUpperCase(),
      baseCurrency: currency.trim().toUpperCase(),
    })
  }

  return (
    <div className="space-y-6">
      <SubscriptionPlanSettings />
      <VideoStorageSettings />

      <SettingsCard
        title="Billing & Payments"
        description="Verified financial identity used for school payments and settlement routing."
      >
        {isLoading ? (
          <p className="text-sm text-muted-foreground">
            Loading billing profile…
          </p>
        ) : isError ? (
          <p role="alert" className="text-sm text-red-600">
            Billing details could not be loaded.
          </p>
        ) : (
          <form onSubmit={save} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-1.5 text-sm font-medium text-gray-800">
                School country
                <Select
                  value={countryCode || undefined}
                  onValueChange={setCountryCode}
                  required
                >
                  <SelectTrigger className="h-10 w-full rounded-md">
                    <SelectValue placeholder="Select school country" />
                  </SelectTrigger>
                  <SelectContent position="popper" className="max-h-80">
                    {SCHOOL_COUNTRY_OPTIONS.map((country) => (
                      <SelectItem key={country.value} value={country.value}>
                        {country.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="block text-xs font-normal text-muted-foreground">
                  The two-letter ISO code is saved for public listings and
                  payment routing.
                </span>
              </label>
              <label className="space-y-1.5 text-sm font-medium text-gray-800">
                Base currency
                <Select
                  value={currency || undefined}
                  onValueChange={setCurrency}
                  required
                >
                  <SelectTrigger className="h-10 w-full rounded-md">
                    <SelectValue placeholder="Select base currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {SCHOOL_CURRENCY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="block text-xs font-normal text-muted-foreground">
                  Defaults to NGN for Nigeria, GBP for the UK, EUR for Europe,
                  and USD elsewhere.
                </span>
              </label>
            </div>
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isPending || !schoolId}
                className="rounded-xl bg-blue-600 px-8 text-white hover:bg-blue-700"
              >
                {isPending ? "Saving…" : "Save Financial Profile"}
              </Button>
            </div>
          </form>
        )}
      </SettingsCard>

      <SettingsCard
        title="Payment Providers"
        description="Live provider connections configured for this school."
      >
        {accountsLoading ? (
          <p className="text-sm text-muted-foreground">Loading providers…</p>
        ) : accounts.length === 0 ? (
          <div className="flex gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
            <CreditCard className="size-5 shrink-0 text-gray-500" />
            <p className="text-sm text-muted-foreground">
              No payment provider is connected. Use Fee Management to complete
              provider onboarding.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200">
            {accounts.map((account) => (
              <li key={account.id} className="flex items-center gap-3 p-4">
                <span className="flex size-10 items-center justify-center rounded-xl bg-blue-50">
                  <Landmark className="size-5 text-blue-600" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-900 capitalize">
                    {account.displayName || account.providerKey}
                    {account.isDefault ? " · Default" : ""}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {account.currencyCode} · Payments{" "}
                    {account.paymentsEnabled ? "enabled" : "disabled"} · Payouts{" "}
                    {account.payoutsEnabled ? "enabled" : "disabled"}
                  </p>
                </div>
                <span
                  className={
                    account.paymentsEnabled && account.payoutsEnabled
                      ? "text-xs font-semibold text-green-600"
                      : "text-xs font-semibold text-amber-600"
                  }
                >
                  {account.paymentsEnabled && account.payoutsEnabled
                    ? "Active"
                    : "Needs attention"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </SettingsCard>
    </div>
  )
}
