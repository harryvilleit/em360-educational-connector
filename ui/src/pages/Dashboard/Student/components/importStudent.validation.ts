import type { Gender } from "@/types/student"
import type { ValidRow, InvalidRow } from "./importStudent.types"

export type ParsedRow = {
  rowNumber: number
  data: Record<string, string>
}

const VALID_GENDERS: Gender[] = ["Male", "Female"]

export function validateRow(row: ParsedRow): ValidRow | InvalidRow {
  const d = row.data
  const errors: string[] = []

  const get = (key: string) => d[key.toLowerCase()] ?? ""

  const studentId = get("studentid")
  const firstName = get("firstname")
  const lastName = get("lastname")
  const middleName = get("middlename")
  const gender = get("gender")
  const dob = get("dateofbirth")
  const email = get("studentemail")
  const guardianAddress = get("guardianaddress")
  const cls = get("class")
  const arm = get("arm")
  const guardianName = get("guardianname")
  const guardianRelationship = get("guardianrelationship")
  const guardianPhone = get("guardianphone")
  const guardianEmail = get("guardianemail")

  if (!studentId) errors.push("studentId is required")
  if (!firstName) errors.push("firstName is required")
  if (!lastName) errors.push("lastName is required")
  if (!gender) errors.push("gender is required")
  else if (!VALID_GENDERS.includes(gender as Gender))
    errors.push(`gender must be "Male" or "Female", got "${gender}"`)
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(dob) ||
    Number.isNaN(Date.parse(dob)) ||
    new Date(dob).toISOString().slice(0, 10) !== dob ||
    dob > new Date().toISOString().slice(0, 10)
  )
    errors.push("dateOfBirth must be a valid past date (YYYY-MM-DD)")
  const validEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)
  if (!validEmail(email))
    errors.push("studentEmail is required and must be valid")
  if (!validEmail(guardianEmail))
    errors.push("guardianEmail is required and must be valid")
  if (email.toLowerCase() === guardianEmail.toLowerCase())
    errors.push("Student and guardian need different email addresses")
  if (guardianName.trim().split(/\s+/).length < 2)
    errors.push("guardianName needs first and last names")
  if (!cls) errors.push("class is required")
  if (!guardianName) errors.push("guardianName is required")
  if (!guardianRelationship) errors.push("guardianRelationship is required")
  if (!guardianPhone) errors.push("guardianPhone is required")

  if (errors.length > 0) {
    return { rowNumber: row.rowNumber, data: d, errors }
  }

  return {
    rowNumber: row.rowNumber,
    studentId,
    firstName,
    lastName,
    middleName: middleName || undefined,
    gender: gender as Gender,
    dob,
    email,
    class: cls,
    arm: arm || undefined,
    guardianName,
    guardianRelationship,
    guardianPhone,
    guardianEmail,
    guardianAddress: guardianAddress || undefined,
  }
}

export function isValidRow(row: ValidRow | InvalidRow): row is ValidRow {
  return !("errors" in row)
}
