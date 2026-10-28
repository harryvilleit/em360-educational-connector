import type { AddStudentDraftValues } from "@/types/student"

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type EmailValues = Pick<
  AddStudentDraftValues,
  "email" | "isDefaultEmail" | "generatedEmail"
>

type BasicValues = Pick<
  AddStudentDraftValues,
  | "studentId"
  | "firstName"
  | "lastName"
  | "gender"
  | "dob"
  | "nationality"
  | "stateOfOrigin"
  | "lgaOfOrigin"
  | "selectedGuardian"
> &
  EmailValues & { password: string }

export function validateStudentEmail({
  email,
  isDefaultEmail,
  generatedEmail,
}: EmailValues): string | undefined {
  if (!email.trim()) {
    return isDefaultEmail
      ? 'Click "Generate Email" to create a login email.'
      : "Enter the student's personal email address."
  }
  if (!EMAIL_PATTERN.test(email.trim())) return "Enter a valid email address."
  if (isDefaultEmail && email.trim() !== generatedEmail) {
    return "Generate a new default email before continuing."
  }
  if (!isDefaultEmail && generatedEmail) {
    return "Enter the student's personal email address."
  }
  return undefined
}

export function validateStudentBasic(
  values: BasicValues
): Record<string, string> {
  const next: Record<string, string> = {}
  const isNigeria = values.nationality === "Nigeria"
  if (!values.studentId.trim()) next.studentId = "Student ID is required."
  if (!values.firstName.trim()) next.firstName = "First name is required."
  if (!values.lastName.trim()) next.lastName = "Last name is required."
  if (!values.gender) next.gender = "Gender is required."
  if (!values.dob) next.dob = "Date of birth is required."
  if (!values.nationality.trim()) next.nationality = "Nationality is required."
  if (!values.stateOfOrigin.trim())
    next.stateOfOrigin = isNigeria
      ? "State of origin is required."
      : "State / province / region is required."
  if (!values.lgaOfOrigin.trim())
    next.lgaOfOrigin = isNigeria
      ? "Local government area is required."
      : "City / district is required."
  if (!values.selectedGuardian)
    next.guardian = "A parent or guardian is required."
  const emailError = validateStudentEmail(values)
  if (emailError) next.email = emailError
  if (!values.password)
    next.password = 'Click "Generate Password" to create a login password.'
  return next
}

export function validateStudentStandard({
  homeAddress,
}: Pick<AddStudentDraftValues, "homeAddress">): Record<string, string> {
  const next: Record<string, string> = {}
  if (!homeAddress.trim()) next.homeAddress = "Home address is required."
  return next
}
