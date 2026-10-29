import { useMemo, useState } from "react"
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
import { SearchInput } from "@/components/ui/search-input"
import {
  FilterSelect,
  type FilterSelectOption,
} from "@/components/ui/filter-select"
import {
  CreditCard,
  Eye,
  MoreHorizontal,
  Pencil,
  Plus,
  Send,
} from "lucide-react"
import { formatDate } from "@/utils"
import type { SchoolPaymentStructureI } from "@/api/feeManagement.api/types"
import { useSchoolMoney } from "@/hooks/useSchoolMoney"

interface Props {
  paymentTypes: SchoolPaymentStructureI[]
  onView: (pt: SchoolPaymentStructureI) => void
  onEdit: (pt: SchoolPaymentStructureI) => void
  onDelete: (pt: SchoolPaymentStructureI) => void
  onAddItem: (pt: SchoolPaymentStructureI) => void
  onSend: (pt: SchoolPaymentStructureI) => void
}

function toOptions(
  values: (string | undefined)[],
  allLabel: string
): FilterSelectOption[] {
  const distinct = Array.from(new Set(values.filter(Boolean))) as string[]
  return [
    { value: "all", label: allLabel },
    ...distinct.sort().map((v) => ({ value: v, label: v })),
  ]
}

export default function PaymentTypeTable({
  paymentTypes,
  onView,
  onEdit,
  onAddItem,
  onSend,
}: Props) {
  const { formatMoney } = useSchoolMoney()
  const [search, setSearch] = useState("")
  const [sessionFilter, setSessionFilter] = useState("all")
  const [termFilter, setTermFilter] = useState("all")
  const [classFilter, setClassFilter] = useState("all")

  const sessionOptions = useMemo(
    () =>
      toOptions(
        paymentTypes.map((pt) => pt.sessionName),
        "All sessions"
      ),
    [paymentTypes]
  )
  const termOptions = useMemo(
    () =>
      toOptions(
        paymentTypes.map((pt) => pt.termName),
        "All terms"
      ),
    [paymentTypes]
  )
  const classOptions = useMemo(
    () =>
      toOptions(
        paymentTypes.map((pt) => pt.className),
        "All classes"
      ),
    [paymentTypes]
  )

  const filteredPaymentTypes = useMemo(
    () =>
      paymentTypes.filter((pt) => {
        if (sessionFilter !== "all" && pt.sessionName !== sessionFilter)
          return false
        if (termFilter !== "all" && pt.termName !== termFilter) return false
        if (classFilter !== "all" && pt.className !== classFilter) return false
        if (
          search &&
          ![pt.className, pt.termName, pt.sessionName, pt.notes].some((f) =>
            f?.toLowerCase().includes(search.toLowerCase())
          )
        )
          return false
        return true
      }),
    [paymentTypes, sessionFilter, termFilter, classFilter, search]
  )

  const columns: DataTableColumn<SchoolPaymentStructureI>[] = [
    {
      key: "class",
      header: "Class",
      cellClassName: "text-sm font-medium text-gray-900",
      render: (pt) => pt.className,
    },
    {
      key: "term",
      header: "Term",
      render: (pt) => (
        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
          {pt.termName}
        </span>
      ),
    },
    {
      key: "session",
      header: "Session",
      cellClassName: "text-sm text-gray-600",
      render: (pt) => pt.sessionName,
    },

    {
      key: "amount",
      header: "Total Amount",
      render: (pt) => (
        <span className="font-semibold text-gray-900">
          {formatMoney(pt.totalAmount ?? 0)}
        </span>
      ),
    },
    {
      key: "date",
      header: "Date Created",
      cellClassName: "text-sm text-gray-600",
      render: (pt) => formatDate(pt.dateCreated, "short"),
    },
    {
      key: "actions",
      header: "",
      render: (pt) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" className="rounded-lg">
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 rounded-xl">
            <DropdownMenuItem
              className="cursor-pointer gap-2 rounded-lg text-xs"
              onClick={() => onView(pt)}
            >
              <Eye className="size-3.5 text-gray-500" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer gap-2 rounded-lg text-xs"
              onClick={() => onEdit(pt)}
            >
              <Pencil className="size-3.5 text-blue-500" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer gap-2 rounded-lg text-xs"
              onClick={() => onAddItem(pt)}
            >
              <Plus className="size-3.5 text-green-600" />
              Add Payment Type
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer gap-2 rounded-lg text-xs"
              onClick={() => onSend(pt)}
            >
              <Send className="size-3.5 text-blue-600" />
              Send to All Guardians
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-50 px-5 py-3">
        <SearchInput
          placeholder="Search by class, term, session or notes…"
          value={search}
          onChange={setSearch}
          containerClassName="min-w-[180px] flex-1"
          className="h-9 rounded-xl"
        />
        <FilterSelect
          value={sessionFilter}
          onChange={setSessionFilter}
          options={sessionOptions}
          placeholder="All sessions"
          triggerClassName="h-9 w-36"
        />
        <FilterSelect
          value={termFilter}
          onChange={setTermFilter}
          options={termOptions}
          placeholder="All terms"
          triggerClassName="h-9 w-32"
        />
        <FilterSelect
          value={classFilter}
          onChange={setClassFilter}
          options={classOptions}
          placeholder="All classes"
          triggerClassName="h-9 w-36"
        />
      </div>

      <DataTable
        columns={columns}
        data={filteredPaymentTypes}
        getRowKey={(pt) => pt.id}
        wrapperClassName=""
        emptyState={
          <EmptyState
            icon={CreditCard}
            title="No payment types found"
            description='Adjust your filters or click "Create Payment Type" to get started'
            size="sm"
            iconContainerClassName="bg-gray-50"
          />
        }
      />
    </div>
  )
}
