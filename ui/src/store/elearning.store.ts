import { create } from "zustand"
import { createGuestToken } from "@/utils/liveClassAccess"
import type {
  ELearningState,
  LiveClassGuestAccess,
  LmsCourseModule,
  LmsLesson,
} from "@/types/elearning"

const COURSE_COLORS = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-purple-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-cyan-500",
  "bg-teal-500",
  "bg-violet-500",
]

export const useELearningStore = create<ELearningState>((set, get) => ({
  sessions: [],
  materials: [],
  assignments: [],
  recordings: [],
  courses: [],
  curriculum: [],
  chatMessages: [],

  addCourse: (data) => {
    const id = `course-${Date.now()}`
    const color =
      data.thumbnailColor ||
      COURSE_COLORS[get().courses.length % COURSE_COLORS.length]
    set((state) => ({
      courses: [{ ...data, id, thumbnailColor: color }, ...state.courses],
    }))
    return id
  },

  updateCourse: (id, data) =>
    set((state) => ({
      courses: state.courses.map((c) => (c.id === id ? { ...c, ...data } : c)),
    })),

  addModule: (courseId, title) =>
    set((state) => {
      const existing = state.curriculum.filter((m) => m.courseId === courseId)
      const mod: LmsCourseModule = {
        id: `school-mod-${Date.now()}`,
        courseId,
        title,
        order: existing.length + 1,
        lessons: [],
      }
      return { curriculum: [...state.curriculum, mod] }
    }),

  updateModule: (moduleId, data) =>
    set((state) => ({
      curriculum: state.curriculum.map((m) =>
        m.id === moduleId ? { ...m, ...data } : m
      ),
    })),

  addLesson: (moduleId, data) => {
    const mod = get().curriculum.find((m) => m.id === moduleId)
    if (!mod) return null

    const lessonId = `school-les-${Date.now()}`
    set((state) => ({
      curriculum: state.curriculum.map((m) => {
        if (m.id !== moduleId) return m
        const lesson: LmsLesson = {
          id: lessonId,
          moduleId,
          courseId: m.courseId,
          title: data.title,
          type: data.type,
          duration: data.duration,
          durationMinutes: data.durationMinutes,
          order: m.lessons.length + 1,
          description: data.description,
          contentUrl: data.contentUrl,
          materialUrl: data.materialUrl,
          htmlContent: data.htmlContent,
          embedUrl: data.embedUrl,
          assignmentType: data.assignmentType,
          materials: data.materials,
        }
        return { ...m, lessons: [...m.lessons, lesson] }
      }),
    }))
    return lessonId
  },

  updateLesson: (lessonId, data) =>
    set((state) => ({
      curriculum: state.curriculum.map((m) => ({
        ...m,
        lessons: m.lessons.map((l) =>
          l.id === lessonId ? { ...l, ...data } : l
        ),
      })),
    })),

  deleteLesson: (lessonId) =>
    set((state) => ({
      curriculum: state.curriculum.map((m) => ({
        ...m,
        lessons: m.lessons.filter((l) => l.id !== lessonId),
      })),
    })),

  addSession: (data) =>
    set((state) => ({
      sessions: [
        {
          ...data,
          id: `sess-${Date.now()}`,
          participantCount: 0,
          status: "upcoming",
        },
        ...state.sessions,
      ],
    })),

  addMaterial: (data) =>
    set((state) => ({
      materials: [
        {
          ...data,
          id: `mat-${Date.now()}`,
          uploadedAt: new Date().toISOString().split("T")[0],
        },
        ...state.materials,
      ],
    })),

  addAssignment: (data) =>
    set((state) => ({
      assignments: [
        {
          ...data,
          id: `asgn-${Date.now()}`,
          submissions: 0,
        },
        ...state.assignments,
      ],
    })),

  addChatMessage: (data) =>
    set((state) => ({
      chatMessages: [
        {
          ...data,
          id: `chat-${Date.now()}`,
          sentAt: new Date().toLocaleString(),
        },
        ...state.chatMessages,
      ],
    })),

  updateSessionStatus: (id, status) =>
    set((state) => ({
      sessions: state.sessions.map((s) => (s.id === id ? { ...s, status } : s)),
    })),

  createGuestLink: (sessionId, { createdBy, expiresAt, maxUses }) =>
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id !== sessionId
          ? s
          : {
              ...s,
              guestAccess: {
                token: createGuestToken(),
                enabled: true,
                expiresAt,
                maxUses,
                uses: 0,
                createdBy,
                createdAt: new Date().toISOString(),
              } satisfies LiveClassGuestAccess,
            }
      ),
    })),

  setGuestLinkEnabled: (sessionId, enabled) =>
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id !== sessionId || !s.guestAccess
          ? s
          : { ...s, guestAccess: { ...s.guestAccess, enabled } }
      ),
    })),

  revokeGuestLink: (sessionId) =>
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id !== sessionId ? s : { ...s, guestAccess: undefined }
      ),
    })),

  recordGuestUse: (token) =>
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.guestAccess?.token !== token
          ? s
          : {
              ...s,
              guestAccess: { ...s.guestAccess, uses: s.guestAccess.uses + 1 },
            }
      ),
    })),
}))
