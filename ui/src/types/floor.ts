export interface FloorItemI {
  id: string
  schoolId: string
  name: string
  description?: string
  dateCreated: string
}

export interface CreateFloorPayloadI {
  schoolId: string
  name: string
  description?: string
}

export interface UpdateFloorPayloadI {
  id: string
  name: string
  description?: string
}

export interface FloorState {
  floors: FloorItemI[]
  createFloor: (data: CreateFloorPayloadI) => FloorItemI
  updateFloor: (data: UpdateFloorPayloadI) => void
  deleteFloor: (id: string) => void
}
