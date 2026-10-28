import type { VoterType } from "@/types/student"

export type CandidateDraft = {
  key: string
  firstName: string
  lastName: string
  class: string
  manifesto: string
  studentId?: string
  staffId?: string
  roleName?: string
  profilePicture?: string
  profileLoading?: boolean
}

export type CandidateType = "student" | "staff"

export type SubcategoryDraft = {
  key: string
  name: string
  candidateType: CandidateType
  candidates: CandidateDraft[]
}

export function newCandidate(): CandidateDraft {
  return {
    key: crypto.randomUUID(),
    firstName: "",
    lastName: "",
    class: "",
    manifesto: "",
  }
}

export function newSubcategory(): SubcategoryDraft {
  return {
    key: crypto.randomUUID(),
    name: "",
    candidateType: "student",
    candidates: [newCandidate(), newCandidate()],
  }
}

export function validateElectionDraft(input: {
  academicSessionId: string
  sessionIds: string[]
  title: string
  category: string
  categories: string[]
  eligibleClasses: string[]
  classNames: string[]
  voterTypes?: VoterType[]
  subcategories: SubcategoryDraft[]
}): Record<string, string> {
  const voterTypes = input.voterTypes ?? ["student"]
  const errors: Record<string, string> = {}
  if (!input.sessionIds.includes(input.academicSessionId))
    errors.session = "Select an academic session."
  if (!input.title.trim()) errors.title = "Title is required."
  if (!input.categories.includes(input.category))
    errors.category = "Select a category."
  if (!voterTypes.length)
    errors.voterTypes = "Select who can vote in this election."
  if (
    voterTypes.includes("student") &&
    (!input.eligibleClasses.length ||
      input.eligibleClasses.some(
        (name) => name !== "All" && !input.classNames.includes(name)
      ))
  )
    errors.classes = "Select at least one available class or All Classes."
  if (!input.subcategories.length)
    errors.subcategories = "Add at least one subcategory."
  const names = new Set<string>()
  for (const group of input.subcategories) {
    const name = group.name.trim().replace(/\s+/g, " ").toLowerCase()
    if (!name) errors[group.key] = "Enter a subcategory name."
    else if (names.has(name))
      errors[group.key] =
        "Subcategory names must be unique within this election."
    names.add(name)
    if (group.candidates.length < 2)
      errors[`${group.key}-candidates`] =
        "Add at least two candidates to this subcategory."
    const people = new Set<string>()
    const staff = group.candidateType === "staff"
    for (const candidate of group.candidates) {
      const personId = staff ? candidate.staffId : candidate.studentId
      if (!personId)
        errors[`cand-${candidate.key}-student`] = staff
          ? "Select a staff member."
          : "Select a registered student."
      if (candidate.profileLoading)
        errors[`cand-${candidate.key}-student`] =
          "Wait for the student profile to finish loading."
      if (!staff) {
        if (!candidate.firstName.trim())
          errors[`cand-${candidate.key}-firstName`] =
            "Update the student's registered first name, then select them again."
        if (!candidate.lastName.trim())
          errors[`cand-${candidate.key}-lastName`] =
            "Update the student's registered last name, then select them again."
        if (!input.classNames.includes(candidate.class))
          errors[`cand-${candidate.key}`] =
            "Update the student's registration to an available class, then select them again."
      }
      if (personId && people.has(personId))
        errors[`${group.key}-candidates`] = staff
          ? "A staff member can only appear once in a subcategory."
          : "A student can only appear once in a subcategory."
      if (personId) people.add(personId)
    }
  }
  return errors
}
