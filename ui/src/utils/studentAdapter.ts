import type {
  SchoolStudentItemI,
  StudentDetailI,
  StudentGuardianI,
  StudentSubjectI,
} from "@/api/studentPortal.api/types"
import type { StudentExtras } from "@/store/studentExtras.store"
import type { Gender, EnrollmentStatus } from "@/types/student"
import { genderFromApi, statusFromApi } from "./studentEnums"

export interface StudentListRow {
  id: string
  studentGivenId?: string
  firstName: string
  lastName: string
  email?: string
  dateOfBirth?: string
  gender: Gender
  enrollmentStatus: EnrollmentStatus
  isEnrolled: boolean
  guardians: StudentGuardianI[]
}

export function mapSchoolStudentItem(item: SchoolStudentItemI): StudentListRow {
  return {
    id: item.studentId,
    studentGivenId: item.studentGivenId,
    firstName: item.firstname,
    lastName: item.lastname,
    email: item.email,
    dateOfBirth: item.dateofBirth,
    gender: genderFromApi(item.gender),
    enrollmentStatus: statusFromApi(item.status),
    isEnrolled: item.isEnrolled,
    guardians: item.guardians ?? [],
  }
}

export interface StudentProfileData {
  id: string
  studentGivenId?: string
  schoolId: string
  firstName: string
  lastName: string
  email?: string
  phoneNumber?: string
  dateOfBirth?: string
  admissionDate?: string
  gender: Gender
  profilePicture?: string
  nationality?: string
  stateOfOrigin?: string
  lgaOfOrigin?: string
  homeAddress?: string
  religion?: string
  enrollmentStatus: EnrollmentStatus
  bloodGroup?: string
  genotype?: string
  allergies?: string
  chronicConditions?: string
  disabilities?: string
  hasSpecialNeeds: boolean
  specialNeedsDescription?: string
  guardians: StudentGuardianI[]
  enrollmentId?: string
  class?: string
  arm?: string
  subjects: StudentSubjectI[]
  extras: StudentExtras
}

export function mapStudentDetail(
  detail: StudentDetailI,
  extras: StudentExtras
): StudentProfileData {
  return {
    id: detail.studentId,
    studentGivenId: detail.studentGivenId,
    schoolId: detail.schoolId,
    firstName: detail.firstname,
    lastName: detail.lastname,
    email: detail.email,
    phoneNumber: detail.phoneNumber,
    dateOfBirth: detail.dateofBirth,
    admissionDate: detail.admissionDate || extras.admissionDate,
    gender: genderFromApi(detail.gender),
    profilePicture: detail.profilePicture,
    nationality: detail.nationality,
    stateOfOrigin: detail.stateOfOrigin,
    lgaOfOrigin: detail.localGovernment,
    homeAddress: detail.homeAddress,
    religion: detail.religion,
    enrollmentStatus: statusFromApi(detail.status),
    bloodGroup: detail.bloodGroup,
    genotype: detail.genotype,
    allergies: detail.allergies,
    chronicConditions: detail.chronicCondtions,
    disabilities: detail.disabilities,
    hasSpecialNeeds: detail.specialNeeds,
    specialNeedsDescription:
      detail.specialNeedsDescription || extras.specialNeedsDescription,
    guardians: detail.guardians ?? [],
    enrollmentId: detail.enrollmentId,
    class: detail.schoolClassName,
    arm: detail.schoolArmName,
    subjects: detail.subjects ?? [],
    extras,
  }
}
