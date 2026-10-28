import { z } from "zod"
import { validatePhoneValue } from "@/utils/phone"

export const permissions = [1, 2, 3, 4] as const
export type Permission = (typeof permissions)[number]

export const CreateUserSchema = z.object({
  firstName: z
    .string({ message: "First name is required" })
    .min(2, { message: "First name is required" }),
  lastName: z
    .string({ message: "Last name is required" })
    .min(2, { message: "Last name is required" }),
  email: z.email({ message: "Enter a valid email address" }),
  phoneNumber: z
    .string({ message: "Phone number is required" })
    .superRefine((value, ctx) => {
      const error = validatePhoneValue(value)
      if (error) {
        ctx.addIssue({ code: "custom", message: error })
      }
    }),
  jobRoles: z
    .array(z.string())
    .min(1, { message: "Select at least one job role" }),
  staffId: z
    .string({ message: "Staff ID is required" })
    .min(1, { message: "Staff ID is required" }),
  gender: z.enum(["male", "female", "other"], {
    message: "Gender is required",
  }),
  dateOfBirth: z
    .string({ message: "Date of birth is required" })
    .min(1, { message: "Date of birth is required" }),
  employmentType: z.enum(["full-time", "part-time", "contract"], {
    message: "Employment type is required",
  }),
  qualification: z
    .string({ message: "Qualification is required" })
    .min(1, { message: "Qualification is required" }),
})

export type CreateUserSchema = z.infer<typeof CreateUserSchema>
