// WordPress version: retried wallet payments reuse their idempotency key, so nobody is charged twice.
import { useMemo, useRef, useState } from "react"
import { Filter, Wallet } from "lucide-react"
import { PageHeader } from "@/components/general/PageHeader"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { SearchInput } from "@/components/ui/search-input"
import {
  FilterSelect,
  type FilterSelectOption,
} from "@/components/ui/filter-select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useSchoolId } from "@/contexts/SchoolContext"
import { useAuthStore } from "@/store/auth.store"
import { useGetAllSchoolSessions } from "@/hooks/userMgt"
import { useGetAllClasses, useGetClassArms } from "@/hooks/examAndRecords"
import { useDebouncedValue } from "@/hooks/useDebouncedValue"
import {
  useGetStudentFeesByClass,
  usePaySchoolFeeFromWallet,
  useCustomPaySchoolFeeFromWallet,
  useBulkPayClassSchoolFeesFromWallet,
  useBulkCustomPayClassSchoolFeesFromWallet,
} from "@/hooks/feeManagement"
import { createPaymentIdempotencyKey } from "@/lib/paymentIntent"
import type { StudentFeeByClassI } from "@/api/feeManagement.api/types"
import ClassFeePaymentsTable from "@/pages/Dashboard/FeeMgt/components/ClassFeePaymentsTable"
import CustomWalletAmountModal from "@/pages/Dashboard/FeeMgt/components/CustomWalletAmountModal"
import { useSchoolMoney } from "@/hooks/useSchoolMoney"

export default function ClassFeePaymentsPage() {
  // One idempotency key per payment attempt: a retry after a lost response reuses it,
  // so the school's wallet is never charged twice. Keys are dropped once a payment succeeds.
  const paymentKeys = useRef<Record<string, string>>({})
  const keyFor = (operation: string) =>
    (paymentKeys.current[operation] ??= createPaymentIdempotencyKey("wallet-fee"))
  const settled = (close: () => void) => {
    paymentKeys.current = {}
    close()
  }
  const schoolId = useSchoolId()
  const { currencyCode, formatMoney } = useSchoolMoney()
  const recordedByUserId = useAuthStore((s) => s.user?.id) ?? ""

  const [search, setSearch] = useState("")
  const debouncedSearch = useDebouncedValue(search, 300)
  const [sessionFilter, setSessionFilter] = useState("")
  const [termFilter, setTermFilter] = useState("")
  const [classFilter, setClassFilter] = useState("")
  const [armFilter, setArmFilter] = useState("")
  const [pageNumber, setPageNumber] = useState(1)

  const [payTarget, setPayTarget] = useState<StudentFeeByClassI | null>(null)
  const [customAmountTarget, setCustomAmountTarget] =
    useState<StudentFeeByClassI | null>(null)
  const [bulkPayConfirmOpen, setBulkPayConfirmOpen] = useState(false)
  const [bulkCustomAmountOpen, setBulkCustomAmountOpen] = useState(false)

  const isReady = Boolean(sessionFilter && termFilter && classFilter)

  const { sessions, isLoading: sessionsLoading } = useGetAllSchoolSessions({
    schoolId,
    pageSize: 100,
  })
  const { classes: classItems, isLoading: classesLoading } = useGetAllClasses({
    schoolId,
    pageSize: 100,
  })
  const { classArms } = useGetClassArms(classFilter)

  const sessionOptions: FilterSelectOption[] = useMemo(
    () => sessions.map((s) => ({ value: s.Id, label: s.SessionName })),
    [sessions]
  )
  const termOptions: FilterSelectOption[] = useMemo(() => {
    const session = sessions.find((s) => s.Id === sessionFilter)
    return (session?.Terms ?? []).map((t) => ({
      value: t.Id,
      label: t.TermName,
    }))
  }, [sessions, sessionFilter])
  const classOptions: FilterSelectOption[] = useMemo(
    () => classItems.map((c) => ({ value: c.Id, label: c.ClsName })),
    [classItems]
  )
  const armOptions: FilterSelectOption[] = useMemo(
    () => classArms.map((a) => ({ value: a.Id, label: a.ArmName })),
    [classArms]
  )

  const selectedClassName =
    classItems.find((c) => c.Id === classFilter)?.ClsName ?? "this class"
  const selectedArmName = classArms.find((a) => a.Id === armFilter)?.ArmName

  const handleSessionFilter = (v: string) => {
    setSessionFilter(v)
    setTermFilter("")
    setClassFilter("")
    setArmFilter("")
    setPageNumber(1)
  }
  const handleTermFilter = (v: string) => {
    setTermFilter(v)
    setClassFilter("")
    setArmFilter("")
    setPageNumber(1)
  }
  const handleClassFilter = (v: string) => {
    setClassFilter(v)
    setArmFilter("")
    setPageNumber(1)
  }

  const { studentFees, totalItems, pageSize, isLoading } =
    useGetStudentFeesByClass({
      schoolId,
      sessionId: sessionFilter,
      termId: termFilter,
      classId: classFilter,
      armId: armFilter || undefined,
      search: debouncedSearch || undefined,
      pageNumber,
      pageSize: 10,
    })

  const { paySchoolFeeFromWallet, isPending: isPaying } =
    usePaySchoolFeeFromWallet({
      currencyCode,
      onSuccess: () => settled(() => setPayTarget(null)),
    })
  const { customPaySchoolFeeFromWallet, isPending: isCustomPaying } =
    useCustomPaySchoolFeeFromWallet({
      currencyCode,
      onSuccess: () => settled(() => setCustomAmountTarget(null)),
    })
  const { bulkPayClassSchoolFeesFromWallet, isPending: isBulkPaying } =
    useBulkPayClassSchoolFeesFromWallet({
      currencyCode,
      onSuccess: () => settled(() => setBulkPayConfirmOpen(false)),
    })
  const {
    bulkCustomPayClassSchoolFeesFromWallet,
    isPending: isBulkCustomPaying,
  } = useBulkCustomPayClassSchoolFeesFromWallet({
    currencyCode,
    onSuccess: () => settled(() => setBulkCustomAmountOpen(false)),
  })

  const payingId = payTarget
    ? payTarget.schoolStudentBillId
    : customAmountTarget
      ? customAmountTarget.schoolStudentBillId
      : undefined

  const handleConfirmPay = () => {
    if (!payTarget) return
    paySchoolFeeFromWallet({
      schoolId,
      studentId: payTarget.studentId,
      schoolStudentBillId: payTarget.schoolStudentBillId,
      recordedByUserId,
      idempotencyKey: keyFor(`single:${payTarget.schoolStudentBillId}`),
    })
  }

  const handleConfirmCustomAmount = (amount: number) => {
    if (!customAmountTarget) return
    customPaySchoolFeeFromWallet({
      schoolId,
      studentId: customAmountTarget.studentId,
      schoolStudentBillId: customAmountTarget.schoolStudentBillId,
      amountToDeduct: amount,
      recordedByUserId,
      idempotencyKey: keyFor(`custom:${customAmountTarget.schoolStudentBillId}:${amount}`),
    })
  }

  const handleConfirmBulkPay = () => {
    bulkPayClassSchoolFeesFromWallet({
      schoolId,
      sessionId: sessionFilter,
      termId: termFilter,
      classId: classFilter,
      armId: armFilter || undefined,
      recordedByUserId,
      idempotencyKey: keyFor(`class:${sessionFilter}:${termFilter}:${classFilter}:${armFilter}`),
    })
  }

  const handleConfirmBulkCustomAmount = (amount: number) => {
    bulkCustomPayClassSchoolFeesFromWallet({
      schoolId,
      sessionId: sessionFilter,
      termId: termFilter,
      classId: classFilter,
      armId: armFilter || undefined,
      amountToDeduct: amount,
      recordedByUserId,
      idempotencyKey: keyFor(`class-custom:${sessionFilter}:${termFilter}:${classFilter}:${armFilter}:${amount}`),
    })
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Class Fee Payments"
        description="Pay outstanding fees directly from students' wallet balances."
      />

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
        <div className="space-y-3 border-b border-gray-50 px-5 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-gray-500">Session</span>
            <FilterSelect
              value={sessionFilter}
              onChange={handleSessionFilter}
              options={sessionOptions}
              placeholder={
                sessionsLoading ? "Loading sessions…" : "Select session"
              }
              triggerClassName="h-8 w-36 py-2 text-xs"
              itemClassName="text-xs"
              disabled={sessionsLoading}
            />

            <span className="ml-2 text-xs font-medium text-gray-500">Term</span>
            <FilterSelect
              value={termFilter}
              onChange={handleTermFilter}
              options={termOptions}
              placeholder="Select term"
              triggerClassName="h-8 w-32 py-2 text-xs"
              itemClassName="text-xs"
              disabled={!sessionFilter}
            />

            <span className="ml-2 text-xs font-medium text-gray-500">
              Class
            </span>
            <FilterSelect
              value={classFilter}
              onChange={handleClassFilter}
              options={classOptions}
              placeholder={classesLoading ? "Loading classes…" : "Select class"}
              triggerClassName="h-8 w-36 py-2 text-xs"
              itemClassName="text-xs"
              disabled={classesLoading || !termFilter}
            />

            <span className="ml-2 text-xs font-medium text-gray-500">Arm</span>
            <FilterSelect
              value={armFilter}
              onChange={(v) => {
                setArmFilter(v)
                setPageNumber(1)
              }}
              options={armOptions}
              placeholder="All arms"
              triggerClassName="h-8 w-32 py-2 text-xs"
              itemClassName="text-xs"
              disabled={!classFilter}
            />
          </div>

          {isReady && (
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-50 pt-3">
              <SearchInput
                placeholder="Search by name or admission number…"
                value={search}
                onChange={(v) => {
                  setSearch(v)
                  setPageNumber(1)
                }}
                containerClassName="min-w-[200px] flex-1"
                className="h-8 rounded-xl py-0 pl-8 text-xs"
              />

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 rounded-md text-xs"
                  onClick={() => setBulkCustomAmountOpen(true)}
                >
                  Bulk Custom Amount
                </Button>
                <Button
                  size="sm"
                  className="h-8 gap-1.5 rounded-md bg-blue-600 text-xs text-white hover:bg-blue-700"
                  onClick={() => setBulkPayConfirmOpen(true)}
                >
                  <Wallet className="size-3.5" />
                  Pay Class from Wallets
                </Button>
              </div>
            </div>
          )}
        </div>

        {isReady ? (
          <ClassFeePaymentsTable
            students={studentFees}
            isLoading={isLoading}
            payingId={payingId}
            onPayFromWallet={setPayTarget}
            onCustomAmount={setCustomAmountTarget}
            pagination={{
              page: pageNumber,
              total: totalItems,
              pageSize,
              onPageChange: setPageNumber,
            }}
          />
        ) : (
          <EmptyState
            icon={Filter}
            title="Select a session, term and class"
            description="Choose a session, term, and class above to view students and pay fees from their wallets."
            size="sm"
          />
        )}
      </div>

      {/* Single-student "pay from wallet" confirm */}
      <Dialog open={!!payTarget} onOpenChange={() => setPayTarget(null)}>
        <DialogContent className="w-full rounded-2xl p-4 sm:max-w-sm sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900">
              Pay from Wallet
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {payTarget && (
                <>
                  This deducts up to{" "}
                  <span className="font-semibold text-gray-700">
                    {formatMoney(
                      Math.min(
                        payTarget.walletBalance,
                        payTarget.outstandingAmount
                      )
                    )}
                  </span>{" "}
                  from {payTarget.studentName}'s wallet to pay down their
                  outstanding fees.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="w-full rounded-md border-gray-200 sm:w-auto"
              onClick={() => setPayTarget(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="w-full rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 sm:w-auto"
              onClick={handleConfirmPay}
              disabled={isPaying}
            >
              {isPaying ? "Paying..." : "Confirm Payment"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Whole-class "pay from wallet" confirm */}
      <Dialog
        open={bulkPayConfirmOpen}
        onOpenChange={() => setBulkPayConfirmOpen(false)}
      >
        <DialogContent className="w-full rounded-2xl p-4 sm:max-w-sm sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900">
              Pay Class from Wallets
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              This pays down outstanding fees for every student in{" "}
              <span className="font-semibold text-gray-700">
                {selectedClassName}
                {selectedArmName ? ` ${selectedArmName}` : ""}
              </span>{" "}
              — not just students matching your search below — deducting up to
              each student's outstanding balance from their wallet.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="w-full rounded-md border-gray-200 sm:w-auto"
              onClick={() => setBulkPayConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="w-full rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 sm:w-auto"
              onClick={handleConfirmBulkPay}
              disabled={isBulkPaying}
            >
              {isBulkPaying ? "Processing..." : "Confirm Payment"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <CustomWalletAmountModal
        open={!!customAmountTarget}
        onClose={() => setCustomAmountTarget(null)}
        title="Custom Amount from Wallet"
        description={
          customAmountTarget
            ? `Deduct a specific amount from ${customAmountTarget.studentName}'s wallet toward their outstanding fees.`
            : ""
        }
        maxAmount={
          customAmountTarget
            ? Math.min(
                customAmountTarget.walletBalance,
                customAmountTarget.outstandingAmount
              )
            : undefined
        }
        isPending={isCustomPaying}
        onConfirm={handleConfirmCustomAmount}
      />

      <CustomWalletAmountModal
        open={bulkCustomAmountOpen}
        onClose={() => setBulkCustomAmountOpen(false)}
        title="Bulk Custom Amount from Wallets"
        description={`Deduct up to this amount from every student's wallet in ${selectedClassName}${selectedArmName ? ` ${selectedArmName}` : ""} — not just students matching your search below — toward their outstanding fees.`}
        isPending={isBulkCustomPaying}
        onConfirm={handleConfirmBulkCustomAmount}
      />
    </div>
  )
}
