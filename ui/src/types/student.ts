import type { StudentSearchResultI } from "@/api/studentPortal.api/types"
import type { GuardianItemI } from "@/api/guardian.api/types"

export type EnrollmentStatus =
  | "Active"
  | "Graduated"
  | "Withdrawn"
  | "Suspended"

export type Gender = "Male" | "Female" | "Other"

export type BloodGroup = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-"

export type Religion = "Christianity" | "Islam" | "Traditional" | "Other"

export interface AddStudentDraftValues {
  studentId: string
  firstName: string
  lastName: string
  middleName: string
  email: string
  isDefaultEmail: boolean
  generatedEmail: string
  gender: Gender | ""
  dob: string
  passport: string | null
  selectedGuardian: GuardianItemI | null
  linkedExistingStudent: StudentSearchResultI | null
  religion: Religion | ""
  religionOther: string
  nationality: string
  stateOfOrigin: string
  lgaOfOrigin: string
  homeAddress: string
  admissionDate: string
  previousSchool: string
  historySession: string
  historyTerm: string
  historyClass: string
  historyAverage: string
  historyRemarks: string
}

export type ModalState =
  | { type: "none" }
  | { type: "create"; step: 1 | 2; createdGuardian: Guardian | null }
  | { type: "view"; guardian: Guardian }
  | { type: "manage"; guardian: Guardian }

export interface Guardian {
  id: string
  firstName: string
  lastName: string
  relationship: string
  phone: string
  email?: string
  address?: string
  occupation?: string
  createdAt: string
  passportPhoto?: string | null
}

export interface GuardianState {
  guardians: Guardian[]
  addGuardian: (data: Omit<Guardian, "id" | "createdAt">) => Guardian
  search: (query: string) => Guardian[]
  findByPhone: (phone: string) => Guardian | undefined
  linkGuardianToStudents: (guardianId: string, studentIds: string[]) => void
  unlinkStudentFromGuardian: (studentId: string) => void
}

export interface AcademicRecord {
  session: string
  term: string
  class: string
  position?: number
  totalStudents?: number
  average?: number
  remarks?: string
}

export interface WelfareRecord {
  date: string
  type: "Behavioral" | "Counseling" | "Incident" | "Medical" | "Special Needs"
  description: string
  reportedBy?: string
  resolved: boolean
  resolution?: string
}

export interface MedicalInfo {
  bloodGroup?: BloodGroup
  genotype?: string
  allergies?: string
  chronicConditions?: string
  disabilities?: string
  emergencyMedicalInfo?: string
  weight?: string
}

export interface StudentBasic {
  id: string
  studentId?: string
  firstName: string
  lastName: string
  middleName?: string
  class: string
  arm?: string
  enrollmentStatus: EnrollmentStatus
  gender: Gender
  dateOfBirth?: string
  createdAt: string
  updatedAt: string
  guardianId: string
}

export interface StudentStandard extends StudentBasic {
  profileMode: "standard" | "advanced"
  passportPhoto?: string
  religion?: Religion
  nationality?: string
  stateOfOrigin?: string
  lgaOfOrigin?: string
  homeAddress?: string
  admissionDate?: string
  previousSchool?: string
  academicHistory: AcademicRecord[]
}

export interface StudentAdvanced extends StudentStandard {
  profileMode: "advanced"
  medicalInfo: MedicalInfo
  hasSpecialNeeds: boolean
  specialNeedsDescription?: string
  welfareRecords: WelfareRecord[]
  behavioralNotes?: string
  extracurriculars?: string[]
}

export type StudentRecord = StudentBasic | StudentStandard | StudentAdvanced

export interface StudentState {
  students: StudentRecord[]
  addStudent: (
    data: Omit<StudentBasic, "id" | "createdAt" | "updatedAt">
  ) => StudentBasic
  updateStudent: (id: string, data: Partial<StudentRecord>) => void
}

export interface BasicSectionProps {
  studentId: string
  passport?: string | null
  onPassportChange: (val: string | null) => void
  firstName: string
  lastName: string
  middleName: string
  email: string
  isDefaultEmail: boolean
  onDefaultEmailChange: (value: boolean) => void
  password: string
  gender: Gender | ""
  dob: string
  nationality: string
  stateOfOrigin: string
  lgaOfOrigin: string
  selectedGuardian: GuardianItemI | null
  onGuardianChange: (guardian: GuardianItemI | null) => void
  errors: Record<string, string>
  onStudentIdChange: (v: string) => void
  onFirstNameChange: (v: string) => void
  onLastNameChange: (v: string) => void
  onMiddleNameChange: (v: string) => void
  onGenerateEmail: () => void
  onEmailChange: (v: string) => void
  onGeneratePassword: () => void
  onGenderChange: (v: Gender) => void
  onDobChange: (v: string) => void
  onNationalityChange: (v: string) => void
  onStateOfOriginChange: (v: string) => void
  onLgaOfOriginChange: (v: string) => void
  clearError: (field: string) => void
  onSave: () => void
  onCancel: () => void
  existingStudentQuery: string
  onExistingStudentQueryChange: (v: string) => void
  existingStudentResults: StudentSearchResultI[]
  existingStudentLoading: boolean
  linkedExistingStudent: StudentSearchResultI | null
  onSelectExistingStudent: (result: StudentSearchResultI) => void
  onClearExistingStudent: () => void
}

export interface StandardSectionProps {
  religion: Religion | ""
  religionOther: string
  homeAddress: string
  admissionDate: string
  previousSchool: string
  historySession: string
  historyTerm: string
  historyClass: string
  historyAverage: string
  historyLeaving: string
  errors: Record<string, string>
  clearError: (field: string) => void
  onReligionChange: (v: Religion) => void
  onReligionOtherChange: (v: string) => void
  onHomeAddressChange: (v: string) => void
  onAdmissionDateChange: (v: string) => void
  onPreviousSchoolChange: (v: string) => void
  onHistorySessionChange: (v: string) => void
  onHistoryTermChange: (v: string) => void
  onHistoryClassChange: (v: string) => void
  onHistoryAverageChange: (v: string) => void
  onHistoryLeavingChange: (v: string) => void
  onSave: () => void
  onBack: () => void
}

export interface AdvancedSectionProps {
  bloodGroup: BloodGroup | ""
  genotype: string
  allergies: string
  chronicConditions: string
  disabilities: string
  hasSpecialNeeds: boolean
  specialNeedsDesc: string
  behavioralNotes: string
  extracurriculars: string
  welfareType: string
  welfareDate: string
  welfareDescription: string
  welfareReportedBy: string
  onBloodGroupChange: (v: BloodGroup) => void
  onGenotypeChange: (v: string) => void
  onAllergiesChange: (v: string) => void
  onChronicConditionsChange: (v: string) => void
  onDisabilitiesChange: (v: string) => void
  onHasSpecialNeedsToggle: () => void
  onSpecialNeedsDescChange: (v: string) => void
  onBehavioralNotesChange: (v: string) => void
  onExtracurricularsChange: (v: string) => void
  onWelfareTypeChange: (v: string) => void
  onWelfareDateChange: (v: string) => void
  onWelfareDescriptionChange: (v: string) => void
  onWelfareReportedByChange: (v: string) => void
  onSave: () => void
  onBack: () => void
  isSubmitting: boolean
}

export type ElectionCategory = string

export type ElectionStatus = "Active" | "Closed" | "Draft"

/** Who is allowed to vote. Elections without this field are legacy and student-only. */
export type VoterType = "student" | "staff"

export type Candidate = {
  subcategoryId?: string
  studentId?: string
  profilePicture?: string
  id: string
  name: string
  class: string
  manifesto?: string
  votes: number
}

export type Election = {
  academicSessionId?: string
  academicSessionName?: string
  subcategories?: { id: string; name: string }[]
  eligibleClasses?: string[]
  /** Defaults to ["student"] when absent, so existing elections keep their current behaviour. */
  eligibleVoterTypes?: VoterType[]
  id: string
  title: string
  category: ElectionCategory
  eligibleClass: string
  status: ElectionStatus
  candidates: Candidate[]
  createdAt: string
  closedAt?: string
}

export type VoterRecord = {
  subcategoryId?: string
  studentId: string
  studentName: string
  /** Defaults to "student" when absent (legacy votes). */
  voterType?: VoterType
  electionId: string
  candidateId: string
  votedAt: string
}
