export interface GetStudentsForPromotionParamsI {
  schoolId?: string
  sessionId?: string
  termId?: string
  classId?: string
  armId?: string
  search?: string
  pageNumber?: number
  pageSize?: number
}

export interface StudentForPromotionI {
  studentId: string
  studentSchoolId: string
  enrollmentId: string
  studentName: string
  admissionNumber: string
  profilePictureUrl: string
  schoolClassId: string
  className: string
  schoolArmId: string
  armName: string
  schoolStudentBillId: string
  totalBilled: number
  totalPaid: number
  outstandingAmount: number
  paymentStatus: number
}

export interface PaginatedStudentsForPromotionValueI {
  items: StudentForPromotionI[]
  pageNumber: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export interface GetStudentsForPromotionResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: PaginatedStudentsForPromotionValueI
}

export interface PromoteStudentsPayloadI {
  schoolId: string
  sourceSessionId: string
  sourceTermId: string
  sourceClassId: string
  studentIds: string[]
  targetSchoolSessionId: string
  targetSchoolSessionTermId: string
  targetSchoolClassId: string
  targetSchoolArmId?: string
}

export interface PromoteStudentsResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
}
