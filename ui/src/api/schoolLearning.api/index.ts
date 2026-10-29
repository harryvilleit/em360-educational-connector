import { elearningApiClient } from "../api"
import { normalizeResponse, type ApiResultI } from "@/utils/apiResponse"

export type SchoolAudienceType = "Student" | "Staff" | "Parent"

export interface TutorJobApplication {
  id: string
  tutorId: string
  tutorName: string
  coverLetter: string
  cvUrl: string
  portfolioUrl?: string | null
  youtubeIntroUrl?: string | null
  proposedRateAmount: number
  availableHoursPerWeek: number
  availableFromUtc: string
  relevantExperience?: string | null
  status: "Submitted" | "Shortlisted" | "Accepted" | "Rejected" | "Withdrawn"
  dateCreatedUtc: string
}

export interface TutorJobRequest {
  id: string
  schoolId: string
  schoolName: string
  title: string
  description: string
  paymentStructure: "Hourly" | "Monthly"
  rateAmount: number
  currency: string
  expectedHoursPerWeek: number
  maximumTotalHours?: number | null
  workMode: "FullyRemote" | "Hybrid"
  hybridLocation?: string | null
  startDateUtc: string
  endDateUtc?: string | null
  minimumExperienceYears?: number | null
  requiredQualifications?: string | null
  status: "Draft" | "Open" | "Filled" | "Closed"
  dateCreatedUtc: string
  applications: TutorJobApplication[]
}
export interface TutorPayPeriod { id:string; periodStartUtc:string; periodEndUtc:string; payDayUtc:string; expectedGrossAmount:number; submittedHours?:number|null; approvedGrossAmount?:number|null; workReport?:string|null; schoolFeedback?:string|null; status:"AwaitingFunding"|"Funded"|"Submitted"|"Approved"|"Released"|"RevisionRequested"; checkoutUrl?:string|null }
export interface TutorContract { id:string; schoolId:string; schoolName:string; tutorId:string; tutorName:string; title:string; rateType:"Hourly"|"Monthly"; paymentFrequency:"Weekly"|"Monthly"; rateAmount:number; expectedHoursPerWeek:number; currency:string; weeklyPayDay?:number|null; monthlyPayDay?:number|null; startDateUtc:string; endDateUtc?:string|null; status:string; tutorAcceptedAtUtc?:string|null; payPeriods:TutorPayPeriod[] }

export interface SchoolDirectoryMember {
  userId: string
  sourceMemberId: string
  displayName: string
  email: string
  audienceType: SchoolAudienceType
  classId?: string | null
  className?: string | null
}

export interface SchoolDirectory {
  schoolId: string
  schoolName: string
  currency: string
  students: SchoolDirectoryMember[]
  staff: SchoolDirectoryMember[]
  parents: SchoolDirectoryMember[]
  classes: Record<string, string>
}

export interface SchoolCourseRequest {
  id: string
  schoolId: string
  schoolName: string
  title: string
  description?: string | null
  topics: string
  startDateUtc: string
  endDateUtc: string
  minimumBudget: number
  maximumBudget: number
  currency: string
  requiredDepositAmount: number
  fundedAmount: number
  remainingFundingAmount: number
  curriculumMaterialUrl?: string | null
  curriculumMaterialName?: string | null
  fundingOrderId?: string | null
  checkoutUrl?: string | null
  applications: SchoolCourseApplication[]
  status: "AwaitingDeposit" | "Open" | "TutorSelected" | "AwaitingFullFunding" | "InProgress" | "Completed" | "Archived"
  dateCreatedUtc: string
}

export interface SchoolCourseApplication {
  id: string
  tutorId: string
  tutorName: string
  description: string
  cvUrl: string
  youtubeIntroUrl?: string | null
  proposedAmount: number
  tutorShare: number
  platformShare: number
  paymentStructure: "OneOff" | "Milestone"
  status: "Submitted" | "Accepted" | "Rejected" | "Withdrawn"
  linkedCourseId?: string | null
  linkedCourseTitle?: string | null
  milestones: Array<{ id: string; title: string; description?: string | null; amount: number; status: string; dueDateUtc?: string | null; submissionNote?: string | null; submittedAtUtc?: string | null; revisionNote?: string | null; revisionRequestedAtUtc?: string | null }>
}

export interface SchoolTutorInvitation {
  id: string
  schoolId: string
  schoolName: string
  tutorId: string
  tutorName: string
  tutorEmail: string
  courseId?: string | null
  courseTitle?: string | null
  schoolCourseRequestId?: string | null
  status: "Pending" | "Accepted" | "Declined" | "Revoked"
  message?: string | null
  dateCreatedUtc: string
}

export interface SchoolCourseOffering {
  id: string
  isOwner: boolean
  schoolId: string
  schoolName: string
  courseId: string
  courseTitle: string
  schoolCourseRequestId?: string | null
  schoolCourseRequestTitle?: string | null
  tutorId: string
  tutorName: string
  origin: "SchoolInvitation" | "TutorAssignment"
  status: "Draft" | "PendingApproval" | "Approved" | "Active" | "Archived"
  audienceSummary: string
  listUnitPrice: number
  discountPercent: number
  unitPrice: number
  seatCount: number
  totalAmount: number
  currency: string
  dateCreatedUtc: string
}

export interface SchoolCourseOrder {
  id: string
  offeringId: string
  courseTitle: string
  tutorName: string
  quantity: number
  listUnitPrice: number
  discountPercent: number
  unitPrice: number
  totalAmount: number
  currency: string
  status: string
  checkoutUrl?: string | null
  dateCreatedUtc: string
  paidAtUtc?: string | null
}

export interface SchoolCourseLearnerProgress {
  userId: string
  learnerName: string
  audienceType: SchoolAudienceType
  className?: string | null
  completedLessons: number
  totalLessons: number
  progressPercent: number
  completedAssessments: number
  totalAssessments: number
  averageScore?: number | null
  lastActiveAtUtc?: string | null
}

export interface SchoolCourseProgress {
  offeringId: string
  courseId: string
  courseTitle: string
  tutorName: string
  assignedUsers: number
  startedUsers: number
  completedUsers: number
  averageProgressPercent: number
  learners: SchoolCourseLearnerProgress[]
}

export interface SchoolLearningHub {
  schoolId: string
  schoolName: string
  currency: string
  courseRequests: SchoolCourseRequest[]
  invitations: SchoolTutorInvitation[]
  offerings: SchoolCourseOffering[]
  orders: SchoolCourseOrder[]
  progress: SchoolCourseProgress[]
}

interface ValueResult<T> extends ApiResultI { value: T }
export const getSchoolTutorContractsApi=async(schoolId:string)=>normalizeResponse<ValueResult<TutorContract[]>>(await elearningApiClient.get(`/school-learning/schools/${encodeURIComponent(schoolId)}/tutor-contracts`))
export const getMyTutorContractsApi=async()=>normalizeResponse<ValueResult<TutorContract[]>>(await elearningApiClient.get("/school-learning/tutor/contracts"))
export const createTutorContractApi=async(schoolId:string,payload:Record<string,unknown>)=>normalizeResponse<ValueResult<TutorContract>>(await elearningApiClient.post(`/school-learning/schools/${encodeURIComponent(schoolId)}/tutor-contracts`,payload))
export const acceptTutorContractApi=async(id:string)=>normalizeResponse<ValueResult<TutorContract>>(await elearningApiClient.patch(`/school-learning/tutor/contracts/${id}/accept`))
export const fundTutorContractApi=async(schoolId:string,id:string)=>normalizeResponse<ValueResult<TutorContract>>(await elearningApiClient.post(`/school-learning/schools/${schoolId}/tutor-contracts/${id}/fund`))
export const submitTutorWorkApi=async(id:string,periodId:string,payload:{hoursWorked?:number;workReport:string})=>normalizeResponse<ValueResult<TutorContract>>(await elearningApiClient.post(`/school-learning/tutor/contracts/${id}/periods/${periodId}/submit`,payload))
export const reviewTutorWorkApi=async(schoolId:string,id:string,periodId:string,payload:{approve:boolean;approvedHours?:number;feedback?:string})=>normalizeResponse<ValueResult<TutorContract>>(await elearningApiClient.post(`/school-learning/schools/${schoolId}/tutor-contracts/${id}/periods/${periodId}/review`,payload))

export async function getPublicTutorJobsApi() {
  const res = await elearningApiClient.get("/school-learning/tutor-jobs/public")
  return normalizeResponse<ValueResult<TutorJobRequest[]>>(res)
}

export async function getSchoolTutorJobsApi(schoolId: string) {
  const res = await elearningApiClient.get(`/school-learning/schools/${encodeURIComponent(schoolId)}/tutor-jobs`)
  return normalizeResponse<ValueResult<TutorJobRequest[]>>(res)
}

export async function createTutorJobApi(schoolId: string, payload: Omit<TutorJobRequest, "id" | "schoolId" | "schoolName" | "status" | "dateCreatedUtc" | "applications">) {
  const res = await elearningApiClient.post(`/school-learning/schools/${encodeURIComponent(schoolId)}/tutor-jobs`, payload)
  return normalizeResponse<ValueResult<TutorJobRequest>>(res)
}

export async function applyForTutorJobApi(jobId: string, payload: { coverLetter: string; cvUrl: string; portfolioUrl?: string; youtubeIntroUrl?: string; proposedRateAmount: number; availableHoursPerWeek: number; availableFromUtc: string; relevantExperience?: string }) {
  const res = await elearningApiClient.post(`/school-learning/tutor-jobs/${encodeURIComponent(jobId)}/applications`, payload)
  return normalizeResponse<ValueResult<TutorJobApplication>>(res)
}

export async function selectTutorJobApplicationApi(schoolId: string, jobId: string, applicationId: string) {
  const res = await elearningApiClient.patch(`/school-learning/schools/${encodeURIComponent(schoolId)}/tutor-jobs/${encodeURIComponent(jobId)}/applications/${encodeURIComponent(applicationId)}/select`)
  return normalizeResponse<ValueResult<TutorJobRequest>>(res)
}

export async function closeTutorJobApi(schoolId: string, jobId: string) {
  const res = await elearningApiClient.patch(`/school-learning/schools/${encodeURIComponent(schoolId)}/tutor-jobs/${encodeURIComponent(jobId)}/close`)
  return normalizeResponse<ValueResult<TutorJobRequest>>(res)
}

export async function getSchoolLearningHubApi(schoolId: string) {
  const res = await elearningApiClient.get(
    `/school-learning/schools/${encodeURIComponent(schoolId)}`
  )
  return normalizeResponse<ValueResult<SchoolLearningHub>>(res)
}

export async function getSchoolDirectoryApi(schoolId: string) {
  const res = await elearningApiClient.get(
    `/school-learning/schools/${encodeURIComponent(schoolId)}/directory`
  )
  return normalizeResponse<ValueResult<SchoolDirectory>>(res)
}

export async function inviteSchoolTutorApi(
  schoolId: string,
  payload: { tutorEmail: string; schoolCourseRequestId?: string; courseId?: string; message?: string }
) {
  const res = await elearningApiClient.post(
    `/school-learning/schools/${encodeURIComponent(schoolId)}/invitations`,
    payload
  )
  return normalizeResponse<ValueResult<SchoolTutorInvitation>>(res)
}

export async function createSchoolCourseRequestApi(
  schoolId: string,
  payload: { title: string; description?: string; topics: string; startDateUtc: string; endDateUtc: string; minimumBudget: number; maximumBudget: number; currency: string; curriculumMaterialUrl?: string; curriculumMaterialName?: string }
) {
  const res = await elearningApiClient.post(
    `/school-learning/schools/${encodeURIComponent(schoolId)}/course-requests`,
    payload
  )
  return normalizeResponse<ValueResult<SchoolCourseRequest>>(res)
}

export async function acceptSchoolCourseApplicationApi(schoolId: string, requestId: string, applicationId: string) {
  const res = await elearningApiClient.patch(`/school-learning/schools/${encodeURIComponent(schoolId)}/course-requests/${encodeURIComponent(requestId)}/applications/${encodeURIComponent(applicationId)}/accept`)
  return normalizeResponse<ValueResult<SchoolCourseRequest>>(res)
}

export async function initializeCourseRequestBalanceApi(schoolId: string, requestId: string) {
  const res = await elearningApiClient.post(`/school-learning/schools/${encodeURIComponent(schoolId)}/course-requests/${encodeURIComponent(requestId)}/fund-balance`)
  return normalizeResponse<ValueResult<SchoolCourseRequest>>(res)
}

export async function getPublicSchoolCourseRequestsApi() {
  const res = await elearningApiClient.get("/school-learning/course-requests/public")
  return normalizeResponse<ValueResult<SchoolCourseRequest[]>>(res)
}

export async function applyForSchoolCourseRequestApi(requestId: string, payload: { description: string; cvUrl: string; youtubeIntroUrl?: string; proposedAmount: number; paymentStructure: "OneOff" | "Milestone"; milestones: Array<{ title: string; description?: string; amount: number; dueDateUtc?: string }> }) {
  const res = await elearningApiClient.post(`/school-learning/course-requests/${encodeURIComponent(requestId)}/applications`, payload)
  return normalizeResponse<ValueResult<SchoolCourseApplication>>(res)
}

export async function getMyCourseRequestDeliveriesApi() {
  const res = await elearningApiClient.get("/school-learning/tutor/course-request-deliveries")
  return normalizeResponse<ValueResult<SchoolCourseRequest[]>>(res)
}

export async function linkCourseRequestDeliveryApi(requestId: string, courseId: string) {
  const res = await elearningApiClient.put(`/school-learning/tutor/course-request-deliveries/${encodeURIComponent(requestId)}/course`, { courseId })
  return normalizeResponse<ValueResult<SchoolCourseRequest>>(res)
}

export async function submitCourseRequestMilestoneApi(requestId: string, milestoneId: string, submissionNote?: string) {
  const res = await elearningApiClient.post(`/school-learning/tutor/course-request-deliveries/${encodeURIComponent(requestId)}/milestones/${encodeURIComponent(milestoneId)}/submit`, { submissionNote })
  return normalizeResponse<ValueResult<SchoolCourseRequest>>(res)
}

export async function reviewCourseRequestMilestoneApi(schoolId: string, requestId: string, milestoneId: string, approve: boolean, feedback?: string) {
  const res = await elearningApiClient.post(`/school-learning/schools/${encodeURIComponent(schoolId)}/course-requests/${encodeURIComponent(requestId)}/milestones/${encodeURIComponent(milestoneId)}/review`, { approve, feedback })
  return normalizeResponse<ValueResult<SchoolCourseRequest>>(res)
}

export async function revokeSchoolTutorInvitationApi(schoolId: string, id: string) {
  const res = await elearningApiClient.delete(
    `/school-learning/schools/${encodeURIComponent(schoolId)}/invitations/${encodeURIComponent(id)}`
  )
  return normalizeResponse<ApiResultI>(res)
}

export async function getMySchoolTutorInvitationsApi() {
  const res = await elearningApiClient.get("/school-learning/tutor/invitations")
  return normalizeResponse<ValueResult<SchoolTutorInvitation[]>>(res)
}

export async function respondToSchoolTutorInvitationApi(id: string, accept: boolean) {
  const res = await elearningApiClient.patch(
    `/school-learning/tutor/invitations/${encodeURIComponent(id)}`,
    { accept }
  )
  return normalizeResponse<ValueResult<SchoolTutorInvitation>>(res)
}

export async function createSchoolCourseOfferingApi(payload: {
  schoolId: string
  courseId: string
  tutorId?: string
  invitationId?: string
}) {
  const res = await elearningApiClient.post("/school-learning/offerings", payload)
  return normalizeResponse<ValueResult<SchoolCourseOffering>>(res)
}

export async function approveSchoolCourseOfferingApi(schoolId: string, id: string) {
  const res = await elearningApiClient.patch(
    `/school-learning/schools/${encodeURIComponent(schoolId)}/offerings/${encodeURIComponent(id)}/approve`
  )
  return normalizeResponse<ValueResult<SchoolCourseOffering>>(res)
}

export async function setSchoolCourseAudienceApi(
  schoolId: string,
  id: string,
  selections: Array<{
    audienceType: SchoolAudienceType
    scope: "All" | "Class" | "Selected"
    classId?: string
    userIds?: string[]
  }>
) {
  const res = await elearningApiClient.put(
    `/school-learning/schools/${encodeURIComponent(schoolId)}/offerings/${encodeURIComponent(id)}/audience`,
    { selections }
  )
  return normalizeResponse<ValueResult<SchoolCourseOffering>>(res)
}

export async function initializeSchoolCourseCheckoutApi(schoolId: string, id: string) {
  const res = await elearningApiClient.post(
    `/school-learning/schools/${encodeURIComponent(schoolId)}/offerings/${encodeURIComponent(id)}/checkout`
  )
  return normalizeResponse<ValueResult<SchoolCourseOrder>>(res)
}

export async function setLessonProgressApi(courseId: string, lessonId: string, completed: boolean) {
  const res = await elearningApiClient.put("/school-learning/progress/lesson", {
    courseId,
    lessonId,
    completed,
  })
  return normalizeResponse<ApiResultI>(res)
}
