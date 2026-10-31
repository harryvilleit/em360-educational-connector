import { create } from "zustand"
import { persist } from "zustand/middleware"

export type TranscriptDelivery = "self" | "official"
export type TranscriptStatus = "pending" | "approved" | "declined"

export type TranscriptPurpose =
  | "University Admission"
  | "Transfer to Another School"
  | "Scholarship Application"
  | "Employment Verification"
  | "Personal Records"
  | "Other"

export interface TranscriptRequest {
  id: string
  serialNumber: string
  parentId: string
  parentName: string
  parentEmail: string
  studentId: string
  studentName: string
  studentClass: string
  deliveryType: TranscriptDelivery
  // official delivery fields
  institutionName?: string
  institutionAddress?: string
  contactPerson?: string
  contactEmail?: string
  purpose?: TranscriptPurpose | string
  notes?: string
  status: TranscriptStatus
  adminNote?: string
  reviewedAt?: string
  createdAt: string
}

interface TranscriptState {
  requests: TranscriptRequest[]
  counter: number
  submitRequest: (
    data: Omit<TranscriptRequest, "id" | "serialNumber" | "status" | "createdAt">
  ) => TranscriptRequest
  approveRequest: (id: string, note?: string) => void
  declineRequest: (id: string, reason: string) => void
  getParentRequests: (parentId: string) => TranscriptRequest[]
}

export const useTranscriptStore = create<TranscriptState>()(
  persist(
    (set, get) => ({
      requests: [],
      counter: 1,

      submitRequest: (data) => {
        const counter = get().counter
        const record: TranscriptRequest = {
          ...data,
          id: crypto.randomUUID(),
          serialNumber: `TRN-${new Date().getFullYear()}-${String(counter).padStart(4, "0")}`,
          status: "pending",
          createdAt: new Date().toISOString().split("T")[0],
        }
        set((s) => ({ requests: [record, ...s.requests], counter: counter + 1 }))
        return record
      },

      approveRequest: (id, note) => {
        set((s) => ({
          requests: s.requests.map((r) =>
            r.id === id
              ? { ...r, status: "approved" as const, adminNote: note, reviewedAt: new Date().toISOString().split("T")[0] }
              : r
          ),
        }))
      },

      declineRequest: (id, reason) => {
        set((s) => ({
          requests: s.requests.map((r) =>
            r.id === id
              ? { ...r, status: "declined" as const, adminNote: reason, reviewedAt: new Date().toISOString().split("T")[0] }
              : r
          ),
        }))
      },

      getParentRequests: (parentId) =>
        get().requests.filter((r) => r.parentId === parentId),
    }),
    { name: "em360-transcripts" }
  )
)
