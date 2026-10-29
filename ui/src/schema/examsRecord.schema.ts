import { z } from "zod"

export const CreateClassFormSchema = z.object({
  clsName: z.string().min(2, "Class name must be at least 2 characters"),
  categoryId: z.string().min(1, "Category is required"),
  classType: z.number().min(1, "Class type is required"),
  armIds: z.array(z.string()).optional(),
})

export type CreateClassFormSchema = z.infer<typeof CreateClassFormSchema>
