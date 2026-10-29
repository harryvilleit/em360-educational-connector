import { memo, useEffect, useRef, useState } from "react"
import { ChevronDown, ChevronUp, CreditCard, Mail, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSchoolId } from "@/contexts/SchoolContext"
import { useGetPaymentReminderDetails } from "@/hooks/feeManagement"
import { useGetStudentById } from "@/hooks/studentPortal"
import type { PaymentReminderBillI } from "@/api/feeManagement.api/types"
import { formatDate } from "@/utils"
import { StatusBadge } from "./StatusBadge"
import { getPaymentReminderStatus } from "../utils"
import { useSchoolMoney } from "@/hooks/useSchoolMoney"

interface BillDetailRowProps {
  bill: PaymentReminderBillI
  defaultExpanded?: boolean
  onMakePayment: (bill: PaymentReminderBillI) => void
}

export const BillDetailRow = memo(function BillDetailRow({
  bill,
  defaultExpanded,
  onMakePayment,
}: BillDetailRowProps) {
  const { formatMoney } = useSchoolMoney()
  const schoolId = useSchoolId()
  const [expanded, setExpanded] = useState(!!defaultExpanded)
  const rowRef = useRef<HTMLDivElement>(null)

  // Only fetch item-level detail and guardians once a row is actually
  // expanded — with a full class open at once, eagerly fetching every
  // student's detail would mean 100+ extra requests on load.
  const { paymentReminderDetails: details, isLoading: detailsLoading } =
    useGetPaymentReminderDetails(expanded ? bill.studentBillId : "")
  const { student } = useGetStudentById({
    studentId: expanded ? bill.studentId : "",
    schoolId,
  })

  useEffect(() => {
    if (defaultExpanded) {
      rowRef.current?.scrollIntoView({ block: "center", behavior: "smooth" })
    }
    // Only run on mount — this scrolls the row into view once, when the
    // page opens with a specific student highlighted.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const status = getPaymentReminderStatus(
    bill.outstandingBalance,
    bill.amountPaid
  )
  const guardians = student?.guardians ?? []

  return (
    <div
      ref={rowRef}
      className={`overflow-hidden rounded-xl border bg-white transition-colors ${
        defaultExpanded
          ? "border-blue-200 ring-1 ring-blue-100"
          : "border-gray-100"
      }`}
    >
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full flex-wrap items-center justify-between gap-3 px-5 py-4 text-left hover:bg-gray-50/60"
      >
        <div className="flex min-w-0 items-center gap-3">
          {expanded ? (
            <ChevronUp className="size-4 shrink-0 text-gray-400" />
          ) : (
            <ChevronDown className="size-4 shrink-0 text-gray-400" />
          )}
          <div className="min-w-0">
            <p className="truncate font-medium text-gray-900">
              {bill.studentName}
            </p>
            <p className="text-xs text-gray-400">
              Due {formatDate(bill.dueDate) || "—"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-5">
          <div className="text-right">
            <p className="text-xs text-gray-400">Total Bill</p>
            <p className="text-sm font-medium text-gray-800">
              {formatMoney(bill.totalBill)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">Paid</p>
            <p className="text-sm font-medium text-emerald-700">
              {formatMoney(bill.amountPaid)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">Outstanding</p>
            <p className="text-sm font-semibold text-red-600">
              {formatMoney(bill.outstandingBalance)}
            </p>
          </div>
          <StatusBadge status={status} />
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 rounded-lg"
            onClick={(e) => {
              e.stopPropagation()
              onMakePayment(bill)
            }}
          >
            <CreditCard className="size-3.5" />
            Record Payment
          </Button>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-gray-100 bg-gray-50/40 px-5 py-4">
          {detailsLoading ? (
            <p className="py-6 text-center text-sm text-gray-400">
              Loading details...
            </p>
          ) : !details ? (
            <p className="py-6 text-center text-sm text-gray-400">
              Could not load details for this student.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <p className="mb-2 text-xs font-semibold tracking-widest text-gray-400 uppercase">
                  Bill Items ({details.items.length})
                </p>
                {details.items.length === 0 ? (
                  <p className="text-sm text-gray-400">
                    No items on this bill.
                  </p>
                ) : (
                  <div className="overflow-hidden rounded-lg border border-gray-100 bg-white">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium">
                            Item
                          </th>
                          <th className="px-3 py-2 text-left font-medium">
                            Requirement
                          </th>
                          <th className="px-3 py-2 text-right font-medium">
                            Amount
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {details.items.map((item) => (
                          <tr key={item.id}>
                            <td className="px-3 py-2">
                              <p className="font-medium text-gray-900">
                                {item.name}
                              </p>
                              {item.notes && (
                                <p className="text-xs text-gray-400">
                                  {item.notes}
                                </p>
                              )}
                            </td>
                            <td className="px-3 py-2 text-gray-600">
                              {item.paymentRequirement}
                            </td>
                            <td className="px-3 py-2 text-right font-medium text-gray-900">
                              {formatMoney(item.amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {details.notes && (
                  <p className="mt-3 text-xs text-gray-500">
                    <span className="font-semibold text-gray-600">Notes: </span>
                    {details.notes}
                  </p>
                )}
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold tracking-widest text-gray-400 uppercase">
                  Guardians
                </p>
                {guardians.length === 0 ? (
                  <p className="text-sm text-gray-400">
                    No guardians on record.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {guardians.map((g) => (
                      <div
                        key={g.id}
                        className="rounded-lg border border-gray-100 bg-white p-3"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-gray-800">
                            {g.firstName} {g.lastName}
                          </p>
                          {g.relationship && (
                            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">
                              {g.relationship}
                            </span>
                          )}
                        </div>
                        {g.phone && (
                          <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-600">
                            <Phone className="size-3.5 text-gray-400" />
                            {g.phone}
                          </div>
                        )}
                        {g.email && (
                          <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-600">
                            <Mail className="size-3.5 text-gray-400" />
                            {g.email}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
})
