import { useState } from "react"
import {
  Plus,
  Vote,
  CheckCircle2,
  BarChart3,
  Power,
  Eye,
  MoreHorizontal,
  Trash2,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Link, useParams } from "react-router"
import { DashboardRoutes } from "@/routes"
import ConfirmActionDialog from "./components/ConfirmActionDialog"
import { EmptyState, StatusBadge } from "../Student/components/VotingComponent"
import { StatCard } from "@/components/general/StatCard"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import Pagination from "@/components/ui/pagination"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import { useSchoolId } from "@/contexts/SchoolContext"
import { useDebouncedValue } from "@/hooks/useDebouncedValue"
import { useSchoolSessionOptions } from "@/hooks/useSchoolSessionOptions"
import {
  useVotingDashboard,
  useCloseElection,
  useDeleteElection,
  useActivateElection,
} from "@/hooks/voting"
import { ElectionStatus } from "@/api/voting.api/types"
import { electionStatusLabel } from "@/lib/electionStatus"
import { formatDate } from "@/utils"

const PAGE_SIZE = 10

export default function VotingManagementPage() {
  const { productId = "" } = useParams()
  const schoolId = useSchoolId()
  const { sessions } = useSchoolSessionOptions(schoolId)

  const [search, setSearch] = useState("")
  const keyword = useDebouncedValue(search.trim(), 300)
  const [filterStatus, setFilterStatus] = useState<"all" | ElectionStatus>(
    "all"
  )
  const [filterSession, setFilterSession] = useState("all")
  const [pageNumber, setPageNumber] = useState(1)
  const hasFilters =
    filterStatus !== "all" || filterSession !== "all" || !!search.trim()

  const { dashboard, isLoading, isError, refetch } = useVotingDashboard({
    schoolId,
    search: keyword || undefined,
    status: filterStatus === "all" ? undefined : filterStatus,
    schoolSessionId: filterSession === "all" ? undefined : filterSession,
    pageNumber,
    pageSize: PAGE_SIZE,
  })
  const elections = dashboard?.elections.items ?? []

  const [closeTarget, setCloseTarget] = useState<{
    id: string
    title: string
  } | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string
    title: string
  } | null>(null)
  const { mutate: closeElection, isPending: closing } = useCloseElection()
  const { mutate: activateElection, isPending: activating } =
    useActivateElection()
  const [openTarget, setOpenTarget] = useState<{
    id: string
    title: string
    reopen: boolean
  } | null>(null)
  const { mutate: deleteElection, isPending: deleting } = useDeleteElection()

  return (
    <>
      <ConfirmActionDialog
        open={!!closeTarget}
        onOpenChange={(open) => !open && setCloseTarget(null)}
        title="Close election?"
        description={`Voting will stop immediately for "${closeTarget?.title}". This cannot be undone.`}
        confirmLabel="Close election"
        busy={closing}
        onConfirm={() => {
          if (!closeTarget) return
          closeElection(
            { electionId: closeTarget.id, schoolId },
            { onSuccess: () => setCloseTarget(null) }
          )
        }}
      />
      <ConfirmActionDialog
        open={!!openTarget}
        onOpenChange={(open) => !open && setOpenTarget(null)}
        title="Open election?"
        description={`Voting will start immediately for "${openTarget?.title}". Eligible students will be able to vote.`}
        confirmLabel="Open election"
        busy={activating}
        onConfirm={() => {
          if (!openTarget) return
          activateElection(
            { electionId: openTarget.id, schoolId, reopen: openTarget.reopen },
            { onSuccess: () => setOpenTarget(null) }
          )
        }}
      />
      <ConfirmActionDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete election?"
        description={`"${deleteTarget?.title}" and all its subcategories, candidates and votes will be permanently deleted.`}
        confirmLabel="Delete election"
        destructive
        busy={deleting}
        onConfirm={() => {
          if (!deleteTarget) return
          deleteElection(
            { electionId: deleteTarget.id, schoolId },
            { onSuccess: () => setDeleteTarget(null) }
          )
        }}
      />
      <div className="space-y-6 py-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Voting Management
            </h1>
            <p className="text-sm text-muted-foreground">
              Create elections, manage candidates, and monitor results
            </p>
          </div>
          <Button
            asChild
            className="w-full rounded-xl bg-blue-600 text-white hover:bg-blue-700 sm:w-auto"
          >
            <Link to={DashboardRoutes.toCreateElection(productId)}>
              <Plus className="mr-1.5 size-4" /> New Election
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard
            label="Total Elections"
            value={dashboard?.totalElections ?? 0}
            icon={Vote}
            color="blue"
          />
          <StatCard
            label="Active"
            value={dashboard?.activeElections ?? 0}
            icon={Power}
            color="emerald"
          />
          <StatCard
            label="Closed"
            value={dashboard?.closedElections ?? 0}
            icon={CheckCircle2}
            color="gray"
          />
          <StatCard
            label="Total Votes"
            value={dashboard?.totalVotes ?? 0}
            icon={BarChart3}
            color="violet"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_12rem_16rem_auto] lg:items-end">
          <div className="space-y-2">
            <Label htmlFor="election-search">Search elections</Label>
            <Input
              id="election-search"
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value)
                setPageNumber(1)
              }}
              placeholder="Search title, category, subcategory or candidate"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="election-status-filter">Status</Label>
            <Select
              value={String(filterStatus)}
              onValueChange={(value) => {
                setFilterStatus(value === "all" ? "all" : (Number(value) as ElectionStatus))
                setPageNumber(1)
              }}
            >
              <SelectTrigger
                id="election-status-filter"
                className="w-full border-chart-2/60 text-blue-700 hover:bg-chart-2/10"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border border-chart-2/40">
                <SelectItem value="all">All statuses</SelectItem>
                {(
                  [
                    ElectionStatus.Draft,
                    ElectionStatus.Active,
                    ElectionStatus.Closed,
                    ElectionStatus.Cancelled,
                  ] as const
                ).map((status) => (
                  <SelectItem key={status} value={String(status)}>
                    {electionStatusLabel(status)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="election-session-filter">Academic session</Label>
            <Select
              value={filterSession}
              onValueChange={(value) => {
                setFilterSession(value)
                setPageNumber(1)
              }}
            >
              <SelectTrigger
                id="election-session-filter"
                className="w-full border-chart-2/60 text-blue-700 hover:bg-chart-2/10"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border border-chart-2/40">
                <SelectItem value="all">All sessions</SelectItem>
                {sessions.map((session) => (
                  <SelectItem key={session.Id} value={session.Id}>
                    {session.SessionName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {hasFilters && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setSearch("")
                setFilterStatus("all")
                setFilterSession("all")
                setPageNumber(1)
              }}
            >
              Clear filters
            </Button>
          )}
        </div>

        {isLoading ? (
          <p role="status" className="text-sm text-muted-foreground">
            Loading elections...
          </p>
        ) : isError ? (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-6">
            <p className="text-sm text-red-700">Elections could not be loaded.</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => void refetch()}
            >
              Retry
            </Button>
          </div>
        ) : elections.length === 0 ? (
          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
            <EmptyState
              icon={<Vote className="size-6" />}
              title="No elections found"
              description={
                hasFilters
                  ? "No elections match your search and filters. Try changing or clearing them."
                  : "Create your first election to get started."
              }
            />
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-chart-2/20 bg-white">
            <Table aria-label="Elections">
              <TableHeader className="bg-chart-2/10">
                <TableRow>
                  {[
                    "Election",
                    "Category",
                    "Academic session",
                    "Status",
                    "Positions",
                    "Candidates",
                    "Votes",
                    "Created",
                    "Actions",
                  ].map((heading) => (
                    <TableHead key={heading} className="text-blue-800">
                      {heading}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {elections.map((election) => (
                  <TableRow key={election.id} className="hover:bg-chart-2/5">
                    <TableCell className="min-w-48 whitespace-normal">
                      <Link
                        className="font-semibold text-blue-700 hover:underline"
                        to={DashboardRoutes.toElectionDetails(
                          productId,
                          election.id
                        )}
                      >
                        {election.title}
                      </Link>
                    </TableCell>
                    <TableCell>{election.categoryName}</TableCell>
                    <TableCell>
                      {election.academicSessionName || "No session assigned"}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={electionStatusLabel(election.status)} />
                    </TableCell>
                    <TableCell>{election.subcategoriesCount}</TableCell>
                    <TableCell>{election.candidatesCount}</TableCell>
                    <TableCell>{election.votesCount}</TableCell>
                    <TableCell>{formatDate(election.createdDate, "short")}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Actions for ${election.title}`}
                            className="rounded-lg"
                          >
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 rounded-xl">
                          <DropdownMenuItem
                            asChild
                            className="cursor-pointer gap-2 rounded-lg text-xs"
                          >
                            <Link
                              to={DashboardRoutes.toElectionDetails(
                                productId,
                                election.id
                              )}
                            >
                              <Eye className="size-3.5 text-gray-500" /> View /
                              Results
                            </Link>
                          </DropdownMenuItem>
                          {["Draft", "Closed"].includes(electionStatusLabel(election.status)) && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="cursor-pointer gap-2 rounded-lg text-xs"
                                onSelect={() =>
                                  setOpenTarget({
                                    id: election.id,
                                    title: election.title,
                                    reopen:
                                      electionStatusLabel(election.status) ===
                                      "Closed",
                                  })
                                }
                              >
                                <Power className="size-3.5 text-gray-500" />{" "}
                                Open Election
                              </DropdownMenuItem>
                            </>
                          )}
                          {electionStatusLabel(election.status) === "Active" && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="cursor-pointer gap-2 rounded-lg text-xs"
                                onSelect={() =>
                                  setCloseTarget({
                                    id: election.id,
                                    title: election.title,
                                  })
                                }
                              >
                                <Power className="size-3.5 text-gray-500" />{" "}
                                Close Election
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="cursor-pointer gap-2 rounded-lg text-xs text-red-600 focus:text-red-700"
                            onSelect={() =>
                              setDeleteTarget({
                                id: election.id,
                                title: election.title,
                              })
                            }
                          >
                            <Trash2 className="size-3.5" /> Delete Election
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {dashboard && dashboard.elections.totalCount > PAGE_SIZE && (
          <Pagination
            page={pageNumber}
            total={dashboard.elections.totalCount}
            pageSize={PAGE_SIZE}
            onPageChange={setPageNumber}
          />
        )}
        {dashboard && (
          <p role="status" className="text-sm text-muted-foreground">
            {elections.length} of {dashboard.elections.totalCount} elections
          </p>
        )}
      </div>
    </>
  )
}
