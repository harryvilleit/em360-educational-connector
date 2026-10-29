import * as z from "zod"

// Backend enum: 1 = Active (available), 2 = Occupied when *sent* (update
// payloads). When *read back*, the API serializes this enum as its name
// ("Active" / "Occupied") rather than its ordinal — this helper accepts
// either form defensively.
export const BED_SPACE_STATUS = {
  Active: 1,
  Occupied: 2,
} as const

export function isBedSpaceOccupied(status: number | string): boolean {
  if (typeof status === "number") return status === BED_SPACE_STATUS.Occupied
  return status.toLowerCase() === "occupied"
}

export const bedSpaceSchema = z.object({
  roomId: z.string().min(1, "Please select a room"),
  label: z
    .string()
    .min(1, "Bed label is required")
    .max(20, "Too long")
    .regex(/^[A-Za-z0-9\s-]+$/, "Use letters, numbers, spaces or hyphens only"),
})

export type BedSpaceFormData = z.infer<typeof bedSpaceSchema>
