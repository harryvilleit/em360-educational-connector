/** Common term name suggestions shown as quick-picks in the form. */
export const COMMON_TERM_NAMES = ["1st Term", "2nd Term", "3rd Term"] as const

export interface AcademicTerm {
  id: string
  sessionId: string
  name: string
  startDate: string
  endDate: string
  isCurrent: boolean
}

export interface AcademicSession {
  id: string
  name: string
  startDate: string
  endDate: string
  isCurrent: boolean
  terms: AcademicTerm[]
}

export interface CurrentAcademicState {
  currentSessionId: string | null
  currentTermId: string | null
  setCurrentSessionId: (id: string) => void
  setCurrentTermId: (id: string) => void
}
