import type {
  GuardianChildI,
  GuardianDetailsChildI,
  GuardianItemI,
  LaunchSchoolPortalActiveSessionFeeBreakdownI,
  LaunchSchoolPortalCurrentClassI,
  LaunchSchoolPortalChildI,
  LaunchSchoolPortalDataI,
  LaunchSchoolPortalSessionI,
  LaunchSchoolPortalTermBreakdownI,
  StudentFeeBreakdownI,
  StudentFeeBreakdownTermI,
} from "@/api/guardian.api/types"
import type { SchoolStudentItemI } from "@/api/studentPortal.api/types"
import type { SchoolSessionItem } from "@/api/userMgt.api/types"
import type { LinkedChild, Parent } from "@/types/parent"

const RELATIONSHIPS = ["Father", "Mother", "Guardian"] as const

export function formatClassOptionLabel(
  className: string | null | undefined,
  armName: string | null
): string {
  if (!className) return "Enrollment Pending"
  return armName ? `${className} - ${armName}` : className
}

export function getCurrentPortalClass(
  child: LaunchSchoolPortalChildI
): LaunchSchoolPortalCurrentClassI | undefined {
  if (child.currentSchoolClassId) {
    return (
      child.currentSessionClasses.find(
        (item) => item.schoolClassId === child.currentSchoolClassId
      ) ?? {
        enrollmentId: "",
        schoolClassId: child.currentSchoolClassId,
        className: child.currentClassName ?? "",
        schoolArmId: child.currentSchoolArmId ?? null,
        armName: child.currentSchoolArmName ?? null,
        isCurrent: true,
      }
    )
  }
  return child.currentSessionClasses.find((item) => item.isCurrent)
}

function initialsOf(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

export function initialsOfName(fullName: string): string {
  const words = fullName.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return "?"
  if (words.length === 1) return words[0].charAt(0).toUpperCase()
  return `${words[0].charAt(0)}${words[words.length - 1].charAt(0)}`.toUpperCase()
}

export function mapGuardianToParent(guardian: GuardianItemI): Parent {
  const relationship = RELATIONSHIPS.includes(
    guardian.relationship as (typeof RELATIONSHIPS)[number]
  )
    ? (guardian.relationship as Parent["relationship"])
    : "Guardian"

  return {
    id: guardian.id,
    firstName: guardian.firstName,
    lastName: guardian.lastName,
    email: guardian.email,
    phone: guardian.phone,
    address: guardian.address,
    occupation: guardian.occupation,
    relationship,
    children: [],
    createdAt: guardian.dateCreated
      ? new Date(guardian.dateCreated).toLocaleDateString()
      : "",
    avatarInitials: initialsOf(guardian.firstName, guardian.lastName),
    numberOfStudents: guardian.numberOfStudents,
  }
}

export function mapStudentToLinkedChild(item: SchoolStudentItemI): LinkedChild {
  return {
    id: item.studentId,
    name: `${item.firstname} ${item.lastname}`,
    class: "",
    studentId: item.studentGivenId,
    avatarInitials: initialsOf(item.firstname, item.lastname),
  }
}

export function mapGuardianDetailsChildToLinkedChild(
  child: GuardianDetailsChildI
): LinkedChild {
  return {
    id: child.studentId,
    name: child.fullName,
    class: child.currentClassName,
    studentId: child.studentGivenId,
    avatarInitials: initialsOfName(child.fullName),
  }
}

export function mapLaunchPortalChildToLinkedChild(
  child: LaunchSchoolPortalChildI
): LinkedChild {
  return {
    id: child.studentId,
    name: child.fullName,
    class: child.currentClassName ?? "",
    studentId: child.studentGivenId,
    avatarInitials: initialsOfName(child.fullName),
  }
}

export function mapLaunchPortalChildToGuardianChild(
  child: LaunchSchoolPortalChildI
): GuardianChildI {
  return {
    studentId: child.studentId,
    studentSchoolId: child.studentSchoolId,
    fullName: child.fullName,
    admissionNumber: child.studentGivenId,
    currentClass: formatClassOptionLabel(
      child.currentClassName,
      child.currentSchoolArmName ?? child.currentArmName ?? null
    ),
    currentSession:
      child.sessions.find((s) => s.isCurrentSession)?.sessionName ?? null,
    profileImageUrl: child.profilePicture ?? "",
    currentSessionClasses: child.currentSessionClasses,
    currentClassName: child.currentClassName,
    currentSchoolClassId: child.currentSchoolClassId,
    currentSchoolArmName: child.currentSchoolArmName ?? child.currentArmName,
    currentSchoolArmId: child.currentSchoolArmId,
  }
}

function mapLaunchPortalTermBreakdown(
  t: LaunchSchoolPortalTermBreakdownI
): StudentFeeBreakdownTermI {
  return {
    schoolSessionTermId: t.schoolSessionTermId,
    termName: t.termName,
    schoolStudentBillId: t.schoolStudentBillId,
    schoolPaymentStructureId: t.schoolPaymentStructureId,
    studentEnrollmentId: "",
    totalBilled: t.totalBilled,
    totalPaid: t.totalPaid,
    outstandingAmount: t.outstandingAmount,
    paymentStatus: t.paymentStatus,
    issueDate: t.issueDate,
    dueDate: t.dueDate,
    canMakePayment: t.canMakePayment,
    billItems: t.billItems,
  }
}

export function mapLaunchPortalFeeBreakdownToStudentFeeBreakdown(
  breakdown: LaunchSchoolPortalActiveSessionFeeBreakdownI
): StudentFeeBreakdownI {
  return {
    sessionId: breakdown.activeSessionId,
    sessionName: breakdown.activeSessionName,
    filteredClassId: null,
    filteredClassName: null,
    walletBalance: breakdown.walletBalance,
    totalBilled: breakdown.totalBilled,
    totalPaid: breakdown.totalPaid,
    outstandingBalance: breakdown.outstandingBalance,
    terms: breakdown.termBreakdowns.map(mapLaunchPortalTermBreakdown),
    classFeeBreakdowns: breakdown.classFeeBreakdowns.map((c) => ({
      classId: c.classId,
      className: c.className,
      classArmId: c.classArmId,
      armName: c.armName,
      totalBilled: c.totalBilled,
      totalPaid: c.totalPaid,
      outstandingBalance: c.outstandingBalance,
      terms: c.termBreakdowns.map(mapLaunchPortalTermBreakdown),
    })),
  }
}

export function mapLaunchPortalSessionsToSchoolSessions(
  sessions: LaunchSchoolPortalSessionI[]
): SchoolSessionItem[] {
  return sessions.map((s) => ({
    Id: s.sessionId,
    SessionName: s.sessionName,
    SchoolId: "",
    SchoolName: "",
    DateCreated: "",
    Status: s.isCurrentSession ? "Active" : undefined,
    IsCurrent: s.isCurrentSession,
    Terms: s.terms.map((t) => ({
      Id: t.schoolSessionTermId,
      SchoolSessionId: s.sessionId,
      SchoolTermId: t.termId,
      TermName: t.termName,
      IsCurrent: t.isCurrentTerm,
      StartDate: t.startDate,
      EndDate: t.endDate,
      DateCreated: "",
    })),
  }))
}

export function mapLaunchPortalToParent(portal: LaunchSchoolPortalDataI): Parent {
  const [firstName = "", ...rest] = portal.guardianFullName.trim().split(/\s+/)
  return {
    id: portal.guardianId,
    firstName,
    lastName: rest.join(" "),
    email: portal.guardianEmail,
    phone: portal.guardianPhone,
    address: "",
    occupation: "",
    relationship: "Guardian",
    children: portal.children.map(mapLaunchPortalChildToLinkedChild),
    createdAt: "",
    avatarInitials: initialsOfName(portal.guardianFullName),
    numberOfStudents: portal.children.length,
  }
}
