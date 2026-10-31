import { coursePublicPath, coursePackagePublicPath } from "@/lib/public-course-url"

export const AuthRoutes = {
  landing: "/",
  login: "/login",
  register: "/register",
  registerSuccess: "/register/success",
  verifyEmail: "/verify-email",
  forgotPassword: "/forgot-password",
  newPassword: "/new-password",
  verifyNotice: "/verify-notice",
  onboarding: "/onboarding",
  guestJoin: "/join/:token",
  toGuestJoin: (token: string) => `/join/${token}`,
} as const

export const HomeRoutes = {
  home: "/home",
  pricing: "/pricing",
  help: "/help",
  products: "/products",
  contact: "/contact",
  about: "/about",
  wordpress: "/wordpress",
  solution: "/solutions/:solutionId",
  aiSchools: "/solutions/ai-schools",
  aiLms: "/solutions/ai-lms",
  healthResearch: "/solutions/health-research",
  assistiveEducation: "/solutions/assistive-education",
  toSolution: (solutionId: string) => `/solutions/${solutionId}`,
  tutorMarketplace: "/tutors",
  tutorMarketplaceProfile: "/tutors/:tutorId",
  courses: "/courses",
  courseRequests: "/course-requests",
  tutorJobs: "/tutor-jobs",
  courseDetail: "/courses/:courseId",
  coursePackageDetail: "/course-packages/:packageId",
  schools: "/schools",
  schoolDetail: "/schools/:schoolId",
  blog: "/blog",
  blogDetail: "/blog/:slug",
  legal: "/legal",
  legalDocument: "/legal/:documentSlug",
  schoolBlogDetail: "/schools/:schoolId/blog/:slug",
  parentHome: "/parent-home/:schoolId",
  parentProfile: "/parent-home/:schoolId/profile",
  parentFees: "/parent-home/:schoolId/fees",
  paymentSuccess: "/payment/success",
  paymentCancelled: "/payment/cancelled",
  subscriptionPaymentSuccess: "/subscription/payment/success",
  subscriptionPaymentCancelled: "/subscription/payment/cancelled",
  paymentOnboardingRefresh: "/settings/payments/:providerKey/refresh",
  paymentOnboardingComplete: "/settings/payments/:providerKey/complete",
  parentTimetable: "/parent-home/:schoolId/timetable",
  parentCalendar: "/parent-home/:schoolId/calendar",
  parentResults: "/parent-home/:schoolId/results",
  parentAttendance: "/parent-home/:schoolId/attendance",
  parentElectives: "/parent-home/:schoolId/electives",
  parentCourse: "/parent-home/:schoolId/children/:studentId/courses/:classId/:subjectId",
  parentMessages: "/parent-home/:schoolId/messages",
  parentChat: "/parent-home/:schoolId/chat",
  parentVisitation: "/parent-home/:schoolId/visitation",
  parentConsent: "/parent-home/:schoolId/consent",
  parentTranscript: "/parent-home/:schoolId/transcript",
  parentNotifications: "/parent-home/:schoolId/notifications",
  parentRateSchool: "/parent-home/:schoolId/rate-school",
  parentSupport: "/parent-home/:schoolId/support",
  studentHome: "/student-home/:schoolId",
  studentChat: "/student-home/:schoolId/chat",
  studentProfile: "/student-home/:schoolId/profile",
  studentTimetable: "/student-home/:schoolId/timetable",
  studentCalendar: "/student-home/:schoolId/calendar",
  studentResults: "/student-home/:schoolId/results",
  studentSubjects: "/student-home/:schoolId/subjects",
  studentAttendance: "/student-home/:schoolId/attendance",
  studentHostel: "/student-home/:schoolId/hostel",
  studentHealth: "/student-home/:schoolId/health",
  studentCafeteria: "/student-home/:schoolId/cafeteria",
  studentLibrary: "/student-home/:schoolId/library",
  studentElearning: "/student-home/:schoolId/elearning",
  studentElearningCourse:
    "/student-home/:schoolId/elearning/courses/:subjectId/:classId",
  studentElearningLesson:
    "/student-home/:schoolId/elearning/courses/:subjectId/:classId/lessons/:lessonId",
  studentElearningAssignment:
    "/student-home/:schoolId/elearning/courses/:subjectId/:classId/assignments/:assignmentId",
  studentLiveRoom: "/student-home/:schoolId/elearning/live/:sessionId",
  studentVoting: "/student-home/:schoolId/voting",
  studentRateSchool: "/student-home/:schoolId/rate-school",
  studentSupport: "/student-home/:schoolId/support",
  toParentHome: (schoolId: string) => `/parent-home/${schoolId}`,
  toParentProfile: (schoolId: string) => `/parent-home/${schoolId}/profile`,
  toParentFees: (schoolId: string) => `/parent-home/${schoolId}/fees`,
  toParentTimetable: (schoolId: string) => `/parent-home/${schoolId}/timetable`,
  toParentCalendar: (schoolId: string) => `/parent-home/${schoolId}/calendar`,
  toParentResults: (schoolId: string) => `/parent-home/${schoolId}/results`,
  toParentAttendance: (schoolId: string) =>
    `/parent-home/${schoolId}/attendance`,
  toParentElectives: (schoolId: string) => `/parent-home/${schoolId}/electives`,
  toParentCourse: (schoolId: string, studentId: string, classId: string, subjectId: string) =>
    `/parent-home/${encodeURIComponent(schoolId)}/children/${encodeURIComponent(studentId)}/courses/${encodeURIComponent(classId)}/${encodeURIComponent(subjectId)}`,
  toParentMessages: (schoolId: string) => `/parent-home/${schoolId}/messages`,
  toParentChat: (schoolId: string) => `/parent-home/${schoolId}/chat`,
  toParentVisitation: (schoolId: string) =>
    `/parent-home/${schoolId}/visitation`,
  toParentConsent: (schoolId: string) => `/parent-home/${schoolId}/consent`,
  toParentTranscript: (schoolId: string) =>
    `/parent-home/${schoolId}/transcript`,
  toParentNotifications: (schoolId: string) =>
    `/parent-home/${schoolId}/notifications`,
  toParentRateSchool: (schoolId: string) =>
    `/parent-home/${schoolId}/rate-school`,
  toParentSupport: (schoolId: string) => `/parent-home/${schoolId}/support`,
  toStudentHome: (schoolId: string) => `/student-home/${schoolId}`,
  toStudentChat: (schoolId: string) => `/student-home/${schoolId}/chat`,
  toStudentProfile: (schoolId: string) => `/student-home/${schoolId}/profile`,
  toStudentTimetable: (schoolId: string) =>
    `/student-home/${schoolId}/timetable`,
  toStudentCalendar: (schoolId: string) => `/student-home/${schoolId}/calendar`,
  toStudentResults: (schoolId: string) => `/student-home/${schoolId}/results`,
  toStudentSubjects: (schoolId: string) => `/student-home/${schoolId}/subjects`,
  toStudentAttendance: (schoolId: string) =>
    `/student-home/${schoolId}/attendance`,
  toStudentHostel: (schoolId: string) => `/student-home/${schoolId}/hostel`,
  toStudentHealth: (schoolId: string) => `/student-home/${schoolId}/health`,
  toStudentCafeteria: (schoolId: string) =>
    `/student-home/${schoolId}/cafeteria`,
  toStudentLibrary: (schoolId: string) => `/student-home/${schoolId}/library`,
  toStudentElearning: (schoolId: string) =>
    `/student-home/${schoolId}/elearning`,
  toStudentElearningCourse: (
    schoolId: string,
    subjectId: string,
    classId: string
  ) =>
    `/student-home/${schoolId}/elearning/courses/${encodeURIComponent(subjectId)}/${encodeURIComponent(classId)}`,
  toStudentElearningLesson: (
    schoolId: string,
    subjectId: string,
    classId: string,
    lessonId: string
  ) =>
    `/student-home/${schoolId}/elearning/courses/${encodeURIComponent(subjectId)}/${encodeURIComponent(classId)}/lessons/${encodeURIComponent(lessonId)}`,
  toStudentElearningAssignment: (
    schoolId: string,
    subjectId: string,
    classId: string,
    assignmentId: string
  ) =>
    `/student-home/${schoolId}/elearning/courses/${encodeURIComponent(subjectId)}/${encodeURIComponent(classId)}/assignments/${encodeURIComponent(assignmentId)}`,
  toStudentLiveRoom: (schoolId: string, sessionId: string) =>
    `/student-home/${schoolId}/elearning/live/${sessionId}`,
  toStudentVoting: (schoolId: string) => `/student-home/${schoolId}/voting`,
  toStudentRateSchool: (schoolId: string) =>
    `/student-home/${schoolId}/rate-school`,
  toStudentSupport: (schoolId: string) => `/student-home/${schoolId}/support`,
  toTutorMarketplace: () => "/tutors",
  toTutorMarketplaceProfile: (tutorId: string) => `/tutors/${tutorId}`,
  toCourses: (params?: {
    category?: string
    subcategory?: string
    tab?: string
  }) => {
    const search = new URLSearchParams()
    if (params?.category) search.set("category", params.category)
    if (params?.subcategory) search.set("subcategory", params.subcategory)
    if (params?.tab) search.set("tab", params.tab)
    const q = search.toString()
    return q ? `/courses?${q}` : "/courses"
  },
  toCourseDetail: coursePublicPath,
  toCoursePackageDetail: coursePackagePublicPath,
  toCoursePackages: () => "/courses?view=packages",
  toSchools: (params?: { type?: string; state?: string }) => {
    const search = new URLSearchParams()
    if (params?.type) search.set("type", params.type)
    if (params?.state) search.set("state", params.state)
    const q = search.toString()
    return q ? `/schools?${q}` : "/schools"
  },
  toSchoolDetail: (schoolIdOrSlug: string) => `/schools/${encodeURIComponent(schoolIdOrSlug)}`,
  toBlog: (params?: { category?: string }) => {
    const search = new URLSearchParams()
    if (params?.category) search.set("category", params.category)
    const q = search.toString()
    return q ? `/blog?${q}` : "/blog"
  },
  toBlogPost: (slug: string) => `/blog/${slug}`,
  toLegalDocument: (documentSlug: string) => `/legal/${documentSlug}`,
  toSchoolBlogPost: (schoolIdOrSlug: string, slug: string) =>
    `/schools/${encodeURIComponent(schoolIdOrSlug)}/blog/${encodeURIComponent(slug)}`,
  liveClasses: "/live-classes",
  liveClassDetail: "/live-classes/:sessionId",
  conferences: "/conferences",
  conferenceDetail: "/conferences/:conferenceCode",
  learnerHub: "/learn",
  learnerCourses: "/learn/courses",
  learnerCart: "/learn/cart",
  learnerCheckout: "/learn/checkout",
  learnerWishlist: "/learn/wishlist",
  learnerPurchaseHistory: "/learn/purchase-history",
  learnerNotifications: "/learn/notifications",
  learnerLiveClasses: "/learn/live-classes",
  learnerLiveSession: "/learn/live-classes/:sessionId/session",
  learnerConferences: "/learn/conferences",
  learnerConferenceSession:
    "/learn/conferences/:conferenceId/sessions/:sessionId",
  learnerCourseLearn: "/learn/courses/:courseId/learn",
  learnerCourseLesson: "/learn/courses/:courseId/lessons/:lessonId",
  learnerSettings: "/learn/settings",
  toLiveClasses: () => "/live-classes",
  toLiveClassDetail: (sessionId: string) => `/live-classes/${sessionId}`,
  toConferences: () => "/conferences",
  toConferenceDetail: (conferenceCode: string) =>
    `/conferences/${conferenceCode}`,
  toLearnerHub: () => "/learn/courses",
  toLearnerCart: () => "/learn/cart",
  toLearnerCheckout: (courseId?: string) =>
    courseId ? `/learn/checkout?course=${courseId}` : "/learn/checkout",
  toLearnerPackageCheckout: (packageId: string) =>
    `/learn/checkout?package=${encodeURIComponent(packageId)}`,
  toLearnerWishlist: () => "/learn/wishlist",
  toLearnerPurchaseHistory: () => "/learn/purchase-history",
  toLearnerNotifications: () => "/learn/notifications",
  toLearnerLiveClasses: () => "/learn/live-classes",
  toLearnerLiveSession: (sessionId: string) =>
    `/learn/live-classes/${sessionId}/session`,
  toLearnerConferences: () => "/learn/conferences",
  toLearnerConferenceSession: (conferenceId: string, sessionId: string) =>
    `/learn/conferences/${conferenceId}/sessions/${sessionId}`,
  toLearnerCourseLearn: (courseId: string) =>
    `/learn/courses/${courseId}/learn`,
  toLearnerCourseLesson: (courseId: string, lessonId: string) =>
    `/learn/courses/${courseId}/lessons/${lessonId}`,
  toLearnerSettings: () => "/learn/settings",
} as const

export const SetupRoutes = {
  schoolMgt: "/setup/school-management",
  adhdLearning: "/setup/adhd",
  mentorship: "/setup/mentorship",
  cbtTest: "/setup/cbt",
  eLearningLms: "/setup/e-learning-lms",
  setupInitailize: "/setup/:productId/initializing",
} as const

export const DashboardRoutes = {
  root: "/dashboard/:productId",
  users: "users",
  usersDashboard: "users/dashboard",
  settings: "settings",
  schoolBlog: "school-blog",
  chat: "chat",
  unauthorized: "unauthorized",
  schoolInfo: "school-info",
  administration: "administration",
  fees: "fees",
  schoolLearning: "school-learning",
  schoolVacancies: "school-vacancies",
  teachers: "teachers",
  students: "students",
  studentIdCards: "students/id-cards",
  attendance: "attendance",
  attendanceStudents: "attendance/students",
  attendanceStudentsMark: "attendance/students/mark",
  attendanceStudentsRecords: "attendance/students/records",
  attendanceStudentDetail: "attendance/students/:studentId",
  attendanceStaff: "attendance/staff",
  attendanceScan: "attendance/scan",
  attendanceIntervention: "attendance/early-intervention",
  attendanceRiskQueue: "attendance/early-intervention/risks",
  attendanceStudentRisk: "attendance/early-intervention/students/:studentId",
  attendanceInterventionSettings: "attendance/early-intervention/settings",
  exams_and_records: "exams_and_records",
  classes: "exams_and_records/classes",
  classesDetail: "exams_and_records/classes/:classId",
  subjects: "exams_and_records/subjects",
  categories: "exams_and_records/categories",
  departments: "exams_and_records/departments",
  manageTeachers: "exams_and_records/manage-teachers",
  managetTeachersDetails: "exams_and_records/manage-teachers/:teacherId",
  gradeBookSettings: "exams_and_records/grade-book-settings",
  gradeDetail: "exams_and_records/grade-book-settings/:gradeId",
  teacherGradeEntry: "exams_and_records/grade-entry",
  studentGradeEntry: "exams_and_records/student-grade-entry",
  approveGrades: "exams_and_records/approve-grades",
  worksheetDetail: "exams_and_records/approve-grades/:worksheetId",
  viewStudentResults: "exams_and_records/view-results",
  manageClassResults: "exams_and_records/manage-class-results",
  promoteStudents: "exams_and_records/promote-students",
  examsBroadsheet: "exams_and_records/broadsheet",
  result: "results",
  reports: "reports",
  reportsAcademic: "reports/academic",
  reportsFinancial: "reports/financial",
  reportsAttendance: "reports/attendance",
  reportsWelfare: "reports/welfare",
  reportsOperations: "reports/operations",
  reportsMine: "reports/my-dashboard",
  reportsEnrolment: "reports/enrolment",
  reportsStaff: "reports/staff",
  timetable: "timetable",
  timetableManage: "timetable/manage",
  timetableCalendar: "timetable/calendar",
  timetablePeriodTypes: "timetable/period-types",
  timetableTypes: "timetable/timetable-types",
  library: "library",
  libraryCatalogue: "library/catalogue",
  libraryBookDetail: "library/catalogue/:bookId",
  libraryBookCategories: "library/book-categories",
  libraryBookGenres: "library/book-genres",
  libraryCirculation: "library/circulation",
  libraryFines: "library/fines",
  libraryInventory: "library/inventory",
  libraryReports: "library/reports",
  librarySettings: "library/settings",
  products: "products",
  manageUsers: "users/manage",
  manageUsersDetail: "users/manage/:subUserId",
  generateInvoice: "fees/invoice/generate",
  viewInvoice: "fees/invoice/:invoiceId",
  createPaymentType: "fees/payment-types/create",
  viewPaymentType: "fees/payment-types/:paymentTypeId",
  jobRoles: "users/job-roles",
  paymentItems: "fees/payment-items",
  bills: "fees/bills",
  paymentReminder: "fees/payment-reminder",
  paymentReminderDetails: "fees/payment-reminder/details",
  bookKeeping: "fees/book-keeping",
  viewTransactionDetails: "fees/book-keeping/:transactionId",
  classFeePayments: "fees/class-fee-payments",
  paymentMethods: "fees/payment-methods",
  onlinePayments: "fees/online-payments",
  onlinePaymentSetup: "fees/online-payment-setup",
  paymentDisputes: "fees/payment-disputes",
  paymentSettlements: "fees/payment-settlements",
  transactionTypes: "fees/transaction-types",

  studentOverview: "students",
  studentList: "students/list",
  studentAdd: "students/add",
  studentProfile: "students/:studentId",
  studentEdit: "students/:studentId/edit",
  studentImport: "students/import",
  studentAddToGuardian: "students/add-to-guardian",
  studentTimetable: "students/:studentId/timetable",
  studentCalendar: "students/:studentId/calendar",

  teacherTimetable: "exams_and_records/manage-teachers/:teacherId/timetable",

  parents: "parents",
  parentList: "parents/list",
  parentAdd: "parents/add",
  parentProfile: "parents/:parentId",
  parentEdit: "parents/:parentId/edit",
  parentResults: "parents/:parentId/results",
  parentAttendance: "parents/:parentId/attendance",
  parentFeesOverview: "parents/fees",
  parentFees: "parents/:parentId/fees",
  parentTimetable: "parents/:parentId/timetable",
  parentCalendar: "parents/:parentId/calendar",
  parentNotificationsDetail: "parents/:parentId/notifications",
  usersChat: "users/chat",
  usersNotifications: "users/notifications",
  usersAcademic: "users/academic",
  usersAcademicDetail: "users/academic/:sessionId",
  usersAttendance: "users/attendance",
  usersAttendanceStaff: "users/attendance/:staffId",
  usersSettings: "users/settings",
  usersIdCards: "users/id-cards",
  parentVisitationOverview: "parents/visitation",
  parentVisitationDetail: "parents/visitation/:requestId",
  parentVisitation: "parents/:parentId/visitation",
  parentConsentOverview: "parents/consent",
  parentConsentDetail: "parents/consent/:consentRequestId",
  parentTranscriptOverview: "parents/transcript",
  parentTranscript: "parents/:parentId/transcript",

  staffMgt: "staff",
  staffList: "staff/list",
  staffProfile: "staff/:id",
  staffEdit: "staff/:id/edit",
  staffRoles: "staff/roles",
  staffVoting: "staff/voting",
  staffLeave: "staff/leave",
  staffMyLeave: "staff/my-leave",
  staffPayroll: "staff/payroll",
  staffPerformance: "staff/performance",
  hostel: "hostel",
  hostelBoys: "hostel?gender=male",
  hostelGirls: "hostel?gender=female",
  hostelRooms: "hostel/rooms",
  hostelCreateRoom: "hostel/rooms/create",
  hostelRoomDetail: "hostel/rooms/:roomId",
  hostelRoomEdit: "hostel/rooms/:roomId/edit",
  hostelParents: "hostel/parents",
  hostelVisitors: "hostel/visitors",
  hostelDamage: "hostel/damage",
  hostelMovement: "hostel/movement",
  hostelTypes: "hostel/hostel-types",
  hostelCategories: "hostel/hostel-categories",
  hostelFloors: "hostel/floors",
  hostelBedSpaces: "hostel/bed-spaces",
  hostelAttendance: "hostel/attendance",
  hostelAttendanceHistory: "hostel/attendance/history",
  hostelHealthRecords: "hostel/health-records",

  cafeteria: "cafeteria",
  cafeteriaMenu: "cafeteria/menu",
  cafeteriaAttendance: "cafeteria/attendance",
  cafeteriaSubscriptions: "cafeteria/subscriptions",
  cafeteriaSubscriptionDetail: "cafeteria/subscriptions/:subscriptionId",
  cafeteriaPayments: "cafeteria/payments",
  cafeteriaDietary: "cafeteria/dietary",
  cafeteriaDietaryTypes: "cafeteria/dietary-types",
  cafeteriaWelfare: "cafeteria/welfare",
  cafeteriaInventory: "cafeteria/inventory",
  cafeteriaSuppliers: "cafeteria/suppliers",
  cafeteriaReports: "cafeteria/reports",
  cafeteriaSettings: "cafeteria/settings",

  learnerSupport: "learner-support",
  learnerSupportReferrals: "learner-support/referrals",
  learnerSupportRegister: "learner-support/register",
  learnerSupportPlans: "learner-support/plans",
  learnerSupportProvision: "learner-support/provision",
  learnerSupportReviews: "learner-support/reviews",
  learnerSupportAdjustments: "learner-support/adjustments",
  learnerSupportReports: "learner-support/reports",
  learnerSupportSettings: "learner-support/settings",
  learnerSupportCase: "learner-support/cases/:caseId",

  safeguarding: "safeguarding",
  safeguardingReport: "safeguarding/report",
  safeguardingCases: "safeguarding/cases",
  safeguardingActions: "safeguarding/actions",
  safeguardingReferrals: "safeguarding/referrals",
  safeguardingSafetyPlans: "safeguarding/safety-plans",
  safeguardingAccess: "safeguarding/access",
  safeguardingSettings: "safeguarding/settings",
  safeguardingCase: "safeguarding/cases/:caseId",

  profile: "profile",
  toProfile: (productId: string) => `/dashboard/${productId}/profile`,
  toLearnerSupport: (productId: string) =>
    `/dashboard/${productId}/learner-support`,
  toLearnerSupportCase: (productId: string, caseId: string) =>
    `/dashboard/${productId}/learner-support/cases/${caseId}`,
  toLearnerSupportSettings: (productId: string) =>
    `/dashboard/${productId}/learner-support/settings`,
  toSafeguarding: (productId: string) => `/dashboard/${productId}/safeguarding`,
  toSafeguardingReport: (productId: string) =>
    `/dashboard/${productId}/safeguarding/report`,
  toSafeguardingCases: (productId: string) =>
    `/dashboard/${productId}/safeguarding/cases`,
  toSafeguardingSettings: (productId: string) =>
    `/dashboard/${productId}/safeguarding/settings`,
  toSafeguardingCase: (productId: string, caseId: string) =>
    `/dashboard/${productId}/safeguarding/cases/${caseId}`,

  toRoot: (productId: string) => `/dashboard/${productId}`,
  toUsers: (productId: string) => `/dashboard/${productId}/users`,
  toUsersIdCards: (productId: string) =>
    `/dashboard/${productId}/users/id-cards`,
  toManageUsers: (productId: string) => `/dashboard/${productId}/users/manage`,
  toManageUsersDetail: (productId: string, subUserId: string) =>
    `/dashboard/${productId}/users/manage/${subUserId}`,
  toUsersAttendance: (productId: string) =>
    `/dashboard/${productId}/users/attendance`,
  toUsersAttendanceStaff: (productId: string, staffId: string) =>
    `/dashboard/${productId}/users/attendance/${encodeURIComponent(staffId)}`,
  toSettings: (productId: string, tab?: string) =>
    tab
      ? `/dashboard/${productId}/settings?tab=${tab}`
      : `/dashboard/${productId}/settings`,
  toSchoolBlog: (productId: string) => `/dashboard/${productId}/school-blog`,
  toChat: (productId: string) => `/dashboard/${productId}/chat`,
  toSchoolInfo: (productId: string) => `/dashboard/${productId}/school-info`,
  toAdministration: (productId: string) =>
    `/dashboard/${productId}/administration`,
  toFees: (productId: string) => `/dashboard/${productId}/fees`,
  toSchoolLearning: (productId: string) =>
    `/dashboard/${productId}/school-learning`,
  toSchoolVacancies: (productId: string) =>
    `/dashboard/${productId}/school-vacancies`,
  toTeachers: (productId: string) => `/dashboard/${productId}/teachers`,
  toStudents: (productId: string) => `/dashboard/${productId}/students`,
  toAttendance: (productId: string) => `/dashboard/${productId}/attendance`,
  toAttendanceIntervention: (productId: string) =>
    `/dashboard/${productId}/attendance/early-intervention`,
  toAttendanceRiskQueue: (productId: string, riskLevel?: string) =>
    `/dashboard/${productId}/attendance/early-intervention/risks${
      riskLevel ? `?riskLevel=${encodeURIComponent(riskLevel)}` : ""
    }`,
  toAttendanceStudentRisk: (productId: string, studentId: string) =>
    `/dashboard/${productId}/attendance/early-intervention/students/${encodeURIComponent(studentId)}`,
  toAttendanceInterventionSettings: (productId: string) =>
    `/dashboard/${productId}/attendance/early-intervention/settings`,
  toAttendanceStudents: (
    productId: string,
    params?: { date?: string; sessionId?: string; termId?: string }
  ) => {
    const search = new URLSearchParams()
    if (params?.date) search.set("date", params.date)
    if (params?.sessionId) search.set("sessionId", params.sessionId)
    if (params?.termId) search.set("termId", params.termId)
    const q = search.toString()
    return `/dashboard/${productId}/attendance/students${q ? `?${q}` : ""}`
  },
  toAttendanceStudentsMark: (
    productId: string,
    params?: {
      classId?: string
      date?: string
      sessionId?: string
      termId?: string
    }
  ) => {
    const search = new URLSearchParams()
    if (params?.classId) search.set("classId", params.classId)
    if (params?.date) search.set("date", params.date)
    if (params?.sessionId) search.set("sessionId", params.sessionId)
    if (params?.termId) search.set("termId", params.termId)
    const q = search.toString()
    return `/dashboard/${productId}/attendance/students/mark${q ? `?${q}` : ""}`
  },
  toAttendanceStudentsRecords: (productId: string) =>
    `/dashboard/${productId}/attendance/students/records`,
  toAttendanceStudentDetail: (productId: string, studentId: string) =>
    `/dashboard/${productId}/attendance/students/${studentId}`,
  toAttendanceStaff: (productId: string) =>
    `/dashboard/${productId}/attendance/staff`,
  toAttendanceScan: (productId: string) =>
    `/dashboard/${productId}/attendance/scan`,
  toExamsAndRecord: (productId: string) =>
    `/dashboard/${productId}/exams_and_records`,

  toClasses: (productId: string) =>
    `/dashboard/${productId}/exams_and_records/classes`,
  toClassDetail: (productId: string, classId: string) =>
    `/dashboard/${productId}/exams_and_records/classes/${classId}`,

  toCategories: (productId: string) =>
    `/dashboard/${productId}/exams_and_records/categories`,

  toDepartments: (productId: string) =>
    `/dashboard/${productId}/exams_and_records/departments`,

  toSubjects: (productId: string) =>
    `/dashboard/${productId}/exams_and_records/subjects`,

  toManageTeachers: (productId: string) =>
    `/dashboard/${productId}/exams_and_records/manage-teachers`,

  toManageTeachersDetail: (productId: string, teacherId: string) =>
    `/dashboard/${productId}/exams_and_records/manage-teachers/${teacherId}`,

  toGradeBookSettings: (productId: string) =>
    `/dashboard/${productId}/exams_and_records/grade-book-settings`,
  toGradeDetail: (productId: string, gradeId: string) =>
    `/dashboard/${productId}/exams_and_records/grade-book-settings/${gradeId}`,

  toTeacherGradeEntry: (productId: string) =>
    `/dashboard/${productId}/exams_and_records/grade-entry`,

  toStudentGradeEntry: (productId: string) =>
    `/dashboard/${productId}/exams_and_records/student-grade-entry`,

  toApproveGrades: (productId: string) =>
    `/dashboard/${productId}/exams_and_records/approve-grades`,

  toWorksheetDetail: (productId: string, worksheetId: string) =>
    `/dashboard/${productId}/exams_and_records/approve-grades/${worksheetId}`,

  toManageClassResults: (productId: string) =>
    `/dashboard/${productId}/exams_and_records/manage-class-results`,
  toPromoteStudents: (productId: string) =>
    `/dashboard/${productId}/exams_and_records/promote-students`,
  toExamsBroadsheet: (productId: string) =>
    `/dashboard/${productId}/exams_and_records/broadsheet`,

  toViewStudentResults: (productId: string) =>
    `/dashboard/${productId}/exams_and_records/view-results`,

  toResult: (productId: string) => `/dashboard/${productId}/results`,
  toReports: (productId: string) => `/dashboard/${productId}/reports`,
  toTimetable: (productId: string) => `/dashboard/${productId}/timetable`,
  toTimetableManage: (
    productId: string,
    tab?: "class" | "test" | "exam" | "assessment"
  ) => `/dashboard/${productId}/timetable/manage${tab ? `?tab=${tab}` : ""}`,
  toTimetableCalendar: (productId: string) =>
    `/dashboard/${productId}/timetable/calendar`,
  toTimetablePeriodTypes: (productId: string) =>
    `/dashboard/${productId}/timetable/period-types`,
  toTimetableTypes: (productId: string) =>
    `/dashboard/${productId}/timetable/timetable-types`,
  toLibrary: (productId: string) => `/dashboard/${productId}/library`,
  toLibraryCatalogue: (productId: string) =>
    `/dashboard/${productId}/library/catalogue`,
  toLibraryBookDetail: (productId: string, bookId: string) =>
    `/dashboard/${productId}/library/catalogue/${bookId}`,
  toLibraryBookCategories: (productId: string) =>
    `/dashboard/${productId}/library/book-categories`,
  toLibraryBookGenres: (productId: string) =>
    `/dashboard/${productId}/library/book-genres`,
  toLibraryCirculation: (productId: string) =>
    `/dashboard/${productId}/library/circulation`,
  toLibraryFines: (productId: string) =>
    `/dashboard/${productId}/library/fines`,
  toLibraryInventory: (productId: string) =>
    `/dashboard/${productId}/library/inventory`,
  toLibraryReports: (productId: string) =>
    `/dashboard/${productId}/library/reports`,
  toLibrarySettings: (productId: string) =>
    `/dashboard/${productId}/library/settings`,
  toProducts: (productId: string) => `/dashboard/${productId}/products`,
  toGenerateInvoice: (productId: string) =>
    `/dashboard/${productId}/fees/invoice/generate`,
  toViewInvoice: (productId: string, invoiceId: string) =>
    `/dashboard/${productId}/fees/invoice/${invoiceId}`,
  toCreatePaymentType: (productId: string) =>
    `/dashboard/${productId}/fees/payment-types/create`,
  toViewPaymentType: (productId: string, paymentTypeId: string) =>
    `/dashboard/${productId}/fees/payment-types/${paymentTypeId}`,
  toJobRoles: (productId: string) => `/dashboard/${productId}/users/job-roles`,
  toPaymentItems: (productId: string) =>
    `/dashboard/${productId}/fees/payment-items`,
  toBills: (productId: string) => `/dashboard/${productId}/fees/bills`,
  toPaymentReminder: (productId: string) =>
    `/dashboard/${productId}/fees/payment-reminder`,
  toPaymentReminderDetails: (
    productId: string,
    params: {
      sessionId: string
      termId: string
      classId: string
      highlight?: string
    }
  ) => {
    const query = new URLSearchParams({
      sessionId: params.sessionId,
      termId: params.termId,
      classId: params.classId,
    })
    if (params.highlight) query.set("highlight", params.highlight)
    return `/dashboard/${productId}/fees/payment-reminder/details?${query.toString()}`
  },
  toBookKeeping: (productId: string) =>
    `/dashboard/${productId}/fees/book-keeping`,
  toViewTransactionDetails: (productId: string, transactionId: string) =>
    `/dashboard/${productId}/fees/book-keeping/${transactionId}`,
  toClassFeePayments: (productId: string) =>
    `/dashboard/${productId}/fees/class-fee-payments`,
  toNewInvoice: (productId: string) =>
    `/dashboard/${productId}/fees/invoice/new`,
  toPaymentMethods: (productId: string) =>
    `/dashboard/${productId}/fees/payment-methods`,
  toOnlinePayments: (productId: string) =>
    `/dashboard/${productId}/fees/online-payments`,
  toOnlinePaymentSetup: (productId: string) =>
    `/dashboard/${productId}/fees/online-payment-setup`,
  toPaymentDisputes: (productId: string) =>
    `/dashboard/${productId}/fees/payment-disputes`,
  toPaymentSettlements: (productId: string) =>
    `/dashboard/${productId}/fees/payment-settlements`,
  toTransactionTypes: (productId: string) =>
    `/dashboard/${productId}/fees/transaction-types`,

  toStudentOverview: (productId: string) => `/dashboard/${productId}/students`,
  toStudentList: (productId: string) => `/dashboard/${productId}/students/list`,
  toStudentAdd: (productId: string) => `/dashboard/${productId}/students/add`,
  toStudentProfile: (productId: string, studentId: string) =>
    `/dashboard/${productId}/students/${studentId}`,
  toStudentEdit: (productId: string, studentId: string) =>
    `/dashboard/${productId}/students/${studentId}/edit`,
  toStudentImport: (productId: string) =>
    `/dashboard/${productId}/students/import`,
  toStudentAddToGuardian: (productId: string) =>
    `/dashboard/${productId}/students/add-to-guardian`,
  toStudentTimetable: (productId: string, studentId: string) =>
    `/dashboard/${productId}/students/${studentId}/timetable`,
  toStudentCalendar: (productId: string, studentId: string) =>
    `/dashboard/${productId}/students/${studentId}/calendar`,
  toTeacherTimetable: (productId: string, teacherId: string) =>
    `/dashboard/${productId}/exams_and_records/manage-teachers/${teacherId}/timetable`,
  toCreateElection: (productId: string) => `/dashboard/${productId}/voting/create`,
  toVotingCategories: (productId: string) => `/dashboard/${productId}/voting/categories`,
  toElectionDetails: (productId: string, electionId: string) => `/dashboard/${productId}/voting/${electionId}`,
  toVotingOverview: (productId: string) => `/dashboard/${productId}/voting`,
  toVotingManagement: (productId: string) =>
    `/dashboard/${productId}/voting/elections`,

  toParents: (productId: string) => `/dashboard/${productId}/parents`,
  toParentList: (productId: string) => `/dashboard/${productId}/parents/list`,
  toParentAdd: (productId: string) => `/dashboard/${productId}/parents/add`,
  toParentProfile: (productId: string, parentId: string) =>
    `/dashboard/${productId}/parents/${parentId}`,
  toParentEdit: (productId: string, parentId: string) =>
    `/dashboard/${productId}/parents/${parentId}/edit`,
  toParentResults: (productId: string, parentId: string) =>
    `/dashboard/${productId}/parents/${parentId}/results`,
  toParentAttendance: (productId: string, parentId: string) =>
    `/dashboard/${productId}/parents/${parentId}/attendance`,
  toParentFeesOverview: (productId: string) =>
    `/dashboard/${productId}/parents/fees`,
  toParentFees: (productId: string, parentId: string) =>
    `/dashboard/${productId}/parents/${parentId}/fees`,
  toParentTimetable: (productId: string, parentId: string) =>
    `/dashboard/${productId}/parents/${parentId}/timetable`,
  toParentCalendar: (productId: string, parentId: string) =>
    `/dashboard/${productId}/parents/${parentId}/calendar`,
  toParentNotificationsDetail: (productId: string, parentId: string) =>
    `/dashboard/${productId}/parents/${parentId}/notifications`,
  toUsersChat: (productId: string) => `/dashboard/${productId}/users/chat`,
  toUsersNotifications: (productId: string) =>
    `/dashboard/${productId}/users/notifications`,
  toUsersAcademic: (productId: string) =>
    `/dashboard/${productId}/users/academic`,
  toUsersAcademicDetail: (productId: string, sessionId: string) =>
    `/dashboard/${productId}/users/academic/${sessionId}`,
  toUsersSettings: (productId: string) =>
    `/dashboard/${productId}/users/settings`,
  toParentVisitationOverview: (productId: string) =>
    `/dashboard/${productId}/parents/visitation`,
  toParentVisitationDetail: (productId: string, requestId: string) =>
    `/dashboard/${productId}/parents/visitation/${requestId}`,
  toParentVisitation: (productId: string, parentId: string) =>
    `/dashboard/${productId}/parents/${parentId}/visitation`,
  toParentConsentOverview: (productId: string) =>
    `/dashboard/${productId}/parents/consent`,
  toParentConsentDetail: (productId: string, consentRequestId: string) =>
    `/dashboard/${productId}/parents/consent/${consentRequestId}`,
  toParentTranscriptOverview: (productId: string) =>
    `/dashboard/${productId}/parents/transcript`,
  toParentTranscript: (productId: string, parentId: string) =>
    `/dashboard/${productId}/parents/${parentId}/transcript`,

  toStaffMgt: (productId: string) => `/dashboard/${productId}/staff`,
  toStaffList: (productId: string) => `/dashboard/${productId}/staff/list`,
  toStaffProfile: (productId: string, staffId: string) =>
    `/dashboard/${productId}/staff/${staffId}`,
  toStaffEdit: (productId: string, staffId: string) =>
    `/dashboard/${productId}/staff/${staffId}/edit`,
  toStaffRoles: (productId: string) => `/dashboard/${productId}/staff/roles`,
  toStaffVoting: (productId: string) =>
    `/dashboard/${productId}/staff/voting`,
  toStaffLeave: (productId: string) => `/dashboard/${productId}/staff/leave`,
  toStaffMyLeave: (productId: string) =>
    `/dashboard/${productId}/staff/my-leave`,
  toStaffPayroll: (productId: string) =>
    `/dashboard/${productId}/staff/payroll`,
  toStaffPerformance: (productId: string) =>
    `/dashboard/${productId}/staff/performance`,
  toHostel: (productId: string) => `/dashboard/${productId}/hostel`,
  toHostelBoys: (productId: string) =>
    `/dashboard/${productId}/hostel?gender=male`,
  toHostelGirls: (productId: string) =>
    `/dashboard/${productId}/hostel?gender=female`,
  toHostelRooms: (productId: string) => `/dashboard/${productId}/hostel/rooms`,
  toHostelCreateRoom: (productId: string) =>
    `/dashboard/${productId}/hostel/rooms/create`,
  toHostelRoomDetail: (productId: string, roomId: string) =>
    `/dashboard/${productId}/hostel/rooms/${roomId}`,
  toHostelRoomEdit: (productId: string, roomId: string) =>
    `/dashboard/${productId}/hostel/rooms/${roomId}/edit`,
  toHostelParents: (productId: string) =>
    `/dashboard/${productId}/hostel/parents`,
  toHostelVisitors: (productId: string) =>
    `/dashboard/${productId}/hostel/visitors`,
  toHostelDamage: (productId: string) =>
    `/dashboard/${productId}/hostel/damage`,
  toHostelMovement: (productId: string) =>
    `/dashboard/${productId}/hostel/movement`,
  toHostelTypes: (productId: string) =>
    `/dashboard/${productId}/hostel/hostel-types`,
  toHostelCategories: (productId: string) =>
    `/dashboard/${productId}/hostel/hostel-categories`,
  toHostelFloors: (productId: string) =>
    `/dashboard/${productId}/hostel/floors`,
  toHostelBedSpaces: (productId: string) =>
    `/dashboard/${productId}/hostel/bed-spaces`,
  toHostelAttendance: (productId: string) =>
    `/dashboard/${productId}/hostel/attendance`,
  toHostelAttendanceHistory: (productId: string) =>
    `/dashboard/${productId}/hostel/attendance/history`,
  toHostelHealthRecords: (productId: string) =>
    `/dashboard/${productId}/hostel/health-records`,

  toCafeteria: (productId: string) => `/dashboard/${productId}/cafeteria`,
  toCafeteriaMenu: (productId: string) =>
    `/dashboard/${productId}/cafeteria/menu`,
  toCafeteriaAttendance: (productId: string) =>
    `/dashboard/${productId}/cafeteria/attendance`,
  toCafeteriaSubscriptions: (productId: string) =>
    `/dashboard/${productId}/cafeteria/subscriptions`,
  toCafeteriaSubscriptionDetail: (productId: string, subscriptionId: string) =>
    `/dashboard/${productId}/cafeteria/subscriptions/${subscriptionId}`,
  toCafeteriaPayments: (productId: string) =>
    `/dashboard/${productId}/cafeteria/payments`,
  toCafeteriaDietary: (productId: string) =>
    `/dashboard/${productId}/cafeteria/dietary`,
  toCafeteriaDietaryTypes: (productId: string) =>
    `/dashboard/${productId}/cafeteria/dietary-types`,
  toCafeteriaWelfare: (productId: string) =>
    `/dashboard/${productId}/cafeteria/welfare`,
  toCafeteriaInventory: (productId: string) =>
    `/dashboard/${productId}/cafeteria/inventory`,
  toCafeteriaSuppliers: (productId: string) =>
    `/dashboard/${productId}/cafeteria/suppliers`,
  toCafeteriaReports: (productId: string) =>
    `/dashboard/${productId}/cafeteria/reports`,
  toCafeteriaSettings: (productId: string) =>
    `/dashboard/${productId}/cafeteria/settings`,
  toHostelSupervisorProfile: (productId: string, supervisorId: string) =>
    `/dashboard/${productId}/hostel/supervisors/${supervisorId}`,

  health: "health",
  healthRecords: "health/records",
  healthStudentDetail: "health/records/:studentId",
  healthSickBay: "health/sick-bay",
  healthFollowUps: "health/incidents",
  healthAccess: "health/access",

  training: "training",
  trainingCourses: "training-courses",
  reportCardDesigner: "report-card-designer",
  certificateDesigner: "certificate-designer",
  issuedDocuments: "issued-documents",
  trainingAssignments: "training-assignments",
  trainingRules: "training-rules",
  elearning: "elearning",
  elearningLiveClasses: "elearning/live-classes",
  elearningLiveRoom: "elearning/live-classes/:sessionId/room",
  elearningCourses: "elearning/courses",
  elearningTeacherCourses: "elearning/teachers/:teacherId/courses",
  elearningTeacherTimetable: "elearning/teachers/:teacherId/timetable",
  elearningCreateCourse: "elearning/courses/create",
  elearningEditCourse: "elearning/courses/:courseId/edit",
  elearningCourseDetail: "elearning/courses/:courseId",
  elearningLesson: "elearning/courses/:courseId/lessons/:lessonId",
  elearningLessonEdit: "elearning/courses/:courseId/lessons/:lessonId/edit",
  elearningMaterials: "elearning/materials",
  elearningAssignments: "elearning/assignments",
  elearningRecordings: "elearning/recordings",
  elearningLessonNotes: "elearning/lesson-notes",
  elearningLessonNoteCreate: "elearning/lesson-notes/create",
  elearningLessonNoteEdit: "elearning/lesson-notes/:noteId/edit",

  lms: "lms",
  lmsLiveClasses: "lms/live-classes",
  lmsLiveRoom: "lms/live-classes/:sessionId/room",
  lmsConferences: "lms/conferences",
  lmsConferenceRoom: "lms/conferences/:conferenceId/sessions/:sessionId/room",
  lmsTutors: "lms/tutors",
  lmsTutorProfile: "lms/tutors/:tutorId",
  lmsCourses: "lms/courses",
  lmsPackages: "lms/packages",
  lmsCreatePackage: "lms/packages/create",
  lmsEditPackage: "lms/packages/:packageId/edit",
  lmsCreateCourse: "lms/courses/create",
  lmsEditCourse: "lms/courses/:courseId/edit",
  lmsCourseDetail: "lms/courses/:courseId",
  lmsCourseLiveClasses: "lms/courses/:courseId/live-classes",
  lmsCourseMaterials: "lms/courses/:courseId/materials",
  lmsCourseAssignments: "lms/courses/:courseId/assignments",
  lmsCourseQuizzes: "lms/courses/:courseId/quizzes",
  lmsCourseCertificates: "lms/courses/:courseId/certificates",
  lmsCourseRecordings: "lms/courses/:courseId/recordings",
  lmsCourseEnrollments: "lms/courses/:courseId/enrollments",
  lmsCourseChat: "lms/courses/:courseId/chat",
  lmsCourseOrganization: "lms/courses/:courseId/organization",
  lmsCourseEarnings: "lms/courses/:courseId/earnings",
  lmsCourseReports: "lms/courses/:courseId/reports",
  lmsLesson: "lms/courses/:courseId/lessons/:lessonId",
  lmsLessonEdit: "lms/courses/:courseId/lessons/:lessonId/edit",
  lmsChat: "lms/chat",
  lmsCreateCourseAssignment: "lms/courses/:courseId/assignments/create",
  lmsEditCourseAssignment:
    "lms/courses/:courseId/assignments/:assignmentId/edit",
  lmsMyCourses: "lms/my-courses",
  lmsEnrollments: "lms/enrollments",
  lmsAssignments: "lms/assignments",
  lmsCreateAssignment: "lms/assignments/create",
  lmsTakeAssignment: "lms/assignments/:assignmentId/take",
  lmsMaterials: "lms/materials",
  lmsRecordings: "lms/recordings",
  lmsMentorship: "lms/mentorship",
  lmsQuizzes: "lms/quizzes",
  lmsQuizDetail: "lms/quizzes/:quizId",
  lmsQuizTake: "lms/quizzes/:quizId/take",
  lmsSubjects: "lms/subjects",
  lmsLearningPaths: "lms/learning-paths",
  lmsEarnings: "lms/earnings",
  lmsAgreement: "lms/agreement-and-earnings",
  lmsOrganization: "lms/organization",
  lmsSchoolAssignments: "lms/school-assignments",
  lmsProgress: "lms/progress",
  lmsCertificates: "lms/certificates",
  lmsReports: "lms/reports",
  lmsProfile: "lms/profile",
  lmsNotifications: "lms/notifications",
  lmsSettings: "lms/settings",

  toHealth: (productId: string) => `/dashboard/${productId}/health`,
  toHealthRecords: (productId: string) =>
    `/dashboard/${productId}/health/records`,
  toHealthStudentDetail: (productId: string, studentId: string) =>
    `/dashboard/${productId}/health/records/${studentId}`,
  toHealthSickBay: (productId: string) =>
    `/dashboard/${productId}/health/sick-bay`,

  toELearning: (productId: string) => `/dashboard/${productId}/elearning`,
  toELearningLiveClasses: (productId: string) =>
    `/dashboard/${productId}/elearning/live-classes`,
  toELearningLiveRoom: (productId: string, sessionId: string) =>
    `/dashboard/${productId}/elearning/live-classes/${sessionId}/room`,
  toELearningCourses: (productId: string) =>
    `/dashboard/${productId}/elearning/courses`,
  toELearningTeacherCourses: (productId: string, teacherId: string) =>
    `/dashboard/${productId}/elearning/teachers/${encodeURIComponent(teacherId)}/courses`,
  toELearningTeacherTimetable: (productId: string, teacherId: string) =>
    `/dashboard/${productId}/elearning/teachers/${encodeURIComponent(teacherId)}/timetable`,
  toELearningCreateCourse: (productId: string) =>
    `/dashboard/${productId}/elearning/courses/create`,
  toELearningEditCourse: (productId: string, courseId: string) =>
    `/dashboard/${productId}/elearning/courses/${courseId}/edit`,
  toELearningCourseDetail: (productId: string, courseId: string) =>
    `/dashboard/${productId}/elearning/courses/${courseId}`,
  toELearningLesson: (productId: string, courseId: string, lessonId: string) =>
    `/dashboard/${productId}/elearning/courses/${courseId}/lessons/${lessonId}`,
  toELearningLessonEdit: (
    productId: string,
    courseId: string,
    lessonId: string
  ) =>
    `/dashboard/${productId}/elearning/courses/${courseId}/lessons/${lessonId}/edit`,
  toELearningMaterials: (productId: string) =>
    `/dashboard/${productId}/elearning/materials`,
  toELearningAssignments: (productId: string) =>
    `/dashboard/${productId}/elearning/assignments`,
  toELearningRecordings: (productId: string) =>
    `/dashboard/${productId}/elearning/recordings`,
  toELearningLessonNotes: (productId: string) =>
    `/dashboard/${productId}/elearning/lesson-notes`,
  toELearningLessonNoteCreate: (productId: string) =>
    `/dashboard/${productId}/elearning/lesson-notes/create`,
  toELearningLessonNoteEdit: (productId: string, noteId: string) =>
    `/dashboard/${productId}/elearning/lesson-notes/${noteId}/edit`,

  toLms: (productId: string) => `/dashboard/${productId}/lms`,
  toLmsLiveClasses: (productId: string) =>
    `/dashboard/${productId}/lms/live-classes`,
  toLmsLiveRoom: (productId: string, sessionId: string) =>
    `/dashboard/${productId}/lms/live-classes/${sessionId}/room`,
  toLmsConferences: (productId: string) =>
    `/dashboard/${productId}/lms/conferences`,
  toLmsConferenceRoom: (
    productId: string,
    conferenceId: string,
    sessionId: string
  ) =>
    `/dashboard/${productId}/lms/conferences/${conferenceId}/sessions/${sessionId}/room`,
  toLmsTutors: (productId: string) => `/dashboard/${productId}/lms/tutors`,
  toLmsTutorProfile: (productId: string, tutorId: string) =>
    `/dashboard/${productId}/lms/tutors/${tutorId}`,
  toLmsCourses: (productId: string) => `/dashboard/${productId}/lms/courses`,
  toLmsPackages: (productId: string) => `/dashboard/${productId}/lms/packages`,
  toLmsCreatePackage: (productId: string) =>
    `/dashboard/${productId}/lms/packages/create`,
  toLmsEditPackage: (productId: string, packageId: string) =>
    `/dashboard/${productId}/lms/packages/${packageId}/edit`,
  toLmsCreateCourse: (productId: string) =>
    `/dashboard/${productId}/lms/courses/create`,
  toLmsEditCourse: (productId: string, courseId: string) =>
    `/dashboard/${productId}/lms/courses/${courseId}/edit`,
  toLmsCourseDetail: (productId: string, courseId: string) =>
    `/dashboard/${productId}/lms/courses/${courseId}`,
  toLmsCourseCoupons: (productId: string, courseId: string) =>
    `/dashboard/${productId}/lms/courses/${courseId}?tab=coupons`,
  toLmsCourseLiveClasses: (productId: string, courseId: string) =>
    `/dashboard/${productId}/lms/courses/${courseId}/live-classes`,
  toLmsCourseMaterials: (productId: string, courseId: string) =>
    `/dashboard/${productId}/lms/courses/${courseId}/materials`,
  toLmsCourseAssignments: (productId: string, courseId: string) =>
    `/dashboard/${productId}/lms/courses/${courseId}/assignments`,
  toLmsCourseQuizzes: (productId: string, courseId: string) =>
    `/dashboard/${productId}/lms/courses/${courseId}/quizzes`,
  toLmsCourseCertificates: (productId: string, courseId: string) =>
    `/dashboard/${productId}/lms/courses/${courseId}/certificates`,
  toLmsCourseRecordings: (productId: string, courseId: string) =>
    `/dashboard/${productId}/lms/courses/${courseId}/recordings`,
  toLmsCourseEnrollments: (productId: string, courseId: string) =>
    `/dashboard/${productId}/lms/courses/${courseId}/enrollments`,
  toLmsCourseChat: (productId: string, courseId: string) =>
    `/dashboard/${productId}/lms/courses/${courseId}/chat`,
  toLmsCourseOrganization: (productId: string, courseId: string) =>
    `/dashboard/${productId}/lms/courses/${courseId}/organization`,
  toLmsCourseEarnings: (productId: string, courseId: string) =>
    `/dashboard/${productId}/lms/courses/${courseId}/earnings`,
  toLmsCourseReports: (productId: string, courseId: string) =>
    `/dashboard/${productId}/lms/courses/${courseId}/reports`,
  toLmsLesson: (productId: string, courseId: string, lessonId: string) =>
    `/dashboard/${productId}/lms/courses/${courseId}/lessons/${lessonId}`,
  toLmsLessonEdit: (productId: string, courseId: string, lessonId: string) =>
    `/dashboard/${productId}/lms/courses/${courseId}/lessons/${lessonId}/edit`,
  toLmsCreateLesson: (productId: string, courseId: string, moduleId: string) =>
    `/dashboard/${productId}/lms/courses/${courseId}/lessons/new/edit?moduleId=${moduleId}`,
  toLmsChat: (productId: string) => `/dashboard/${productId}/lms/chat`,
  toLmsCreateCourseAssignment: (productId: string, courseId: string) =>
    `/dashboard/${productId}/lms/courses/${courseId}/assignments/create`,
  toLmsEditCourseAssignment: (
    productId: string,
    courseId: string,
    assignmentId: string
  ) =>
    `/dashboard/${productId}/lms/courses/${courseId}/assignments/${assignmentId}/edit`,
  toLmsMyCourses: (productId: string) =>
    `/dashboard/${productId}/lms/my-courses`,
  toLmsEnrollments: (productId: string) =>
    `/dashboard/${productId}/lms/enrollments`,
  toLmsAssignments: (productId: string) =>
    `/dashboard/${productId}/lms/assignments`,
  toLmsCreateAssignment: (productId: string) =>
    `/dashboard/${productId}/lms/assignments/create`,
  toLmsTakeAssignment: (productId: string, assignmentId: string) =>
    `/dashboard/${productId}/lms/assignments/${assignmentId}/take`,
  toLmsMaterials: (productId: string) =>
    `/dashboard/${productId}/lms/materials`,
  toLmsRecordings: (productId: string) =>
    `/dashboard/${productId}/lms/recordings`,
  toLmsMentorship: (productId: string) =>
    `/dashboard/${productId}/lms/mentorship`,
  toLmsQuizzes: (productId: string) => `/dashboard/${productId}/lms/quizzes`,
  toLmsQuizDetail: (productId: string, quizId: string) =>
    `/dashboard/${productId}/lms/quizzes/${quizId}`,
  toLmsQuizTake: (productId: string, quizId: string) =>
    `/dashboard/${productId}/lms/quizzes/${quizId}/take`,
  toLmsSubjects: (productId: string) => `/dashboard/${productId}/lms/subjects`,
  toLmsLearningPaths: (productId: string) =>
    `/dashboard/${productId}/lms/learning-paths`,
  toLmsEarnings: (productId: string) => `/dashboard/${productId}/lms/earnings`,
  toLmsAgreement: (productId: string) =>
    `/dashboard/${productId}/lms/agreement-and-earnings`,
  toLmsOrganization: (productId: string) =>
    `/dashboard/${productId}/lms/organization`,
  toLmsSchoolAssignments: (productId: string) =>
    `/dashboard/${productId}/lms/school-assignments`,
  toLmsProgress: (productId: string) => `/dashboard/${productId}/lms/progress`,
  toLmsCertificates: (productId: string) =>
    `/dashboard/${productId}/lms/certificates`,
  toLmsReports: (productId: string) => `/dashboard/${productId}/lms/reports`,
  toLmsProfile: (productId: string) => `/dashboard/${productId}/lms/profile`,
  toLmsNotifications: (productId: string) =>
    `/dashboard/${productId}/lms/notifications`,
  toLmsSettings: (productId: string) => `/dashboard/${productId}/lms/settings`,
} as const
