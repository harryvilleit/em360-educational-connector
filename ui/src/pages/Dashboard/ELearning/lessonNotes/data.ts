export type LessonNoteStatus = "draft" | "submitted" | "approved" | "returned"

export interface LessonNote {
  id: string
  subjectId: string
  classId: string
  schoolSessionTermId: string
  authorUserId: string
  revision: string
  title: string
  subject: string
  className: string
  term: string
  session: string
  week: number
  durationMinutes: number
  date: string
  teacherName: string
  status: LessonNoteStatus
  topic: string
  behaviouralObjectives: string
  previousKnowledge: string
  instructionalMaterials: string
  introduction: string
  presentation: string
  evaluation: string
  assignment: string
  conclusion: string
  references: string
  remarks?: string
  updatedAt: string
}

export const LESSON_NOTE_STATUS_STYLE: Record<
  LessonNoteStatus,
  { label: string; className: string }
> = {
  draft: {
    label: "Draft",
    className: "bg-slate-100 text-slate-700",
  },
  submitted: {
    label: "Submitted",
    className: "bg-amber-50 text-amber-700",
  },
  approved: {
    label: "Approved",
    className: "bg-emerald-50 text-emerald-700",
  },
  returned: {
    label: "Returned",
    className: "bg-rose-50 text-rose-700",
  },
}

export function emptyLessonNote(teacherName = "Teacher"): LessonNote {
  return {
    id: "",
    subjectId: "",
    classId: "",
    schoolSessionTermId: "",
    authorUserId: "",
    revision: "",
    title: "",
    subject: "",
    className: "",
    term: "",
    session: "",
    week: 1,
    durationMinutes: 40,
    date: new Date().toISOString().slice(0, 10),
    teacherName,
    status: "draft",
    topic: "",
    behaviouralObjectives: "",
    previousKnowledge: "",
    instructionalMaterials: "",
    introduction: "",
    presentation: "",
    evaluation: "",
    assignment: "",
    conclusion: "",
    references: "",
    updatedAt: new Date().toISOString(),
  }
}
