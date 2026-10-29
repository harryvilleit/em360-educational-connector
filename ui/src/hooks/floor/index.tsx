import { toast } from "sonner"
import { useFloorStore } from "@/store/floor.store"
import type { FloorItemI } from "@/types/floor"

export const useGetAllFloors = (schoolId?: string) => {

  const allFloors = useFloorStore((s) => s.floors)
  const floors = schoolId ? allFloors.filter((f) => f.schoolId === schoolId) : []

  return { floors, isLoading: false }
}

interface UseCreateFloorOptions {
  onSuccess?: (floor: FloorItemI) => void
}

export const useCreateFloor = ({ onSuccess }: UseCreateFloorOptions = {}) => {
  const createFloorInStore = useFloorStore((s) => s.createFloor)

  const createFloor = (payload: {
    schoolId: string
    name: string
    description?: string
  }) => {
    const floor = createFloorInStore(payload)
    toast.success("Floor created successfully")
    onSuccess?.(floor)
  }

  return { createFloor, isPending: false }
}

interface UseUpdateFloorOptions {
  onSuccess?: () => void
}

export const useUpdateFloor = ({ onSuccess }: UseUpdateFloorOptions = {}) => {
  const updateFloorInStore = useFloorStore((s) => s.updateFloor)

  const updateFloor = (payload: {
    id: string
    name: string
    description?: string
  }) => {
    updateFloorInStore(payload)
    toast.success("Floor updated successfully")
    onSuccess?.()
  }

  return { updateFloor, isPending: false }
}

interface UseDeleteFloorOptions {
  onSuccess?: () => void
}

export const useDeleteFloor = ({ onSuccess }: UseDeleteFloorOptions = {}) => {
  const deleteFloorInStore = useFloorStore((s) => s.deleteFloor)

  const deleteFloor = (id: string) => {
    deleteFloorInStore(id)
    toast.success("Floor deleted successfully")
    onSuccess?.()
  }

  return { deleteFloor, isPending: false }
}
