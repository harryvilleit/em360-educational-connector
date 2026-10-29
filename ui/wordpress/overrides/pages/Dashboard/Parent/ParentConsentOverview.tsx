import { useLocation } from "react-router"
import { QueryErrorPanel } from "@/components/general/QueryErrorPanel"
import { Can } from "@/components/general/Can"
import { useState } from "react"
import {
  Plus,
  CheckCircle2,
  XCircle,
  ClipboardList,
  Users,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { SearchInput } from "@/components/ui/search-input"
import { FilterSelect } from "@/components/ui/filter-select"
import { EmptyState } from "@/components/ui/empty-state"
import { StatCard } from "@/components/general/StatCard"
import { PageHeader } from "@/components/general/PageHeader"
import { useSchoolId } from "@/contexts/SchoolContext"
import { useGetConsentRequests } from "@/hooks/consent"
import { ConsentCategory } from "@/api/consent.api/types"
import { CONSENT_CATEGORY_OPTIONS } from "@/utils/consent"
import { NewConsentModal } from "@/pages/Dashboard/Parent/components/NewConsentModal"
import { ConsentRequestsTable } from "@/pages/Dashboard/Parent/components/ConsentRequestsTable"

type StatusFilter = "all" | "open" | "closed"
type CategoryFilter = ConsentCategory | "all"

const PAGE_SIZE = 20

export default function ParentConsentOverviewPage() {
  const schoolId = useSchoolId()
  const [page, setPage] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const menuUrl = useLocation().pathname.includes("/parents/")
    ? "/dashboard/parents/consent"
    : "/dashboard/users/consent"
  const { requests, totalItems, isLoading, isError, error, refetch, summary } =
    useGetConsentRequests({
      schoolId,
      pageNumber: page,
      pageSize: PAGE_SIZE,
      search: search || undefined,
      category: categoryFilter === "all" ? undefined : categoryFilter,
      status: statusFilter === "all" ? undefined : statusFilter,
    })
  const totals = summary ?? { pending: 0, approved: 0, rejected: 0 }

  return (
    <div>
      <PageHeader
        title="Consent Management"
        description="Create and track digital consent requests sent to parents"
        actions={
          <Can menuUrl={menuUrl} action="Create">
            <Button variant="primary" onClick={() => setShowForm(true)}>
              <Plus className="size-4" />
              New Request
            </Button>
          </Can>
        }
        className="mb-6"
      />

      {/* Summary cards */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="Total Requests"
          value={isLoading || isError ? "—" : totalItems}
          icon={ClipboardList}
          color="gray"
        />
        <StatCard
          label="Pending"
          value={isLoading || isError ? "—" : totals.pending}
          icon={Users}
          color="blue"
          valueColor="text-blue-600"
        />
        <StatCard
          label="Approved"
          value={isLoading || isError ? "—" : totals.approved}
          icon={CheckCircle2}
          color="green"
          valueColor="text-green-600"
        />
        <StatCard
          label="Rejected"
          value={isLoading || isError ? "—" : totals.rejected}
          icon={XCircle}
          color="red"
          valueColor="text-red-600"
        />
      </div>

      {/* Toolbar */}
      {
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
                setCategoryFilter(
                  v === "all" ? "all" : (Number(v) as ConsentCategory)
                )
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
      }

      {/* Request table */}
      {isError ? (
        <QueryErrorPanel
          title="Unable to load consent requests"
          message={error?.message ?? "Please try again."}
          onRetry={() => void refetch()}
        />
      ) : isLoading ? (
        <div className="flex items-center justify-center rounded-2xl border border-gray-100 bg-white py-20 dark:border-white/10 dark:bg-white/3">
          <Loader2 className="size-5 animate-spin text-gray-400" />
        </div>
      ) : requests.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-white dark:border-white/10 dark:bg-white/3">
          <EmptyState
            icon={ClipboardList}
            title={
              search || categoryFilter !== "all" || statusFilter !== "all"
                ? "No matching requests"
                : "No consent requests yet"
            }
            description='Click "New Request" to send a consent request to parents'
          />
        </div>
      ) : (
        <ConsentRequestsTable
          requests={requests}
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
