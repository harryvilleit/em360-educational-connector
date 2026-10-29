import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
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
import {
  Download,
  Eye,
  FileText,
  MoreHorizontal,
  Pencil,
  Printer,
} from "lucide-react"
import { getInvoiceDetailsApi } from "@/api/feeManagement.api"
import type {
  StudentInvoiceI,
  StudentInvoiceSummaryI,
} from "@/api/feeManagement.api/types"
import { getErrorMessage } from "@/utils"
import { mockSchoolInfo } from "@/data"
import { downloadInvoicePdf, printInvoiceElement } from "@/lib/invoicePdf"
import InvoicePDFTemplate from "./InvoiceTemplate"
import { useSchoolMoney } from "@/hooks/useSchoolMoney"

interface InvoiceTableProps {
  invoices: StudentInvoiceSummaryI[]
  isLoading?: boolean
  hasFilters: boolean
  onView: (invoice: StudentInvoiceSummaryI) => void
  onEdit: (invoice: StudentInvoiceSummaryI) => void
}

const statusColor = (status: string) => {
  if (status === "Paid") return "bg-green-50 text-green-700"
  if (status === "Partial") return "bg-amber-50 text-amber-700"
  return "bg-red-50 text-red-600"
}

export default function InvoiceTable({
  invoices,
  isLoading,
  hasFilters,
  onView,
  onEdit,
}: InvoiceTableProps) {
  const { formatMoney } = useSchoolMoney()
  const printRef = useRef<HTMLDivElement>(null)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [pdfInvoice, setPdfInvoice] = useState<StudentInvoiceI | null>(null)
  const [pdfAction, setPdfAction] = useState<"print" | "download" | null>(null)

  useEffect(() => {
    if (!pdfInvoice || !pdfAction || !printRef.current) return
    if (pdfAction === "download") {
      downloadInvoicePdf(printRef.current, pdfInvoice.invoiceNumber)
    } else {
      printInvoiceElement(printRef.current, pdfInvoice.invoiceNumber)
    }
    setPdfInvoice(null)
    setPdfAction(null)
  }, [pdfInvoice, pdfAction])

  async function handleGeneratePdf(
    inv: StudentInvoiceSummaryI,
    action: "print" | "download"
  ) {
    setPendingId(inv.id)
    try {
      const res = await getInvoiceDetailsApi(inv.id)
      if (!res.value) {
        toast.error("Could not load invoice details.")
        return
      }
      setPdfInvoice(res.value)
      setPdfAction(action)
    } catch (error) {
      toast.error(
        getErrorMessage(
          error,
          `Failed to ${action === "download" ? "download" : "print"} invoice.`
        )
      )
    } finally {
      setPendingId(null)
    }
  }

  const columns: DataTableColumn<StudentInvoiceSummaryI>[] = [
    {
      key: "invoiceNumber",
      header: "Invoice No.",
      render: (inv) => (
        <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
          {inv.invoiceNumber}
        </span>
      ),
    },
    {
      key: "student",
      header: "Student",
      render: (inv) => (
        <>
          <p className="font-medium text-gray-900">{inv.studentName}</p>
          <p className="text-xs text-muted-foreground">{inv.parentName}</p>
        </>
      ),
    },
    {
      key: "class",
      header: "Class",
      cellClassName: "text-sm text-gray-600",
      render: (inv) => inv.class,
    },
    {
      key: "term",
      header: "Term",
      render: (inv) => (
        <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
          {inv.term}
        </span>
      ),
    },
    {
      key: "total",
      header: "Total",
      cellClassName: "font-semibold text-gray-900",
      render: (inv) => formatMoney(inv.grandTotal),
    },
    {
      key: "status",
      header: "Status",
      render: (inv) => (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${statusColor(inv.paymentStatus)}`}
        >
          {inv.paymentStatus}
        </span>
      ),
    },
    {
      key: "date",
      header: "Date",
      cellClassName: "text-xs text-muted-foreground",
      render: (inv) => new Date(inv.dateCreated).toLocaleDateString(),
    },
    {
      key: "actions",
      header: "",
      render: (inv) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" className="rounded-lg">
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 rounded-xl">
            <DropdownMenuItem
              className="cursor-pointer gap-2 rounded-lg text-xs"
              onClick={() => onView(inv)}
            >
              <Eye className="size-3.5 text-gray-500" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer gap-2 rounded-lg text-xs"
              onClick={() => onEdit(inv)}
            >
              <Pencil className="size-3.5 text-gray-500" />
              Edit Invoice
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer gap-2 rounded-lg text-xs"
              disabled={pendingId === inv.id}
              onClick={() => handleGeneratePdf(inv, "download")}
            >
              <Download className="size-3.5 text-gray-500" />
              Download Invoice
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer gap-2 rounded-lg text-xs"
              disabled={pendingId === inv.id}
              onClick={() => handleGeneratePdf(inv, "print")}
            >
              <Printer className="size-3.5 text-gray-500" />
              Print Invoice
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <>
      <DataTable
        columns={columns}
        data={invoices}
        isLoading={isLoading}
        getRowKey={(inv) => inv.id}
        emptyState={
          <EmptyState
            icon={FileText}
            title="No invoices found"
            description={
              hasFilters
                ? "Try clearing filters"
                : "Generate your first invoice to get started"
            }
            size="sm"
            iconContainerClassName="bg-gray-50"
          />
        }
      />

      {/* Off-screen render target used to rasterize the invoice for
          download/print — html2canvas needs the element laid out in the
          DOM, so it's pushed out of the viewport rather than hidden. */}
      {pdfInvoice && (
        <div style={{ position: "fixed", top: 0, left: "-10000px" }}>
          <div ref={printRef} className="w-fit">
            <InvoicePDFTemplate invoice={pdfInvoice} school={mockSchoolInfo} />
          </div>
        </div>
      )}
    </>
  )
}
