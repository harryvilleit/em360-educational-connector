import { useState } from "react"
import { ArrowLeft, Power, Trash2 } from "lucide-react"
import { Link, useNavigate, useParams } from "react-router"
import { Button } from "@/components/ui/button"
import { DashboardRoutes } from "@/routes"
import { useSchoolId } from "@/contexts/SchoolContext"
import {
  useElectionDetails,
  useCloseElection,
  useActivateElection,
  useDeleteElection,
} from "@/hooks/voting"
import { ElectionStatus, CandidateType } from "@/api/voting.api/types"
import { electionStatusLabel } from "@/lib/electionStatus"
import { AvatarInitials, StatusBadge } from "../Student/components/VotingComponent"
import ConfirmActionDialog from "./components/ConfirmActionDialog"
import SupervisedVoting from "./components/SupervisedVoting"
import ResultsPanel from "./components/ResultsPanel"
import { formatDate } from "@/utils"

const subId = (subcategory: { subcategoryId?: string; id?: string; name: string }) =>
  subcategory.subcategoryId ?? subcategory.id ?? subcategory.name

export default function ElectionDetailsPage() {
  const { productId = "", electionId = "" } = useParams()
  const navigate = useNavigate()
  const schoolId = useSchoolId()
  const back = DashboardRoutes.toVotingManagement(productId)

  const { election, isLoading, isError, refetch } = useElectionDetails(
    electionId,
    schoolId
  )
  const { mutate: closeElection, isPending: closing } = useCloseElection()
  const { mutate: activateElection, isPending: activating } =
    useActivateElection()
  const { mutate: deleteElection, isPending: deleting } = useDeleteElection()
  const [closeOpen, setCloseOpen] = useState(false)
  const [openOpen, setOpenOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const isActive = electionStatusLabel(election?.status as ElectionStatus) === "Active"
  const subcategories = (election?.subcategories ?? [])
    .slice()
    .sort((a, b) => a.orderIndex - b.orderIndex)

  return (
    <div className="space-y-6 py-6">
      <Button asChild variant="ghost">
        <Link to={back}>
          <ArrowLeft className="size-4" /> Back to elections
        </Link>
      </Button>

      {isLoading ? (
        <p role="status" className="text-sm text-muted-foreground">
          Loading election...
        </p>
      ) : isError || !election ? (
        <div className="rounded-xl border bg-white p-6">
          <h1 className="text-xl font-semibold">Election not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This election may have been deleted, or could not be loaded.
          </p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => void refetch()}>
            Retry
          </Button>
        </div>
      ) : (
        <>
          <ConfirmActionDialog
            open={openOpen}
            onOpenChange={setOpenOpen}
            title="Open election?"
            description={`Voting will start immediately for "${election.title}". Eligible students will be able to vote.`}
            confirmLabel="Open election"
            busy={activating}
            onConfirm={() =>
              activateElection(
                {
                  electionId: election.id,
                  schoolId,
                  reopen: electionStatusLabel(election.status) === "Closed",
                },
                { onSuccess: () => setOpenOpen(false) }
              )
            }
          />
          <ConfirmActionDialog
            open={closeOpen}
            onOpenChange={setCloseOpen}
            title="Close election?"
            description={`Voting will stop immediately for "${election.title}". This cannot be undone.`}
            confirmLabel="Close election"
            busy={closing}
            onConfirm={() =>
              closeElection(
                { electionId: election.id, schoolId },
                { onSuccess: () => setCloseOpen(false) }
              )
            }
          />
          <ConfirmActionDialog
            open={deleteOpen}
            onOpenChange={setDeleteOpen}
            title="Delete election?"
            description={`"${election.title}" and all its subcategories, candidates and votes will be permanently deleted.`}
            confirmLabel="Delete election"
            destructive
            busy={deleting}
            onConfirm={() =>
              deleteElection(
                { electionId: election.id, schoolId },
                { onSuccess: () => navigate(back, { replace: true }) }
              )
            }
          />
          <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold">{election.title}</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Election details
              </p>
              <div className="mt-2">
                <StatusBadge status={electionStatusLabel(election.status)} />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <SupervisedVoting
                electionId={election.id}
                title={election.title}
                active={isActive}
              />
              {["Draft", "Closed"].includes(electionStatusLabel(election.status)) && (
                <Button
                  type="button"
                  disabled={activating}
                  onClick={() => setOpenOpen(true)}
                >
                  <Power className="size-4" />
                  {activating ? "Opening..." : "Open Election"}
                </Button>
              )}
              {isActive && (
                <Button type="button" variant="outline" onClick={() => setCloseOpen(true)}>
                  <Power className="size-4" /> Close Election
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="size-4" /> Delete election
              </Button>
            </div>
          </header>

          <dl className="grid gap-5 rounded-xl border bg-white p-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ["Category", election.categoryName],
              ["Academic session", election.academicSessionName || "No session assigned"],
              ["Eligible classes", election.eligibleClassesDisplay || "All Classes"],
              ["Created", formatDate(election.createdDate, "short")],
              ["Subcategories", String(election.subcategoriesCount)],
              ["Candidates", String(election.candidatesCount)],
              ["Total votes", String(election.totalVotes)],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs text-muted-foreground">{label}</dt>
                <dd className="mt-1 font-medium break-words">{value}</dd>
              </div>
            ))}
          </dl>

          <section aria-labelledby="election-candidates" className="space-y-4">
            <h2 id="election-candidates" className="text-lg font-semibold">
              Subcategories and candidates
            </h2>
            {subcategories.map((subcategory) => (
              <section
                key={subId(subcategory)}
                className="space-y-4 rounded-xl border bg-white p-5"
              >
                <h3 className="font-semibold text-blue-800">
                  {subcategory.name}
                </h3>
                {subcategory.candidates.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No candidates.</p>
                ) : (
                  <ul className="grid gap-3 sm:grid-cols-2">
                    {subcategory.candidates.map((candidate, index) => (
                      <li
                        key={candidate.id}
                        className="flex items-start gap-3 rounded-lg border p-4"
                      >
                        <AvatarInitials
                          name={candidate.fullName}
                          photo={candidate.profileImageUrl}
                          colorIndex={index}
                          size="lg"
                        />
                        <div className="min-w-0">
                          <p className="font-medium">{candidate.fullName}</p>
                          <p className="text-sm text-muted-foreground">
                            {candidate.candidateType === CandidateType.Staff
                              ? candidate.roleName
                              : [candidate.className, candidate.admissionNumber]
                                  .filter(Boolean)
                                  .join(" · ")}{" "}
                            · {candidate.votesCount} votes
                          </p>
                          <p className="mt-2 text-sm break-words whitespace-pre-wrap">
                            {candidate.manifesto || "No manifesto provided."}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </section>
          <section aria-labelledby="election-results" className="space-y-4">
            <h2 id="election-results" className="text-lg font-semibold">
              Results by subcategory
            </h2>
            <div className="space-y-4">
              {subcategories.map((subcategory) => (
                <ResultsPanel
                  key={subId(subcategory)}
                  election={{
                    id: subId(subcategory),
                    title: `${election.title} — ${subcategory.name}`,
                    category: election.categoryName,
                    eligibleClass: election.eligibleClassesDisplay,
                    status:
                      electionStatusLabel(election.status) === "Active"
                        ? "Active"
                        : electionStatusLabel(election.status) === "Draft"
                          ? "Draft"
                          : "Closed",
                    createdAt: election.createdDate,
                    candidates: subcategory.candidates.map((candidate) => ({
                      id: candidate.id,
                      name: candidate.fullName,
                      class:
                        (candidate.candidateType === CandidateType.Staff
                          ? candidate.roleName
                          : candidate.className) ?? "",
                      manifesto: candidate.manifesto,
                      profilePicture: candidate.profileImageUrl,
                      votes: candidate.votesCount,
                    })),
                  }}
                />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  )
}
