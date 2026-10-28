import type { StaffDirectoryItemI } from "@/api/staff.api/types"
import type { SchoolStudentItemI } from "@/api/studentPortal.api/types"
import type { DirectoryStudent } from "@/lib/schoolStudentDirectory"
import type { EnrolmentSummary, StaffSummary } from "./useReportData"

type Sex = "M" | "F" | ""

export function sexOf(gender: string | number | null | undefined): Sex {
  const g = String(gender ?? "").toLowerCase()
  if (g === "1" || g.startsWith("m")) return "M"
  if (g === "2" || g.startsWith("f")) return "F"
  return ""
}

export function qualificationBucket(text: string | null): string {
  const q = (text ?? "").trim().toLowerCase()
  if (!q) return "Not recorded"
  if (/grade\s*(ii|2)|grd/.test(q)) return "Grade II"
  if (/\bnce\b/.test(q)) return "NCE"
  if (
    /b\.?\s?sc|b\.?\s?ed|b\.?\s?a\b|degree|hnd|m\.?\s?sc|ph\.?d|master/.test(q)
  )
    return "Degree & above"
  return "Other"
}

function tally(values: string[]) {
  const counts = new Map<string, number>()
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1)
  return Array.from(counts, ([label, count]) => ({ label, count })).sort(
    (a, b) => b.count - a.count
  )
}

const AGE_BANDS: [string, number, number][] = [
  ["Under 5", 0, 4],
  ["5 - 7", 5, 7],
  ["8 - 10", 8, 10],
  ["11 - 13", 11, 13],
  ["14 - 16", 14, 16],
  ["17+", 17, 200],
]

function ageOf(dob: string) {
  const born = new Date(dob)
  if (Number.isNaN(born.getTime())) return null
  const now = new Date()
  let age = now.getFullYear() - born.getFullYear()
  if (
    now.getMonth() < born.getMonth() ||
    (now.getMonth() === born.getMonth() && now.getDate() < born.getDate())
  )
    age -= 1
  return age
}

export function buildEnrolment(
  roster: DirectoryStudent[],
  people: SchoolStudentItemI[]
): EnrolmentSummary {
  const byId = new Map(people.map((p) => [p.studentId, p]))
  const classes = new Map<
    string,
    { boys: number; girls: number; total: number }
  >()
  const ageCounts = new Map<string, number>()
  let boys = 0
  let girls = 0
  let withDob = 0
  let withGender = 0

  for (const s of roster) {
    const row = classes.get(s.className) ?? { boys: 0, girls: 0, total: 0 }
    const person = byId.get(s.studentId)
    const sex = sexOf(person?.gender)
    if (sex === "M") {
      boys += 1
      row.boys += 1
    } else if (sex === "F") {
      girls += 1
      row.girls += 1
    }
    row.total += 1
    classes.set(s.className, row)

    if (sex) withGender += 1
    const age = person?.dateofBirth ? ageOf(person.dateofBirth) : null
    if (age !== null) {
      withDob += 1
      const band = AGE_BANDS.find(([, lo, hi]) => age >= lo && age <= hi)
      if (band) ageCounts.set(band[0], (ageCounts.get(band[0]) ?? 0) + 1)
    }
  }

  return {
    total: roster.length,
    boys,
    girls,
    byClass: Array.from(classes, ([className, v]) => ({
      className,
      ...v,
    })).sort((a, b) =>
      a.className.localeCompare(b.className, undefined, { numeric: true })
    ),
    ageBands: AGE_BANDS.map(([band]) => ({
      band,
      count: ageCounts.get(band) ?? 0,
    })),
    completeness: [
      { label: "Student gender", filled: withGender, total: roster.length },
      { label: "Student date of birth", filled: withDob, total: roster.length },
    ],
  }
}

export function buildStaff(items: StaffDirectoryItemI[]): StaffSummary {
  const isTeaching = (s: StaffDirectoryItemI) =>
    /teach|tutor|instruct/i.test(`${s.role} ${s.department}`)
  const teaching = items.filter(isTeaching).length

  return {
    total: items.length,
    teaching,
    nonTeaching: items.length - teaching,
    male: items.filter((s) => sexOf(s.gender) === "M").length,
    female: items.filter((s) => sexOf(s.gender) === "F").length,
    byQualification: tally(
      items.map((s) => qualificationBucket(s.qualification))
    ),
    byRole: tally(items.map((s) => s.role || "Not recorded")),
    byStatus: tally(items.map((s) => s.statusLabel || "Not recorded")),
    roster: items.map((s) => ({
      id: s.subUserId,
      name: s.fullName,
      sex: sexOf(s.gender),
      dob: s.dateOfBirth,
      qualification: s.qualification,
      role: s.role,
      department: s.department,
      category: isTeaching(s) ? "Teaching" : "Non-teaching",
      status: s.statusLabel,
      serviceNumber: s.serviceNumber ?? "",
      gradeLevel: [s.gradeLevel, s.gradeStep].filter(Boolean).join(" / "),
      firstAppointment: s.firstAppointmentDate ?? "",
      presentAppointment: s.presentAppointmentDate ?? "",
      datePosted: s.datePostedToSchool ?? "",
      origin: [s.stateOfOrigin, s.lgaOfOrigin].filter(Boolean).join(" / "),
      town: s.town ?? "",
    })),
    completeness: [
      {
        label: "Staff gender",
        filled: items.filter((s) => sexOf(s.gender)).length,
        total: items.length,
      },
      {
        label: "Staff date of birth",
        filled: items.filter((s) => s.dateOfBirth).length,
        total: items.length,
      },
      {
        label: "Staff qualification",
        filled: items.filter((s) => s.qualification?.trim()).length,
        total: items.length,
      },
      {
        label: "Service (SB) number",
        filled: items.filter((s) => s.serviceNumber?.trim()).length,
        total: items.length,
      },
      {
        label: "Grade level and step",
        filled: items.filter((s) => s.gradeLevel?.trim()).length,
        total: items.length,
      },
      {
        label: "Date of first appointment",
        filled: items.filter((s) => s.firstAppointmentDate).length,
        total: items.length,
      },
      {
        label: "Date of present appointment",
        filled: items.filter((s) => s.presentAppointmentDate).length,
        total: items.length,
      },
      {
        label: "Date posted to this school",
        filled: items.filter((s) => s.datePostedToSchool).length,
        total: items.length,
      },
      {
        label: "State and LGA of origin",
        filled: items.filter((s) => s.stateOfOrigin && s.lgaOfOrigin).length,
        total: items.length,
      },
      {
        label: "Town",
        filled: items.filter((s) => s.town?.trim()).length,
        total: items.length,
      },
    ],
  }
}
