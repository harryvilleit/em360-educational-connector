import type { Election, VoterType } from "@/types/student"

export function isEligibleForElection(
  election: Election,
  voterClass: string,
  voterType: VoterType = "student"
): boolean {
  const allowedTypes = election.eligibleVoterTypes ?? ["student"]
  if (!allowedTypes.includes(voterType)) return false
  if (voterType === "staff") return true
  const classes = election.eligibleClasses ?? [election.eligibleClass]
  return classes.includes("All") || classes.includes(voterClass)
}

// Older elections have a single ballot; new elections have one per subcategory.
export function getElectionBallots(election: Election): Election[] {
  if (!election.subcategories?.length) return [election]
  return election.subcategories.map((subcategory) => ({
    ...election,
    id: subcategory.id,
    title: `${election.title} — ${subcategory.name}`,
    subcategories: undefined,
    candidates: election.candidates.filter(
      (candidate) => candidate.subcategoryId === subcategory.id
    ),
  }))
}
