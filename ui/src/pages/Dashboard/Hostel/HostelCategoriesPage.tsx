import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSchoolId } from "@/contexts/SchoolContext"
import { useGetAllHostelCategories } from "@/hooks/hostelCategory"
import { PageHeader } from "@/components/general/PageHeader"
import type { HostelCategoryItemI } from "@/api/hostel.api/types"
import { HostelCategoryModal } from "./components/HostelCategoryModal"
import { HostelCategoryTable } from "./components/HostelCategoryTable"

export default function HostelCategoriesPage() {
  const schoolId = useSchoolId()
  const { categories, isLoading } = useGetAllHostelCategories(schoolId)

  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<HostelCategoryItemI | null>(null)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hostel Categories"
        description="Manage the hostel categories (e.g. Boys Hostel, Girls Hostel) used when creating hostels"
        actions={
          <Button variant="primary" onClick={() => setCreateOpen(true)}>
            <Plus className="size-3.5" />
            Create Category
          </Button>
        }
      />

      <div className="rounded-xl border border-gray-200 bg-white ">
        <HostelCategoryTable
          categories={categories}
          isLoading={isLoading}
          onCreateCategory={() => setCreateOpen(true)}
          onEdit={setEditTarget}
        />
      </div>

      <HostelCategoryModal
        open={createOpen || !!editTarget}
        onClose={() => {
          setCreateOpen(false)
          setEditTarget(null)
        }}
        category={editTarget}
      />
    </div>
  )
}
