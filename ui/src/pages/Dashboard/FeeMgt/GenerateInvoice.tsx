import { useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/general/PageHeader"
import { Plus } from "lucide-react"
import { useSchoolId } from "@/contexts/SchoolContext"
import { useGetAllSchoolSessions } from "@/hooks/userMgt"
import { useGetAllClasses } from "@/hooks/examAndRecords"
import { useGetInvoices } from "@/hooks/feeManagement"
import { useDebouncedValue } from "@/hooks/useDebouncedValue"
import InvoiceFilters from "./components/InvoiceFilters"
import InvoiceTable from "./components/InvoiceTable"
import InvoiceStatsCards from "./components/InvoiceStatsCard"
import { EditInvoiceModal } from "./components/EditInvoiceModal"
import { DashboardRoutes } from "@/routes"
import type { StudentInvoiceSummaryI } from "@/api/feeManagement.api/types"

export default function GenerateInvoicePage() {
  const schoolId = useSchoolId()
  const navigate = useNavigate()
  const { productId } = useParams()

  const [search, setSearch] = useState("")
  const debouncedSearch = useDebouncedValue(search, 300)
  const [termFilter, setTermFilter] = useState("all")
  const [sessionFilter, setSessionFilter] = useState("")
  const [classFilter, setClassFilter] = useState("all")
  const [pageNumber, setPageNumber] = useState(1)

  const { sessions } = useGetAllSchoolSessions({ schoolId, pageSize: 100 })
  const { classes: classItems } = useGetAllClasses({ schoolId, pageSize: 100 })

  const defaultSessionId = useMemo(() => {
    const current = sessions.find((s) => s.Terms.some((t) => t.IsCurrent))
    return current?.Id ?? sessions[0]?.Id ?? ""
  }, [sessions])
  const effectiveSessionId = sessionFilter || defaultSessionId

  const sessionOptions = useMemo(
    () => sessions.map((s) => ({ value: s.Id, label: s.SessionName })),
    [sessions]
  )
  const termOptions = useMemo(() => {
    const session = sessions.find((s) => s.Id === effectiveSessionId)
    return (session?.Terms ?? []).map((t) => ({
      value: t.Id,
      label: t.TermName,
    }))
  }, [sessions, effectiveSessionId])
  const classOptions = useMemo(
    () => classItems.map((c) => ({ value: c.Id, label: c.ClsName })),
    [classItems]
  )

  const handleSessionChange = (v: string) => {
    setSessionFilter(v)
    setTermFilter("all")
    setPageNumber(1)
  }
  const handleTermChange = (v: string) => {
    setTermFilter(v)
    setPageNumber(1)
  }
  const handleClassChange = (v: string) => {
    setClassFilter(v)
    setPageNumber(1)
  }

  const hasFilters =
    !!search ||
    termFilter !== "all" ||
    classFilter !== "all" ||
    (!!sessionFilter && sessionFilter !== defaultSessionId)

  const clearFilters = () => {
    setSearch("")
    setTermFilter("all")
    setSessionFilter("")
    setClassFilter("all")
  }

  const {
    invoices,
    totalItems,
    pageSize,
    isLoading,
    totalInvoiced,
    totalCollected,
    outstandingBalance,
    fullyPaidCount,
  } = useGetInvoices({
    schoolId,
    search: debouncedSearch || undefined,
    schoolSessionId: effectiveSessionId || undefined,
    schoolSessionTermId: termFilter !== "all" ? termFilter : undefined,
    schoolClassId: classFilter !== "all" ? classFilter : undefined,
    pageNumber,
    pageSize: 10,
  })

  const [editingInvoice, setEditingInvoice] =
    useState<StudentInvoiceSummaryI | null>(null)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoices"
        description="Generate and manage student fee invoices."
        actions={
          <Button
            variant="primary"
            onClick={() => navigate(`/dashboard/${productId}/fees/invoice/new`)}
          >
            <Plus className="size-4" />
            Generate Invoice
          </Button>
        }
      />

      <InvoiceStatsCards
        totalInvoiced={totalInvoiced}
        totalCollected={totalCollected}
        outstandingBalance={outstandingBalance}
        fullyPaidCount={fullyPaidCount}
      />

      <InvoiceFilters
        search={search}
        termFilter={termFilter}
        sessionFilter={effectiveSessionId}
        classFilter={classFilter}
        sessionOptions={sessionOptions}
        termOptions={termOptions}
        classOptions={classOptions}
        hasFilters={hasFilters}
        onSearchChange={(v) => {
          setSearch(v)
          setPageNumber(1)
        }}
        onTermChange={handleTermChange}
        onSessionChange={handleSessionChange}
        onClassChange={handleClassChange}
        onClearFilters={clearFilters}
      />

      <InvoiceTable
        invoices={invoices}
        isLoading={isLoading}
        hasFilters={hasFilters}
        onView={(inv) =>
          navigate(DashboardRoutes.toViewInvoice(productId ?? "", inv.id))
        }
        onEdit={(inv) => setEditingInvoice(inv)}
      />

      <EditInvoiceModal
        key={editingInvoice?.id ?? "closed"}
        invoice={editingInvoice}
        open={!!editingInvoice}
        onClose={() => setEditingInvoice(null)}
      />

      {totalItems > pageSize && (
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>
            Page {pageNumber} of {Math.max(1, Math.ceil(totalItems / pageSize))}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pageNumber <= 1}
              onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pageNumber >= Math.ceil(totalItems / pageSize)}
              onClick={() => setPageNumber((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
