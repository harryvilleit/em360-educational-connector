import { memo } from "react"
import { CheckCircle2 } from "lucide-react"
import type { ElectionStatus } from "@/api/voting.api/types"
import {
  AvatarInitials,
  CategoryBadge,
  StatusBadge,
} from "@/pages/Dashboard/Student/components/VotingComponent"
import { electionStatusLabel } from "@/lib/electionStatus"

type BallotCandidate = {
  candidateId: string
  fullName: string
  profileImageUrl?: string | null
  className?: string | null
  roleName?: string | null
}

type BallotSubcategory = {
  subcategoryId: string
  displayTitle: string
  hasVoted: boolean
  votedCandidateName?: string | null
  candidates: BallotCandidate[]
}

const CandidateOption = memo(function CandidateOption({
  candidate,
  subcategoryId,
  selected,
  onSelect,
  colorIndex,
}: {
  candidate: BallotCandidate
  subcategoryId: string
  selected: boolean
  onSelect: (subcategoryId: string, candidateId: string) => void
  colorIndex: number
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={() => onSelect(subcategoryId, candidate.candidateId)}
      className={`flex w-full cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all hover:bg-gray-50 ${
        selected
          ? "border-blue-400 bg-blue-50 ring-1 ring-blue-300"
          : "border-gray-200 bg-white"
      }`}
    >
      <div
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
          selected ? "border-blue-600 bg-blue-600" : "border-gray-300"
        }`}
      >
        {selected && <div className="h-2 w-2 rounded-full bg-white" />}
      </div>

      <AvatarInitials
        name={candidate.fullName}
        photo={candidate.profileImageUrl ?? undefined}
        size="md"
        colorIndex={colorIndex}
      />

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-gray-900">{candidate.fullName}</p>
        {(candidate.roleName || candidate.className) && (
          <p className="text-xs text-gray-400">
            {candidate.roleName || candidate.className}
          </p>
        )}
      </div>

      {selected && <CheckCircle2 className="size-4 shrink-0 text-blue-600" />}
    </button>
  )
})

export const StudentElectionBallotCard = memo(function StudentElectionBallotCard({
  ballot,
  status,
  categoryName,
  academicSessionName,
  selectedCandidateId,
  onSelect,
}: {
  ballot: BallotSubcategory
  status: ElectionStatus
  categoryName: string
  academicSessionName: string
  selectedCandidateId: string | null
  onSelect: (subcategoryId: string, candidateId: string) => void
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
      <div className="border-b border-gray-100 px-5 py-4">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <StatusBadge status={electionStatusLabel(status)} />
          <CategoryBadge category={categoryName} />
          <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
            {academicSessionName || "No session assigned"}
          </span>
        </div>
        <h3 className="text-sm font-semibold text-gray-900">{ballot.displayTitle}</h3>
        <p className="mt-0.5 text-xs text-gray-400">
          {ballot.candidates.length} candidates
        </p>
      </div>

      <div className="space-y-2.5 p-4">
        {ballot.hasVoted ? (
          <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <CheckCircle2 className="size-5 shrink-0 text-emerald-600" />
            <div>
              <p className="text-sm font-semibold text-emerald-800">Vote recorded</p>
              {ballot.votedCandidateName && (
                <p className="text-xs text-emerald-600">
                  You voted for {ballot.votedCandidateName}
                </p>
              )}
            </div>
          </div>
        ) : (
          ballot.candidates.map((candidate, index) => (
            <CandidateOption
              key={candidate.candidateId}
              candidate={candidate}
              subcategoryId={ballot.subcategoryId}
              selected={selectedCandidateId === candidate.candidateId}
              onSelect={onSelect}
              colorIndex={index}
            />
          ))
        )}
      </div>
    </div>
  )
})
