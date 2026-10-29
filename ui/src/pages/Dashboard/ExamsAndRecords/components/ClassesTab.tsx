import AssignArmToClassModal from "./AssignArmToClassModal"
import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  useEffect,
  memo,
} from "react"
import { createPortal } from "react-dom"
import { useNavigate } from "react-router"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TabsContent } from "@/components/ui/tabs"
import {
  BookOpen,
  Edit,
  Eye,
  FolderOpen,
  MoreHorizontal,
  Plus,
  Search,
  RefreshCw,
} from "lucide-react"
import { format } from "date-fns"
import type { ClassItem } from "@/api/examAndRecords.api/types"
import { useGetClassArms } from "@/hooks/examAndRecords"
import { DashboardRoutes } from "@/routes"
import {
  classTypeLabel,
  normalizeClassType,
  CLASS_TYPE,
} from "@/utils/classType.utils"
import Pagination from "@/components/ui/pagination"
import EditClassModal from "./EditClassModal"
import AssignSubjectToClassModal from "./AssignSubjectToClassModal"
import { usePermissions } from "@/hooks/usePermissions"
import { syncClassSubjectsApi } from "@/api/examAndRecords.api"

const PAGE_SIZE = 10
const SKELETON_ROWS = 6
const MENU_WIDTH = 208 // w-52

// ── Per-row class type badge ────────────────────────────────────────────────────

function ClassTypeBadge({ classType }: { classType: ClassItem["ClassType"] }) {
  const normalized = normalizeClassType(classType)
  if (normalized === undefined)
    return <span className="text-xs text-gray-400">—</span>
  const isPrimary = normalized === CLASS_TYPE.Primary
  return (
    <Badge
      className={
        isPrimary
          ? "bg-blue-100 text-blue-700 hover:bg-blue-100"
          : "bg-purple-100 text-purple-700 hover:bg-purple-100"
      }
    >
      {classTypeLabel(classType)}
    </Badge>
  )
}

// ── Per-row arm badges ─────────────────────────────────────────────────────────

const ClassArmsCell = memo(function ClassArmsCell({
  classId,
}: {
  classId: string
}) {
  const { classArms } = useGetClassArms(classId)
  if (classArms.length === 0)
    return <span className="text-xs text-gray-400">—</span>
  return (
    <div className="flex flex-wrap gap-1">
      {classArms.map((arm) => (
        <span
          key={arm.Id}
          className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700"
        >
          {arm.ArmName}
        </span>
      ))}
    </div>
  )
})

// ── Row action dropdown (portal-rendered so it escapes the table's overflow) ────

const RowActions = memo(function RowActions({
  cls,
  productId,
  onEditClass,
  onAssignSubject,
  onManageArms,
  onSyncSubjects,
  isSyncing,
}: {
  cls: ClassItem
  productId: string
  onEditClass: (cls: ClassItem) => void
  onAssignSubject: (cls: ClassItem) => void
  onManageArms: (cls: ClassItem) => void
  onSyncSubjects: (cls: ClassItem) => void
  isSyncing: boolean
}) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [coords, setCoords] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  })
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const { canUpdate } = usePermissions()
  const canEditClass = canUpdate(DashboardRoutes.toClasses(productId))

  // Anchor the fixed-position menu to the trigger, right-aligned.
  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    setCoords({
      top: rect.bottom + 4,
      left: Math.max(8, rect.right - MENU_WIDTH),
    })
  }, [open])

  // Close on outside click / scroll / resize.
  useEffect(() => {
    if (!open) return
    function handlePointer(e: MouseEvent) {
      const target = e.target as Node
      if (
        !menuRef.current?.contains(target) &&
        !triggerRef.current?.contains(target)
      ) {
        setOpen(false)
      }
    }
    function close() {
      setOpen(false)
    }
    document.addEventListener("mousedown", handlePointer)
    window.addEventListener("scroll", close, true)
    window.addEventListener("resize", close)
    return () => {
      document.removeEventListener("mousedown", handlePointer)
      window.removeEventListener("scroll", close, true)
      window.removeEventListener("resize", close)
    }
  }, [open])

  return (
    <>
      <Button
        ref={triggerRef}
        variant="ghost"
        size="sm"
        onClick={() => setOpen((p) => !p)}
        className="h-8 w-8 p-0 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
      >
        <MoreHorizontal className="h-4 w-4" />
      </Button>

      {open &&
        createPortal(
          <div
            ref={menuRef}
            style={{ top: coords.top, left: coords.left, width: MENU_WIDTH }}
            className="fixed z-50 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg"
          >
            <button
              onClick={() => {
                navigate(DashboardRoutes.toClassDetail(productId, cls.Id))
                setOpen(false)
              }}
              className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-xs text-gray-600 hover:bg-gray-50"
            >
              <Eye className="size-3.5 text-gray-400" />
              View Details
            </button>
            {canEditClass && (
              <>
                <button
                  onClick={() => {
                    onEditClass(cls)
                    setOpen(false)
                  }}
                  className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-xs text-gray-600 hover:bg-gray-50"
                >
                  <Edit className="size-3.5 text-gray-400" />
                  Edit Class
                </button>
                <button
                  onClick={() => {
                    onManageArms(cls)
                    setOpen(false)
                  }}
                  className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-xs text-gray-600 hover:bg-gray-50"
                >
                  <FolderOpen className="size-3.5 text-gray-400" />
                  Manage Arms
                </button>
                <button
                  onClick={() => {
                    onAssignSubject(cls)
                    setOpen(false)
                  }}
                  className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-xs text-gray-600 hover:bg-gray-50"
                >
                  <BookOpen className="size-3.5 text-gray-400" />
                  Assign Subject
                </button>
                <button
                  disabled={isSyncing}
                  onClick={() => {
                    onSyncSubjects(cls)
                    setOpen(false)
                  }}
                  className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-xs text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                >
                  <RefreshCw className="size-3.5 text-gray-400" />
                  {isSyncing ? "Syncing subjects…" : "Sync student subjects"}
                </button>
              </>
            )}
          </div>,
          document.body
        )}
    </>
  )
})

// ── Props ──────────────────────────────────────────────────────────────────────

interface ClassesTabProps {
  classes: ClassItem[]
  isLoading: boolean
  searchQuery: string
  currentPage: number
  totalItems: number
  productId: string
  schoolId: string
  onSearchChange: (value: string) => void
  onPageChange: (page: number) => void
  onCreateClass: () => void
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function ClassesTab({
  classes,
  isLoading,
  searchQuery,
  currentPage,
  totalItems,
  productId,
  schoolId,
  onSearchChange,
  onPageChange,
  onCreateClass,
}: ClassesTabProps) {
  const [armTarget, setArmTarget] = useState<ClassItem | null>(null)
  const [editTarget, setEditTarget] = useState<ClassItem | null>(null)
  const [assignSubjectTarget, setAssignSubjectTarget] =
    useState<ClassItem | null>(null)
  const { canCreate } = usePermissions()
  const canCreateClass = canCreate(DashboardRoutes.toClasses(productId))
  const syncSubjects = useMutation({
    mutationFn: (classId: string) => syncClassSubjectsApi(schoolId, classId),
    onSuccess: (result) => {
      const added = result.value.missingSubjectEnrollmentsCreated
      const restored = result.value.inactiveSubjectEnrollmentsRestored
      toast.success(`Student subjects updated: ${added} added, ${restored} restored.`)
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const handleEditClass = useCallback(
    (cls: ClassItem) => setEditTarget(cls),
    []
  )
  const handleAssignSubject = useCallback(
    (cls: ClassItem) => setAssignSubjectTarget(cls),
    []
  )

  return (
    <>
      <TabsContent value="classes" className="space-y-6">
        {/* Search */}
        <div className="relative md:w-1/2">
          <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
          <Input
            placeholder="Search classes..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="py-6 pl-10"
          />
        </div>

        {/* Loading */}
        {isLoading ? (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10" />
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Arms</TableHead>
                    <TableHead>Date Created</TableHead>
                    <TableHead className="w-16">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: SKELETON_ROWS }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Skeleton className="h-8 w-8 rounded-lg" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-28" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-7 w-7 rounded-lg" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : /* Empty */
        classes.length === 0 ? (
          <Card className="p-0">
            <EmptyState
              icon={FolderOpen}
              title="No classes found"
              description={
                searchQuery
                  ? `No classes matching "${searchQuery}" were found.`
                  : "You haven't created any classes yet."
              }
              size="lg"
              iconContainerClassName="bg-blue-50"
              iconClassName="text-blue-500"
              action={
                !searchQuery && canCreateClass
                  ? {
                      label: "Create Class",
                      icon: Plus,
                      onClick: onCreateClass,
                    }
                  : undefined
              }
            />
          </Card>
        ) : (
          /* Data */
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10" />
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Arms</TableHead>
                    <TableHead>Date Created</TableHead>
                    <TableHead className="w-16">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {classes.map((cls) => (
                    <TableRow key={cls.Id}>
                      <TableCell>
                        <div />
                      </TableCell>
                      <TableCell className="font-medium">
                        {cls.ClsName}
                      </TableCell>
                      <TableCell className="text-gray-500">
                        {cls.CategoryName}
                      </TableCell>
                      <TableCell>
                        <ClassTypeBadge classType={cls.ClassType} />
                      </TableCell>
                      <TableCell>
                        <ClassArmsCell classId={cls.Id} />
                      </TableCell>
                      <TableCell className="text-gray-500">
                        {format(new Date(cls.DateCreated), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <RowActions
                          cls={cls}
                          productId={productId}
                          onEditClass={handleEditClass}
                          onAssignSubject={handleAssignSubject}
                          onManageArms={setArmTarget}
                          onSyncSubjects={(item) => syncSubjects.mutate(item.Id)}
                          isSyncing={syncSubjects.isPending}
                        />
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
        )}
      </TabsContent>

      {armTarget && (
        <AssignArmToClassModal
          open
          onClose={() => setArmTarget(null)}
          classId={armTarget.Id}
          className={armTarget.ClsName}
          schoolId={schoolId}
        />
      )}
      <EditClassModal
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        cls={editTarget}
        schoolId={schoolId}
      />

      {assignSubjectTarget && (
        <AssignSubjectToClassModal
          open
          onClose={() => setAssignSubjectTarget(null)}
          classId={assignSubjectTarget.Id}
          className={assignSubjectTarget.ClsName}
          schoolId={schoolId}
        />
      )}
    </>
  )
}
