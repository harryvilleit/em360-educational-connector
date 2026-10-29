import { z } from "zod"

export const PeriodSchema = z
  .object({
    periodTypeId: z.string().min(1, "Period type is required"),
    startTime: z.string().min(1, "Start time is required"),
    endTime: z.string().min(1, "End time is required"),
    subjectId: z.string().optional(),
    classMode: z.number().optional(),
    venue: z.string().optional(),
    assessmentType: z.string().optional(),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: "End time must be after start time",
    path: ["endTime"],
  })

export type PeriodFormValues = z.infer<typeof PeriodSchema>

/**
 * The built-in "Class" period type is structurally special (requires a
 * subjectId) — its id is only known once the real period type list has been
 * fetched, so the schema is built with a factory rather than a compile-time
 * constant.
 */
export function makePeriodSchema(classPeriodTypeId: string) {
  return PeriodSchema.refine(
    (data) => data.periodTypeId !== classPeriodTypeId || !!data.subjectId,
    { message: "Subject is required for a class period", path: ["subjectId"] }
  )
}
