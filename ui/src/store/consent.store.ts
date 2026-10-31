import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { ConsentResponse, ConsentState } from "@/types/consent"

export const useConsentStore = create<ConsentState>()(
  persist(
    (set, get) => ({
      responses: [],

      respond: (data) => {
        const existing = get().responses.find(
          (r) =>
            r.requestId === data.requestId &&
            r.studentId === data.studentId &&
            r.parentId === data.parentId
        )
        if (existing) {
          // update in place
          set((state) => ({
            responses: state.responses.map((r) =>
              r.id === existing.id
                ? {
                    ...r,
                    decision: data.decision,
                    notes: data.notes,
                    respondedAt: new Date().toISOString(),
                  }
                : r
            ),
          }))
        } else {
          const record: ConsentResponse = {
            ...data,
            id: crypto.randomUUID(),
            respondedAt: new Date().toISOString(),
          }
          set((state) => ({ responses: [record, ...state.responses] }))
        }
      },
    }),
    { name: "em360-consent" }
  )
)
