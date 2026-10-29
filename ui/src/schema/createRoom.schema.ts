import * as z from "zod"

export const ROOM_AMENITIES = [
  "Air Conditioning",
  "Ceiling Fan",
  "Study Desk",
  "Bunk Beds",
  "Individual Beds",
  "Storage Locker",
  "Wardrobe",
  "Private Bathroom",
  "Shared Bathroom",
  "Window Blinds",
  "Reading Lamp",
  "Power Socket (per bed)",
] as const

export const roomSchema = z.object({
  hostelId: z.string().min(1, "Please select a hostel"),
  roomNumber: z.string().min(1, "Room number is required").max(20, "Too long"),
  roomName: z.string().min(1, "Room name is required").max(60, "Too long"),
  floor: z.string().optional(),
  description: z.string().max(300, "Too long").optional(),
  amenities: z.array(z.string()),
})

export type RoomFormData = z.infer<typeof roomSchema>
