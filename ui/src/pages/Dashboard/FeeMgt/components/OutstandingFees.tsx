import { format, isValid, parseISO } from "date-fns"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { FeeOverviewOutstandingFeeI } from "@/api/feeManagement.api/types"
import { useSchoolMoney } from "@/hooks/useSchoolMoney"

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
  "bg-red-500",
  "bg-orange-500",
  "bg-amber-600",
  "bg-purple-600",
  "bg-indigo-600",
]

function OverdueBadge({ days }: { days: number }) {
  const style =
    days > 45
      ? "bg-red-50 text-red-600"
      : days > 21
        ? "bg-amber-50 text-amber-700"
        : "bg-yellow-50 text-yellow-700"
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${style}`}>
      {days}d overdue
    </span>
  )
}

interface OutstandingFeesProps {
  outstandingFees: FeeOverviewOutstandingFeeI[]
  isLoading?: boolean
  isError?: boolean
}

export default function OutstandingFees({
  outstandingFees,
  isLoading,
  isError,
}: OutstandingFeesProps) {
  const { formatMoney } = useSchoolMoney()
  return (
    <div className="flex flex-col rounded-2xl border border-gray-100 bg-white">
      <div className="flex flex-col justify-between gap-3 p-6 pb-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-base font-bold text-gray-900">
            Outstanding Fees
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Overdue fee balances
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
                Balance
              </TableHead>
              <TableHead className="px-4 py-3 text-xs font-semibold tracking-wide text-gray-500 uppercase">
                Overdue
              </TableHead>
              <TableHead className="hidden px-4 py-3 text-xs font-semibold tracking-wide text-gray-500 uppercase md:table-cell">
                Due Date
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
                  Loading outstanding fees...
                </TableCell>
              </TableRow>
            ) : isError || outstandingFees.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="py-8 text-center text-sm text-muted-foreground"
                >
                  {isError
                    ? "Unable to load outstanding fees"
                    : "No outstanding fees found"}
                </TableCell>
              </TableRow>
            ) : (
              outstandingFees.map((s, i) => (
                <TableRow
                  key={`${s.studentId}-${i}`}
                  className="transition-colors hover:bg-gray-50/50"
                >
                  <TableCell className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-8 w-8 rounded-full ${avatarColors[i % avatarColors.length]} flex shrink-0 items-center justify-center text-xs font-bold text-white`}
                      >
                        {initialsFor(s.studentName)}
                      </div>
                      <div>
                        <p className="text-sm leading-tight font-medium text-gray-800">
                          {s.studentName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {s.className}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden px-4 py-3.5 sm:table-cell">
                    <span className="text-sm font-semibold text-red-600">
                      {formatMoney(s.outstandingBalance)}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3.5">
                    <OverdueBadge days={s.daysOverdue} />
                  </TableCell>
                  <TableCell className="hidden px-4 py-3.5 text-xs text-muted-foreground md:table-cell">
                    {s.dueDate && isValid(parseISO(s.dueDate))
                      ? `Was due ${format(parseISO(s.dueDate), "MMM d")}`
                      : "?"}
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
