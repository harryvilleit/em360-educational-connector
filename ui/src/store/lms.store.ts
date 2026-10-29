import { create } from "zustand"
import type {
  LmsCertificate,
  LmsCourse,
  LmsCourseChatMessage,
  LmsEnrollment,
  LmsLearnerProgress,
  LmsLearningPath,
  LmsMentorImpact,
  LmsMentorshipSession,
  LmsOrganization,
  LmsOrgTrainingRequest,
  LmsQuiz,
  LmsQuizAttempt,
  LmsQuizQuestion,
  LmsSubject,
} from "@/types/elearning"

interface LmsState {
  courses: LmsCourse[]
  enrollments: LmsEnrollment[]
  quizzes: LmsQuiz[]
  quizAttempts: LmsQuizAttempt[]
  certificates: LmsCertificate[]
  progress: LmsLearnerProgress[]
  subjects: LmsSubject[]
  learningPaths: LmsLearningPath[]
  organization: LmsOrganization
  mentorshipSessions: LmsMentorshipSession[]
  mentorImpact: LmsMentorImpact
  chatMessages: LmsCourseChatMessage[]
  orgTrainingRequests: LmsOrgTrainingRequest[]
  followedTutors: string[]

  upsertCourse: (course: LmsCourse) => void
  followTutor: (tutorId: string) => void
  unfollowTutor: (tutorId: string) => void
  updateCourse: (id: string, data: Partial<LmsCourse>) => void
  addEnrollment: (enrollment: Omit<LmsEnrollment, "id" | "enrolledAt" | "progress">) => void
  enrollInPath: (pathId: string, learnerName: string, email: string) => void

  addQuiz: (quiz: Omit<LmsQuiz, "id" | "attempts" | "avgScore">) => string
  updateQuiz: (id: string, data: Partial<Omit<LmsQuiz, "id" | "attempts">>) => void
  submitQuizAttempt: (
    quizId: string,
    attempt: Omit<LmsQuizAttempt, "id" | "quizId" | "completedAt">
  ) => LmsQuizAttempt
  getQuizAttempts: (quizId: string, email: string) => LmsQuizAttempt[]
  gradeQuizAnswer: (question: LmsQuizQuestion, answer: string) => { correct: boolean; points: number }

  sendChatMessage: (
    msg: Omit<LmsCourseChatMessage, "id" | "sentAt">
  ) => void
  submitOrgTrainingRequest: (
    req: Omit<LmsOrgTrainingRequest, "id" | "status" | "submittedAt">
  ) => void

  addOrgEmployee: (employee: Omit<LmsOrganization["employees"][0], "id" | "progress" | "status">) => void
  assignOrgProgram: (program: Omit<LmsOrganization["assignedPrograms"][0], "id">) => void
  bookMentorshipSession: (session: Omit<LmsMentorshipSession, "id">) => void
}


function gradeQuestion(question: LmsQuizQuestion, answer: string): { correct: boolean; points: number } {
  const normalized = answer.trim().toLowerCase()
  const correct = (question.correctAnswer ?? "").trim().toLowerCase()

  if (question.type === "essay" || question.type === "video_response") {
    return { correct: normalized.length > 20, points: normalized.length > 20 ? question.points : 0 }
  }
  if (question.type === "short_answer") {
    const ok = normalized.includes(correct) || correct.includes(normalized)
    return { correct: ok, points: ok ? question.points : 0 }
  }
  if (question.type === "video_mcq") {
    const ok = normalized.startsWith(correct)
    return { correct: ok, points: ok ? question.points : 0 }
  }

  const ok = normalized === correct
  return { correct: ok, points: ok ? question.points : 0 }
}

const EMPTY_ORGANIZATION: LmsOrganization = {
  id: "",
  name: "",
  seats: 0,
  seatsUsed: 0,
  employees: [],
  assignedPrograms: [],
}

const EMPTY_MENTOR_IMPACT: LmsMentorImpact = {
  mentorId: "",
  menteeCount: 0,
  hoursCompleted: 0,
  sessionCount: 0,
  avgRating: 0,
  skillsTaught: [],
  countriesReached: [],
  successStories: [],
  reviews: [],
}

export const useLmsStore = create<LmsState>((set, get) => ({
  courses: [],
  enrollments: [],
  quizzes: [],
  quizAttempts: [],
  certificates: [],
  progress: [],
  subjects: [],
  learningPaths: [],
  organization: EMPTY_ORGANIZATION,
  mentorshipSessions: [],
  mentorImpact: EMPTY_MENTOR_IMPACT,
  chatMessages: [],
  orgTrainingRequests: [],
  followedTutors: [],

  upsertCourse: (course) => {
    const existing = get().courses.find((c) => c.id === course.id)
    if (existing) {
      const same =
        existing.title === course.title &&
        existing.description === course.description &&
        existing.status === course.status &&
        existing.price === course.price &&
        existing.isFree === course.isFree &&
        existing.enrolledCount === course.enrolledCount &&
        existing.lessonCount === course.lessonCount &&
        existing.instructor === course.instructor &&
        existing.gradeType === course.gradeType &&
        existing.scoreWeight === course.scoreWeight &&
        existing.introMediaUrl === course.introMediaUrl &&
        existing.category === course.category &&
        existing.subcategory === course.subcategory
      if (same) return
    }

    set((state) => ({
      courses: existing
        ? state.courses.map((c) =>
            c.id === course.id ? { ...c, ...course } : c
          )
        : [course, ...state.courses],
    }))
  },

  followTutor: (tutorId) =>
    set((state) => ({
      followedTutors: state.followedTutors.includes(tutorId)
        ? state.followedTutors
        : [...state.followedTutors, tutorId],
    })),

  unfollowTutor: (tutorId) =>
    set((state) => ({
      followedTutors: state.followedTutors.filter((id) => id !== tutorId),
    })),

  updateCourse: (id, data) =>
    set((state) => ({
      courses: state.courses.map((c) => (c.id === id ? { ...c, ...data } : c)),
    })),

  addEnrollment: (data) =>
    set((state) => ({
      enrollments: [
        {
          ...data,
          id: `enr-${Date.now()}`,
          enrolledAt: new Date().toISOString().split("T")[0],
          progress: 0,
        },
        ...state.enrollments,
      ],
    })),

  enrollInPath: (pathId, learnerName, email) => {
    const path = get().learningPaths.find((p) => p.id === pathId)
    if (!path) return
    for (const c of path.courses) {
      get().addEnrollment({
        learnerName,
        email,
        courseTitle: c.title,
        courseId: c.courseId,
        status: "active",
        cohort: path.title,
      })
    }
  },

  addQuiz: (data) => {
    const id = `quiz-${Date.now()}`
    set((state) => ({
      quizzes: [{ ...data, id, attempts: 0 }, ...state.quizzes],
    }))
    return id
  },

  updateQuiz: (id, data) =>
    set((state) => ({
      quizzes: state.quizzes.map((q) => (q.id === id ? { ...q, ...data } : q)),
    })),

  gradeQuizAnswer: (question, answer) => gradeQuestion(question, answer),

  getQuizAttempts: (quizId, email) =>
    get().quizAttempts.filter((a) => a.quizId === quizId && a.learnerEmail === email),

  submitQuizAttempt: (quizId, attempt) => {
    const quiz = get().quizzes.find((q) => q.id === quizId)
    const questions = quiz?.questionItems ?? []
    let earned = 0
    let total = 0
    for (const q of questions) {
      total += q.points
      const ans = attempt.answers[q.id] ?? ""
      earned += gradeQuestion(q, ans).points
    }
    const score = total > 0 ? Math.round((earned / total) * 100) : 0
    const passed = score >= (quiz?.passingScore ?? 0)
    const record: LmsQuizAttempt = {
      ...attempt,
      id: `qat-${Date.now()}`,
      quizId,
      score,
      passed,
      completedAt: new Date().toISOString(),
    }
    set((state) => ({
      quizAttempts: [record, ...state.quizAttempts],
      quizzes: state.quizzes.map((q) =>
        q.id === quizId ? { ...q, attempts: q.attempts + 1, avgScore: score } : q
      ),
    }))
    return record
  },

  addOrgEmployee: (employee) =>
    set((state) => ({
      organization: {
        ...state.organization,
        seatsUsed: state.organization.seatsUsed + 1,
        employees: [
          {
            ...employee,
            id: `emp-${Date.now()}`,
            progress: 0,
            status: "invited",
          },
          ...state.organization.employees,
        ],
      },
    })),

  assignOrgProgram: (program) =>
    set((state) => ({
      organization: {
        ...state.organization,
        assignedPrograms: [
          { ...program, id: `prog-${Date.now()}` },
          ...state.organization.assignedPrograms,
        ],
      },
    })),

  bookMentorshipSession: (session) =>
    set((state) => ({
      mentorshipSessions: [{ ...session, id: `mentor-${Date.now()}` }, ...state.mentorshipSessions],
    })),

  sendChatMessage: (msg) =>
    set((state) => ({
      chatMessages: [
        {
          ...msg,
          id: `chat-${Date.now()}`,
          sentAt: new Date().toLocaleString(),
        },
        ...state.chatMessages,
      ],
    })),

  submitOrgTrainingRequest: (req) =>
    set((state) => ({
      orgTrainingRequests: [
        {
          ...req,
          id: `org-req-${Date.now()}`,
          status: "pending",
          submittedAt: new Date().toISOString().split("T")[0],
        },
        ...state.orgTrainingRequests,
      ],
    })),

}))
