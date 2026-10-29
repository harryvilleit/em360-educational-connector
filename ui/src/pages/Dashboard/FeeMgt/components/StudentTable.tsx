import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EmptyState } from "@/components/ui/empty-state"
import { DataTable, type DataTableColumn } from "@/components/ui/data-table"
import { Users, MoreHorizontal, Eye, CreditCard, Send } from "lucide-react"
import { StatusBadge } from "./StatusBadge"
import { getPaymentReminderStatus } from "../utils"
import type { PaymentReminderBillI } from "@/api/feeManagement.api/types"
import { useSchoolMoney } from "@/hooks/useSchoolMoney"

interface StudentTablePagination {
  page: number
  total: number
  pageSize: number
  onPageChange: (page: number) => void
}

interface StudentTableProps {
  students: PaymentReminderBillI[]
  selected: Set<string>
  isLoading?: boolean
  pagination?: StudentTablePagination
  onToggleOne: (id: string) => void
  onToggleAll: (checked: boolean) => void
  onViewDetails: (student: PaymentReminderBillI) => void
  onMakePayment: (student: PaymentReminderBillI) => void
  onSendReminder: (student: PaymentReminderBillI) => void
}

export function StudentTable({
  students,
  selected,
  isLoading,
  pagination,
  onToggleOne,
  onToggleAll,
  onViewDetails,
  onMakePayment,
  onSendReminder,
}: StudentTableProps) {
  const { formatMoney } = useSchoolMoney()
  const allSelected =
    students.length > 0 && students.every((s) => selected.has(s.studentBillId))

  const columns: DataTableColumn<PaymentReminderBillI>[] = [
    {
      key: "select",
      header: (
        <Checkbox
          checked={allSelected}
          onCheckedChange={(v) => onToggleAll(!!v)}
          aria-label="Select all"
        />
      ),
      headerClassName: "w-10 px-5 py-3",
      cellClassName: "px-5 py-3.5",
      render: (s) => (
        <Checkbox
          checked={selected.has(s.studentBillId)}
          onCheckedChange={() => onToggleOne(s.studentBillId)}
          onClick={(e) => e.stopPropagation()}
          aria-label={`Select ${s.studentName}`}
        />
      ),
    },
    {
      key: "name",
      header: "Student",
      render: (s) => (
        <p className="font-medium text-gray-900">{s.studentName}</p>
      ),
    },
    {
      key: "class",
      header: "Class",
      render: (s) => (
        <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
          {s.className}
        </span>
      ),
    },
    {
      key: "term",
      header: "Term",
      cellClassName: "text-sm text-gray-600",
      render: (s) => s.termName,
    },
    {
      key: "session",
      header: "Session",
      cellClassName: "text-sm text-gray-600",
      render: (s) => s.sessionName,
    },
    {
      key: "status",
      header: "Status",
      render: (s) => (
        <StatusBadge
          status={getPaymentReminderStatus(s.outstandingBalance, s.amountPaid)}
        />
      ),
    },
    {
      key: "Total Bill",
      header: "Total Bill",
      cellClassName: "text-sm font-semibold text-gray-900",
      render: (s) => formatMoney(s.totalBill),
    },

    {
      key: "amountPaid",
      header: "Amount Paid",
      cellClassName: "text-sm font-semibold text-gray-900",
      render: (s) => formatMoney(s.amountPaid),
    },
    {
      key: "balance",
      header: "Outstanding Balance",
      cellClassName: "text-sm font-semibold text-red-600",
      render: (s) =>
        s.outstandingBalance <= 0 ? (
          <span className="text-green-600">Paid</span>
        ) : (
          formatMoney(s.outstandingBalance)
        ),
    },
    {
      key: "actions",
      header: "",
      headerClassName: "w-10",
      render: (s) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="rounded-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44 rounded-xl">
            <DropdownMenuItem
              className="cursor-pointer gap-2 rounded-lg text-xs"
              onClick={(e) => {
                e.stopPropagation()
                onViewDetails(s)
              }}
            >
              <Eye className="size-3.5 text-gray-500" />
              View details
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer gap-2 rounded-lg text-xs"
              onClick={(e) => {
                e.stopPropagation()
                onSendReminder(s)
              }}
            >
              <Send className="size-3.5 text-gray-500" />
              Send reminder
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer gap-2 rounded-lg text-xs"
              onClick={(e) => {
                e.stopPropagation()
                onMakePayment(s)
              }}
            >
              <CreditCard className="size-3.5 text-gray-500" />
              Make payment
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={students}
      getRowKey={(s) => s.studentBillId}
      isLoading={isLoading}
      pagination={pagination}
      onRowClick={(s) => onToggleOne(s.studentBillId)}
      rowClassName={(s) =>
        selected.has(s.studentBillId) ? "bg-blue-50/60 hover:bg-blue-50" : ""
      }
      wrapperClassName=""
      emptyState={<EmptyState icon={Users} title="No students" size="sm" />}
    />
  )
}
