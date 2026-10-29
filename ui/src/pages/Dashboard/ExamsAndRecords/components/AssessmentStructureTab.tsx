import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { TabsContent } from "@/components/ui/tabs"
import { Loader2, Trash2 } from "lucide-react"
import { useParams } from "react-router"
import type { SchoolAssessmentItem } from "@/api/examAndRecords.api/types"
import { AssessmentStructureDialog } from "./AssessmentStructureDialog"
import { Can } from "@/components/general/Can"
import { usePermissions } from "@/hooks/usePermissions"
import { DashboardRoutes } from "@/routes"

interface AssessmentRow {
  id: string
  name: string
  weight: string
}

interface SessionOption {
  id: string
  name: string
}

interface AssessmentStructureTabProps {
  assessments: SchoolAssessmentItem[]
  isLoading: boolean
  isCreating: boolean
  isDeleting: boolean
  sessions: SessionOption[]
  isModalOpen: boolean
  onModalOpenChange: (open: boolean) => void
  structureName: string
  onStructureNameChange: (name: string) => void
  session: string
  onSessionChange: (session: string) => void
  assessmentRows: AssessmentRow[]
  onRowChange: (id: string, field: "name" | "weight", value: string) => void
  onAddRow: () => void
  onRemoveRow: (id: string) => void
  onAddAssessment: () => void
  onResetForm: () => void
  onDeleteAssessment: (id: string) => void
  totalEntered: number
  remaining: number
}

export function AssessmentStructureTab({
  assessments,
  isLoading,
  isCreating,
  isDeleting,
  sessions,
  isModalOpen,
  onModalOpenChange,
  structureName,
  onStructureNameChange,
  session,
  onSessionChange,
  assessmentRows,
  onRowChange,
  onAddRow,
  onRemoveRow,
  onAddAssessment,
  onResetForm,
  onDeleteAssessment,
  totalEntered,
  remaining,
}: AssessmentStructureTabProps) {
  const { productId } = useParams<{ productId: string }>()
  const { canDelete } = usePermissions()
  const gradeBookMenuUrl = DashboardRoutes.toGradeBookSettings(productId ?? "")
  const canRemoveAssessment = canDelete(gradeBookMenuUrl)

  const totalWeightById = useMemo(
    () =>
      new Map(
        assessments.map((a) => [
          a.Id,
          a.Components.reduce((sum, c) => sum + c.WeightPercentage, 0),
        ])
      ),
    [assessments]
  )

  return (
    <TabsContent value="assessment" className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Assessment Structure</CardTitle>
              <CardDescription>
                Define how scores are weighted — items must total 100%
              </CardDescription>
            </div>
            <Can menuUrl={gradeBookMenuUrl} action="Create">
              <AssessmentStructureDialog
                isOpen={isModalOpen}
                onOpenChange={onModalOpenChange}
                structureName={structureName}
                onStructureNameChange={onStructureNameChange}
                session={session}
                onSessionChange={onSessionChange}
                sessions={sessions}
                assessmentRows={assessmentRows}
                onRowChange={onRowChange}
                onAddRow={onAddRow}
                onRemoveRow={onRemoveRow}
                onAddAssessment={onAddAssessment}
                onResetForm={onResetForm}
                totalEntered={totalEntered}
                remaining={remaining}
                isPending={isCreating}
              />
            </Can>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Structure Name</TableHead>
                  <TableHead>Session</TableHead>
                  <TableHead>Assessment Items</TableHead>
                  <TableHead className="w-24">Total</TableHead>
                  <TableHead className="w-16 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assessments.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-12 text-center text-sm text-muted-foreground"
                    >
                      No assessment structures yet. Click{" "}
                      <span className="font-medium text-gray-700">"Add Assessment"</span> to create one.
                    </TableCell>
                  </TableRow>
                ) : (
                  assessments.map((assessment) => {
                    const totalWeight = totalWeightById.get(assessment.Id) ?? 0
                    return (
                      <TableRow key={assessment.Id}>
                        <TableCell className="align-top font-medium">
                          {assessment.StructureName}
                        </TableCell>
                        <TableCell className="align-top text-sm text-muted-foreground">
                          {assessment.SchoolSessionName || "—"}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-2">
                            {assessment.Components.map((component) => (
                              <span
                                key={component.Id}
                                className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700"
                              >
                                {component.AssessmentName}
                                <span className="text-blue-400">·</span>
                                {component.WeightPercentage}%
                              </span>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="align-top font-semibold text-green-600">
                          {totalWeight}%
                        </TableCell>
                        <TableCell className="text-right align-top">
                          {canRemoveAssessment && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onDeleteAssessment(assessment.Id)}
                              disabled={isDeleting}
                              className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-600"
                            >
                              {isDeleting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </TabsContent>
  )
}
