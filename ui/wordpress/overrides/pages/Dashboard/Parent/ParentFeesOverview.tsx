import { QueryErrorPanel } from "@/components/general/QueryErrorPanel"
import { useState } from "react"
import { useNavigate, useParams } from "react-router"
import { useSchoolId } from "@/contexts/SchoolContext"
import { useDebouncedValue } from "@/hooks/useDebouncedValue"
import { useGetSchoolParents } from "@/hooks/guardian"
import { useGetInvoices } from "@/hooks/feeManagement"
import { useGetAllSchoolSessions } from "@/hooks/userMgt"
import { useGetAllClasses } from "@/hooks/examAndRecords"
import { DashboardRoutes } from "@/routes"
import { PageHeader } from "@/components/general/PageHeader"
import { SearchInput } from "@/components/ui/search-input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import Pagination from "@/components/ui/pagination"
import { OverviewCard } from "@/pages/Dashboard/Parent/components/OverviewCard"
import { ParentFeesTable } from "@/pages/Dashboard/Parent/components/ParentFeesTable"

const ALL = "all"
const PAGE_SIZE = 10

export default function ParentFeesOverviewPage() {
  const { productId } = useParams<{ productId: string }>()
  const navigate = useNavigate()
  const schoolId = useSchoolId()

  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [sessionFilter, setSessionFilter] = useState("")
  const [termFilter, setTermFilter] = useState(ALL)
  const [classFilter, setClassFilter] = useState(ALL)

  const debouncedSearch = useDebouncedValue(search, 300)

  const sessionQuery = useGetAllSchoolSessions({
    schoolId,
    pageSize: 100,
  })
  const { sessions, isLoading: sessionsLoading } = sessionQuery
  const classQuery = useGetAllClasses({ schoolId, pageSize: 100 })
  const { classes } = classQuery

  const activeSessionId =
    sessionFilter ||
    sessions.find((s) => s.IsCurrent)?.Id ||
    sessions[0]?.Id ||
    ""
  const activeSession = sessions.find((s) => s.Id === activeSessionId)
  const activeTermId = termFilter !== ALL ? termFilter : undefined
  const activeClassId = classFilter !== ALL ? classFilter : undefined

  const summary = useGetInvoices({
    schoolId,
    schoolSessionId: activeSessionId,
    schoolSessionTermId: activeTermId,
    schoolClassId: activeClassId,
    pageSize: 1,
  })

  const { parents, pagination, isLoading, isError, error, refetch } =
    useGetSchoolParents({
      schoolId,
      pageNumber: currentPage,
      pageSize: PAGE_SIZE,
      search: debouncedSearch.trim() || undefined,
    })

  function handleSearchChange(value: string) {
    setSearch(value)
    setCurrentPage(1)
  }

  const handleView = (guardianId: string) =>
    navigate(DashboardRoutes.toParentFees(productId!, guardianId))

  return (
    <div>
      <PageHeader
        title="School Fees"
        description="Fee status and invoices for all parents"
        className="mb-6"
      />

      {/* School-wide summary — reflects the session/term filters below */}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <OverviewCard
          label="Total Billed"
          amount={
            summary.isLoading || summary.isError
              ? undefined
              : summary.totalInvoiced
          }
          color="gray"
        />
        <OverviewCard
          label="Total Collected"
          amount={
            summary.isLoading || summary.isError
              ? undefined
              : summary.totalCollected
          }
          color="green"
        />
        <OverviewCard
          label="Total Outstanding"
          amount={
            summary.isLoading || summary.isError
              ? undefined
              : summary.outstandingBalance
          }
          color={(summary.outstandingBalance ?? 0) > 0 ? "red" : "green"}
        />
      </div>

      {(sessionQuery.isError || classQuery.isError) && (
        <QueryErrorPanel
          title="Unable to load fee filters"
          message="Academic sessions or classes could not be loaded."
          onRetry={() => {
            void sessionQuery.refetch()
            void classQuery.refetch()
          }}
        />
      )}
      {summary.isError && (
        <QueryErrorPanel
          title="Unable to load fee totals"
          message={summary.error?.message || "Try again."}
          onRetry={() => void summary.refetch()}
        />
      )}
      {/* Search + filters */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="min-w-56 flex-1">
          <SearchInput
            placeholder="Search parents by name, email or phone"
            value={search}
            onChange={handleSearchChange}
          />
        </div>

        <Select
          value={activeSessionId}
          onValueChange={(v) => {
            setSessionFilter(v)
            setTermFilter(ALL)
          }}
          disabled={sessionsLoading}
        >
          <SelectTrigger className="w-40 border-gray-200">
            <SelectValue
              placeholder={sessionsLoading ? "Loading…" : "Select session"}
            />
          </SelectTrigger>
          <SelectContent>
            {sessions.map((s) => (
              <SelectItem key={s.Id} value={s.Id}>
                {s.SessionName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={termFilter} onValueChange={setTermFilter}>
          <SelectTrigger className="w-36 border-gray-200">
            <SelectValue placeholder="Term" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All Terms</SelectItem>
            {(activeSession?.Terms ?? []).map((t) => (
              <SelectItem key={t.Id} value={t.Id}>
                {t.TermName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={classFilter} onValueChange={setClassFilter}>
          <SelectTrigger className="w-36 border-gray-200">
            <SelectValue placeholder="Class" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All Classes</SelectItem>
            {classes.map((c) => (
              <SelectItem key={c.Id} value={c.Id}>
                {c.ClsName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Per-parent table */}
      {isError ? (
        <QueryErrorPanel
          title="Unable to load parents"
          message={error?.message || "Try again."}
          onRetry={() => void refetch()}
        />
      ) : isLoading ? (
        <div className="flex items-center justify-center rounded-xl border border-gray-200 bg-white py-20 text-sm text-gray-400 dark:border-white/10 dark:bg-white/3">
          Loading parents...
        </div>
      ) : sessionsLoading || !activeSessionId ? (
        <div className="flex items-center justify-center rounded-xl border border-gray-200 bg-white py-20 text-sm text-gray-400 dark:border-white/10 dark:bg-white/3">
          {sessionsLoading
            ? "Loading academic sessions..."
            : "No academic sessions configured for this school yet."}
        </div>
      ) : (
        <ParentFeesTable
          parents={parents}
          schoolId={schoolId}
          sessionId={activeSessionId}
          termId={activeTermId}
          classId={activeClassId}
          onView={handleView}
        />
      )}

      {pagination.totalItems > PAGE_SIZE && (
        <div className="mt-4">
          <Pagination
            page={currentPage}
            total={pagination.totalItems}
            pageSize={PAGE_SIZE}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  )
}
