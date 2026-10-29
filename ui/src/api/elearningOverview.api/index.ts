import apiClient from "../api"
import { normalizeResponse } from "@/utils/apiResponse"
import type { ResultI } from "@/api/liveClass.api/types"
import type { GetTimetableByWeekResponseI } from "@/api/timetable.api/types"

export interface ELearningTeacherSummaryI {
  subUserId: string
  userId: string
  name: string
  email: string
  status: string
  courseCount: number
}

export interface ELearningTodayClassI {
  timetableId: string
  subjectId: string
  subjectName: string
  classId: string
  className: string
  teacherName: string
  startTime: string
  endTime: string
  classMode: string
  venue: string
  status: string
  liveClassId?: string | null
}

export interface ELearningOverviewI {
  viewerRole: "Owner" | "Teacher"
  isOwner: boolean
  totalCourses: number
  liveCoursesCurrentTerm: number
  upcomingClassesThisWeek: number
  schoolDate: string
  todayClasses: ELearningTodayClassI[]
  teachers: ELearningTeacherSummaryI[]
}

export interface GetELearningOverviewParamsI {
  schoolId: string
  schoolSessionId: string
  schoolSessionTermId: string
}

export interface GetELearningTeacherTimetableWeekParamsI {
  schoolId: string
  teacherSubUserId: string
  schoolSessionId: string
  schoolSessionTermId: string
  timetableType: number
  weekStartDate?: string
}

export async function getELearningOverviewApi(
  params: GetELearningOverviewParamsI
): Promise<ResultI<ELearningOverviewI>> {
  const res = await apiClient.get("/ELearning/Overview", { params })
  return normalizeResponse<ResultI<ELearningOverviewI>>(res)
}

export async function getELearningTeacherTimetableWeekApi(
  params: GetELearningTeacherTimetableWeekParamsI
): Promise<GetTimetableByWeekResponseI> {
  const { schoolId, teacherSubUserId, ...query } = params
  const res = await apiClient.get(
    `/TeacherPortal/Teachers/${encodeURIComponent(teacherSubUserId)}/Timetable/Week/${schoolId}`,
    { params: query }
  )
  return normalizeResponse<GetTimetableByWeekResponseI>(res)
}
