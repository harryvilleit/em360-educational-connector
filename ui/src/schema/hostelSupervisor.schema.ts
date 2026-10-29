import * as z from "zod"

export const supervisorSchema = z.object({
  hostelId: z.string().min(1, "Please select a hostel"),
  subUserId: z.string().min(1, "Please select a staff member"),
})

export type SupervisorFormData = z.infer<typeof supervisorSchema>
