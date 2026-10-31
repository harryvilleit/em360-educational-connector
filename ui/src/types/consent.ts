// There is no backend endpoint yet for a parent submitting a consent
// response — until one exists, responses are recorded locally so the
// parent-facing approve/disapprove UI keeps working end-to-end. Requests
// themselves come from the real Consent API (see src/hooks/consent).
export type ConsentDecision = "approved" | "disapproved"

export interface ConsentResponse {
  id: string
  requestId: string
  parentId: string
  studentId: string
  studentName: string
  decision: ConsentDecision
  respondedAt: string
  notes?: string
}

export interface ConsentState {
  responses: ConsentResponse[]
  respond: (data: Omit<ConsentResponse, "id" | "respondedAt">) => void
}
