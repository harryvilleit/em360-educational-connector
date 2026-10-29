import { usePermissions } from "@/hooks/usePermissions"
import { QueryErrorPanel } from "@/components/general/QueryErrorPanel"
import { useState } from "react"
import { useNavigate, useParams } from "react-router"
import { UserPlus } from "lucide-react"
import { DashboardRoutes } from "@/routes"
import { Button } from "@/components/ui/button"
import { SearchInput } from "@/components/ui/search-input"
import { PageHeader } from "@/components/general/PageHeader"
import { useGetSchoolParents } from "@/hooks/guardian"
import { useDebouncedValue } from "@/hooks/useDebouncedValue"
import { useSchoolId } from "@/contexts/SchoolContext"
import Pagination from "@/components/ui/pagination"
import { ParentTable } from "@/pages/Dashboard/Parent/components/ParentTable"

const PAGE_SIZE = 10

export default function ParentListPage() {
  const { productId } = useParams<{ productId: string }>()
  const navigate = useNavigate()
  const schoolId = useSchoolId()
  const permissions = usePermissions()
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  const debouncedSearch = useDebouncedValue(search, 300)

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

  return (
    <div>
      <PageHeader
        title="Parent List"
        description="View and manage all parents associated with your school."
        actions={
          permissions.canCreate("/dashboard/parents/add") && (
            <Button
              variant="primary"
              onClick={() => navigate(DashboardRoutes.toParentAdd(productId!))}
            >
              <UserPlus className="size-4" />
              Add Parent
            </Button>
          )
        }
        className="mb-6"
      />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <SearchInput
          placeholder="Search parents by name, email or phone"
          value={search}
          onChange={handleSearchChange}
        />
      </div>

      {isError ? (
        <QueryErrorPanel
          title="Unable to load parents"
          message={error?.message || "Please try again."}
          onRetry={() => void refetch()}
        />
      ) : isLoading ? (
        <div className="flex items-center justify-center rounded-2xl border border-gray-100 bg-white py-20 text-sm text-gray-400 shadow-sm">
          Loading parents...
        </div>
      ) : (
        <ParentTable
          parents={parents}
          productId={productId!}
          onViewDetails={(parent) =>
            navigate(
              DashboardRoutes.toParentProfile(productId!, parent.guardianId)
            )
          }
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
