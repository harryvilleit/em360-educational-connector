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
import { Eye, MoreHorizontal, PlusCircle, Users, Wallet } from "lucide-react"
import type { SchoolTransactionI } from "@/api/feeManagement.api/types"
import { getTransactionCategoryLabel, isIncomeCategory } from "../utils"
import { useSchoolMoney } from "@/hooks/useSchoolMoney"

interface Props {
  transactions: SchoolTransactionI[]
  isLoading?: boolean
  onAddTransaction: () => void
  onView: (tx: SchoolTransactionI) => void
  onAddVat: (tx: SchoolTransactionI) => void
  onApplyDiscount: (tx: SchoolTransactionI) => void
  onAllocate: (tx: SchoolTransactionI) => void
  page: number
  totalItems: number
  pageSize: number
  onPageChange: (page: number) => void
}

const categoryStyle: Record<string, string> = {
  Income: "bg-emerald-100 text-emerald-700",
  Expense: "bg-orange-100 text-orange-700",
}

export default function BookKeepingTable({
  transactions,
  isLoading,
  onAddTransaction,
  onView,
  onAddVat,
  onApplyDiscount,
  onAllocate,
  page,
  totalItems,
  pageSize,
  onPageChange,
}: Props) {
  const { formatMoney } = useSchoolMoney()
  const columns: DataTableColumn<SchoolTransactionI>[] = [
    {
      key: "transactionDate",
      header: "Date",
      cellClassName: "text-gray-700",
      render: (tx) => new Date(tx.transactionDate).toLocaleDateString(),
    },
    {
      key: "transactionMode",
      header: "Mode",
      render: (tx) => (
        <span className="inline-block rounded-full bg-gray-100 px-3 py-1 text-xs font-medium">
          {tx.transactionMode || "Unknown"}
        </span>
      ),
    },
    {
      key: "description",
      header: "Description",
      cellClassName: "text-gray-900",
      render: (tx) => tx.description,
    },
    {
      key: "transactionCategory",
      header: "Category",
      render: (tx) => {
        const label = getTransactionCategoryLabel(tx.transactionCategory)
        return (
          <span
            className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${categoryStyle[label] ?? "bg-gray-100 text-gray-600"}`}
          >
            {label}
          </span>
        )
      },
    },
    {
      key: "amount",
      header: "Amount",
      headerClassName: "text-right",
      cellClassName: "text-right font-semibold text-gray-900",
      render: (tx) => (
        <>
          {formatMoney(tx.netAmount)}
          {tx.vatPercentage > 0 && (
            <span className="ml-1 text-xs font-normal text-amber-600">
              +{tx.vatPercentage}% VAT
            </span>
          )}
        </>
      ),
    },
    {
      key: "type",
      header: "Type",
      render: (tx) => (
        <span
          className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${isIncomeCategory(tx.transactionCategory) ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}
        >
          {isIncomeCategory(tx.transactionCategory) ? "IN" : "OUT"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (tx) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="h-8 w-8 rounded-lg"
            >
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52 rounded-xl">
            <DropdownMenuItem className="gap-2" onClick={() => onView(tx)}>
              <Eye className="size-4" /> View Transaction
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-2"
              disabled={!!tx.payrollPayslipId}
              onClick={() => onAddVat(tx)}
            >
              <PlusCircle className="size-4" /> Add VAT
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-2"
              disabled={!!tx.payrollPayslipId}
              onClick={() => onApplyDiscount(tx)}
            >
              Apply Discount
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-2"
              disabled={!!tx.payrollPayslipId}
              onClick={() => onAllocate(tx)}
            >
              <Users className="size-4" /> Allocate to Student
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={transactions}
      isLoading={isLoading}
      getRowKey={(tx) => tx.id}
      pagination={{ page, total: totalItems, pageSize, onPageChange }}
      emptyState={
        <EmptyState
          icon={Wallet}
          title="No transactions yet"
          description="Add your first transaction to start tracking income and expenses."
          size="sm"
          iconContainerClassName="bg-gray-100"
          action={{ label: "Add Transaction", onClick: onAddTransaction }}
        />
      }
    />
  )
}
