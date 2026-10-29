import { memo } from "react"
import { AlertCircle, CheckCircle2, ChevronRight, Loader2 } from "lucide-react"
import { useGetInvoices } from "@/hooks/feeManagement"
import type { SchoolParentItemI } from "@/api/guardian.api/types"
import { useSchoolMoney } from "@/hooks/useSchoolMoney"

interface FeesRowProps {
  parent: SchoolParentItemI
  schoolId: string
  sessionId: string
  termId?: string
  classId?: string
  onView: (guardianId: string) => void
}

// Each row resolves its own totals (one /Invoices call per guardian, scoped
// to the current session/term/class filters) rather than the page fetching
// everything up front — there's no single endpoint that returns fee totals
// for every parent in one call, and this keeps the request count bounded to
// whatever page of parents is actually on screen.
export const FeesRow = memo(function FeesRow({
  parent,
  schoolId,
  sessionId,
  termId,
  classId,
  onView,
}: FeesRowProps) {
  const { formatMoney } = useSchoolMoney()
  const {
    totalInvoiced,
    totalCollected,
    outstandingBalance,
    isLoading,
    isError,
    refetch,
  } = useGetInvoices({
    schoolId,
    guardianId: parent.guardianId,
    schoolSessionId: sessionId,
    schoolSessionTermId: termId,
    schoolClassId: classId,
    pageSize: 1,
  })

  const hasInvoices = totalInvoiced > 0
  const allPaid = hasInvoices && outstandingBalance <= 0

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`View fees for ${parent.fullName}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onView(parent.guardianId)
        }
      }}
      onClick={() => onView(parent.guardianId)}
      className="grid cursor-pointer grid-cols-1 gap-2 px-5 py-4 transition-colors hover:bg-gray-50 lg:grid-cols-[1fr_90px_110px_110px_120px_110px_40px] lg:items-center lg:gap-4 dark:hover:bg-white/2"
    >
      <div>
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {parent.fullName}
        </p>
        <p className="truncate text-xs text-gray-400 dark:text-gray-500">
          {parent.email}
        </p>
      </div>

      <p className="hidden text-sm text-gray-500 lg:block dark:text-gray-400">
        {parent.childrenCount}
      </p>

      {isError ? (
        <p role="alert" className="text-red-700 lg:col-span-4">
          Unable to load fees.{" "}
          <button
            onClick={(e) => {
              e.stopPropagation()
              void refetch()
            }}
          >
            Try again
          </button>
        </p>
      ) : isLoading ? (
        <>
          <div className="hidden lg:block">
            <Loader2 size={13} className="animate-spin text-gray-300" />
          </div>
          <div className="hidden lg:block" />
          <div className="hidden lg:block" />
          <div className="hidden lg:block" />
        </>
      ) : (
        <>
          <p className="hidden text-sm text-gray-700 lg:block dark:text-gray-300">
            {formatMoney(totalInvoiced)}
          </p>
          <p className="hidden text-sm font-medium text-green-600 lg:block dark:text-green-400">
            {formatMoney(totalCollected)}
          </p>
          <p
            className={`hidden text-sm font-medium lg:block ${
              outstandingBalance > 0
                ? "text-red-600 dark:text-red-400"
                : "text-gray-400 dark:text-gray-500"
            }`}
          >
            {formatMoney(outstandingBalance ?? 0)}
          </p>

          <div className="hidden lg:block">
            {!hasInvoices ? (
              <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500 dark:bg-white/10 dark:text-gray-400">
                No Invoices
              </span>
            ) : allPaid ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                <CheckCircle2 size={11} /> All Paid
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
                <AlertCircle size={11} /> Outstanding
              </span>
            )}
          </div>
        </>
      )}

      <p className="text-sm lg:hidden">
        {isLoading
          ? "Loading fees…"
          : isError
            ? "Fees unavailable"
            : `${formatMoney(totalInvoiced)} billed · ${formatMoney(outstandingBalance)} outstanding`}
      </p>
      <div className="hidden justify-end lg:flex">
        <ChevronRight size={15} className="text-gray-400" />
      </div>
    </div>
  )
})
