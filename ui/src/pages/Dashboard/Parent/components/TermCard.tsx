import { memo, useRef } from "react"
import {
  AlertCircle,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Download,
} from "lucide-react"
import { mockSchoolInfo } from "@/data"
import { downloadInvoicePdf } from "@/lib/invoicePdf"
import { formatDate } from "@/utils"
import type { StudentFeeBreakdownTermI } from "@/api/guardian.api/types"
import ParentInvoicePDFTemplate from "./ParentInvoicePDFTemplate"
import { OptionalFeesSection } from "./OptionalFeesSection"
import { StatusBadge, type FeeStatus } from "./StatusBadge"
import { formatCurrency } from "@/utils/currency"

function computeStatus(totalBilled: number, totalPaid: number): FeeStatus {
  if (totalBilled > 0 && totalPaid >= totalBilled) return "Paid"
  if (totalPaid > 0) return "Partial"
  return "Unpaid"
}

export const TermCard = memo(function TermCard({
  term,
  studentName,
  studentClass,
  parentName,
  currencyCode,
  expanded,
  onToggle,
  onPayNow,
}: {
  term: StudentFeeBreakdownTermI
  studentName: string
  studentClass: string
  parentName: string
  currencyCode?: string | null
  expanded: boolean
  onToggle: (id: string) => void
  onPayNow: (term: StudentFeeBreakdownTermI) => void
}) {
  const status = computeStatus(term.totalBilled, term.totalPaid)
  const balance = term.outstandingAmount
  const invoiceRef = useRef<HTMLDivElement>(null)

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/10 dark:bg-white/3">
      <button
        onClick={() => onToggle(term.schoolSessionTermId)}
        className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-gray-50 dark:hover:bg-white/2"
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {term.termName}
            </p>
            <StatusBadge status={status} />
          </div>
          <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
            Issued {formatDate(term.issueDate, "short")} · Due{" "}
            {formatDate(term.dueDate, "short")}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
            {formatCurrency(term.totalBilled, currencyCode)}
          </p>
          {balance > 0 && (
            <p className="text-xs font-medium text-red-500 dark:text-red-400">
              {formatCurrency(balance, currencyCode)} due
            </p>
          )}
        </div>
        {expanded ? (
          <ChevronUp size={15} className="shrink-0 text-gray-400" />
        ) : (
          <ChevronDown size={15} className="shrink-0 text-gray-400" />
        )}
      </button>

      {expanded && (
        <div className="border-t border-gray-100 dark:border-white/5">
          {/* Fee breakdown */}
          <div className="px-5 pt-4 pb-3">
            <p className="mb-2 font-semibold ">
              Fee Breakdown
            </p>
            <div className="space-y-1.5">
              {term.billItems.map((item) => (
                <div
                  key={item.schoolStudentBillItemId}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-gray-600 dark:text-gray-300">
                    {item.paymentItemName}
                  </span>
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    {formatCurrency(item.amount, currencyCode)}
                  </span>
                </div>
              ))}
              <div className="flex items-center justify-between border-t border-gray-100 pt-2 text-sm font-bold dark:border-white/5">
                <span className="text-gray-900 dark:text-gray-100">Total</span>
                <span className="text-gray-900 dark:text-gray-100">
                  {formatCurrency(term.totalBilled, currencyCode)}
                </span>
              </div>
            </div>
          </div>

          {/* Optional fees available to opt into */}
          <OptionalFeesSection term={term} currencyCode={currencyCode} />

          {/* Outstanding tracker */}
          {balance > 0 && (
            <div className="border-t border-gray-100 px-5 py-3 dark:border-white/5">
              <div className="rounded-lg bg-red-50 p-3 dark:bg-red-900/10">
                <div className="mb-1.5 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-red-700 dark:text-red-400">
                    <AlertCircle size={12} />
                    Outstanding Balance
                  </div>
                  <span className="text-sm font-bold text-red-700 dark:text-red-400">
                    {formatCurrency(balance, currencyCode)}
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-red-200 dark:bg-red-900/30">
                  <div
                    className="h-full rounded-full bg-green-500"
                    style={{
                      width: `${term.totalBilled > 0 ? (term.totalPaid / term.totalBilled) * 100 : 0}%`,
                    }}
                  />
                </div>
                <p className="mt-1 text-[11px] text-red-600 dark:text-red-400">
                  {formatCurrency(term.totalPaid, currencyCode)} paid of{" "}
                  {formatCurrency(term.totalBilled, currencyCode)}
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2 border-t border-gray-100 px-5 py-3 dark:border-white/5">
            {term.canMakePayment && status !== "Paid" && (
              <button
                type="button"
                onClick={() => onPayNow(term)}
                className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-medium text-white transition-colors hover:bg-blue-700"
              >
                <CreditCard size={12} />
                Pay Now
              </button>
            )}
            <button
              onClick={() =>
                invoiceRef.current &&
                downloadInvoicePdf(
                  invoiceRef.current,
                  `Invoice_${term.termName.replace(/\s+/g, "_")}`
                )
              }
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3.5 py-2 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5"
            >
              <Download size={12} />
              Download Invoice
            </button>
          </div>

          {/* Off-screen PDF template — captured by html2canvas on download,
              never shown to the user. Mounted only while this term is
              expanded (the only time the button above exists). */}
          <div style={{ position: "fixed", top: 0, left: "-9999px" }}>
            <div ref={invoiceRef}>
              <ParentInvoicePDFTemplate
                term={term}
                studentName={studentName}
                studentClass={studentClass}
                parentName={parentName}
                school={mockSchoolInfo}
                currencyCode={currencyCode}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
})
