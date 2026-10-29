import { useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/general/PageHeader"
import { Plus } from "lucide-react"
import { useSchoolId } from "@/contexts/SchoolContext"
import { useGetAllSchoolSessions } from "@/hooks/userMgt"
import {
  useGetSchoolTransactions,
  useCreateSchoolTransaction,
  useApplyTransactionVat,
  useApplyTransactionDiscount,
  useAllocateTransaction,
} from "@/hooks/feeManagement"
import { useDebouncedValue } from "@/hooks/useDebouncedValue"
import { DashboardRoutes } from "@/routes"
import VatModal from "./components/AddVatModal"
import AddTransactionModal from "./components/AddTransactionModal"
import AllocateTransactionModal from "./components/AddTransactionDetails"
import TransactionDiscountModal from "./components/DiscountModal"
import BookKeepingStatsCards from "./components/BookKeepingStatsCards"
import BookKeepingTable from "./components/BookKeepingTable"
import BookKeepingFilters, {
  type MoneyDirectionFilter,
} from "./components/BookKeepingFilters"
import type { SchoolTransactionI } from "@/api/feeManagement.api/types"

export default function BookkeepingPage() {
  const schoolId = useSchoolId()
  const navigate = useNavigate()
  const { productId } = useParams<{ productId: string }>()

  const [search, setSearch] = useState("")
  const debouncedSearch = useDebouncedValue(search, 300)
  const [sessionFilter, setSessionFilter] = useState("all")
  const [termFilter, setTermFilter] = useState("all")
  const [directionFilter, setDirectionFilter] =
    useState<MoneyDirectionFilter>("all")
  const [pageNumber, setPageNumber] = useState(1)

  const { sessions } = useGetAllSchoolSessions({ schoolId, pageSize: 100 })

  const sessionOptions = useMemo(
    () => sessions.map((s) => ({ value: s.Id, label: s.SessionName })),
    [sessions]
  )
  const termOptions = useMemo(() => {
    const session = sessions.find((s) => s.Id === sessionFilter)
    return (session?.Terms ?? []).map((t) => ({
      value: t.Id,
      label: t.TermName,
    }))
  }, [sessions, sessionFilter])

  const handleSessionChange = (v: string) => {
    setSessionFilter(v)
    setTermFilter("all")
    setPageNumber(1)
  }

  const handleTermChange = (v: string) => {
    setTermFilter(v)
    setPageNumber(1)
  }

  const hasFilters =
    !!search ||
    sessionFilter !== "all" ||
    termFilter !== "all" ||
    directionFilter !== "all"

  const clearFilters = () => {
    setSearch("")
    setSessionFilter("all")
    setTermFilter("all")
    setDirectionFilter("all")
    setPageNumber(1)
  }

  const {
    transactions,
    cashSummary,
    isError,
    error,
    totalItems,
    pageSize,
    isLoading,
  } = useGetSchoolTransactions({
    schoolId,
    sessionId: sessionFilter !== "all" ? sessionFilter : undefined,
    termId: termFilter !== "all" ? termFilter : undefined,
    pageNumber,
    pageSize: 100,
    search: debouncedSearch,
    direction: directionFilter,
  })

  const { createSchoolTransaction, isPending: isCreating } =
    useCreateSchoolTransaction({ onSuccess: () => setAddOpen(false) })
  const { applyTransactionVat } = useApplyTransactionVat()
  const { applyTransactionDiscount } = useApplyTransactionDiscount()
  const { allocateTransaction, isPending: isAllocating } =
    useAllocateTransaction({ onSuccess: () => setAllocateOpen(false) })

  const [addOpen, setAddOpen] = useState(false)
  const [vatOpen, setVatOpen] = useState(false)
  const [allocateOpen, setAllocateOpen] = useState(false)
  const [discountOpen, setDiscountOpen] = useState(false)
  const [selectedTxForAction, setSelectedTxForAction] =
    useState<SchoolTransactionI | null>(null)
  const [selectedTxIdForVat, setSelectedTxIdForVat] = useState<string | null>(
    null
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bookkeeping"
        description="Track all money coming in and going out"
        actions={
          <Button
            variant="primary"
            onClick={() => setAddOpen(true)}
            className="w-full justify-center sm:w-auto"
          >
            <Plus className="size-4" />
            Add Transaction
          </Button>
        }
      />

      {isError && (
        <p role="alert" className="text-red-700">
          {error?.message || "Unable to load bookkeeping records"}
        </p>
      )}
      <BookKeepingStatsCards summary={cashSummary} />

      <BookKeepingFilters
        search={search}
        sessionFilter={sessionFilter}
        termFilter={termFilter}
        directionFilter={directionFilter}
        sessionOptions={sessionOptions}
        termOptions={termOptions}
        hasFilters={hasFilters}
        onSearchChange={(v) => {
          setSearch(v)
          setPageNumber(1)
        }}
        onSessionChange={handleSessionChange}
        onTermChange={handleTermChange}
        onDirectionChange={(v) => {
          setDirectionFilter(v)
          setPageNumber(1)
        }}
        onClearFilters={clearFilters}
      />

      <BookKeepingTable
        transactions={transactions}
        isLoading={isLoading}
        page={pageNumber}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={setPageNumber}
        onAddTransaction={() => setAddOpen(true)}
        onView={(tx) =>
          navigate(
            DashboardRoutes.toViewTransactionDetails(productId ?? "", tx.id)
          )
        }
        onAddVat={(tx) => {
          setSelectedTxIdForVat(tx.id)
          setVatOpen(true)
        }}
        onApplyDiscount={(tx) => {
          setSelectedTxForAction(tx)
          setDiscountOpen(true)
        }}
        onAllocate={(tx) => {
          setSelectedTxForAction(tx)
          setAllocateOpen(true)
        }}
      />

      {/* Modals */}
      <AddTransactionModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        isPending={isCreating}
        onSave={(payload) => createSchoolTransaction({ schoolId, ...payload })}
      />
      <VatModal
        open={vatOpen}
        onClose={() => setVatOpen(false)}
        onApply={(rate) => {
          if (selectedTxIdForVat) {
            applyTransactionVat({
              transactionId: selectedTxIdForVat,
              vatPercentage: rate,
            })
            setVatOpen(false)
          }
        }}
      />
      <AllocateTransactionModal
        key={selectedTxForAction?.id ?? "none"}
        open={allocateOpen}
        onClose={() => setAllocateOpen(false)}
        transaction={selectedTxForAction}
        isPending={isAllocating}
        onSave={({ studentId, amount }) => {
          if (!selectedTxForAction) return
          allocateTransaction({
            transactionId: selectedTxForAction.id,
            allocations: [{ studentId, amount }],
          })
        }}
      />
      <TransactionDiscountModal
        open={discountOpen}
        onClose={() => setDiscountOpen(false)}
        transaction={selectedTxForAction}
        onApply={(discount) => {
          if (!selectedTxForAction) return
          applyTransactionDiscount({
            transactionId: selectedTxForAction.id,
            discountAmount: discount,
          })
        }}
      />
    </div>
  )
}
