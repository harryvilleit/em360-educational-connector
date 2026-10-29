import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface InvoiceSignatureI {
  name: string
  title: string
}

interface InvoiceSignatureState {
  signaturesBySchool: Record<string, InvoiceSignatureI>
  setSignature: (schoolId: string, signature: InvoiceSignatureI) => void
  getSignature: (schoolId: string) => InvoiceSignatureI | undefined
}

// Set once by Admin per school (name + title), then rendered onto every
// invoice's "Authorised Signature" line going forward — no backend field
// exists for this yet, so it's a local, persisted, school-scoped setting.
export const useInvoiceSignatureStore = create<InvoiceSignatureState>()(
  persist(
    (set, get) => ({
      signaturesBySchool: {},

      setSignature: (schoolId, signature) =>
        set((state) => ({
          signaturesBySchool: { ...state.signaturesBySchool, [schoolId]: signature },
        })),

      getSignature: (schoolId) => get().signaturesBySchool[schoolId],
    }),
    { name: "em360-invoice-signature" }
  )
)
