import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { StudentBasic, StudentState } from "@/types/student"

export const useStudentStore = create<StudentState>()(
  persist(
    (set) => ({
      students: [],

      addStudent: (data) => {
        const now = new Date().toISOString().split("T")[0]
        const record: StudentBasic = {
          ...data,
          id: crypto.randomUUID(),
          createdAt: now,
          updatedAt: now,
        }
        set((state) => ({ students: [record, ...state.students] }))
        return record
      },

      updateStudent: (id, data) => {
        set((state) => ({
          students: state.students.map((s) =>
            s.id === id
              ? {
                  ...s,
                  ...data,
                  updatedAt: new Date().toISOString().split("T")[0],
                }
              : s
          ),
        }))
      },
    }),
    { name: "em360-students", version: 1 }
  )
)
