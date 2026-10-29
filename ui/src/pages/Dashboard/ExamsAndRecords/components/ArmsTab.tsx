import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { TabsContent } from "@/components/ui/tabs"
import { Edit, FolderOpen, MoreHorizontal, Plus } from "lucide-react"
import type { SchoolArmItem } from "@/api/examAndRecords.api/types"
import { useParams } from "react-router"
import { usePermissions } from "@/hooks/usePermissions"
import { DashboardRoutes } from "@/routes"

interface ArmsTabProps {
  arms: SchoolArmItem[]
  onCreateArm: () => void
  onEditArm: (arm: SchoolArmItem) => void
}

export default function ArmsTab({ arms, onCreateArm, onEditArm }: ArmsTabProps) {
  const { productId } = useParams<{ productId: string }>()
  const { canCreate, canUpdate } = usePermissions()
  const classesMenuUrl = DashboardRoutes.toClasses(productId ?? "")
  const canCreateArm = canCreate(classesMenuUrl)
  const canEditArm = canUpdate(classesMenuUrl)

  return (
    <TabsContent value="arms" className="space-y-6">
      {arms.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-50">
            <FolderOpen className="h-10 w-10 text-blue-500" />
          </div>
          <h3 className="mt-6 text-xl font-semibold text-gray-900">No class arms found</h3>
          <p className="mt-2 max-w-sm text-sm text-gray-500">
            You haven't created any class arms yet.
          </p>
          {canCreateArm && (
            <Button variant="primary" onClick={onCreateArm} className="mt-6">
              <Plus className="size-4" />
              Create Class Arm
            </Button>
          )}
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-32">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {arms.map((arm) => (
                  <TableRow key={arm.Id}>
                    <TableCell className="font-medium">{arm.ArmName}</TableCell>
                    <TableCell className="text-gray-600">
                      {arm.Description || "—"}
                    </TableCell>
                    <TableCell>
                      {canEditArm && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="h-8 w-8 rounded-lg"
                            >
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 rounded-xl">
                            <DropdownMenuItem
                              className="cursor-pointer gap-2 rounded-lg"
                              onClick={() => onEditArm(arm)}
                            >
                              <Edit className="size-3.5 text-blue-500" />
                              Edit
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </TabsContent>
  )
}
