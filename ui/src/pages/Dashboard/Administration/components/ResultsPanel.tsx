import { getElectionBallots } from "@/lib/electionBallots"
import type { Election } from "@/types/student"
import { StatusBadge, VoteBar } from "../../Student/components/VotingComponent"

export default function ResultsPanel({
  election,
  onClose,
}: {
  election: Election
  onClose?: () => void
}) {
  if (election.subcategories?.length) {
    return (
      <div className="space-y-4">
        {getElectionBallots(election).map((ballot) => (
          <ResultsPanel key={ballot.id} election={ballot} onClose={onClose} />
        ))}
      </div>
    )
  }
  const totalVotes = election.candidates.reduce((s, c) => s + c.votes, 0)
  const sorted = [...election.candidates].sort((a, b) => b.votes - a.votes)
  const winner = sorted[0]
  const winners = sorted.filter(
    (candidate) => candidate.votes === winner?.votes
  )

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">
            {election.title}
          </h3>
          <p className="mt-0.5 text-xs text-gray-400">
            {totalVotes} total votes · {election.candidates.length} candidates
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={election.status} />
          {onClose && (
            <button
              onClick={onClose}
              className="text-xs text-gray-400 underline hover:text-gray-600"
            >
              Close
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4 p-5">
        {election.status === "Closed" && totalVotes > 0 && winner && (
          <div className="flex items-center gap-3 rounded-xl border border-amber-100 bg-amber-50/60 p-3">
            <span className="text-2xl">🏆</span>
            <div>
              <p className="text-xs font-semibold text-amber-700">
                {winners.length > 1 ? "Tie" : "Winner"}
              </p>
              <p className="text-sm font-bold text-amber-900">
                {winners.map((candidate) => candidate.name).join(", ")}
              </p>
              <p className="text-xs text-amber-600">
                {winner.votes} votes ·{" "}
                {Math.round((winner.votes / totalVotes) * 100)}%
              </p>
            </div>
          </div>
        )}

        {sorted.map((c, i) => (
          <VoteBar
            key={c.id}
            candidate={c}
            totalVotes={totalVotes}
            isLeading={i === 0}
            colorIndex={election.candidates.findIndex((ec) => ec.id === c.id)}
          />
        ))}

        {totalVotes === 0 && (
          <p className="py-4 text-center text-xs text-gray-400">No votes yet</p>
        )}
      </div>
    </div>
  )
}
