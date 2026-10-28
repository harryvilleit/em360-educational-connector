import { useParams } from "react-router"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/general/PageHeader"
import { Plus } from "lucide-react"
import { Can } from "@/components/general/Can"
import { DashboardRoutes } from "@/routes"

interface JobRolesHeaderProps {
  onAddClick: () => void
}

export default function JobRolesHeader({ onAddClick }: JobRolesHeaderProps) {
  const { productId } = useParams<{ productId: string }>()

  return (
    <PageHeader
      title="Job Roles"
      description="Create and manage job roles for your school staff."
      actions={
        <Can menuUrl={DashboardRoutes.toJobRoles(productId ?? "")} action="Create">
          <Button variant="primary" onClick={onAddClick}>
            <Plus className="size-4" />
            Add Job Role
          </Button>
        </Can>
      }
    />
  )
}
