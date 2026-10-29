import { useState } from "react"
import { useParams, useNavigate } from "react-router"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageHeader } from "@/components/general/PageHeader"
import { StatCard } from "@/components/general/StatCard"
import { Plus, GraduationCap, Layers } from "lucide-react"
import type { SchoolArmItem } from "@/api/examAndRecords.api/types"
import { useGetAllClasses, useGetAllSchoolArms } from "@/hooks/examAndRecords"
import { useSchoolId } from "@/contexts/SchoolContext"
import ClassesTab from "./components/ClassesTab"
import ArmsTab from "./components/ArmsTab"
import CreateClassModal from "./components/CreateClassModal"
import CreateClassArmModal from "./components/CreateClassArmModal"
import EditClassArmModal from "./components/EditClassArmModal"
import DeleteClassArmModal from "./components/DeleteClassArmModal"
import { Can } from "@/components/general/Can"
import { DashboardRoutes } from "@/routes"

const PAGE_SIZE = 10

export default function ClassesPage() {
  const { productId } = useParams<{ productId: string }>()
  const schoolId = useSchoolId()
  const navigate = useNavigate()

  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isCreateArmModalOpen, setIsCreateArmModalOpen] = useState(false)
  const [editArmTarget, setEditArmTarget] = useState<SchoolArmItem | null>(null)
  const [deleteArmTarget, setDeleteArmTarget] = useState<SchoolArmItem | null>(null)

  const { classes, pagination, isLoading } = useGetAllClasses({
    schoolId,
    keyword: searchQuery || undefined,
    pageNumber: currentPage,
    pageSize: PAGE_SIZE,
  })

  const { schoolArms: arms } = useGetAllSchoolArms(schoolId)

  function handleSearchChange(value: string) {
    setSearchQuery(value)
    setCurrentPage(1)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Classes & Arms"
        description="Manage classes and class arms"
        actions={
          <Can menuUrl={DashboardRoutes.toClasses(productId ?? "")} action="Create">
            <Button
              variant="outline"
              onClick={() => setIsCreateArmModalOpen(true)}
              className="flex items-center gap-2 py-6"
            >
              <Plus className="h-4 w-4" />
              Create Class Arm
            </Button>
            <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="size-4" />
              Create Class
            </Button>
          </Can>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:max-w-md">
        <StatCard
          label="Total Classes"
          value={pagination?.totalItems ?? classes.length}
          icon={GraduationCap}
          color="blue"
        />
        <StatCard
          label="Total Arms"
          value={arms.length}
          icon={Layers}
          color="indigo"
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="classes" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="classes">Classes</TabsTrigger>
          <TabsTrigger value="arms">Class Arms</TabsTrigger>
        </TabsList>

        <ClassesTab
          classes={classes}
          isLoading={isLoading}
          searchQuery={searchQuery}
          currentPage={currentPage}
          totalItems={pagination?.totalItems ?? 0}
          productId={productId ?? ""}
          schoolId={schoolId}
          onSearchChange={handleSearchChange}
          onPageChange={setCurrentPage}
          onCreateClass={() => setIsCreateModalOpen(true)}
        />

        <ArmsTab
          arms={arms}
          onCreateArm={() => setIsCreateArmModalOpen(true)}
          onEditArm={setEditArmTarget}
        />
      </Tabs>

      {/* Modals */}
      <CreateClassModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      <CreateClassArmModal
        open={isCreateArmModalOpen}
        onClose={() => setIsCreateArmModalOpen(false)}
        onSuccess={() => {}}
      />

      <EditClassArmModal
        open={!!editArmTarget}
        onClose={() => setEditArmTarget(null)}
        arm={editArmTarget}
        onSuccess={() => {}}
      />

      <DeleteClassArmModal
        open={!!deleteArmTarget}
        onClose={() => setDeleteArmTarget(null)}
        arm={deleteArmTarget}
      />
    </div>
  )
}
