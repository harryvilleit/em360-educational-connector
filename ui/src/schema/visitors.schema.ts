import * as z from "zod"
import { validatePhoneValue } from "@/utils/phone"

export const visitorSchema = z.object({
  studentIds: z.array(z.string()).min(1, "Select at least one student"),
  visitorFirstName: z.string().min(1, "First name is required"),
  visitorLastName: z.string().min(1, "Last name is required"),
  visitorPhone: z.string().superRefine((value, ctx) => {
    const error = validatePhoneValue(value)
    if (error) {
      ctx.addIssue({ code: "custom", message: error })
    }
  }),
  relationship: z.string().min(2, "Relationship is required"),
  visitDate: z.string().min(1, "Visit date is required"),
  checkIn: z.string().min(1, "Check-in time is required"),
  checkOut: z.string().min(1, "Check-out time is required"),
  reason: z.string().min(3, "Reason for visit is required"),
  broughtGift: z.enum(["yes", "no"]),
  giftItems: z.string().optional(),
  extraVisitorsCount: z.string().optional(),
  extraVisitorsNames: z.string().optional(),
})

export type VisitorFormData = z.infer<typeof visitorSchema>
