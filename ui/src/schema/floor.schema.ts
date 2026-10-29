import * as z from "zod"

export const floorSchema = z.object({
  name: z.string().min(1, "Floor name is required").max(60, "Too long"),
  description: z.string().max(200, "Too long").optional(),
})

export type FloorFormData = z.infer<typeof floorSchema>
