export interface ApiResult<T> {
  data: T
  isSuccess: boolean
  message?: string
  statusCode: number
  errors?: string[]
}

export interface ResultViewModel {
  isSuccess: boolean
  message?: string
  statusCode: number
  errors?: string[]
}

export interface PaginatedResult<T> {
  items: T[]
  pageIndex: number
  totalPages: number
  totalCount: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

export const ElectionStatus = {
  Draft: 0,
  Active: 1,
  Closed: 2,
  Cancelled: 3,
} as const
export type ElectionStatus = (typeof ElectionStatus)[keyof typeof ElectionStatus]

export const CandidateStatus = {
  Active: 0,
  Disqualified: 1,
  Withdrawn: 2,
} as const
export type CandidateStatus =
  (typeof CandidateStatus)[keyof typeof CandidateStatus]

export type CategoryStatus = "Active" | "Inactive"

export interface ChangeCategoryStatusRequest {
  id: string
  schoolId: string
  status: CategoryStatus
}

export interface ElectionCategoryDto {
  id: string
  schoolId: string
  name: string
  description?: string
  isActive: boolean
  status?: CategoryStatus
  dateCreated: string
}

export interface CreateElectionCategoryCommand {
  schoolId: string
  name: string
  description?: string
}

export interface UpdateElectionCategoryCommand {
  id: string
  schoolId: string
  name: string
  description?: string
  isActive?: boolean
}

export const ElectionVoterType = {
  AllStudents: 0,
  AllStaff: 1,
  StudentsAndStaff: 2,
} as const
export type ElectionVoterType =
  (typeof ElectionVoterType)[keyof typeof ElectionVoterType]

export const CandidateType = {
  Student: 0,
  Staff: 1,
} as const
export type CandidateType = (typeof CandidateType)[keyof typeof CandidateType]

export type CandidateSearchType = "Student" | "Staff"

export interface CandidateStudentSearchResultDto {
  candidateType?: CandidateSearchType
  staffId?: string | null
  roleName?: string | null
  studentId: string | null
  studentSchoolId: string | null
  fullName: string
  admissionNumber: string
  className?: string | null
  profileImageUrl?: string | null
  email?: string | null
}

export interface CreateElectionCandidateInput {
  candidateType: CandidateType
  studentId?: string | null
  studentSchoolId?: string | null
  staffId?: string | null
  manifesto?: string
}

export interface CreateElectionSubcategoryInput {
  name: string
  description?: string
  orderIndex: number
  candidates: CreateElectionCandidateInput[]
}

export interface CreateElectionCommand {
  schoolId: string
  title: string
  description?: string
  electionCategoryId: string
  schoolSessionId: string
  schoolSessionTermId?: string
  voterType: ElectionVoterType
  isAllClassesEligible: boolean
  eligibleClassIds?: string[]
  status: ElectionStatus
  startDate?: string
  endDate?: string
  subcategories: CreateElectionSubcategoryInput[]
}

export interface ElectionListItemDto {
  id: string
  title: string
  electionCategoryId: string
  categoryName: string
  schoolSessionId: string
  academicSessionName: string
  status: ElectionStatus
  subcategoriesCount: number
  candidatesCount: number
  votesCount: number
  createdDate: string
}

export interface VotingDashboardDto {
  totalElections: number
  activeElections: number
  closedElections: number
  totalVotes: number
  elections: PaginatedResult<ElectionListItemDto>
}

export interface GetVotingDashboardParamsI {
  schoolId: string
  search?: string
  status?: ElectionStatus
  schoolSessionId?: string
  pageNumber?: number
  pageSize?: number
}

export interface ElectionCandidateDetailDto {
  id: string
  candidateType?: CandidateType
  staffId?: string | null
  roleName?: string | null
  studentId?: string | null
  studentSchoolId?: string
  fullName: string
  admissionNumber?: string
  className?: string
  profileImageUrl?: string
  manifesto?: string
  votesCount: number
  votePercentage: number
  isLeading: boolean
  status: CandidateStatus
}

export interface ElectionSubcategoryDetailDto {
  id?: string
  subcategoryId?: string
  name: string
  description?: string
  orderIndex: number
  totalVotes: number
  candidates: ElectionCandidateDetailDto[]
}

export interface ElectionDetailDto {
  id: string
  title: string
  description?: string
  electionCategoryId: string
  categoryName: string
  schoolSessionId: string
  academicSessionName: string
  status: ElectionStatus
  isAllClassesEligible: boolean
  eligibleClassesDisplay: string
  eligibleClassIds: string[]
  createdDate: string
  subcategoriesCount: number
  candidatesCount: number
  totalVotes: number
  subcategories: ElectionSubcategoryDetailDto[]
}

// ─── Student portal ──────────────────────────────────────────────────────────

export interface StudentElectionListItemDto {
  electionId: string
  title: string
  categoryName: string
  academicSessionName: string
  status: ElectionStatus
  totalSubcategoriesCount: number
  completedBallotsCount: number
  candidatesCount: number
  hasCompletedAllBallots: boolean
  startDate?: string
  endDate?: string
}

export interface StudentElectionsDashboardDto {
  studentName: string
  admissionNumber: string
  className: string
  elections: StudentElectionListItemDto[]
}

export interface GetStudentElectionsParamsI {
  studentSchoolId: string
  schoolId: string
  search?: string
  status?: ElectionStatus
  schoolSessionId?: string
}

export interface StudentBallotCandidateDto {
  candidateId: string
  studentId: string
  fullName: string
  admissionNumber?: string
  className?: string
  profileImageUrl?: string | null
  manifesto?: string
}

export interface StudentBallotSubcategoryDto {
  subcategoryId: string
  subcategoryName: string
  displayTitle: string
  orderIndex: number
  hasVoted: boolean
  candidates: StudentBallotCandidateDto[]
  votedCandidateId?: string
  votedCandidateName?: string
}

export interface StudentBallotDto {
  electionId: string
  title: string
  categoryName: string
  academicSessionName: string
  status: ElectionStatus
  studentName: string
  studentClassName: string
  isEligible: boolean
  ineligibilityReason?: string
  openBallots: StudentBallotSubcategoryDto[]
  completedBallots: StudentBallotSubcategoryDto[]
}

export interface CastElectionVoteInput {
  subcategoryId: string
  candidateId: string
}

export interface CastElectionVoteCommand {
  electionId: string
  studentSchoolId: string
  schoolId: string
  votes: CastElectionVoteInput[]
}

export interface StaffElectionListItemDto {
  electionId: string
  title: string
  categoryName: string
  academicSessionName: string
  status: ElectionStatus
  completedBallotsCount: number
  totalSubcategoriesCount: number
  candidatesCount: number
  hasCompletedAllBallots: boolean
  startDate?: string | null
  endDate?: string | null
}

export interface StaffElectionsDashboardDto {
  staffId: string
  staffName: string
  roleName: string | null
  elections: StaffElectionListItemDto[]
}

export interface GetStaffElectionsParamsI {
  staffId: string
  schoolId: string
  search?: string
  status?: ElectionStatus
  schoolSessionId?: string
}

export interface StaffBallotCandidateDto {
  candidateId: string
  candidateType: CandidateSearchType
  staffId?: string | null
  studentId?: string | null
  fullName: string
  roleName?: string | null
  className?: string | null
  profileImageUrl?: string | null
  manifesto?: string | null
}

export interface StaffBallotSubcategoryDto {
  subcategoryId: string
  subcategoryName: string
  displayTitle: string
  orderIndex: number
  hasVoted: boolean
  votedCandidateId?: string | null
  votedCandidateName?: string | null
  candidates: StaffBallotCandidateDto[]
}

export interface StaffBallotDto {
  electionId: string
  title: string
  categoryName: string
  academicSessionName: string
  status: ElectionStatus
  staffId: string
  staffName: string
  staffRole?: string
  isEligible: boolean
  ineligibilityReason?: string | null
  openBallots: StaffBallotSubcategoryDto[]
  completedBallots: StaffBallotSubcategoryDto[]
}

export interface CastStaffVoteCommand {
  electionId: string
  staffId: string
  schoolId: string
  votes: CastElectionVoteInput[]
}
