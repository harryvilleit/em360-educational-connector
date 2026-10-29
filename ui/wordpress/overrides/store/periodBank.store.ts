// WordPress version: the period bank is kept in memory for the open portal only (no browser storage).
import { create } from "zustand"

export interface PeriodTemplate {
  id: string
  periodTypeId: string
  startTime: string
  endTime: string
  subjectId?: string
  classMode?: number
  /** Which backend Timetable (Class/Exam/Test — see TIMETABLE_TYPE) this
   * template gets scheduled into when dropped onto a day. */
  timetableType: number
  venue?: string
  assessmentType?: string
}

interface PeriodBankState {
  templatesByClass: Record<string, PeriodTemplate[]>
  addTemplates: (key: string, templates: Omit<PeriodTemplate, "id">[]) => void
  updateTemplate: (key: string, templateId: string, updates: Omit<PeriodTemplate, "id">) => void
  removeTemplate: (key: string, templateId: string) => void
}

// A stable reference for selectors like `s.templatesByClass[key] ?? EMPTY_TEMPLATES` —
// returning a fresh `[]` literal from a selector instead gives useSyncExternalStore a
// new reference on every read and triggers "Maximum update depth exceeded".
export const EMPTY_TEMPLATES: PeriodTemplate[] = []

export const usePeriodBankStore = create<PeriodBankState>()(
  (set) => ({
    templatesByClass: {},

    addTemplates: (key, templates) =>
      set((state) => ({
        templatesByClass: {
          ...state.templatesByClass,
          [key]: [
            ...(state.templatesByClass[key] ?? []),
            ...templates.map((t) => ({ ...t, id: crypto.randomUUID() })),
          ],
        },
      })),

    updateTemplate: (key, templateId, updates) =>
      set((state) => ({
        templatesByClass: {
          ...state.templatesByClass,
          [key]: (state.templatesByClass[key] ?? []).map((t) =>
            t.id === templateId ? { ...updates, id: t.id } : t
          ),
        },
      })),

    removeTemplate: (key, templateId) =>
      set((state) => ({
        templatesByClass: {
          ...state.templatesByClass,
          [key]: (state.templatesByClass[key] ?? []).filter((t) => t.id !== templateId),
        },
      })),
  })
)
