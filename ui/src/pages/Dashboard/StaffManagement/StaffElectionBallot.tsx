import { useState } from "react"
import { Vote, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/general/PageHeader"
import { useStaffBallot, useCastStaffVote } from "@/hooks/voting"
import { StudentElectionBallotCard } from "@/pages/StudentHome/components/StudentElectionBallotCard"

export function StaffElectionBallot({
  electionId,
  staffId,
  schoolId,
  onBack,
}: {
  electionId: string
  staffId: string
  schoolId: string
  onBack: () => void
}) {
  const { ballot, isLoading, isError, refetch } = useStaffBallot(
    electionId,
    staffId,
    schoolId
  )
  const { mutate: castVote, isPending: submitting } = useCastStaffVote()

  const [selections, setSelections] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState("")

  function handleSelect(subcategoryId: string, candidateId: string) {
    setSelections((previous) => ({ ...previous, [subcategoryId]: candidateId }))
    setSubmitError("")
  }

  function submit() {
    const votes = Object.entries(selections).map(
      ([subcategoryId, candidateId]) => ({ subcategoryId, candidateId })
    )
    if (!votes.length) return
    castVote(
      { electionId, staffId, schoolId, votes },
      {
        onSuccess: () => setSelections({}),
        onError: (error) =>
          setSubmitError(error.message || "Could not record your vote."),
      }
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cast Your Vote"
        description={`${ballot?.staffName ?? ""}${ballot?.staffRole ? ` · ${ballot.staffRole}` : ""} — participate in school elections`}
        onBack={onBack}
        className="mb-7"
      />

      {isLoading ? (
        <p role="status" className="text-sm text-muted-foreground">
          Loading ballot...
        </p>
      ) : isError || !ballot ? (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-6">
          <p className="text-sm text-red-700">This ballot could not be loaded.</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => void refetch()}
          >
            Retry
          </Button>
        </div>
      ) : !ballot.isEligible ? (
        <p role="alert" className="rounded-2xl border bg-white p-6 text-sm">
          {ballot.ineligibilityReason ||
            "You are not eligible to vote in this election."}
        </p>
      ) : (
        <>
          {ballot.openBallots.length > 0 && (
            <div className="space-y-4">
              <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase">
                Open for voting
              </p>
              {ballot.openBallots.map((openBallot) => (
                <StudentElectionBallotCard
                  key={openBallot.subcategoryId}
                  ballot={openBallot}
                  status={ballot.status}
                  categoryName={ballot.categoryName}
                  academicSessionName={ballot.academicSessionName}
                  selectedCandidateId={selections[openBallot.subcategoryId] ?? null}
                  onSelect={handleSelect}
                />
              ))}
            </div>
          )}

          {ballot.completedBallots.length > 0 && (
            <div className="space-y-4">
              <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase">
                Already voted
              </p>
              {ballot.completedBallots.map((completedBallot) => (
                <StudentElectionBallotCard
                  key={completedBallot.subcategoryId}
                  ballot={completedBallot}
                  status={ballot.status}
                  categoryName={ballot.categoryName}
                  academicSessionName={ballot.academicSessionName}
                  selectedCandidateId={null}
                  onSelect={() => {}}
                />
              ))}
            </div>
          )}

          {ballot.openBallots.length === 0 &&
            ballot.completedBallots.length === 0 && (
              <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center text-sm text-muted-foreground">
                <Vote className="mx-auto mb-2 size-6 text-gray-300" />
                No subcategories are open for this election yet.
              </div>
            )}

          {ballot.openBallots.length > 0 && (
            <div className="space-y-3 rounded-2xl border border-gray-100 bg-white p-5">
              {submitError && (
                <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5">
                  <AlertCircle className="mt-0.5 size-4 shrink-0 text-amber-500" />
                  <p className="text-xs text-amber-700">{submitError}</p>
                </div>
              )}
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button
                  variant="outline"
                  onClick={onBack}
                  className="w-full rounded-lg border-gray-200 sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  onClick={submit}
                  disabled={Object.keys(selections).length === 0 || submitting}
                  className="w-full rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 sm:w-auto"
                >
                  <Vote className="mr-1.5 size-4" />
                  {submitting
                    ? "Submitting..."
                    : Object.keys(selections).length > 0
                      ? `Submit ${Object.keys(selections).length} Vote${Object.keys(selections).length !== 1 ? "s" : ""}`
                      : "Submit Votes"}
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
