import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PageHeader } from "@/components/general/PageHeader"
import { useDebouncedValue } from "@/hooks/useDebouncedValue"
import { useSchoolSessionOptions } from "@/hooks/useSchoolSessionOptions"
import { useStaffElections } from "@/hooks/voting"
import { ElectionStatus } from "@/api/voting.api/types"
import { electionStatusLabel } from "@/lib/electionStatus"
import { StatusBadge } from "@/pages/Dashboard/Student/components/VotingComponent"
import { StaffElectionBallot } from "./StaffElectionBallot"

const selectClass =
  "w-full rounded-lg border border-chart-2/60 bg-chart-2/5 p-2 text-sm text-blue-700 hover:border-chart-2 focus:outline-chart-2"

export default function StaffElections({
  staffId,
  schoolId,
}: {
  staffId: string
  schoolId: string
}) {
  const [selectedElectionId, setSelectedElectionId] = useState<string | null>(
    null
  )
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<"all" | ElectionStatus>("all")
  const [sessionId, setSessionId] = useState("all")
  const keyword = useDebouncedValue(search.trim(), 300)
  const { sessions } = useSchoolSessionOptions(schoolId)

  const { dashboard, isLoading, isError, refetch } = useStaffElections({
    staffId,
    schoolId,
    search: keyword || undefined,
    status: status === "all" ? undefined : status,
    schoolSessionId: sessionId === "all" ? undefined : sessionId,
  })
  const elections = dashboard?.elections ?? []

  if (selectedElectionId)
    return (
      <StaffElectionBallot
        key={selectedElectionId}
        electionId={selectedElectionId}
        staffId={staffId}
        schoolId={schoolId}
        onBack={() => setSelectedElectionId(null)}
      />
    )

  return (
    <div className="space-y-5">
      <PageHeader
        title="School elections"
        description={
          dashboard
            ? [dashboard.staffName, dashboard.roleName]
                .filter(Boolean)
                .join(" · ")
            : undefined
        }
      />
      <p className="text-sm text-muted-foreground">
        Choose an election to vote. You can vote once in each subcategory.
      </p>
      <div className="grid gap-3 rounded-xl border bg-white p-4 sm:grid-cols-3">
        <div className="space-y-1">
          <Label htmlFor="staff-election-search">Search elections</Label>
          <Input
            id="staff-election-search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Title, category or candidate"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="staff-election-status">Status</Label>
          <select
            id="staff-election-status"
            className={selectClass}
            value={String(status)}
            onChange={(event) =>
              setStatus(
                event.target.value === "all"
                  ? "all"
                  : (Number(event.target.value) as ElectionStatus)
              )
            }
          >
            <option value="all">All statuses</option>
            <option value={ElectionStatus.Active}>Active</option>
            <option value={ElectionStatus.Closed}>Closed</option>
          </select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="staff-election-session">Academic session</Label>
          <select
            id="staff-election-session"
            className={selectClass}
            value={sessionId}
            onChange={(event) => setSessionId(event.target.value)}
          >
            <option value="all">All sessions</option>
            {sessions.map((session) => (
              <option key={session.Id} value={session.Id}>
                {session.SessionName}
              </option>
            ))}
          </select>
        </div>
      </div>
      {isLoading ? (
        <p
          role="status"
          className="rounded-xl border bg-white p-6 text-sm text-muted-foreground"
        >
          Loading elections...
        </p>
      ) : isError ? (
        <div className="rounded-xl border border-red-100 bg-red-50 p-6">
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
      ) : !elections.length ? (
        <p
          role="status"
          className="rounded-xl border bg-white p-6 text-sm text-muted-foreground"
        >
          No elections are available for staff yet.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {elections.map((election) => (
            <article
              key={election.electionId}
              className="space-y-3 rounded-xl border bg-white p-5"
            >
              <StatusBadge status={electionStatusLabel(election.status)} />
              <h2 className="text-lg font-semibold">{election.title}</h2>
              <p className="text-sm text-muted-foreground">
                {election.categoryName} ·{" "}
                {election.academicSessionName || "No session assigned"}
              </p>
              <p className="text-sm">
                {election.completedBallotsCount} of{" "}
                {election.totalSubcategoriesCount} ballots completed ·{" "}
                {election.candidatesCount} candidates
              </p>
              <Button
                variant={
                  election.status === ElectionStatus.Closed ||
                  election.hasCompletedAllBallots
                    ? "outline"
                    : "default"
                }
                onClick={() => setSelectedElectionId(election.electionId)}
              >
                {election.status === ElectionStatus.Closed
                  ? "View details"
                  : election.hasCompletedAllBallots
                    ? "View voting status"
                    : election.completedBallotsCount
                      ? "Continue voting"
                      : "Vote now"}
              </Button>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
