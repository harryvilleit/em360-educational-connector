import { useState } from "react"
import { useParams, useNavigate } from "react-router"
import { Button } from "@/components/ui/button"
import { SearchInput } from "@/components/ui/search-input"
import { PageHeader } from "@/components/general/PageHeader"
import { Plus } from "lucide-react"
import CreateCategoryModal from "./components/CreateCategoryModal"
import EditCategoryModal from "./components/EditCategoryModal"
import DeleteCategoryModal from "./components/DeleteCategoryModal"
import CategoryTable from "./components/CategoryTable"
import type { CategoryItem } from "@/api/examAndRecords.api/types"
import { useGetAllCategories } from "@/hooks/examAndRecords"
import { useSchoolId } from "@/contexts/SchoolContext"
import { Can } from "@/components/general/Can"
import { DashboardRoutes } from "@/routes"

const PAGE_SIZE = 10

export default function CategoriesPage() {
  const { productId } = useParams<{ productId: string }>()
  const schoolId = useSchoolId()
  const navigate = useNavigate()

  const [searchQuery, setSearchQuery] = useState<string>("")
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false)
  const [editTarget, setEditTarget] = useState<CategoryItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<CategoryItem | null>(null)


  const { categories, pagination, isLoading } = useGetAllCategories({
    schoolId: schoolId,
    keyword: searchQuery || undefined,
    pageNumber: currentPage,
    pageSize: PAGE_SIZE,
  })

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    setCurrentPage(1)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categories"
        description="Organize classes by department"
        actions={
          <Can menuUrl={DashboardRoutes.toCategories(productId ?? "")} action="Create">
            <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="size-4" />
              Create Category
            </Button>
          </Can>
        }
      />

      {/* Search */}
      <SearchInput
        placeholder="Search categories..."
        value={searchQuery}
        onChange={handleSearch}
        containerClassName="md:w-1/2"
      />

      {/* Table */}
      <CategoryTable
        categories={categories}
        isLoading={isLoading}
        searchQuery={searchQuery}
        currentPage={currentPage}
        totalItems={pagination?.totalItems ?? 0}
        onPageChange={setCurrentPage}
        onCreateCategory={() => setIsCreateModalOpen(true)}
        onEditCategory={setEditTarget}
        onDeleteCategory={setDeleteTarget}
      />

      <CreateCategoryModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      <EditCategoryModal
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        category={editTarget}
      />

      <DeleteCategoryModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        category={deleteTarget}
      />
    </div>
  )
}
