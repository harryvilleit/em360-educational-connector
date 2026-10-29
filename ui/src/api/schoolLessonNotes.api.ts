import apiClient from "./api"
import { toCamelCase } from "@/utils/caseConversion"
import type { LessonNote } from "@/pages/Dashboard/ELearning/lessonNotes/data"

export const LESSON_NOTES_MENU = "/dashboard/elearning/lesson-notes"
export const lessonNoteKeys = (school: string, user?: string) =>
  ["school-lesson-notes", school, user ?? ""] as const
export interface LessonNoteOptions {
  subjects: { id: string; name: string }[]
  classes: { id: string; name: string }[]
  courses: { subjectId: string; classId: string }[]
  terms: { id: string; name: string; sessionId: string; sessionName: string }[]
  isOwner: boolean
}
export interface LessonNoteList {
  items: LessonNote[]
  totalItems: number
  page: number
  pageSize: number
  canReview: boolean
  stats: { total: number; draft: number; submitted: number; approved: number }
}
export type LessonNoteFilters = {
  page: number
  search?: string
  classId?: string
  subjectId?: string
  termId?: string
  status?: string
}
const root = (school: string) =>
  `/SchoolLessonNotes/${encodeURIComponent(school)}`
function note(raw: unknown): LessonNote {
  const value = toCamelCase<
    Omit<LessonNote, "topic"> & { content: Partial<LessonNote> }
  >(raw)
  const { content, ...details } = value
  return { ...content, ...details } as LessonNote
}
function payload(n: LessonNote) {
  return {
    title: n.title,
    subjectId: n.subjectId,
    classId: n.classId,
    schoolSessionTermId: n.schoolSessionTermId,
    revision: n.revision || null,
    content: {
      topic: n.topic,
      week: n.week,
      durationMinutes: n.durationMinutes,
      date: n.date,
      behaviouralObjectives: n.behaviouralObjectives,
      previousKnowledge: n.previousKnowledge,
      instructionalMaterials: n.instructionalMaterials,
      introduction: n.introduction,
      presentation: n.presentation,
      evaluation: n.evaluation,
      assignment: n.assignment,
      conclusion: n.conclusion,
      references: n.references,
    },
  }
}
export const lessonNotesApi = {
  async list(
    school: string,
    filters: LessonNoteFilters
  ): Promise<LessonNoteList> {
    const value = toCamelCase<LessonNoteList>(
      await apiClient.get(root(school), { params: filters })
    )
    return { ...value, items: value.items.map(note) }
  },
  async options(school: string) {
    return toCamelCase<LessonNoteOptions>(
      await apiClient.get(root(school) + "/Options")
    )
  },
  async get(school: string, id: string) {
    return note(
      await apiClient.get(root(school) + "/" + encodeURIComponent(id))
    )
  },
  async save(school: string, n: LessonNote) {
    return note(
      n.id
        ? await apiClient.put(
            root(school) + "/" + encodeURIComponent(n.id),
            payload(n)
          )
        : await apiClient.post(root(school), payload(n))
    )
  },
  async submit(school: string, n: LessonNote) {
    return note(
      await apiClient.post(
        `${root(school)}/${encodeURIComponent(n.id)}/Submit`,
        { revision: n.revision }
      )
    )
  },
  async review(
    school: string,
    n: LessonNote,
    approve: boolean,
    remarks: string
  ) {
    return note(
      await apiClient.post(
        `${root(school)}/${encodeURIComponent(n.id)}/Review`,
        { revision: n.revision, approve, remarks }
      )
    )
  },
  async remove(school: string, n: LessonNote) {
    await apiClient.delete(`${root(school)}/${encodeURIComponent(n.id)}`, {
      data: { revision: n.revision },
    })
  },
}
