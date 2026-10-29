import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { FloorItemI, FloorState } from "@/types/floor"

export const useFloorStore = create<FloorState>()(
  persist(
    (set) => ({
      floors: [],

      createFloor: (data) => {
        const floor: FloorItemI = {
          id: crypto.randomUUID(),
          schoolId: data.schoolId,
          name: data.name,
          description: data.description,
          dateCreated: new Date().toISOString(),
        }
        set((s) => ({ floors: [floor, ...s.floors] }))
        return floor
      },

      updateFloor: ({ id, name, description }) =>
        set((s) => ({
          floors: s.floors.map((f) =>
            f.id === id ? { ...f, name, description } : f
          ),
        })),

      deleteFloor: (id) =>
        set((s) => ({ floors: s.floors.filter((f) => f.id !== id) })),
    }),
    { name: "em360-floors" }
  )
)
