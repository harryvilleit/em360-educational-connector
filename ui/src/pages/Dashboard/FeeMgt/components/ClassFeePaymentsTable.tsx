import { Loader2, User, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { DataTable, type DataTableColumn } from "@/components/ui/data-table"
import { StatusBadge } from "./StatusBadge"
import { getPaymentReminderStatus } from "../utils"
import type { StudentFeeByClassI } from "@/api/feeManagement.api/types"
import { useSchoolMoney } from "@/hooks/useSchoolMoney"

interface Pagination {
  page: number
  total: number
  pageSize: number
  onPageChange: (page: number) => void
}

interface Props {
  students: StudentFeeByClassI[]
  isLoading?: boolean
  pagination?: Pagination
  // schoolStudentBillId of the row currently being paid — disables that
  // row's action buttons while a payment mutation for it is in flight.
  payingId?: string
  onPayFromWallet: (student: StudentFeeByClassI) => void
  onCustomAmount: (student: StudentFeeByClassI) => void
}

export default function ClassFeePaymentsTable({
  students,
  isLoading,
  pagination,
  payingId,
  onPayFromWallet,
  onCustomAmount,
}: Props) {
  const { formatMoney } = useSchoolMoney()
  const columns: DataTableColumn<StudentFeeByClassI>[] = [
    {
      key: "student",
      header: "Student",
      render: (s) => (
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100">
            {s.profileImageUrl ? (
              <img
                src={s.profileImageUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <User className="size-4 text-gray-400" />
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate font-medium text-gray-900">
              {s.studentName}
            </p>
            <p className="truncate text-xs text-gray-400">
              {s.admissionNumber}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "class",
      header: "Class",
      render: (s) => (
        <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
          {s.className}
          {s.armName ? ` ${s.armName}` : ""}
        </span>
      ),
    },
    {
      key: "wallet",
      header: "Wallet Balance",
      cellClassName: "text-sm font-semibold text-blue-700",
      render: (s) => formatMoney(s.walletBalance),
    },
    {
      key: "billed",
      header: "Total Billed",
      cellClassName: "text-sm text-gray-600",
      render: (s) => formatMoney(s.totalBilled),
    },
    {
      key: "outstanding",
      header: "Outstanding",
      cellClassName: "text-sm font-semibold text-red-600",
      render: (s) =>
        s.outstandingAmount <= 0 ? (
          <span className="text-green-600">Paid</span>
        ) : (
          formatMoney(s.outstandingAmount)
        ),
    },
    {
      key: "status",
      header: "Status",
      render: (s) => (
        <StatusBadge
          status={getPaymentReminderStatus(s.outstandingAmount, s.totalPaid)}
        />
      ),
    },
    {
      key: "actions",
      header: "",
      headerClassName: "text-right",
      cellClassName: "text-right",
      render: (s) => {
        const isPaying = payingId === s.schoolStudentBillId
        const canPay = s.walletBalance > 0 && s.outstandingAmount > 0
        return (
          <div
            className="flex justify-end gap-1.5"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="outline"
              size="sm"
              className="h-7 rounded-md text-xs"
              disabled={!canPay || isPaying}
              onClick={() => onCustomAmount(s)}
            >
              Custom Amount
            </Button>
            <Button
              size="sm"
              className="h-7 gap-1 rounded-md bg-blue-600 text-xs text-white hover:bg-blue-700"
              disabled={!canPay || isPaying}
              onClick={() => onPayFromWallet(s)}
            >
              {isPaying ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                <Wallet className="size-3" />
              )}
              Pay from Wallet
            </Button>
          </div>
        )
      },
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={students}
      getRowKey={(s) => s.schoolStudentBillId}
      isLoading={isLoading}
      pagination={pagination}
      emptyState={
        <EmptyState
          icon={Wallet}
          title="No students found"
          description="No students match this session, term, class and filter combination."
          size="sm"
        />
      }
    />
  )
}
