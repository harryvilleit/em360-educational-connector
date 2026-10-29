import { z } from "zod"

export const lmsAssignmentFormSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  courseId: z.string().min(1, "Select a course"),
  type: z.enum(["cbt", "voice", "file_upload"]),
  description: z.string(),
  questionFileUrl: z.string().optional(),
  questionFileName: z.string().optional(),
  dueDate: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  durationMinutes: z.string(),
  weightPercent: z.string(),
  requireCameraRecording: z.boolean(),
  voiceTimerMode: z.enum(["total", "per_question"]),
  voiceDurationMinutes: z.string(),
  voiceStartDate: z.string(),
  voiceEndDate: z.string(),
  mcqQuestions: z.array(
    z.object({
      id: z.string().optional(),
      text: z.string(),
      options: z.object({
        A: z.string(),
        B: z.string(),
        C: z.string(),
        D: z.string(),
      }),
      correct: z.enum(["A", "B", "C", "D"]),
    })
  ),
  voiceQuestions: z.array(
    z.object({
      text: z.string(),
      id: z.string(),
      tutorVoicePromptUrl: z.string().optional(),
      voicePromptFileName: z.string().optional(),
      voicePromptFile: z.custom<File | null>(),
      recordingVoice: z.boolean(),
      durationMinutes: z.string(),
    })
  ),
})

export type LmsAssignmentFormSchema = z.infer<typeof lmsAssignmentFormSchema>
