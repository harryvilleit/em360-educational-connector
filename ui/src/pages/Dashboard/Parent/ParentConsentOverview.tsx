import { Can } from "@/components/general/Can"
import { useMemo, useState } from "react"
import { Plus, CheckCircle2, XCircle, ClipboardList, Users, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SearchInput } from "@/components/ui/search-input"
import { FilterSelect } from "@/components/ui/filter-select"
import { EmptyState } from "@/components/ui/empty-state"
import { StatCard } from "@/components/general/StatCard"
import { PageHeader } from "@/components/general/PageHeader"
import { useSchoolId } from "@/contexts/SchoolContext"
import { useGetConsentRequests } from "@/hooks/consent"
import { ConsentCategory } from "@/api/consent.api/types"
import {
  CONSENT_CATEGORY_OPTIONS,
  getConsentCategoryMeta,
  isConsentClosed,
} from "@/utils/consent"
import { NewConsentModal } from "./components/NewConsentModal"
import { ConsentRequestsTable } from "./components/ConsentRequestsTable"

type StatusFilter = "all" | "open" | "closed"
type CategoryFilter = ConsentCategory | "all"

const PAGE_SIZE = 100

export default function ParentConsentOverviewPage() {
  const schoolId = useSchoolId()
  const [page, setPage] = useState(1)
  const { requests, totalItems, isLoading } = useGetConsentRequests({
    schoolId,
    pageNumber: page,
    pageSize: PAGE_SIZE,
  })

  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")

  const totals = useMemo(
    () =>
      requests.reduce(
        (acc, req) => ({
          approved: acc.approved + req.approved,
          rejected: acc.rejected + req.rejected,
          pending: acc.pending + req.pending,
        }),
        { approved: 0, rejected: 0, pending: 0 }
      ),
    [requests]
  )

  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      const isClosed = isConsentClosed(req.responseDue)
      if (statusFilter === "open" && isClosed) return false
      if (statusFilter === "closed" && !isClosed) return false
      if (
        categoryFilter !== "all" &&
        getConsentCategoryMeta(req.category).label !==
          CONSENT_CATEGORY_OPTIONS.find((o) => o.value === categoryFilter)
            ?.label
      )
        return false
      if (search && !req.title.toLowerCase().includes(search.toLowerCase()))
        return false
      return true
    })
  }, [requests, search, categoryFilter, statusFilter])

  return (
    <div>
      <PageHeader
        title="Consent Management"
        description="Create and track digital consent requests sent to parents"
        actions={
          <Can menuUrl="/dashboard/users/consent" action="Create"><Button variant="primary" onClick={() => setShowForm(true)}>
            <Plus className="size-4" />
            New Request
          </Button></Can>
        }
        className="mb-6"
      />

      {/* Summary cards */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="Total Requests"
          value={totalItems}
          icon={ClipboardList}
          color="gray"
        />
        <StatCard
          label="Pending"
          value={totals.pending}
          icon={Users}
          color="blue"
          valueColor="text-blue-600"
        />
        <StatCard
          label="Approved"
          value={totals.approved}
          icon={CheckCircle2}
          color="green"
          valueColor="text-green-600"
        />
        <StatCard
          label="Rejected"
          value={totals.rejected}
          icon={XCircle}
          color="red"
          valueColor="text-red-600"
        />
      </div>

      {/* Toolbar */}
      {requests.length > 0 && (
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <SearchInput
            value={search}
            onChange={(v) => {
              setSearch(v)
              setPage(1)
            }}
            placeholder="Search by title..."
            containerClassName="sm:max-w-xs"
          />
          <div className="flex gap-2">
            <FilterSelect
              value={String(categoryFilter)}
              onChange={(v) => {
                setCategoryFilter(v === "all" ? "all" : (Number(v) as ConsentCategory))
                setPage(1)
              }}
              options={[
                { value: "all", label: "All Categories" },
                ...CONSENT_CATEGORY_OPTIONS.map((o) => ({
                  value: String(o.value),
                  label: o.label,
                })),
              ]}
              placeholder="Category"
              triggerClassName="w-40"
            />
            <FilterSelect
              value={statusFilter}
              onChange={(v) => {
                setStatusFilter(v as StatusFilter)
                setPage(1)
              }}
              options={[
                { value: "all", label: "All" },
                { value: "open", label: "Open" },
                { value: "closed", label: "Closed" },
              ]}
              placeholder="Status"
              triggerClassName="w-32"
            />
          </div>
        </div>
      )}

      {/* Request table */}
      {isLoading ? (
        <div className="flex items-center justify-center rounded-2xl border border-gray-100 bg-white py-20 dark:border-white/10 dark:bg-white/3">
          <Loader2 className="size-5 animate-spin text-gray-400" />
        </div>
      ) : requests.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-white dark:border-white/10 dark:bg-white/3">
          <EmptyState
            icon={ClipboardList}
            title="No consent requests yet"
            description='Click "New Request" to send a consent request to parents'
          />
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-white dark:border-white/10 dark:bg-white/3">
          <EmptyState
            icon={ClipboardList}
            title="No matching requests"
            description="Try adjusting your search or filters"
          />
        </div>
      ) : (
        <ConsentRequestsTable
          requests={filteredRequests}
          page={page}
          totalItems={totalItems}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
        />
      )}

      {/* Create modal */}
      {showForm && <NewConsentModal onClose={() => setShowForm(false)} />}
    </div>
  )
}
