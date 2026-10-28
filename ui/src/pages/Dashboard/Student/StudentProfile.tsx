import StudentClassTeachersSection from "./components/StudentClassTeachersSection"
import IdCardButton from "@/components/id-cards/IdCardButton"
import { useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  GraduationCap,
  Phone,
  Mail,
  MapPin,
  Heart,
  BookOpen,
  Edit,
  CreditCard,
  Calendar,
} from "lucide-react"
import { useSchoolId } from "@/contexts/SchoolContext"
import {
  useGetStudentDetail,
  useAdminResetStudentPassword,
} from "@/hooks/studentPortal"
import type { StudentExtras } from "@/store/studentExtras.store"
import { usePermissions } from "@/hooks/usePermissions"
import { QueryErrorPanel } from "@/components/general/QueryErrorPanel"
import { DashboardRoutes } from "@/routes"
import type { EnrollmentStatus } from "@/types/student"
import { formatDate } from "@/utils"
import { useSchoolMoney } from "@/hooks/useSchoolMoney"
import { genderFromApi, statusFromApi } from "@/utils/studentEnums"
import {
  SectionCard,
  ProfileField,
  ProfileHero,
} from "@/components/general/ProfileSections"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AdminResetPasswordSection } from "@/components/general/AdminResetPasswordSection"
import { AcademicHistorySection } from "./components/AcaddmicHistorySection"
import { WelfareSection } from "./components/WelfareSection"
import { ExtracurricularsSection } from "./components/ExtraCurriculumSection"
import TeacherSupportSummary from "../LearnerSupport/TeacherSupportSummary"

const STATUS_STYLES: Record<EnrollmentStatus | "Pending", string> = {
  Pending: "bg-amber-100 text-amber-700",
  Active: "bg-emerald-100 text-emerald-700",
  Graduated: "bg-blue-100 text-blue-700",
  Withdrawn: "bg-gray-100 text-gray-600",
  Suspended: "bg-red-100 text-red-700",
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] as const

function feeStatusBadgeClass(status?: string | null): string {
  const normalized = (status ?? "").toLowerCase().replace(/\s+/g, "")
  if (normalized.includes("partial")) return "bg-amber-100 text-amber-700"
  if (normalized === "paid" || normalized === "cleared")
    return "bg-emerald-100 text-emerald-700"
  if (normalized.includes("owing") || normalized.includes("unpaid"))
    return "bg-red-100 text-red-700"
  return "bg-gray-100 text-gray-500"
}

const GUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function formatBillReference(invoiceNumber: string): string {
  return GUID_RE.test(invoiceNumber)
    ? `INV-${invoiceNumber.slice(0, 8).toUpperCase()}`
    : invoiceNumber
}

export default function StudentProfilePage() {
  const { formatMoney } = useSchoolMoney()
  const navigate = useNavigate()
  const { productId, studentId } = useParams()
  const schoolId = useSchoolId()

  const [activeDay, setActiveDay] = useState<(typeof DAYS)[number]>("Monday")
  const [selectedClassId, setSelectedClassId] = useState("")

  const {
    student: detail,
    isLoading,
    isError,
    refetch,
  } = useGetStudentDetail({
    studentId: studentId!,
    schoolId,
  })
  const extras: StudentExtras = {
    academicHistory: [],
    welfareRecords: [],
    extracurriculars: [],
    ...detail?.profile,
  }
  const { canUpdate } = usePermissions()
  const editable = canUpdate("/dashboard/students/list")
  const { adminResetStudentPasswordAsync, isPending: isResettingPassword } =
    useAdminResetStudentPassword()

  const primaryEnrolledClass = useMemo(
    () =>
      detail?.enrolledClasses?.find((c) => c.isPrimary) ??
      detail?.enrolledClasses?.[0],
    [detail?.enrolledClasses],
  )

  const daySchedule = useMemo(
    () =>
      (detail?.classTimetable ?? [])
        .filter((slot) => slot.dayOfWeekName === activeDay)
        .sort((a, b) =>
          (a.formattedStartTime ?? "").localeCompare(
            b.formattedStartTime ?? "",
          ),
        ),
    [detail?.classTimetable, activeDay],
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-sm text-gray-500">
        Loading student...
      </div>
    )
  }

  if (isError)
    return (
      <QueryErrorPanel
        title="Unable to load student"
        message="Please retry to load the latest student record."
        onRetry={() => void refetch()}
      />
    )
  if (!detail) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <GraduationCap className="size-10 text-gray-300" />
        <p className="text-sm text-gray-500">Student not found.</p>
        <Button
          variant="outline"
          onClick={() => navigate(DashboardRoutes.toStudentList(productId!))}
        >
          Back to Students
        </Button>
      </div>
    )
  }

  const enrolledClasses = detail.enrolledClasses ?? []
  const selectedClass =
    enrolledClasses.find((c) => c.schoolClassId === selectedClassId) ??
    primaryEnrolledClass

  const className =
    selectedClass?.schoolClassName || detail.primarySchoolClassName || undefined
  const armName = selectedClass?.schoolArmName ?? undefined
  const classLabel = className
    ? `${className}${armName ? ` ${armName}` : ""}`
    : "Unassigned"

  const enrollmentLabel: EnrollmentStatus | "Pending" = className
    ? statusFromApi(detail.status)
    : "Pending"

  const guardians = detail.guardians ?? []
  const subjects = detail.subjects ?? []

  const subjectsForSelectedClass = subjects.filter(
    (s) =>
      !s.classId ||
      !selectedClass?.schoolClassId ||
      s.classId === selectedClass.schoolClassId,
  )
  const feeStatus = detail.feeStatus ?? {
    overallStatus: "No Records",
    totalBilled: 0,
    amountPaid: 0,
    outstandingBalance: 0,
    bills: [],
  }
  const bills = feeStatus.bills ?? []
  const medical = detail.medicalInformation

  return (
    <div className="space-y-6 py-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <button
          onClick={() => navigate(DashboardRoutes.toStudentList(productId!))}
          className="flex w-fit items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="size-4" />
          Back to Students
        </button>

        <ProfileHero
          avatarInitials={`${detail.firstname?.[0] ?? ""}${detail.lastname?.[0] ?? ""}`}
          avatarClassName="bg-blue-600"
          avatarSrc={detail.profilePicture ?? undefined}
          name={detail.fullName}
          badge={
            <span
              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[enrollmentLabel]}`}
            >
              {enrollmentLabel}
            </span>
          }
          subtitle={
            <span>
              <span className="font-mono">{detail.studentGivenId ?? "—"}</span>
              {" · "}
              {classLabel}
              {extras.sssTrack ? ` · ${extras.sssTrack}` : ""}
            </span>
          }
          actions={
            <div className="flex flex-wrap gap-2">
              <IdCardButton
                card={{
                  kind: "student",
                  schoolId,
                  personId: detail.studentId,
                  displayId: detail.studentGivenId || detail.studentId,
                  name: detail.fullName,
                  photo: detail.profilePicture ?? undefined,
                  className: classLabel,
                  gender:
                    detail.gender == null || detail.gender === ""
                      ? undefined
                      : genderFromApi(detail.gender),
                  session: detail.currentSessionName,
                }}
              />
              {editable && (
                <Button
                  onClick={() =>
                    navigate(
                      DashboardRoutes.toStudentEdit(
                        productId!,
                        detail.studentId,
                      ),
                    )
                  }
                  variant="outline"
                  className="rounded-xl"
                >
                  <Edit className="mr-1.5 size-4" />
                  Edit Profile
                </Button>
              )}
            </div>
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <TeacherSupportSummary
          schoolId={schoolId}
          studentId={detail.studentId}
          allowLogging={editable}
        />
        {/* Basic info */}
        <SectionCard title="Student Details" icon={GraduationCap}>
          <div className="grid grid-cols-2 gap-4">
            <ProfileField label="Gender" value={genderFromApi(detail.gender)} />
            <ProfileField
              label="Date of Birth"
              value={formatDate(detail.dateofBirth, "YYYY-MM-DD")}
            />
            {enrolledClasses.length > 1 ? (
              <div>
                <p className="mb-0.5 text-xs text-gray-400">Class</p>
                <Select
                  value={selectedClass?.schoolClassId}
                  onValueChange={setSelectedClassId}
                >
                  <SelectTrigger
                    size="sm"
                    className="h-8 w-full font-medium text-gray-800"
                  >
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {enrolledClasses.map((c) => (
                      <SelectItem key={c.schoolClassId} value={c.schoolClassId}>
                        {c.schoolClassName}
                        {c.schoolArmName ? ` ${c.schoolArmName}` : ""}
                        {c.isPrimary ? " (Primary)" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <ProfileField label="Class" value={classLabel} />
            )}
            <ProfileField label="Enrollment Status" value={enrollmentLabel} />
            <ProfileField label="Session" value={detail.currentSessionName} />
            <ProfileField label="Term" value={detail.currentTermName} />
            <ProfileField label="Email" value={detail.email} />
            {extras.sssTrack && (
              <ProfileField label="SSS Track" value={extras.sssTrack} />
            )}
            <ProfileField label="Nationality" value={detail.nationality} />
            <ProfileField label="Religion" value={detail.religion} />
            <ProfileField
              label="State of Origin"
              value={detail.stateOfOrigin}
            />
            <ProfileField
              label="LGA of Origin"
              value={detail.localGovernment}
            />
            <ProfileField
              label="Admission Date"
              value={formatDate(
                extras.admissionDate || detail.admissionDate,
                "YYYY-MM-DD",
              )}
            />
            <ProfileField
              label="Previous School"
              value={extras.previousSchool || detail.previousSchool}
            />
            {detail.homeAddress && (
              <div className="col-span-2 flex items-start gap-1.5">
                <MapPin className="mt-0.5 size-3.5 shrink-0 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-400">Home Address</p>
                  <p className="mt-0.5 text-sm text-gray-900">
                    {detail.homeAddress}
                  </p>
                </div>
              </div>
            )}
          </div>
        </SectionCard>

        {/* Reset Password */}
        {editable && (
          <AdminResetPasswordSection
            key={studentId}
            onReset={(password) =>
              adminResetStudentPasswordAsync({
                studentId: detail.studentId,
                password,
                schoolId: detail.schoolId,
              })
            }
            isPending={isResettingPassword}
          />
        )}

        {/* Guardian */}
        <SectionCard title="Guardian / Parent" icon={Phone}>
          {guardians.length === 0 ? (
            <p className="text-xs text-gray-400">
              No guardian information available.
            </p>
          ) : (
            <div className="space-y-4">
              {guardians.map((guardian, index) => (
                <div
                  key={guardian.id || index}
                  className={index > 0 ? "border-t border-gray-100 pt-4" : ""}
                >
                  <div className="grid grid-cols-2 gap-4">
                    <ProfileField
                      label="Full Name"
                      value={`${guardian.firstName ?? ""} ${guardian.lastName ?? ""}`.trim()}
                    />
                    <ProfileField
                      label="Relationship"
                      value={guardian.relationship}
                    />
                    <ProfileField label="Phone" value={guardian.phone} />
                    <ProfileField
                      label="Occupation"
                      value={guardian.occupation}
                    />
                    {guardian.email && (
                      <div className="col-span-2 flex min-w-0 items-center gap-1.5">
                        <Mail className="size-3.5 shrink-0 text-gray-400" />
                        <span className="min-w-0 text-sm wrap-break-word text-gray-700">
                          {guardian.email}
                        </span>
                      </div>
                    )}
                    {guardian.address && (
                      <div className="col-span-2">
                        <ProfileField
                          label="Address"
                          value={guardian.address}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* Class Teachers */}
        {selectedClass?.schoolClassId && schoolId && (
          <StudentClassTeachersSection
            schoolId={schoolId}
            classId={selectedClass.schoolClassId}
            className={selectedClass.schoolClassName}
          />
        )}
        {/* Fee Status */}
        <SectionCard title="Fee Status" icon={CreditCard}>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/60 px-4 py-3">
              <span className="text-sm text-gray-500">Status</span>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${feeStatusBadgeClass(feeStatus.overallStatus)}`}
              >
                {feeStatus.overallStatus || "No Records"}
              </span>
            </div>
            {bills.length > 0 && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total Billed</span>
                  <span className="font-medium text-gray-900">
                    {formatMoney(feeStatus.totalBilled)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Amount Paid</span>
                  <span className="font-medium text-emerald-700">
                    {formatMoney(feeStatus.amountPaid)}
                  </span>
                </div>
                {feeStatus.outstandingBalance > 0 && (
                  <div className="flex justify-between border-t border-gray-100 pt-2 text-sm">
                    <span className="text-gray-500">Outstanding Balance</span>
                    <span className="font-semibold text-red-600">
                      {formatMoney(feeStatus.outstandingBalance)}
                    </span>
                  </div>
                )}
                <div className="mt-2 space-y-2">
                  {bills.map((bill) => (
                    <div
                      key={bill.schoolStudentBillId}
                      className="flex items-center justify-between rounded-xl border border-gray-100 bg-white px-3 py-2 text-xs"
                    >
                      <div>
                        <p className="font-medium text-gray-800">
                          {formatBillReference(bill.invoiceNumber)}
                        </p>
                        <p className="text-gray-400">
                          {bill.termName} · {bill.sessionName}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-2 py-0.5 font-semibold ${feeStatusBadgeClass(bill.paymentStatus)}`}
                      >
                        {bill.paymentStatus}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
            {bills.length === 0 && (
              <p className="text-xs text-gray-400">
                No invoices found for this student.
              </p>
            )}
          </div>
        </SectionCard>

        {/* Subjects */}
        {subjectsForSelectedClass.length > 0 && (
          <SectionCard
            title={`Subjects${className ? ` — ${className}` : ""}${extras.sssTrack ? ` (${extras.sssTrack})` : ""}`}
            icon={BookOpen}
          >
            <div className="flex flex-wrap gap-2">
              {subjectsForSelectedClass.map((subject) => (
                <span
                  key={subject.subjectId}
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    subject.isActive
                      ? "bg-blue-50 text-blue-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {subject.subjectName}
                  {!subject.isActive && (
                    <span className="ml-1 text-gray-400">(inactive)</span>
                  )}
                </span>
              ))}
            </div>
            <p className="mt-3 text-xs text-gray-400">
              Blue = active · Grey = inactive
            </p>
          </SectionCard>
        )}

        {/* Timetable */}
        <SectionCard
          title="Class Timetable"
          icon={Calendar}
          action={
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  navigate(
                    DashboardRoutes.toStudentTimetable(productId!, studentId!),
                  )
                }
                className="text-xs font-medium text-blue-600 hover:underline"
              >
                View Full Timetable
              </button>
              <button
                type="button"
                onClick={() =>
                  navigate(
                    DashboardRoutes.toStudentCalendar(productId!, studentId!),
                  )
                }
                className="text-xs font-medium text-blue-600 hover:underline"
              >
                School Calendar
              </button>
            </div>
          }
        >
          <div className="mb-3 flex flex-wrap gap-1.5">
            {DAYS.map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => setActiveDay(day)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  activeDay === day
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {day.slice(0, 3)}
              </button>
            ))}
          </div>
          {daySchedule.length > 0 ? (
            <div className="space-y-1.5">
              {daySchedule.map((slot, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs ${
                    slot.subjectName === "Break"
                      ? "bg-amber-50 text-amber-700"
                      : slot.subjectName.includes("Assembly") ||
                          slot.subjectName.includes("Closing")
                        ? "bg-gray-50 text-gray-500"
                        : "bg-blue-50/60 text-gray-800"
                  }`}
                >
                  <span className="w-28 shrink-0 text-gray-400">
                    {slot.formattedStartTime} - {slot.formattedEndTime}
                  </span>
                  <span className="flex-1 font-medium">{slot.subjectName}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400">
              No classes scheduled for {activeDay}.
            </p>
          )}
        </SectionCard>

        {/* Academic History */}
        <AcademicHistorySection records={extras.academicHistory} />

        {/* Medical */}
        <SectionCard title="Medical Information" icon={Heart}>
          <div className="grid grid-cols-2 gap-4">
            <ProfileField label="Blood Group" value={medical?.bloodGroup} />
            <ProfileField label="Genotype" value={medical?.genotype} />
            <ProfileField label="Allergies" value={medical?.allergies} />
            <ProfileField
              label="Chronic Conditions"
              value={medical?.chronicConditions}
            />
            <ProfileField label="Disabilities" value={medical?.disabilities} />
          </div>
          {medical?.specialNeeds && (
            <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
              <p className="text-xs font-semibold text-amber-700">
                Special Needs
              </p>
              <p className="mt-0.5 text-xs text-amber-600">
                {medical.specialNeedsDescription || "No description provided"}
              </p>
            </div>
          )}
        </SectionCard>

        {/* Welfare */}
        <WelfareSection records={extras.welfareRecords} />

        {/* Extracurricular */}
        <ExtracurricularsSection activities={extras.extracurriculars} />
      </div>
    </div>
  )
}
