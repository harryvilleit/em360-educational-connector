import { z } from "zod"

export const EVENT_TYPES: { value: number; label: string }[] = [
  { value: 1, label: "Holiday" },
  { value: 2, label: "Exam" },
  { value: 3, label: "Test" },
  { value: 4, label: "Event" },
  { value: 5, label: "Sports" },
  { value: 6, label: "Meeting" },
]

export const CalendarEventSchema = z
  .object({
    title: z.string().min(1, "Title is required"),
    date: z.string().min(1, "Date is required"),
    endDate: z.string().optional(),
    isAllDay: z.boolean(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    eventType: z.number(),
    description: z.string().min(1, "Description is required"),
    affectsAllClasses: z.boolean(),
    schoolClassIds: z.array(z.string()).optional(),
  })
  .refine((data) => !data.endDate || data.endDate >= data.date, {
    message: "End date cannot be before start date",
    path: ["endDate"],
  })
  .refine(
    (data) =>
      data.isAllDay ||
      (!!data.startTime &&
        !!data.endTime &&
        ((!!data.endDate && data.endDate !== data.date) ||
          data.endTime > data.startTime)),
    {
      message: "Choose an end time after the start time",
      path: ["endTime"],
    }
  )
  .refine(
    (data) =>
      data.affectsAllClasses ||
      (data.schoolClassIds && data.schoolClassIds.length > 0),
    { message: "Select at least one class", path: ["schoolClassIds"] }
  )

export type CalendarEventFormValues = z.infer<typeof CalendarEventSchema>

export const EMPTY_CALENDAR_EVENT: CalendarEventFormValues = {
  title: "",
  date: "",
  endDate: "",
  isAllDay: true,
  startTime: "",
  endTime: "",
  eventType: 4,
  description: "",
  affectsAllClasses: true,
  schoolClassIds: [],
}
