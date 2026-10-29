import { formatDistanceToNow } from "date-fns"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { FeeOverviewRecentPaymentI } from "@/api/feeManagement.api/types"
import { useSchoolMoney } from "@/hooks/useSchoolMoney"

const methodStyles: Record<string, string> = {
  "bank transfer": "bg-blue-50 text-blue-700",
  cash: "bg-green-50 text-green-700",
  pos: "bg-purple-50 text-purple-700",
  online: "bg-cyan-50 text-cyan-700",
}

function methodBadgeClass(method: string): string {
  return methodStyles[method.trim().toLowerCase()] ?? "bg-gray-50 text-gray-700"
}

function initialsFor(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
}

const avatarColors = [
  "bg-blue-600",
  "bg-purple-600",
  "bg-green-600",
  "bg-indigo-600",
  "bg-cyan-600",
]

interface RecentPaymentsProps {
  payments: FeeOverviewRecentPaymentI[]
  isLoading?: boolean
  isError?: boolean
}

export default function RecentPayments({
  payments,
  isLoading,
  isError,
}: RecentPaymentsProps) {
  const { formatMoney } = useSchoolMoney()
  return (
    <div className="flex flex-col rounded-2xl border border-gray-100 bg-white">
      <div className="flex flex-col justify-between gap-3 p-6 pb-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-base font-bold text-gray-900">Recent Payments</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Latest fee transactions
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-y border-gray-100 bg-gray-50/60 hover:bg-gray-50/60">
              <TableHead className="px-6 py-3 text-xs font-semibold tracking-wide text-gray-500 uppercase">
                Student
              </TableHead>
              <TableHead className="hidden px-4 py-3 text-xs font-semibold tracking-wide text-gray-500 uppercase sm:table-cell">
                Amount
              </TableHead>
              <TableHead className="hidden px-4 py-3 text-xs font-semibold tracking-wide text-gray-500 uppercase md:table-cell">
                Method
              </TableHead>
              <TableHead className="hidden px-4 py-3 text-xs font-semibold tracking-wide text-gray-500 uppercase lg:table-cell">
                Date
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="py-8 text-center text-sm text-muted-foreground"
                >
                  Loading payments...
                </TableCell>
              </TableRow>
            ) : isError || payments.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="py-8 text-center text-sm text-muted-foreground"
                >
                  {isError ? "Unable to load payments" : "No payments found"}
                </TableCell>
              </TableRow>
            ) : (
              payments.map((p, i) => (
                <TableRow
                  key={`${p.studentId}-${p.paymentDate}-${i}`}
                  className="transition-colors hover:bg-gray-50/50"
                >
                  <TableCell className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-8 w-8 rounded-full ${avatarColors[i % avatarColors.length]} flex shrink-0 items-center justify-center text-xs font-bold text-white`}
                      >
                        {initialsFor(p.studentName)}
                      </div>
                      <div>
                        <p className="text-sm leading-tight font-medium text-gray-800">
                          {p.studentName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {p.classTerm}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden px-4 py-3.5 sm:table-cell">
                    <span className="text-sm font-semibold text-gray-800">
                      {formatMoney(p.amount)}
                    </span>
                  </TableCell>
                  <TableCell className="hidden px-4 py-3.5 md:table-cell">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${methodBadgeClass(p.paymentMethod)}`}
                    >
                      {p.paymentMethod}
                    </span>
                  </TableCell>
                  <TableCell className="hidden px-4 py-3.5 text-xs text-muted-foreground lg:table-cell">
                    {formatDistanceToNow(new Date(p.paymentDate), {
                      addSuffix: true,
                    })}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
