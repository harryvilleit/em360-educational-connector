import { z } from "zod"

export const JobRoleSchema = z.object({
  name: z.string().min(2, { message: "Role name is required" }),
  description: z.string().optional(),
  systemJobRole: z.number().optional(),
})

export type JobRoleSchema = z.infer<typeof JobRoleSchema>
