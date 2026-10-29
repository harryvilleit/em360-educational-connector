import type { LessonNote } from "@/pages/Dashboard/ELearning/lessonNotes/data"
import type {
  LessonNoteFilters,
  LessonNoteList,
  LessonNoteOptions,
} from "@/api/schoolLessonNotes.api"
import { request, type Row } from "../rebuilt/service"
import { currentContext } from "../rebuilt/runtime"
export type { LessonNoteFilters, LessonNoteList, LessonNoteOptions }
export const LESSON_NOTES_MENU = "/dashboard/elearning/lesson-notes"
export const lessonNoteKeys = (school: string, user?: string) =>
  ["school-lesson-notes", school, user || ""] as const
function school(id: string) {
  if (id !== currentContext().schoolId)
    throw Error("Select the connected school.")
}
function note(value: Row): LessonNote {
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
    content: Object.fromEntries(
      [
        "topic",
        "week",
        "durationMinutes",
        "date",
        "behaviouralObjectives",
        "previousKnowledge",
        "instructionalMaterials",
        "introduction",
        "presentation",
        "evaluation",
        "assignment",
        "conclusion",
        "references",
      ].map((k) => [k, (n as any)[k]])
    ),
  }
}
async function allPages(path: string, params: Row = {}) {
  const rows: Row[] = []
  let page = 1,
    totalPages = 1
  do {
    const value = await request(path, "GET", undefined, {
      ...params,
      pageNumber: page,
      pageSize: 100,
    })
    if (Array.isArray(value)) return value
    if (!Array.isArray(value.items))
      throw Error("The school returned an invalid options list.")
    rows.push(...value.items)
    totalPages =
      value.totalPages ||
      Math.ceil((value.totalItems || rows.length) / (value.pageSize || 100))
    if (page < totalPages && !value.items.length)
      throw Error("The school returned an incomplete options list.")
    page++
  } while (page <= totalPages)
  return rows
}
export const lessonNotesApi = {
  async list(id: string, filters: LessonNoteFilters): Promise<LessonNoteList> {
    school(id)
    // The existing WordPress endpoint supports page only. Read its authorised
    // pages before filtering so search and totals never silently omit page 2+.
    const rows: LessonNote[] = []
    let page = 1,
      total = 0,
      canReview = false
    do {
      const data = await request("/WordPressLessonNotes", "GET", undefined, {
        page,
      })
      if (!Array.isArray(data.items))
        throw Error("Unable to read lesson notes.")
      rows.push(...data.items.map(note))
      total = data.totalItems
      canReview = data.canReview
      if (!data.items.length && rows.length < total)
        throw Error("The lesson-note list changed. Refresh to continue.")
      page++
    } while (rows.length < total)
    const search = (filters.search || "").toLowerCase().trim()
    const matched = rows.filter(
      (n) =>
        (!search ||
          [n.title, n.topic, n.subject, n.className, n.teacherName]
            .join(" ")
            .toLowerCase()
            .includes(search)) &&
        (!filters.classId || n.classId === filters.classId) &&
        (!filters.subjectId || n.subjectId === filters.subjectId) &&
        (!filters.termId || n.schoolSessionTermId === filters.termId) &&
        (!filters.status || n.status === filters.status)
    )
    return {
      items: matched.slice((filters.page - 1) * 50, filters.page * 50),
      page: filters.page,
      pageSize: 50,
      totalItems: matched.length,
      canReview,
      stats: {
        total: rows.length,
        draft: rows.filter((n) => n.status === "draft").length,
        submitted: rows.filter((n) => n.status === "submitted").length,
        approved: rows.filter((n) => n.status === "approved").length,
      },
    }
  },
  async options(id: string): Promise<LessonNoteOptions> {
    school(id)
    const isOwner = currentContext().dashboard.UserRole === "Owner"
    const [sessions, courses, subjects, classes] = await Promise.all([
      allPages("/SchoolSession/GetAll", { schoolId: id }),
      isOwner
        ? Promise.resolve([])
        : request<Row[]>("/TeacherPortal/Courses/" + id),
      isOwner
        ? allPages("/SchoolSubject/GetAll", { schoolId: id })
        : Promise.resolve([]),
      isOwner
        ? allPages("/SchoolClass/GetAll", { schoolId: id })
        : Promise.resolve([]),
    ])
    const unique = (items: Row[], key: string, name: string) => [
      ...new Map(
        items.map((c) => [c[key], { id: c[key], name: c[name] }])
      ).values(),
    ]
    return {
      isOwner,
      courses: courses.map((c) => ({
        subjectId: c.subjectId,
        classId: c.classId,
      })),
      subjects: isOwner
        ? subjects.map((s) => ({ id: s.id, name: s.name }))
        : unique(courses, "subjectId", "subjectName"),
      classes: isOwner
        ? classes.map((c) => ({ id: c.id, name: c.clsName || c.name }))
        : unique(courses, "classId", "className"),
      terms: sessions.flatMap((s) =>
        (s.terms || []).map((t: Row) => ({
          id: t.id,
          name: t.termName,
          sessionId: s.id,
          sessionName: s.sessionName,
        }))
      ),
    }
  },
  async get(id: string, noteId: string) {
    school(id)
    return note(await request("/WordPressLessonNotes/" + noteId))
  },
  async save(id: string, n: LessonNote) {
    school(id)
    return note(
      await request(
        "/WordPressLessonNotes" + (n.id ? "/" + n.id : ""),
        n.id ? "PUT" : "POST",
        payload(n)
      )
    )
  },
  async submit(id: string, n: LessonNote) {
    school(id)
    return note(
      await request("/WordPressLessonNotes/" + n.id + "/Submit", "POST", {
        revision: n.revision,
      })
    )
  },
  async review(id: string, n: LessonNote, approve: boolean, remarks: string) {
    school(id)
    return note(
      await request("/WordPressLessonNotes/" + n.id + "/Review", "POST", {
        revision: n.revision,
        approve,
        remarks,
      })
    )
  },
  async remove(id: string, n: LessonNote) {
    school(id)
    return request("/WordPressLessonNotes/" + n.id, "DELETE", {
      revision: n.revision,
    })
  },
}
