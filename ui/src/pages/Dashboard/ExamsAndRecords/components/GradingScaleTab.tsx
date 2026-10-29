import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { TabsContent } from "@/components/ui/tabs"
import { useParams } from "react-router"
import type { SchoolGradeItem } from "@/api/examAndRecords.api/types"
import { GradingScaleDialog } from "./GradingScaleDialog"
import { GradingScaleTable } from "./GradingScaleTable"
import { Can } from "@/components/general/Can"
import { DashboardRoutes } from "@/routes"

interface GradingForm {
  grade: string
  minScore: number
  maxScore: number
  description: string
}

interface GradingScaleTabProps {
  grades: SchoolGradeItem[]
  isLoading: boolean
  isCreating: boolean
  isGradingModalOpen: boolean
  onGradingModalOpenChange: (open: boolean) => void
  gradingForm: GradingForm
  onGradingFormChange: (form: GradingForm) => void
  onAddGradingScale: () => void
  onEdit: (grade: SchoolGradeItem) => void
  onViewDetails: (gradeId: string) => void
}

export function GradingScaleTab({
  grades,
  isLoading,
  isCreating,
  isGradingModalOpen,
  onGradingModalOpenChange,
  gradingForm,
  onGradingFormChange,
  onAddGradingScale,
  onEdit,
  onViewDetails,
}: GradingScaleTabProps) {
  const { productId } = useParams<{ productId: string }>()

  return (
    <TabsContent value="grading" className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Grading Scale</CardTitle>
              <CardDescription>
                Define grades and their corresponding score ranges
              </CardDescription>
            </div>
            <Can
              menuUrl={DashboardRoutes.toGradeBookSettings(productId ?? "")}
              action="Create"
            >
              <GradingScaleDialog
                isOpen={isGradingModalOpen}
                onOpenChange={onGradingModalOpenChange}
                gradingForm={gradingForm}
                onGradingFormChange={onGradingFormChange}
                onAddGradingScale={onAddGradingScale}
                isPending={isCreating}
              />
            </Can>
          </div>
        </CardHeader>

        <CardContent>
          <GradingScaleTable
            grades={grades}
            isLoading={isLoading}
            onEdit={onEdit}
            onViewDetails={onViewDetails}
          />
        </CardContent>
      </Card>
    </TabsContent>
  )
}
