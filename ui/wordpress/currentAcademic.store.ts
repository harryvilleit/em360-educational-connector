import { create } from "zustand"
import type { CurrentAcademicState } from "@/types/academic"
export const useCurrentAcademicStore = create<CurrentAcademicState>((set) => ({
  currentSessionId: null,
  currentTermId: null,
  setCurrentSessionId: (id) => set({ currentSessionId: id }),
  setCurrentTermId: (id) => set({ currentTermId: id }),
}))
