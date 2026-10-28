import {
  BarChart3,
  CheckCircle2,
  ListChecks,
  Plus,
  Power,
  Tags,
  Vote,
} from "lucide-react"
import { Link, useNavigate, useParams } from "react-router"
import { PageHeader } from "@/components/general/PageHeader"
import { StatCard } from "@/components/general/StatCard"
import { ShortcutCard } from "@/components/general/ShortcutCard"
import { useSchoolId } from "@/contexts/SchoolContext"
import { useVotingDashboard } from "@/hooks/voting"
import { DashboardRoutes } from "@/routes"
import { electionStatusLabel } from "@/lib/electionStatus"
import { formatDate } from "@/utils"
import { StatusBadge } from "../Student/components/VotingComponent"

export default function VotingOverviewPage() {
  const { productId = "" } = useParams()
  const navigate = useNavigate()
  const schoolId = useSchoolId()
  const { dashboard, isLoading, isError, refetch } = useVotingDashboard({
    schoolId,
    pageNumber: 1,
    pageSize: 5,
  })
  const recent = dashboard?.elections.items ?? []

  return (
    <div className="space-y-8 py-6">
      <PageHeader
        title="Voting"
        description="Overview of school elections and results"
      />

      <section>
        <h2 className="mb-3 text-xs font-semibold tracking-widest text-gray-400 uppercase">
          Overall Summary
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
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
      </section>

      <section>
        <h2 className="mb-3 text-xs font-semibold tracking-widest text-gray-400 uppercase">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ShortcutCard
            onClick={() =>
              navigate(DashboardRoutes.toVotingManagement(productId))
            }
            iconBg="bg-blue-50 group-hover:bg-blue-100"
            icon={<ListChecks className="size-6 text-blue-600" />}
            borderColor="border-blue-100"
            title="Elections"
            description={`${dashboard?.totalElections ?? 0} total · ${dashboard?.activeElections ?? 0} open now`}
          />
          <ShortcutCard
            onClick={() =>
              navigate(DashboardRoutes.toCreateElection(productId))
            }
            iconBg="bg-emerald-50 group-hover:bg-emerald-100"
            icon={<Plus className="size-6 text-emerald-600" />}
            borderColor="border-emerald-100"
            title="Create Election"
            description="Set up a new election with candidates"
          />
          <ShortcutCard
            onClick={() =>
              navigate(DashboardRoutes.toVotingCategories(productId))
            }
            iconBg="bg-purple-50 group-hover:bg-purple-100"
            icon={<Tags className="size-6 text-purple-600" />}
            borderColor="border-purple-100"
            title="Categories"
            description="Manage election categories"
          />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-xs font-semibold tracking-widest text-gray-400 uppercase">
          Recent Elections
        </h2>
        <div className="rounded-xl border bg-white">
          {isLoading ? (
            <p role="status" className="p-5 text-sm text-muted-foreground">
              Loading elections...
            </p>
          ) : isError ? (
            <div className="p-5">
              <p className="text-sm text-red-600">
                Elections could not be loaded.
              </p>
              <button
                type="button"
                className="mt-2 text-sm underline"
                onClick={() => void refetch()}
              >
                Retry
              </button>
            </div>
          ) : recent.length === 0 ? (
            <p className="p-5 text-sm text-muted-foreground">
              No elections yet. Create your first election to get started.
            </p>
          ) : (
            <ul className="divide-y">
              {recent.map((election) => (
                <li key={election.id}>
                  <Link
                    to={DashboardRoutes.toElectionDetails(
                      productId,
                      election.id
                    )}
                    className="flex items-center justify-between gap-4 p-4 hover:bg-gray-50"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">{election.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {election.categoryName} · {election.academicSessionName}{" "}
                        · {formatDate(election.createdDate)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="text-xs text-muted-foreground">
                        {election.votesCount} votes
                      </span>
                      <StatusBadge
                        status={electionStatusLabel(election.status)}
                      />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  )
}
