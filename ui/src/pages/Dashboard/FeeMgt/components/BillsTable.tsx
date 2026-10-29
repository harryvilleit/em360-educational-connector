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
import { Receipt, MoreHorizontal, Eye, Pencil, Trash2 } from "lucide-react"
import type { SchoolBillSummaryI } from "@/api/feeManagement.api/types"
import { formatDate } from "@/utils"
import { useSchoolMoney } from "@/hooks/useSchoolMoney"

const statusColor = (status: string) => {
  if (status === "Paid") return "bg-green-50 text-green-700"
  if (status === "Partial") return "bg-amber-50 text-amber-700"
  return "bg-red-50 text-red-600"
}

interface BillsTableProps {
  bills: SchoolBillSummaryI[]
  isLoading?: boolean
  onView: (b: SchoolBillSummaryI) => void
  onEdit: (b: SchoolBillSummaryI) => void
  onDelete: (b: SchoolBillSummaryI) => void
  page: number
  totalItems: number
  pageSize: number
  onPageChange: (page: number) => void
}

export function BillsTable({
  bills,
  isLoading,
  onView,
  onEdit,
  onDelete,
  page,
  totalItems,
  pageSize,
  onPageChange,
}: BillsTableProps) {
  const { formatMoney } = useSchoolMoney()
  const columns: DataTableColumn<SchoolBillSummaryI>[] = [
    {
      key: "billNumber",
      header: "Bill No.",
      render: (bill) => (
        <span className="rounded-lg bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700">
          {bill.billNumber}
        </span>
      ),
    },
    {
      key: "customer",
      header: "Customer",
      render: (bill) => (
        <>
          <p className="font-medium text-gray-900">{bill.customerName}</p>
          <p className="text-xs text-muted-foreground">
            {bill.session} · {bill.term}
          </p>
        </>
      ),
    },
    {
      key: "total",
      header: "Total",
      cellClassName: "font-semibold text-gray-900",
      render: (bill) => formatMoney(bill.totalAmount ?? 0),
    },
    {
      key: "paid",
      header: "Paid",
      cellClassName: "text-sm text-green-600",
      render: (bill) => formatMoney(bill.amountPaid ?? 0),
    },
    {
      key: "balance",
      header: "Balance",
      cellClassName: "text-sm font-medium text-red-600",
      render: (bill) => formatMoney(bill.outstandingAmount ?? 0),
    },
    {
      key: "status",
      header: "Status",
      render: (bill) => (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${statusColor(bill.paymentStatus)}`}
        >
          {bill.paymentStatus}
        </span>
      ),
    },
    {
      key: "dueDate",
      header: "Due Date",
      cellClassName: "text-xs text-muted-foreground",
      render: (bill) => formatDate(bill.dueDate, "short") || "—",
    },
    {
      key: "actions",
      header: "",
      render: (bill) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" className="rounded-lg">
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44 rounded-xl">
            <DropdownMenuItem
              className="cursor-pointer gap-2 rounded-lg text-xs"
              onClick={() => onView(bill)}
            >
              <Eye className="size-3.5 text-gray-500" />
              View & Download
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer gap-2 rounded-lg text-xs"
              onClick={() => onEdit(bill)}
            >
              <Pencil className="size-3.5 text-gray-500" />
              Edit Bill
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer gap-2 rounded-lg text-xs text-red-600"
              onClick={() => onDelete(bill)}
            >
              <Trash2 className="size-3.5" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={bills}
      getRowKey={(bill) => bill.id}
      isLoading={isLoading}
      pagination={{ page, total: totalItems, pageSize, onPageChange }}
      emptyState={
        <EmptyState
          icon={Receipt}
          title="No bills yet"
          description="Create your first bill to get started"
          size="sm"
          iconContainerClassName="bg-gray-50"
        />
      }
    />
  )
}
