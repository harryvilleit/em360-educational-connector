import { z } from "zod"

export const CreateClassSchema = z.object({
  name: z.string().min(2, "Class name is required"),
  categoryId: z.string().min(1, "Category is required"),
  arm: z.string().optional(),
  capacity: z.string().regex(/^\d+$/, "Capacity must be a number"),
  description: z.string().optional(),
})

export const CreateCategorySchema = z.object({
  name: z.string().min(2, "Category name is required"),
  description: z.string().optional(),
})

export const CreateClassArmSchema = z.object({
  name: z.string().min(1, "Arm name is required"),
  description: z.string().optional(),
})

export const CreateSubjectSchema = z.object({
  description: z.string().max(20000, "Description cannot exceed 20,000 characters").optional(),
  isPublic: z.boolean().optional(),
  name: z.string().min(2, "Subject name is required"),
  code: z.string().optional(),
})

export const CreateSubjectsSchema = z.object({
  subjects: z.array(CreateSubjectSchema).min(1, "Add at least one subject"),
})

export const StudentGradeSchema = z.object({
  studentId: z.string(),
  name: z.string(),
  studentId_num: z.string(),
  ca1: z.number().min(0).max(100).optional(),
  ca2: z.number().min(0).max(100).optional(),
  ca3: z.number().min(0).max(100).optional(),
  examScore: z.number().min(0).max(100).optional(),
  total: z.number().min(0).optional(),
  grade: z.string().optional(),
  position: z.number().optional(),
})

export const GradeEntrySchema = z.object({
  classId: z.string(),
  subjectId: z.string(),
  term: z.string().optional(),
  session: z.string().optional(),
  students: z.array(StudentGradeSchema),
})

export const SubmitGradesSchema = z.object({
  gradeEntryId: z.string(),
  classId: z.string(),
  subjectId: z.string(),
  students: z.array(StudentGradeSchema),
})

export const EditSubjectSchema = z.object({
  description: z.string().max(20000, "Description cannot exceed 20,000 characters").optional(),
  isPublic: z.boolean().optional(),
  name: z.string().min(1, "Subject name is required"),
  code: z.string().optional(),
})

export const CreateDepartmentSchema = z.object({
  name: z.string().min(2, "Department name is required"),
  description: z.string().optional(),
})

export const EditDepartmentSchema = z.object({
  name: z.string().min(2, "Department name is required"),
  description: z.string().optional(),
})

export type CreateClassSchema = z.infer<typeof CreateClassSchema>
export type CreateCategorySchema = z.infer<typeof CreateCategorySchema>
export type CreateClassArmSchema = z.infer<typeof CreateClassArmSchema>
export type CreateSubjectSchema = z.infer<typeof CreateSubjectSchema>
export type CreateSubjectsSchema = z.infer<typeof CreateSubjectsSchema>
export type StudentGradeSchema = z.infer<typeof StudentGradeSchema>
export type GradeEntrySchema = z.infer<typeof GradeEntrySchema>
export type SubmitGradesSchema = z.infer<typeof SubmitGradesSchema>
export type EditSubjectSchema = z.infer<typeof EditSubjectSchema>
export type CreateDepartmentSchema = z.infer<typeof CreateDepartmentSchema>
export type EditDepartmentSchema = z.infer<typeof EditDepartmentSchema>
