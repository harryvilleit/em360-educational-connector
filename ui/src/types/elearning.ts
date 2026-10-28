export type ClassSessionStatus = "upcoming" | "live" | "ended"
export interface LiveClassGuestAccess {
  token: string
  enabled: boolean
  expiresAt?: string
  maxUses?: number
  uses: number
  createdBy: string
  createdAt: string
}

export interface LiveClassSession {
  id: string
  title: string
  subject?: string
  className?: string
  classId?: string
  term?: string
  courseId?: string
  courseTitle?: string
  timetableSlotId?: string
  teacherName: string
  teacherId?: string
  canStart?: boolean
  canSpectate?: boolean
  yourRole?: "Host" | "CoHost" | "Participant"
  coTeacherIds?: string[]
  guestAccess?: LiveClassGuestAccess
  scheduledDate: string
  startTime: string
  endTime: string
  status: ClassSessionStatus
  lmsStatus?: "Scheduled" | "Live" | "Ended" | "Cancelled"
  participantCount: number
  paidEnrollmentCount?: number
  pendingRefundCount?: number
  maxParticipants: number
  agoraChannelId: string
  mediaProvider?: "Agora" | "CloudflareStream"
  recordingUrl?: string
  isPaid?: boolean
  price?: number
  currency?: string
  accessType?: "private" | "public"
  targetLearnerIds?: string[]
  targetGroup?: string
  description?: string
  coverImageUrl?: string
  publicCode?: string
  publicUrl?: string
  scheduledStartUtc?: string
  scheduledEndUtc?: string
  targetEnrollmentFromUtc?: string
  targetEnrollmentToUtc?: string
  isEnrolled?: boolean
  isHost?: boolean
  hasPaid?: boolean
  canJoin?: boolean
  canEdit?: boolean
  canDelete?: boolean
}

export interface ClassMaterial {
  id: string
  title: string
  subject?: string
  className?: string
  courseId?: string
  lessonId?: string
  type: "pdf" | "video" | "link" | "document"
  uploadedBy: string
  uploadedAt: string
  fileSize?: string
  url?: string
}

export interface ELearningAssignment {
  id: string
  title: string
  subject: string
  className: string
  courseId?: string
  dueDate: string
  status: "draft" | "approved" | "closed" | "open" | "graded"
  submissions: number
  totalStudents: number
  description: string
  assignmentType?: "objective" | "voice" | "visual"
  answerMode?:
    | "single_choice"
    | "multiple_choice"
    | "written"
    | "voice"
    | "visual"
  submissionMethod?: "student_online" | "teacher_paper" | "hybrid"
  workType?: "not_applicable" | "handwritten" | "map" | "diagram" | "mixed"
  languageCode?: string
  curriculumStandard?: string
  educationLevel?: string
  countryCode?: string
  schoolSessionId?: string
  schoolSessionTermId?: string
  assessmentComponentId?: string
  assessmentComponentName?: string
  assessmentComponentWeight?: number
  gradebookContributionPoints?: number
  durationMinutes?: number
  allowVideoRecording?: boolean
  maxRetakes?: number
  endAttemptOnTabLeave?: boolean
  disableCopyPaste?: boolean
  sourceDocumentName?: string
  sourceDocumentUrl?: string
  questions?: ELearningCbtQuestion[]
}

export interface ELearningAssignmentSnapshot {
  id: string
  fileUrl: string
  capturedAtUtc: string
}

export interface ELearningAssignmentAnswer {
  id: string
  questionId: string
  prompt: string
  answerMode:
    | "single_choice"
    | "multiple_choice"
    | "written"
    | "voice"
    | "visual"
  selectedOptionIds: string[]
  textAnswer?: string
  voiceAnswerUrl?: string
  voiceTranscript?: string
  transcriptionStatus?: "processing" | "completed" | "failed" | "not_configured"
  transcriptionError?: string
  transcriptionModel?: string
  transcribedAtUtc?: string
  awardedPoints?: number
  aiSuggestedPoints?: number
  aiConfidence?: number
  aiFeedback?: string
  aiModel?: string
  aiMarkedAtUtc?: string
  teacherFeedback?: string
  visualPages: ELearningVisualPage[]
}

export interface ELearningVisualPage {
  id: string
  fileUrl: string
  originalFileName: string
  contentType: string
  pageNumber: number
}

export interface ELearningAssignmentAttempt {
  id: string
  attemptNumber: number
  status: "in_progress" | "submitted" | "ended"
  startedAtUtc: string
  endedAtUtc?: string
  submittedAtUtc?: string
  endedReason?: string
  objectiveScore?: number
  finalScore?: number
  reopenGranted: boolean
  submissionSource: "student_online" | "teacher_paper"
  paperSubmissionId?: string
  uploadedByUserId?: string
  paperPages: ELearningVisualPage[]
  answers: ELearningAssignmentAnswer[]
  snapshots: ELearningAssignmentSnapshot[]
}

export interface ELearningAssignmentStudentSubmission {
  studentId: string
  studentName: string
  email: string
  studentIdentifier: string
  status: "not_started" | "in_progress" | "submitted" | "ended" | "reopened"
  attemptCount: number
  latestAttempt?: ELearningAssignmentAttempt
  attempts: ELearningAssignmentAttempt[]
}

export interface ELearningCbtOption {
  id?: string
  text: string
  isCorrect: boolean
}

export interface ELearningCbtQuestion {
  id?: string
  prompt: string
  referenceAnswer?: string
  points: number
  rubricCriteria?: ELearningRubricCriterion[]
  options: ELearningCbtOption[]
}

export interface ELearningRubricCriterion {
  name: string
  description?: string
  points: number
}

export interface ClassRecording {
  id: string
  sessionId: string
  title: string
  subject?: string
  className?: string
  courseId?: string
  teacherName: string
  recordedAt: string
  duration: string
  views: number
  thumbnailUrl?: string
  videoUrl: string
}
export interface SchoolSubjectCourse {
  id: string
  subjectId?: string
  subject: string
  className: string
  classId?: string
  teacherName: string
  description: string
  studentCount: number
  thumbnailColor: string
  terms?: string[]
}

export type LmsCourseLevel = "beginner" | "intermediate" | "advanced"
export type LmsGradeType = string

export interface LmsCategoryTopic {
  id: string
  name: string
}

export interface LmsCategorySubcategory {
  id: string
  name: string
  topics: LmsCategoryTopic[]
}

export interface LmsCategory {
  id: string
  name: string
  subcategories: LmsCategorySubcategory[]
}

export type LmsCourseBadge = "bestseller" | "premium" | "new"

export interface LmsCourse {
  id: string
  title: string
  description: string
  subtitle?: string
  instructor: string
  categoryId: string
  category: string
  subcategoryId?: string
  subcategory?: string
  topicId?: string
  topic?: string
  levels: LmsCourseLevel[]
  level?: LmsCourseLevel
  status: "draft" | "published" | "archived"
  isDeleted?: boolean
  deletedAtUtc?: string
  enrolledCount: number
  lessonCount: number
  duration: string
  thumbnailColor: string
  thumbnailUrl?: string
  progress?: number
  version?: number
  parentCourseId?: string
  isFree: boolean
  price?: number
  originalPrice?: number
  currency?: string
  gradeType: LmsGradeType
  scoreWeight: number
  passScorePercent?: number
  rating?: number
  ratingCount?: number
  badge?: LmsCourseBadge
  lastUpdated?: string
  language?: string
  captions?: string[]
  whatYouLearn?: string[]
  requirements?: string[]
  includes?: string[]
  relatedCourseIds?: string[]
  isTrending?: boolean
  introMediaUrl?: string
  introMediaType?: "image" | "video"
  introMediaFileName?: string
  tutorId?: string
  isOwner?: boolean
}

export type CourseCardProps = {
  course: LmsCourse
  onClick?: () => void
  onEdit?: () => void
  onOpenCurriculum?: () => void
  onManageCoupons?: () => void
  onPublish?: () => void
  onArchive?: () => void
  onDelete?: () => void
  onRestore?: () => void
  isActionPending?: boolean
  showActions?: boolean
  progress?: number
  completedLessons?: number
  totalLessons?: number
}

export type LmsRole = "tutor" | "student"

export type LmsLessonType =
  | "video"
  | "document"
  | "article"
  | "quiz"
  | "assignment"
  | "live"

export type LmsAssignmentType =
  | "cbt"
  | "paper"
  | "voice"
  | "written"
  | "handwritten"
  | "file_upload"
  | "video_response"
  | "video_mcq"

export type LmsQuestionType =
  | "mcq"
  | "true_false"
  | "fill_blank"
  | "short_answer"
  | "essay"
  | "matching"
  | "video_response"
  | "video_mcq"

export interface LmsCourseModule {
  id: string
  courseId: string
  title: string
  order: number
  lessons: LmsLesson[]
}

export interface LmsVideoChapter {
  id: string
  title: string
  startSeconds: number
}

export interface LmsLessonMaterial {
  id: string
  title: string
  type: "pdf" | "video" | "link" | "document"
  url?: string
  fileName?: string
  fileSize?: string
  fileSizeBytes?: number
  contentType?: string
}

export type LmsLessonMediaPreviewKind =
  | "embed"
  | "pdf"
  | "document"
  | "video"
  | "image"
  | "link"

export interface LmsLessonMediaPreview {
  title: string
  url: string
  kind?: LmsLessonMediaPreviewKind
  fileName?: string
}

export type LmsExpandStateMap = Record<string, boolean>

export interface LmsLesson {
  id: string
  moduleId: string
  courseId: string
  title: string
  type: LmsLessonType
  duration: string
  durationMinutes?: number
  order: number
  description?: string
  htmlContent?: string
  embedUrl?: string
  contentUrl?: string
  videoUploadId?: string
  videoUploadStatus?: "Uploading" | "Processing" | "Ready" | "Failed"
  videoUploadSizeBytes?: number
  materialUrl?: string
  materials?: LmsLessonMaterial[]
  videoFileName?: string
  videoChapters?: LmsVideoChapter[]
  assignmentType?: LmsAssignmentType
  assignmentId?: string
  quizId?: string
  liveSessionId?: string
  completed?: boolean
  isPreview?: boolean
  scoreWeight?: number
}

export interface CourseCurriculumProps {
  modules: LmsCourseModule[]
  isTutor: boolean
  onLessonClick: (lesson: LmsLesson) => void
  onViewLesson?: (lesson: LmsLesson) => void
  onEditLesson?: (lesson: LmsLesson) => void
  onDeleteLesson?: (lesson: LmsLesson) => void
  onMoveLesson?: (
    module: LmsCourseModule,
    lessonIndex: number,
    direction: -1 | 1
  ) => void
  onViewCourse?: () => void
  onAddModule?: () => void
  onEditModule?: (module: LmsCourseModule) => void
  onDeleteModule?: (module: LmsCourseModule) => void
  onAddLesson?: (moduleId: string) => void
  canDeleteCurriculum?: boolean
  deleteDisabledReason?: string
}

export interface LmsAssignmentQuestion {
  id: string
  text: string
  type: LmsQuestionType | "voice" | "written"
  options?: string[]
  correctAnswer?: string
  pairs?: { left: string; right: string }[]
  explanation?: string
  videoPrompt?: string
  points?: number
  tutorVoicePromptUrl?: string
  voicePromptFileName?: string
  durationMinutes?: number
}

export interface LmsAssignment {
  id: string
  title: string
  courseId: string
  courseTitle: string
  lessonId?: string
  type: LmsAssignmentType
  description: string
  dueDate: string
  startDate?: string
  endDate?: string
  durationMinutes?: number
  status: "draft" | "open" | "closed" | "graded"
  questionFileUrl?: string
  questionFileName?: string
  tutorVoicePromptUrl?: string
  tutorVideoNoteUrl?: string
  requireStudentVideo?: boolean
  requireCameraRecording?: boolean
  gradeType?: LmsGradeType
  maxScore?: number
  weightPercent?: number
  questions?: LmsAssignmentQuestion[]
  submissions: LmsSubmission[]
  totalStudents: number
  createdBy: string
  voiceTimerMode?: "total" | "per_question"
  requireVoiceResponse?: boolean
}

export interface LmsSubmission {
  id: string
  assignmentId: string
  studentName: string
  studentEmail: string
  submittedAt: string
  type: LmsAssignmentType
  status: "submitted" | "pending_approval" | "graded" | "resubmit_requested"
  score?: number
  suggestedScore?: number
  weightedScore?: number
  feedback?: string
  privateNotes?: string
  gradingMethod?: string
  approvedAt?: string
  pdfUrl?: string
  voiceUrl?: string
  voiceAnswers?: Record<string, string>
  videoUrl?: string
  imageUrls?: string[]
  cbtAnswers?: Record<string, string>
  questionVideos?: Record<string, string>
  writtenAnswer?: string
  fileName?: string
  tutorAnnotations?: string
}

export interface LmsEnrollment {
  id: string
  learnerName: string
  email: string
  courseTitle: string
  courseId: string
  enrolledAt: string
  progress: number
  status: "active" | "completed" | "dropped"
  cohort?: string
  completedLessons?: number
  totalLessons?: number
  lastStudiedAt?: string
}

export interface LmsQuiz {
  id: string
  title: string
  courseTitle: string
  courseId?: string
  questions: number
  duration: number
  passingScore: number
  attempts: number
  maxAttempts?: number
  randomizeQuestions?: boolean
  status: "draft" | "published"
  avgScore?: number
  questionItems?: LmsQuizQuestion[]
}

export interface LmsQuizQuestion {
  id: string
  quizId: string
  text: string
  type: LmsQuestionType
  points: number
  options?: string[]
  correctAnswer?: string
  pairs?: { left: string; right: string }[]
  explanation?: string
  videoPrompt?: string
}

export interface LmsQuizAttempt {
  id: string
  quizId: string
  learnerName: string
  learnerEmail: string
  score: number
  passed: boolean
  answers: Record<string, string>
  startedAt: string
  completedAt: string
  attemptNumber: number
}

export interface LmsCertificate {
  id: string
  learnerName: string
  courseTitle: string
  issuedAt: string
  certificateNumber: string
  status: "issued" | "pending" | "revoked"
}

export interface LmsLearnerProgress {
  id: string
  learnerName: string
  courseTitle: string
  completedLessons: number
  totalLessons: number
  progress: number
  lastActive: string
  timeSpent: string
}

export interface TutorAvailabilitySlot {
  id: string
  date: string
  startTime: string
  endTime: string
  booked: boolean
}

export interface LmsTutor {
  id: string
  name: string
  title: string
  avatarColor: string
  subjects: string[]
  rating: number
  reviewCount: number
  sessionsCompleted: number
  hourlyRate: number
  currency: string
  bio: string
  languages: string[]
  experience: string
  availability: TutorAvailabilitySlot[]
  country?: string
  verified?: boolean
  introVideoUrl?: string
  qualifications?: string[]
  certifications?: string[]
  teachingLevels?: string[]
  studentCount?: number
  completionRate?: number
  avgResponseTime?: string
  isOnline?: boolean
  scheduleTags?: ("weekend" | "weekday" | "evening")[]
  isFree?: boolean
  publishedCourses?: LmsTutorPublishedCourse[]
  reviews?: LmsTutorReview[]
}

export interface LmsTutorPublishedCourse {
  courseId: string
  title: string
}

export interface LmsTutorReview {
  author: string
  rating: number
  text: string
  date: string
}

export interface LmsSubjectTopic {
  id: string
  name: string
  lessonCount: number
  hasCbt: boolean
  hasPastQuestions: boolean
  hasLiveRevision: boolean
}

export interface LmsSubject {
  id: string
  name: string
  examBoards: string[]
  level: "primary" | "secondary" | "examination"
  topicCount: number
  lessonCount: number
  cbtCount: number
  description: string
  topics: LmsSubjectTopic[]
}

export interface LmsLearningPath {
  id: string
  title: string
  description: string
  career: string
  courseCount: number
  duration: string
  level: "beginner" | "intermediate" | "advanced"
  milestones: string[]
  hasCapstone: boolean
  hasMentorSessions: boolean
  courses: { courseId: string; title: string; order: number }[]
  enrolledCount: number
}

export interface LmsOrgEmployee {
  id: string
  name: string
  email: string
  department: string
  progress: number
  status: "active" | "invited" | "completed"
}

export interface LmsOrgProgram {
  id: string
  title: string
  type: "course" | "learning_path"
  assignedCount: number
  completionRate: number
  mandatory: boolean
}

export interface LmsOrganization {
  id: string
  name: string
  seats: number
  seatsUsed: number
  employees: LmsOrgEmployee[]
  assignedPrograms: LmsOrgProgram[]
}

export interface LmsMentorshipSession {
  id: string
  mentorName: string
  menteeName: string
  goal: string
  nextSession: string
  progress: number
  status: "active" | "completed" | "scheduled"
  isPaid: boolean
  sessionCount: number
  hoursCompleted: number
}

export interface LmsMentorImpact {
  mentorId: string
  menteeCount: number
  hoursCompleted: number
  sessionCount: number
  avgRating: number
  skillsTaught: string[]
  countriesReached: string[]
  successStories: string[]
  reviews: LmsTutorReview[]
}

export interface LmsTutorOnboardingProfile {
  fullName: string
  email: string
  phone: string
  professionalTitle: string
  bio: string
  country: string
  countryIso: string
  categorySelections?: {
    categoryId: string
    category: string
    subCategories: { id: string; name: string }[]
  }[]
  categoryId: string
  category: string
  subcategoryId: string
  subcategory: string
  languages: string[]
  experienceYears: string
  qualifications: string
  certifications?: string
  identityDocumentType: string
  identityDocumentLabel: string
  identityFileName: string
  identityFileUrl: string
  hourlyRate: number
  currency: string
  cvFileName: string
  cvFileUrl: string
  introVideoFileName?: string
  introVideoUrl?: string
  portfolioUrl?: string
  phoneVerified: boolean
  completedAt: string
}

export interface LmsLearnerOnboardingProfile {
  fullName: string
  email: string
  phone: string
  educationLevel: string
  institution?: string
  subjectsOfInterest: string[]
  learningGoals: string
  preferredStyle: "video" | "live" | "self_paced" | "mixed"
  availability: ("weekday" | "weekend" | "evening")[]
  referralSource?: string
  completedAt: string
}

export interface LmsUserOnboardingRecord {
  tutor?: LmsTutorOnboardingProfile
  learner?: LmsLearnerOnboardingProfile
}

export type LmsChatMessageType =
  | "text"
  | "emoji"
  | "image"
  | "file"
  | "video"
  | "camera"

export interface LmsCourseChatMessage {
  id: string
  courseId: string
  courseTitle?: string
  senderName: string
  senderRole: "tutor" | "student"
  message: string
  sentAt: string
  isGroup: boolean
  recipientEmail?: string
  messageType?: LmsChatMessageType
  attachmentUrl?: string
  attachmentName?: string
}

export interface LmsOrgTrainingRequest {
  id: string
  organizationName: string
  contactName: string
  contactEmail: string
  contactPhone: string
  tutorId?: string
  tutorName?: string
  courseId?: string
  courseTitle?: string
  trainingFrequency: "daily" | "weekly" | "biweekly" | "monthly" | "custom"
  preferredSchedule?: string
  learnerCount: number
  message: string
  status: "pending" | "accepted" | "declined"
  submittedAt: string
}

export const LMS_COURSE_DESCRIPTION_MAX = 3000

export type AddLessonInput = {
  title: string
  type: LmsLessonType
  duration: string
  durationMinutes?: number
  description?: string
  contentUrl?: string
  materialUrl?: string
  htmlContent?: string
  embedUrl?: string
  assignmentType?: LmsAssignmentType
  materials?: LmsLesson["materials"]
}

export interface ELearningState {
  sessions: LiveClassSession[]
  materials: ClassMaterial[]
  assignments: ELearningAssignment[]
  recordings: ClassRecording[]
  courses: SchoolSubjectCourse[]
  curriculum: LmsCourseModule[]
  chatMessages: LmsCourseChatMessage[]

  addCourse: (course: Omit<SchoolSubjectCourse, "id">) => string
  updateCourse: (id: string, data: Partial<SchoolSubjectCourse>) => void
  addModule: (courseId: string, title: string) => void
  updateModule: (
    moduleId: string,
    data: Partial<Pick<LmsCourseModule, "title" | "order">>
  ) => void
  addLesson: (moduleId: string, data: AddLessonInput) => string | null
  updateLesson: (lessonId: string, data: Partial<LmsLesson>) => void
  deleteLesson: (lessonId: string) => void

  addSession: (
    session: Omit<LiveClassSession, "id" | "participantCount" | "status">
  ) => void
  addMaterial: (material: Omit<ClassMaterial, "id" | "uploadedAt">) => void
  addAssignment: (
    assignment: Omit<ELearningAssignment, "id" | "submissions">
  ) => void
  addChatMessage: (message: Omit<LmsCourseChatMessage, "id" | "sentAt">) => void
  updateSessionStatus: (id: string, status: LiveClassSession["status"]) => void

  createGuestLink: (
    sessionId: string,
    options: { createdBy: string; expiresAt?: string; maxUses?: number }
  ) => void
  setGuestLinkEnabled: (sessionId: string, enabled: boolean) => void
  revokeGuestLink: (sessionId: string) => void
  recordGuestUse: (token: string) => void
}
