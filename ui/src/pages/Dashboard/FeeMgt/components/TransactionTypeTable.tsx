import { Loader2, MoreVertical, Pencil, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EmptyState } from "@/components/ui/empty-state"
import { DataTable, type DataTableColumn } from "@/components/ui/data-table"
import type { SchoolTransactionTypeI } from "@/api/feeManagement.api/types"
import { isTransactionTypeActive } from "../utils"

interface Props {
  transactionTypes: SchoolTransactionTypeI[]
  onEdit: (t: SchoolTransactionTypeI) => void
  onAdd: () => void
  onToggleStatus: (t: SchoolTransactionTypeI) => void
  isToggling?: boolean
}

export default function TransactionTypeTable({
  transactionTypes,
  onEdit,
  onAdd,
  onToggleStatus,
  isToggling,
}: Props) {
  const columns: DataTableColumn<SchoolTransactionTypeI>[] = [
    {
      key: "name",
      header: "Type Name",
      render: (t) => (
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50">
            <Tag className="size-4 text-blue-600" />
          </div>
          <span className="font-medium text-gray-900">{t.name}</span>
        </div>
      ),
    },
    {
      key: "description",
      header: "Description",
      cellClassName: "text-sm text-gray-600",
      render: (t) => t.description || "—",
    },
    {
      key: "status",
      header: "Status",
      render: (t) => {
        const active = isTransactionTypeActive(t.status)
        return (
          <span
            className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
              active
                ? "bg-green-50 text-green-700"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {active ? "Active" : "Inactive"}
          </span>
        )
      },
    },
    {
      key: "actions",
      header: "",
      headerClassName: "text-right",
      cellClassName: "text-right",
      render: (t) => (
        <div onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className="h-8 w-8 rounded-lg text-gray-400 hover:text-gray-600"
                disabled={isToggling}
              >
                {isToggling ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <MoreVertical className="size-3.5" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                className="cursor-pointer gap-2"
                onClick={() => onEdit(t)}
              >
                <Pencil className="size-4 text-gray-400" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer gap-2"
                onClick={() => onToggleStatus(t)}
              >
                {isTransactionTypeActive(t.status) ? "Deactivate" : "Activate"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ]

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
      <DataTable
        columns={columns}
        data={transactionTypes}
        getRowKey={(t) => t.id}
        emptyState={
          <EmptyState
            icon={Tag}
            title="No transaction types yet"
            description="Add types like Tuition Fee or Excursion so they appear when recording a transaction."
            size="sm"
            iconContainerClassName="bg-gray-100"
            action={{ label: "Add Transaction Type", onClick: onAdd }}
          />
        }
      />
    </div>
  )
}
