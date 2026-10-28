export const LIFELAB_PRODUCT_SLUG = "lifelab"
export const LifeLabRoutes = {
  landing: "/lifelab",
  social: "/lifelab/life",
  hub: "/lifelab/hub",
  play: "/lifelab/play",
  home: "/lifelab/home/:attemptId",
  london: "/lifelab/london/:saveId",
  school: "/lifelab/schools/:schoolId",
  teacher: "/dashboard/:productId/lifelab",
  student: "/student-home/:schoolId/lifelab",
  toRoom: (roomId: string) => `/lifelab/play?roomId=${encodeURIComponent(roomId)}`,
  toPlay: (sessionId: string) => `/lifelab/play?sessionId=${encodeURIComponent(sessionId)}`,
  toHome: (attemptId: string) => `/lifelab/home/${encodeURIComponent(attemptId)}`,
  toLondon: (saveId: string) => `/lifelab/london/${encodeURIComponent(saveId)}`,
  toSchool: (schoolId: string) => `/lifelab/schools/${encodeURIComponent(schoolId)}`,
} as const
