// WordPress version: provider onboarding opens in a new tab (the portal is inside the school website).
import { useMemo, useState } from "react"
import { useParams } from "react-router"
import { useQueryClient } from "@tanstack/react-query"
import {
  Building2,
  CheckCircle2,
  ExternalLink,
  Link2,
  RefreshCw,
  ShieldCheck,
  Unplug,
} from "lucide-react"
import { PageHeader } from "@/components/general/PageHeader"
import { toSafeExternalUrl } from "@/lib/safeExternalUrl"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FilterSelect } from "@/components/ui/filter-select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useSchoolId } from "@/contexts/SchoolContext"
import {
  useDisconnectSchoolPaymentProvider,
  useGetPaymentProviders,
  useGetSchoolFinancialProfile,
  useGetSchoolPaymentProviderAccounts,
  useGetSettlementBanks,
  useOnboardSchoolPaymentProvider,
  useRefreshSchoolPaymentProvider,
  useResolveSettlementAccount,
  useUpdateSchoolFinancialProfile,
} from "@/hooks/payment"
import type {
  PaymentProviderDescriptorI,
  SchoolPaymentProviderAccountI,
} from "@/api/payment.api/types"
import { PaymentProviderAccountStatus } from "@/api/payment.api/types"
import { DashboardRoutes } from "@/routes"
import {
  defaultSchoolCurrency,
  financialCountryLabel,
  financialCurrencyLabel,
  SCHOOL_COUNTRY_OPTIONS,
  SCHOOL_CURRENCY_OPTIONS,
} from "@/data/schoolFinancialProfile"
import {
  formatPaymentDate,
  paymentStatusClass,
  providerAccountStatusLabel,
  providerAccountStatusValue,
} from "@/pages/Dashboard/FeeMgt/paymentDisplay"

/**
 * Provider onboarding opens in a new tab: the portal runs inside the school's website
 * and cannot hand the whole page to the payment provider.
 */
function useProviderLink() {
  const [link, setLink] = useState<string | null>(null)
  return { link, setLink }
}

function ProviderLink({ link }: { link: string | null }) {
  if (!link) return null
  return (
    <div role="status" className="my-3 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-950">
      <a href={link} target="_blank" rel="noopener noreferrer" className="font-semibold underline">
        Continue secure provider setup
      </a>
      <p className="mt-2">
        Complete setup in the new tab, then return to this portal and select Refresh to check the account status.
      </p>
    </div>
  )
}

export default function OnlinePaymentSetupPage() {
  const queryClient = useQueryClient()
  const schoolId = useSchoolId()
  const { productId = "" } = useParams<{ productId: string }>()
  const [financialSelection, setFinancialSelection] = useState<{
    schoolId: string
    countryCode?: string
    baseCurrency?: string
  }>({ schoolId })
  const [providerSelection, setProviderSelection] = useState<{
    schoolId: string
    provider: PaymentProviderDescriptorI | null
  }>({ schoolId, provider: null })
  const {
    financialProfile,
    isError: profileError,
    error: financialProfileError,
    refetch: refetchFinancialProfile,
  } = useGetSchoolFinancialProfile(schoolId)
  const { accounts, isLoading: accountsLoading } =
    useGetSchoolPaymentProviderAccounts(schoolId)
  const inferredCountry = accounts[0]?.countryCode ?? ""
  const inferredCurrency = accounts[0]?.currencyCode ?? ""
  const currentSelection =
    financialSelection.schoolId === schoolId ? financialSelection : null
  const countryCode =
    currentSelection?.countryCode ??
    financialProfile?.countryCode ??
    inferredCountry
  const baseCurrency =
    currentSelection?.baseCurrency ??
    financialProfile?.baseCurrency ??
    inferredCurrency
  const selectedProvider =
    providerSelection.schoolId === schoolId ? providerSelection.provider : null
  const setCountryCode = (value: string) =>
    setFinancialSelection({
      schoolId,
      countryCode: value,
      baseCurrency: defaultSchoolCurrency(value),
    })
  const setBaseCurrency = (value: string) =>
    setFinancialSelection((current) => ({
      schoolId,
      countryCode:
        current.schoolId === schoolId ? current.countryCode : undefined,
      baseCurrency: value,
    }))
  const setSelectedProvider = (provider: PaymentProviderDescriptorI | null) =>
    setProviderSelection({ schoolId, provider })
  const effectiveCountry = countryCode.toUpperCase()
  const effectiveCurrency = baseCurrency.toUpperCase()
  const {
    providers,
    isLoading: providersLoading,
    isError: providersError,
    error: paymentProvidersError,
    refetch: refetchProviders,
  } = useGetPaymentProviders()
  const { updateFinancialProfileAsync, isPending: savingProfile } =
    useUpdateSchoolFinancialProfile()

  const onboardingMarkets = useMemo(
    () =>
      providers.flatMap((provider) =>
        provider.markets.filter((market) => market.allowOnboarding)
      ),
    [providers]
  )

  const countryOptions = useMemo(() => {
    if (
      !effectiveCountry ||
      SCHOOL_COUNTRY_OPTIONS.some(
        (country) => country.value === effectiveCountry
      )
    )
      return SCHOOL_COUNTRY_OPTIONS

    return [
      ...SCHOOL_COUNTRY_OPTIONS,
      {
        value: effectiveCountry,
        label: financialCountryLabel(effectiveCountry),
      },
    ]
  }, [effectiveCountry])

  const currencyOptions = useMemo(() => {
    if (
      !effectiveCurrency ||
      SCHOOL_CURRENCY_OPTIONS.some(
        (currency) => currency.value === effectiveCurrency
      )
    )
      return SCHOOL_CURRENCY_OPTIONS

    return [
      ...SCHOOL_CURRENCY_OPTIONS,
      {
        value: effectiveCurrency,
        label: financialCurrencyLabel(effectiveCurrency),
      },
    ]
  }, [effectiveCurrency])

  const savedCountry =
    financialProfile?.countryCode?.toUpperCase() ??
    inferredCountry.toUpperCase()
  const savedCurrency =
    financialProfile?.baseCurrency?.toUpperCase() ??
    inferredCurrency.toUpperCase()
  const profileMatchesSelection =
    !!effectiveCountry &&
    !!effectiveCurrency &&
    effectiveCountry === savedCountry &&
    effectiveCurrency === savedCurrency

  const availableProviders = useMemo(
    () =>
      providers.filter(
        (provider) =>
          provider.isConfigured &&
          provider.markets.some(
            (market) =>
              market.allowOnboarding &&
              (!effectiveCountry ||
                market.countryCode.toUpperCase() === effectiveCountry) &&
              (!effectiveCurrency ||
                market.currencyCode.toUpperCase() === effectiveCurrency)
          )
      ),
    [effectiveCountry, effectiveCurrency, providers]
  )

  const saveProfile = async () => {
    if (!effectiveCountry || !effectiveCurrency) return
    await updateFinancialProfileAsync({
      schoolId,
      countryCode: effectiveCountry.toUpperCase(),
      baseCurrency: effectiveCurrency.toUpperCase(),
    })
    // The portal's school context carries the currency used across the screens.
    await queryClient.invalidateQueries({ queryKey: ["wordpress-context"] })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Online Payment Setup"
        description="Configure the school financial profile and connect provider settlement accounts."
      />

      <section className="rounded-2xl border border-gray-100 bg-white p-5">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
            <Building2 className="size-5" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">
              School financial profile
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              The selected school controls currency and provider routing. Base
              currency becomes immutable after financial activity begins.
            </p>
          </div>
        </div>

        {profileError && (
          <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-red-100 bg-red-50 p-3 text-xs text-red-800">
            <span>
              {financialProfileError instanceof Error
                ? financialProfileError.message
                : "Unable to load the saved school financial profile."}
            </span>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => void refetchFinancialProfile()}
            >
              Retry
            </Button>
          </div>
        )}

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label>Financial country</Label>
            <FilterSelect
              value={effectiveCountry}
              onChange={setCountryCode}
              options={countryOptions}
              placeholder="Select country"
              triggerClassName="w-full"
              disabled={countryOptions.length === 0}
            />
            <p className="text-xs text-gray-400">
              Where the school receives payments.
            </p>
          </div>
          <div className="space-y-1.5">
            <Label>Base currency</Label>
            <FilterSelect
              value={effectiveCurrency}
              onChange={setBaseCurrency}
              options={currencyOptions}
              placeholder={
                !effectiveCountry ? "Select country first" : "Select currency"
              }
              triggerClassName="w-full"
              disabled={!effectiveCountry || currencyOptions.length === 0}
            />
            <p className="text-xs text-gray-400">
              Used for fees, wallets and settlements.
            </p>
          </div>
          <div className="flex items-end">
            <Button
              className="w-full"
              disabled={
                savingProfile ||
                effectiveCountry.length !== 2 ||
                effectiveCurrency.length !== 3
              }
              onClick={() => void saveProfile()}
            >
              {savingProfile ? "Saving..." : "Save financial profile"}
            </Button>
          </div>
        </div>
        {!providersLoading && onboardingMarkets.length === 0 && (
          <div className="mt-4 rounded-xl border border-amber-100 bg-amber-50 p-3 text-xs text-amber-800">
            No payment markets are enabled yet. An EM360 platform administrator
            must configure a country, currency and provider route.
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold text-gray-900">
              Connected provider accounts
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              Provider funds settle directly to the school. EM360 stores only
              safe account metadata.
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Available providers are supplied by EM360 payment routing for the
              saved country and currency.
            </p>
          </div>
          <FilterSelect
            value=""
            onChange={(key) => {
              const provider = availableProviders.find(
                (item) => item.key === key
              )
              if (provider) setSelectedProvider(provider)
            }}
            options={availableProviders.map((provider) => ({
              value: provider.key,
              label: `Connect ${provider.displayName}`,
            }))}
            placeholder={
              providersLoading
                ? "Loading providers..."
                : "Select payment provider"
            }
            triggerClassName="w-56"
            disabled={
              !profileMatchesSelection ||
              providersLoading ||
              availableProviders.length === 0
            }
          />
        </div>

        {providersError && (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-red-100 bg-red-50 p-3 text-xs text-red-800">
            <span>
              {paymentProvidersError instanceof Error
                ? paymentProvidersError.message
                : "Unable to load payment providers."}
            </span>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => void refetchProviders()}
            >
              Retry
            </Button>
          </div>
        )}

        {!providersLoading &&
          !profileMatchesSelection &&
          effectiveCountry &&
          effectiveCurrency && (
            <div className="rounded-xl border border-blue-100 bg-blue-50 p-3 text-xs text-blue-800">
              Save this financial profile before selecting a payment provider.
            </div>
          )}
        {!providersLoading &&
          profileMatchesSelection &&
          availableProviders.length === 0 && (
            <div className="rounded-xl border border-amber-100 bg-amber-50 p-3 text-xs text-amber-800">
              No configured payment provider is available for {effectiveCountry}{" "}
              / {effectiveCurrency}. An EM360 platform administrator must enable
              the provider credentials and onboarding route.
            </div>
          )}

        {accountsLoading ? (
          <div className="rounded-2xl border border-gray-100 bg-white py-14 text-center text-sm text-gray-400">
            Loading provider accounts...
          </div>
        ) : accounts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 py-14 text-center">
            <Link2 className="mx-auto size-8 text-gray-300" />
            <p className="mt-3 text-sm font-medium text-gray-600">
              No payment provider connected
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Save the financial profile, then connect an enabled provider.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {accounts.map((account) => (
              <ProviderAccountCard
                key={account.id}
                account={account}
                productId={productId}
              />
            ))}
          </div>
        )}
      </section>

      <div className="rounded-2xl border border-green-100 bg-green-50 p-4 text-sm text-green-800">
        <div className="flex gap-2">
          <ShieldCheck className="mt-0.5 size-4 shrink-0" />
          <p>
            Never enter provider API keys, webhook secrets or private
            credentials here. Those belong in the EM360 server secret store.
          </p>
        </div>
      </div>

      <ProviderOnboardingModal
        provider={selectedProvider}
        schoolId={schoolId}
        countryCode={effectiveCountry}
        currencyCode={effectiveCurrency}
        productId={productId}
        onClose={() => setSelectedProvider(null)}
      />
    </div>
  )
}
function ProviderAccountCard({
  account,
  productId,
}: {
  account: SchoolPaymentProviderAccountI
  productId: string
}) {
  const { link, setLink } = useProviderLink()
  const { refreshProviderAsync, isPending: refreshing } =
    useRefreshSchoolPaymentProvider()
  const { disconnectProviderAsync, isPending: disconnecting } =
    useDisconnectSchoolPaymentProvider()
  const accountStatus = providerAccountStatusValue(account.accountStatus)
  const label = providerAccountStatusLabel(account.accountStatus)

  const refresh = async (createOnboardingLink: boolean) => {
    const result = await refreshProviderAsync({
      schoolId: account.schoolId,
      accountId: account.id,
      createOnboardingLink,
    })
    if (result.value.onboardingUrl) {
      const safeUrl = toSafeExternalUrl(result.value.onboardingUrl)
      if (!safeUrl) throw new Error("The provider returned an unsafe link.")
      setLink(safeUrl)
    }
  }

  const disconnect = async () => {
    if (
      !window.confirm(
        "Disconnect this provider from new EM360 payment routing? Historical transactions will remain available."
      )
    )
      return
    await disconnectProviderAsync({
      schoolId: account.schoolId,
      accountId: account.id,
    })
  }

  return (
    <>
    <ProviderLink link={link} />
    <div className="rounded-2xl border border-gray-100 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-gray-900 capitalize">
            {account.displayName || account.providerKey}
          </p>
          <p className="mt-1 text-xs text-gray-400">
            {account.countryCode} · {account.currencyCode}
            {account.settlementAccountLast4
              ? ` · Account ••••${account.settlementAccountLast4}`
              : ""}
          </p>
        </div>
        <Badge className={paymentStatusClass(label)}>{label}</Badge>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
        <div className="rounded-xl bg-gray-50 p-3">
          <p className="text-gray-400">Payments</p>
          <p className="mt-1 font-semibold text-gray-700">
            {account.paymentsEnabled ? "Enabled" : "Disabled"}
          </p>
        </div>
        <div className="rounded-xl bg-gray-50 p-3">
          <p className="text-gray-400">Settlement</p>
          <p className="mt-1 font-semibold text-gray-700">
            {account.payoutsEnabled ? "Enabled" : "Disabled"}
          </p>
        </div>
      </div>

      <p className="mt-3 text-xs text-gray-400">
        Last verified: {formatPaymentDate(account.lastVerifiedAtUtc)}
      </p>
      <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-100 pt-4">
        <Button
          size="sm"
          variant="outline"
          disabled={refreshing}
          onClick={() => void refresh(false)}
        >
          <RefreshCw
            className={`size-3.5 ${refreshing ? "animate-spin" : ""}`}
          />{" "}
          Refresh status
        </Button>
        {accountStatus !== PaymentProviderAccountStatus.Active && (
          <Button
            size="sm"
            variant="outline"
            disabled={refreshing}
            onClick={() => void refresh(true)}
          >
            <ExternalLink className="size-3.5" /> Continue onboarding
          </Button>
        )}
        {accountStatus !== PaymentProviderAccountStatus.Disabled && (
          <Button
            size="sm"
            variant="outline"
            disabled={disconnecting}
            onClick={() => void disconnect()}
          >
            <Unplug className="size-3.5" /> Disconnect
          </Button>
        )}
      </div>
    </div>
    </>
  )
}

function ProviderOnboardingModal({
  provider,
  schoolId,
  countryCode,
  currencyCode,
  productId,
  onClose,
}: {
  provider: PaymentProviderDescriptorI | null
  schoolId: string
  countryCode: string
  currencyCode: string
  productId: string
  onClose: () => void
}) {
  const [bankCode, setBankCode] = useState("")
  const [accountNumber, setAccountNumber] = useState("")
  const [existingAccountId, setExistingAccountId] = useState("")
  const { link, setLink } = useProviderLink()
  const [resolvedName, setResolvedName] = useState("")
  const needsBank = !!provider?.supportsSettlementBankDiscovery
  const { banks, isLoading: banksLoading } = useGetSettlementBanks(
    schoolId,
    provider?.key ?? "",
    !!provider && needsBank
  )
  const { resolveSettlementAccountAsync, isPending: resolving } =
    useResolveSettlementAccount()
  const {
    onboardProviderAsync,
    isPending: onboarding,
    error: onboardingError,
  } = useOnboardSchoolPaymentProvider()

  if (!provider) return null

  const resolveAccount = async () => {
    if (!bankCode || !accountNumber) return
    const result = await resolveSettlementAccountAsync({
      schoolId,
      providerKey: provider.key,
      bankCode,
      accountNumber,
    })
    setResolvedName(result.value.accountName ?? "Verified account")
  }

  const connect = async () => {
    try {
      const result = await onboardProviderAsync({
        schoolId,
        providerKey: provider.key,
        countryCode,
        currencyCode,
        isDefault: true,
        existingExternalAccountId: existingAccountId.trim() || undefined,
        providerParameters: needsBank ? { bankCode, accountNumber } : {},
      })
      if (result.value.onboardingUrl) {
        const safeUrl = toSafeExternalUrl(result.value.onboardingUrl)
        if (!safeUrl) throw new Error("The provider returned an unsafe link.")
        setLink(safeUrl)
        return
      }
      onClose()
    } catch {
      // The mutation exposes a safe backend/provider message below and also
      // raises the global toast. Keep the modal open so the user can retry.
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Connect {provider.displayName}</DialogTitle>
          <DialogDescription>
            {countryCode.toUpperCase()} · {currencyCode.toUpperCase()} ·
            Provider credentials are never requested.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {needsBank ? (
            <>
              <div className="space-y-1.5">
                <Label>Settlement bank</Label>
                <FilterSelect
                  value={bankCode}
                  onChange={(value) => {
                    setBankCode(value)
                    setResolvedName("")
                  }}
                  options={banks.map((bank) => ({
                    value: bank.code,
                    label: bank.name,
                  }))}
                  placeholder={
                    banksLoading ? "Loading banks..." : "Select bank"
                  }
                  triggerClassName="w-full"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Settlement account number</Label>
                <Input
                  inputMode="numeric"
                  value={accountNumber}
                  onChange={(event) => {
                    setAccountNumber(event.target.value.replace(/\D/g, ""))
                    setResolvedName("")
                  }}
                />
              </div>
              <Button
                variant="outline"
                className="w-full"
                disabled={!bankCode || !accountNumber || resolving}
                onClick={() => void resolveAccount()}
              >
                {resolving
                  ? "Resolving account..."
                  : "Verify settlement account"}
              </Button>
              {resolvedName && (
                <div className="flex items-center gap-2 rounded-xl border border-green-100 bg-green-50 p-3 text-sm text-green-700">
                  <CheckCircle2 className="size-4" /> {resolvedName}
                </div>
              )}
            </>
          ) : (
            <div className="rounded-xl border border-blue-100 bg-blue-50 p-3 text-sm text-blue-800">
              {provider.supportsConnectedAccounts
                ? "You will continue through the provider’s hosted onboarding page."
                : "EM360 will create the provider account using the configured deployment adapter."}
            </div>
          )}

          {provider.supportsConnectedAccounts && (
            <div className="space-y-1.5">
              <Label>Existing connected account ID (optional)</Label>
              <Input
                value={existingAccountId}
                onChange={(event) => setExistingAccountId(event.target.value)}
              />
            </div>
          )}

          <ProviderLink link={link} />

          {onboardingError && (
            <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-800">
              {onboardingError instanceof Error
                ? onboardingError.message
                : "Unable to start provider onboarding."}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              disabled={onboarding}
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              disabled={onboarding || (needsBank && !resolvedName)}
              onClick={() => void connect()}
            >
              {onboarding ? "Connecting..." : "Connect provider"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
