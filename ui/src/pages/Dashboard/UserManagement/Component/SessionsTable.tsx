import { useMemo } from "react"
import { useNavigate, useParams } from "react-router"
import {
  CalendarDays,
  CalendarPlus,
  Star,
  MoreHorizontal,
  Eye,
  Pencil,
} from "lucide-react"
import { DashboardRoutes } from "@/routes"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EmptyState } from "@/components/ui/empty-state"
import { DataTable, type DataTableColumn } from "@/components/ui/data-table"
import type { SchoolSessionItem } from "@/api/userMgt.api/types"
import { useCurrentAcademicStore } from "@/store/currentAcademic.store"
import { formatDate } from "@/utils"

// ─── Helpers ───────────────────────────────────────────────────────────────────

function isSessionCurrent(
  session: SchoolSessionItem,
  storedCurrentId: string | null
) {
  return (
    session.Id === storedCurrentId ||
    session.IsCurrent === true ||
    session.Status === "Active"
  )
}

// ─── Props ─────────────────────────────────────────────────────────────────────

interface SessionsTableProps {
  sessions: SchoolSessionItem[]
  isLoading?: boolean
  onSetCurrentSession: (id: string) => void
  onCreateSession: () => void
  onEditSession: (session: SchoolSessionItem) => void
  onAddTerm: (session: SchoolSessionItem) => void
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function SessionsTable({
  sessions,
  isLoading,
  onSetCurrentSession,
  onCreateSession,
  onEditSession,
  onAddTerm,
}: SessionsTableProps) {
  const navigate = useNavigate()
  const { productId } = useParams<{ productId: string }>()
  const currentSessionId = useCurrentAcademicStore((s) => s.currentSessionId)
  const currentTermId = useCurrentAcademicStore((s) => s.currentTermId)

  const sorted = useMemo(
    () => sessions.slice().sort((a, b) => b.SessionName.localeCompare(a.SessionName)),
    [sessions]
  )

  const goToDetail = (sessionId: string) =>
    navigate(DashboardRoutes.toUsersAcademicDetail(productId ?? "", sessionId))

  const columns: DataTableColumn<SchoolSessionItem>[] = [
    {
      key: "session",
      header: "Session",
      render: (session) => {
        const current = isSessionCurrent(session, currentSessionId)
        const activeTerm = session.Terms.find(
          (t) => t.IsCurrent || t.Id === currentTermId
        )
        return (
          <div className="flex items-center gap-3">
            <div>
              <p className="font-semibold text-gray-900">
                {session.SessionName}
              </p>
              {activeTerm && (
                <p className="text-[11px] text-muted-foreground">
                  Active: {activeTerm.TermName}
                </p>
              )}
            </div>
          </div>
        )
      },
    },
    {
      key: "dateCreated",
      header: "Date Created",
      cellClassName: "text-gray-600",
      render: (session) => formatDate(session.DateCreated, "short") || "—",
    },
    {
      key: "terms",
      header: "Terms",
      render: (session) => (
        <span className="inline-flex items-center gap-1.5 rounded-full  px-2.5 py-1 text-xs font-medium text-gray-600">
          {session.Terms.length} term{session.Terms.length !== 1 ? "s" : ""}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (session) => {
        const current = isSessionCurrent(session, currentSessionId)
        return current ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
            <Star className="size-3" />
            Current
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500">
            Inactive
          </span>
        )
      },
    },
    {
      key: "actions",
      header: "",
      headerClassName: "text-right",
      cellClassName: "text-right",
      render: (session) => {
        const current = isSessionCurrent(session, currentSessionId)
        return (
          <div onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm" className="rounded-lg">
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 rounded-xl">
                <DropdownMenuItem
                  className="cursor-pointer gap-2 rounded-lg text-xs"
                  onClick={() => goToDetail(session.Id)}
                >
                  <Eye className="size-3.5 text-gray-500" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer gap-2 rounded-lg text-xs"
                  onClick={() => onEditSession(session)}
                >
                  <Pencil className="size-3.5 text-gray-500" />
                  Edit Session
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer gap-2 rounded-lg text-xs"
                  onClick={() => onAddTerm(session)}
                >
                  <CalendarPlus className="size-3.5 text-gray-500" />
                  Add Term
                </DropdownMenuItem>
                {!current && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="cursor-pointer gap-2 rounded-lg text-xs"
                      onClick={() => onSetCurrentSession(session.Id)}
                    >
                      <Star className="size-3.5 text-gray-500" />
                      Set as Active
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
      <DataTable
        columns={columns}
        data={sorted}
        getRowKey={(session) => session.Id}
        isLoading={isLoading}
        loadingRows={3}
        onRowClick={(session) => goToDetail(session.Id)}
        rowClassName={(session) =>
          isSessionCurrent(session, currentSessionId) ? "bg-blue-50/20" : ""
        }
        wrapperClassName=""
        emptyState={
          <EmptyState
            icon={CalendarDays}
            title="No sessions yet"
            description="Create your first academic session to get started"
            iconContainerClassName="bg-gray-50"
            action={{ label: "New Session", onClick: onCreateSession }}
          />
        }
      />
      <div className="border-t border-gray-100 px-5 py-3">
        <p className="text-[11px] text-gray-400">
          Note: Only one session can be active at a time — setting a session as
          current replaces the previously active session.
        </p>
      </div>
    </div>
  )
}
