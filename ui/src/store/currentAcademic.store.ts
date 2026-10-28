import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { CurrentAcademicState } from "@/types/academic"

export const useCurrentAcademicStore = create<CurrentAcademicState>()(
  persist(
    (set) => ({
      currentSessionId: null,
      currentTermId: null,
      setCurrentSessionId: (id) => set({ currentSessionId: id }),
      setCurrentTermId: (id) => set({ currentTermId: id }),
    }),
    { name: "em360-current-academic" }
  )
)
