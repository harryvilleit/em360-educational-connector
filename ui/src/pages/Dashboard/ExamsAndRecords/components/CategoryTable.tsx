import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Plus, Edit, Trash2, FolderOpen, MoreHorizontal } from "lucide-react"
import { format } from "date-fns"
import { useParams } from "react-router"
import type { CategoryItem } from "@/api/examAndRecords.api/types"
import Pagination from "@/components/ui/pagination"
import { usePermissions } from "@/hooks/usePermissions"
import { DashboardRoutes } from "@/routes"

const PAGE_SIZE = 10
const SKELETON_ROWS = 5

interface CategoryTableProps {
  categories: CategoryItem[]
  isLoading: boolean
  searchQuery: string
  currentPage: number
  totalItems: number
  onPageChange: (page: number) => void
  onCreateCategory: () => void
  onEditCategory: (category: CategoryItem) => void
  onDeleteCategory: (category: CategoryItem) => void
}

export default function CategoryTable({
  categories,
  isLoading,
  searchQuery,
  currentPage,
  totalItems,
  onPageChange,
  onCreateCategory,
  onEditCategory,
  onDeleteCategory,
}: CategoryTableProps) {
  const { productId } = useParams<{ productId: string }>()
  const { canCreate, canUpdate, canDelete } = usePermissions()
  const categoriesMenuUrl = DashboardRoutes.toCategories(productId ?? "")
  const canCreateCategory = canCreate(categoriesMenuUrl)
  const canEditCategory = canUpdate(categoriesMenuUrl)
  const canRemoveCategory = canDelete(categoriesMenuUrl)

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10" />
                <TableHead>Name</TableHead>
                <TableHead>Date Created</TableHead>
                <TableHead className="w-10">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: SKELETON_ROWS }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-8 w-8 rounded-lg" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-7 w-7 rounded-lg" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    )
  }

  if (categories.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center p-12 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-purple-50">
          <FolderOpen className="h-10 w-10 text-purple-500" />
        </div>
        <h3 className="mt-6 text-xl font-semibold text-gray-900">
          No categories found
        </h3>
        <p className="mt-2 max-w-sm text-sm text-gray-500">
          {searchQuery
            ? `No categories matching "${searchQuery}" were found. Try a different search term.`
            : "You haven't created any categories yet. Click the button below to add your first category."}
        </p>
        {!searchQuery && canCreateCategory && (
          <Button variant="primary" onClick={onCreateCategory} className="mt-6">
            <Plus className="size-4" />
            Create Category
          </Button>
        )}
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10" />
              <TableHead>Name</TableHead>
              <TableHead>Date Created</TableHead>
              <TableHead className="w-10">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.Id}>
                <TableCell></TableCell>
                <TableCell className="font-medium">
                  {category.CatName}
                </TableCell>
                <TableCell className="text-gray-600">
                  {format(new Date(category.DateCreated), "MMM d, yyyy")}
                </TableCell>
                <TableCell>
                  {(canEditCategory || canRemoveCategory) && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40 rounded-xl py-1">
                        {canEditCategory && (
                          <DropdownMenuItem
                            className="cursor-pointer gap-2"
                            onClick={() => onEditCategory(category)}
                          >
                            <Edit className="h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                        )}
                        {canEditCategory && canRemoveCategory && (
                          <DropdownMenuSeparator />
                        )}
                        {canRemoveCategory && (
                          <DropdownMenuItem
                            className="cursor-pointer gap-2 text-red-600 focus:text-red-600"
                            onClick={() => onDeleteCategory(category)}
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {totalItems > PAGE_SIZE && (
          <Pagination
            page={currentPage}
            total={totalItems}
            pageSize={PAGE_SIZE}
            onPageChange={onPageChange}
          />
        )}
      </CardContent>
    </Card>
  )
}
