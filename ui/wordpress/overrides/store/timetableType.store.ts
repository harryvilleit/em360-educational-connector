// WordPress version: the two timetable types the School API schedules (Class and Assessment).
// The main site also lets schools add label-only types kept in browser storage; those are not offered here.
import { create } from "zustand"
import { TIMETABLE_TYPE } from "@/pages/Dashboard/Timetable/timetable.utils"

export interface TimetableTypeItem {
  id: string
  label: string
  /** The Timetable API's `type` (1 = Class, 2 = Assessment); null for label-only types. */
  backendType: number | null
  locked?: boolean
}

interface TimetableTypeStore {
  timetableTypes: TimetableTypeItem[]
  addTimetableType: (label: string) => void
  updateTimetableType: (id: string, label: string) => void
  removeTimetableType: (id: string) => void
}

const TYPES: TimetableTypeItem[] = [
  { id: "class", label: "Class Timetable", backendType: TIMETABLE_TYPE.Class, locked: true },
  { id: "assessment", label: "Assessment Timetable", backendType: TIMETABLE_TYPE.Assessment, locked: true },
]

export const useTimetableTypeStore = create<TimetableTypeStore>()(() => ({
  timetableTypes: TYPES,
  addTimetableType: () => {},
  updateTimetableType: () => {},
  removeTimetableType: () => {},
}))
