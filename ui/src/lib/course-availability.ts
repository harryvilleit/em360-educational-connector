import { z } from "zod"

export const WEEK_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
]

export function isTimeZone(value: string): boolean {
  try {
    new Intl.DateTimeFormat("en", { timeZone: value }).format()
    return !!value
  } catch {
    return false
  }
}

const clock = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Enter a time in HH:mm format")
export const courseAvailabilitySchema = z
  .object({
    timeZone: z.string().refine(isTimeZone, "Choose a valid time zone"),
    slots: z
      .array(
        z.object({
          dayOfWeek: z.number().int().min(1).max(7),
          startTime: clock,
          endTime: clock,
        })
      )
      .max(70),
  })
  .superRefine((value, ctx) => {
    value.slots.forEach((slot, index) => {
      if (slot.endTime <= slot.startTime)
        ctx.addIssue({
          code: "custom",
          path: ["slots", index, "endTime"],
          message: "End time must be after start time",
        })
      if (
        value.slots.some(
          (other, j) =>
            j < index &&
            other.dayOfWeek === slot.dayOfWeek &&
            slot.startTime < other.endTime &&
            other.startTime < slot.endTime
        )
      )
        ctx.addIssue({
          code: "custom",
          path: ["slots", index, "startTime"],
          message: "Time slots on the same day cannot overlap",
        })
    })
  })
export type CourseWeeklyAvailability = z.infer<typeof courseAvailabilitySchema>
export const emptyCourseAvailability = (): CourseWeeklyAvailability => ({
  timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
  slots: [],
})

export function formatAvailabilityTime(value: string): string {
  const [hours, minutes] = value.split(":").map(Number)
  return `${hours % 12 || 12}:${String(minutes).padStart(2, "0")} ${hours < 12 ? "AM" : "PM"}`
}
