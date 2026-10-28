import { useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router"
import { toast } from "sonner"
import { ArrowLeft, ArrowRight, Loader2, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/general/PageHeader"
import { Combobox } from "@/components/ui/combobox"
import { Input } from "@/components/ui/input"
import { PhoneInput } from "@/components/ui/phone-input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { COUNTRIES } from "@/data/countries"
import { useSchoolId } from "@/contexts/SchoolContext"
import { useGetStudentById, useUpdateStudent } from "@/hooks/studentPortal"
import { useUpdateGuardian } from "@/hooks/guardian"
import { emptyStudentProfile } from "@/api/studentPortal.api/types"
import { ProfileRecordsEditor } from "./components/ProfileRecordsEditor"
import { QueryErrorPanel } from "@/components/general/QueryErrorPanel"
import { genderToApi, genderFromApi, statusFromApi } from "@/utils/studentEnums"
import { DashboardRoutes } from "@/routes"
import { formatDate, getErrorMessage, isValidPhoneNumber } from "@/utils"
import type { Gender, Religion, BloodGroup } from "@/types/student"
import type { StudentDetailI } from "@/api/studentPortal.api/types"
import NaijaStates from "naija-state-local-government"
import { FieldError } from "./components/FieldError"
import { StepTabs, type StepTabItem } from "./components/StepTabs"

const KNOWN_RELIGIONS: readonly string[] = [
  "Christianity",
  "Islam",
  "Traditional",
]

// Static — computed once at module load rather than on every render.
const ALL_STATES: string[] = NaijaStates.states()

const steps: StepTabItem[] = [
  {
    key: "basic",
    title: "Basic Information",
    subtitle: "Identity, status & guardian",
  },
  {
    key: "standard",
    title: "Standard Profile",
    subtitle: "Origin, religion & history",
  },
  {
    key: "advanced",
    title: "Advanced Profile",
    subtitle: "Medical & special needs",
  },
]

export default function EditStudentPage() {
  const navigate = useNavigate()
  const { productId, studentId } = useParams()
  const schoolId = useSchoolId()

  const {
    student: detail,
    isLoading,
    isError,
    refetch,
  } = useGetStudentById({
    studentId: studentId!,
    schoolId,
  })

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
        message="Please retry before editing this record."
        onRetry={() => void refetch()}
      />
    )
  if (!detail) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <p className="text-sm text-gray-500">Student not found.</p>
        <Button variant="outline" onClick={() => navigate(-1)}>
          Go back
        </Button>
      </div>
    )
  }

  return <EditStudentForm detail={detail} productId={productId!} />
}

function EditStudentForm({
  detail,
  productId,
}: {
  detail: StudentDetailI
  productId: string
}) {
  const navigate = useNavigate()
  const [profile, setProfile] = useState({
    ...emptyStudentProfile,
    ...detail.profile,
  })
  const extras = profile
  const { updateStudentAsync } = useUpdateStudent()
  const { updateGuardianAsync } = useUpdateGuardian()

  const apiGuardian = detail.guardians?.[0]
  const hasGuardian = !!apiGuardian

  const [activeStep, setActiveStep] = useState<StepTabItem["key"]>("basic")
  const [basicSaved, setBasicSaved] = useState(false)
  const [standardSaved, setStandardSaved] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // ── Basic fields ──
  const [sid, setSid] = useState(detail.studentGivenId ?? "")
  const [firstName, setFirstName] = useState(detail.firstname)
  const [lastName, setLastName] = useState(detail.lastname)
  const [middleName, setMiddleName] = useState(extras.middleName ?? "")
  const [gender, setGender] = useState<Gender | "">(
    genderFromApi(detail.gender),
  )
  const [dob, setDob] = useState(formatDate(detail.dateofBirth, "YYYY-MM-DD"))
  const enrollmentStatusLabel = statusFromApi(detail.status)

  const [guardianFirstName, setGuardianFirstName] = useState(
    apiGuardian?.firstName ?? "",
  )
  const [guardianLastName, setGuardianLastName] = useState(
    apiGuardian?.lastName ?? "",
  )
  const [guardianRelationship, setGuardianRelationship] = useState(
    apiGuardian?.relationship ?? "",
  )
  const [guardianPhone, setGuardianPhone] = useState(apiGuardian?.phone ?? "")
  const [guardianEmail] = useState(apiGuardian?.email ?? "")
  const [guardianAddress, setGuardianAddress] = useState(
    apiGuardian?.address ?? "",
  )
  const [guardianOccupation, setGuardianOccupation] = useState(
    apiGuardian?.occupation ?? "",
  )

  // ── Nationality & Origin ──
  const [nationality, setNationality] = useState(detail.nationality ?? "")
  const [stateOfOrigin, setStateOfOrigin] = useState(detail.stateOfOrigin ?? "")
  const [lgaOfOrigin, setLgaOfOrigin] = useState(detail.localGovernment ?? "")

  // ── Standard fields ──
  const initialReligionKnown = KNOWN_RELIGIONS.includes(detail.religion)
  const [religion, setReligion] = useState<Religion | "">(
    detail.religion
      ? initialReligionKnown
        ? (detail.religion as Religion)
        : "Other"
      : "",
  )
  const [religionOther, setReligionOther] = useState(
    detail.religion && !initialReligionKnown ? detail.religion : "",
  )
  const [isEditingOtherReligion, setIsEditingOtherReligion] = useState(
    () => religion === "Other" && !religionOther,
  )
  const [homeAddress, setHomeAddress] = useState(detail.homeAddress ?? "")
  const [admissionDate, setAdmissionDate] = useState(
    formatDate(detail.admissionDate, "YYYY-MM-DD") ||
      extras.admissionDate ||
      "",
  )
  const [previousSchool, setPreviousSchool] = useState(
    extras.previousSchool ?? detail.previousSchool ?? "",
  )

  // ── Advanced fields ──
  const [bloodGroup, setBloodGroup] = useState<BloodGroup | "">(
    (detail.bloodGroup as BloodGroup) || "",
  )
  const [genotype, setGenotype] = useState(detail.genotype ?? "")
  const [allergies, setAllergies] = useState(detail.allergies ?? "")
  const [chronicConditions, setChronicConditions] = useState(
    detail.chronicCondtions ?? "",
  )
  const [disabilities, setDisabilities] = useState(detail.disabilities ?? "")
  const [hasSpecialNeeds, setHasSpecialNeeds] = useState(
    detail.specialNeeds ?? false,
  )
  const [specialNeedsDesc, setSpecialNeedsDesc] = useState(
    detail.specialNeedsDescription || "",
  )

  const lgas = useMemo(
    () => (stateOfOrigin ? (NaijaStates.lgas(stateOfOrigin)?.lgas ?? []) : []),
    [stateOfOrigin],
  )
  const isNigeria = nationality === "Nigeria"

  function clearError(field: string) {
    setErrors((p) => {
      const n = { ...p }
      delete n[field]
      return n
    })
  }

  function validateGuardianPhone() {
    if (!hasGuardian) return
    if (!guardianPhone.trim())
      setErrors((p) => ({ ...p, guardianPhone: "Phone is required." }))
    else if (!isValidPhoneNumber(guardianPhone))
      setErrors((p) => ({
        ...p,
        guardianPhone: "Enter a valid Nigerian phone number",
      }))
  }

  async function saveBasic() {
    const next: Record<string, string> = {}
    if (!sid.trim()) next.sid = "Student ID is required."
    if (!firstName.trim()) next.firstName = "First name is required."
    if (!lastName.trim()) next.lastName = "Last name is required."
    if (!gender) next.gender = "Gender is required."
    if (!dob) next.dob = "Date of birth is required."
    if (hasGuardian) {
      if (!guardianFirstName.trim())
        next.guardianFirstName = "Guardian first name is required."
      if (!guardianLastName.trim())
        next.guardianLastName = "Guardian last name is required."
      if (!guardianRelationship.trim())
        next.guardianRelationship = "Relationship is required."
      if (!guardianPhone.trim()) next.guardianPhone = "Phone is required."
      else if (!isValidPhoneNumber(guardianPhone))
        next.guardianPhone = "Enter a valid Nigerian phone number"
    }
    setErrors(next)
    if (Object.keys(next).length > 0) return

    setBasicSaved(true)
    setActiveStep("standard")
  }

  function saveStandard() {
    if (
      admissionDate &&
      admissionDate > new Date().toISOString().slice(0, 10)
    ) {
      toast.error("Admission date cannot be in the future.")
      return
    }
    setStandardSaved(true)
    setActiveStep("advanced")
  }

  async function saveAdvanced() {
    if (
      !sid.trim() ||
      !firstName.trim() ||
      !lastName.trim() ||
      !gender ||
      !dob
    ) {
      toast.error("Complete the required basic information.")
      setActiveStep("basic")
      return
    }
    setIsSubmitting(true)
    try {
      await updateStudentAsync({
        profile: {
          ...profile,
          extracurriculars: profile.extracurriculars.filter(Boolean),
          middleName: middleName.trim(),
          admissionDate: admissionDate || undefined,
          previousSchool,
        },
        previousSchool,
        studentId: detail.studentId,
        schoolId: detail.schoolId,
        studentGivenId: sid.trim() || undefined,
        firstname: firstName.trim(),
        lastname: lastName.trim(),
        email: detail.email,
        phoneNumber: detail.phoneNumber,
        dateofBirth: dob || undefined,
        gender: genderToApi(gender),
        profilePicture: detail.profilePicture,
        nationality: nationality || undefined,
        stateOfOrigin: stateOfOrigin || undefined,
        localGovernment: lgaOfOrigin || undefined,
        homeAddress: homeAddress || undefined,
        religion:
          religion === "Other"
            ? religionOther.trim() || "Other"
            : religion || undefined,
        status: detail.status,
        bloodGroup: bloodGroup || undefined,
        genotype: genotype || undefined,
        allergies: allergies || undefined,
        chronicCondtions: chronicConditions || undefined,
        disabilities: disabilities || undefined,
        specialNeeds: hasSpecialNeeds,
        specialNeedsDescription: specialNeedsDesc || undefined,
      })

      if (
        hasGuardian &&
        apiGuardian &&
        (guardianFirstName.trim() !== apiGuardian.firstName ||
          guardianLastName.trim() !== apiGuardian.lastName ||
          guardianRelationship !== apiGuardian.relationship ||
          guardianPhone.trim() !== apiGuardian.phone ||
          guardianAddress !== (apiGuardian.address ?? "") ||
          guardianOccupation !== (apiGuardian.occupation ?? ""))
      ) {
        try {
          await updateGuardianAsync({
            id: apiGuardian.id,
            firstName: guardianFirstName.trim(),
            lastName: guardianLastName.trim(),
            relationship: guardianRelationship,
            phone: guardianPhone.trim(),
            address: guardianAddress,
            occupation: guardianOccupation,
          })
        } catch (error) {
          toast.error(
            getErrorMessage(
              error,
              "Student saved, but guardian changes could not be saved. Retry to finish.",
            ),
          )
          return
        }
      }
      navigate(DashboardRoutes.toStudentProfile(productId, detail.studentId))
    } catch (error) {
      toast.error(
        getErrorMessage(error, "Failed to update student. Please try again."),
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  function isStepComplete(step: StepTabItem["key"]) {
    if (step === "basic") return basicSaved
    if (step === "standard") return standardSaved
    return false
  }

  function isStepEnabled() {
    return true
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Student"
        description={`${detail.firstname} ${detail.lastname}${detail.studentGivenId ? ` · ${detail.studentGivenId}` : ""}`}
        onBack={() =>
          navigate(
            DashboardRoutes.toStudentProfile(productId, detail.studentId),
          )
        }
        backLabel="Back to Profile"
      />

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <StepTabs
          steps={steps}
          activeStep={activeStep}
          isStepComplete={isStepComplete}
          isStepEnabled={isStepEnabled}
          onStepChange={setActiveStep}
        />

        <div className="pt-6">
          {/* ── BASIC ── */}
          {activeStep === "basic" && (
            <div className="space-y-6 px-4 pb-6 sm:px-6">
              <div>
                <p className="mb-3 text-xs font-semibold tracking-widest text-gray-400 uppercase">
                  Student Identity
                </p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-gray-700">
                      Student ID <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={sid}
                      onChange={(e) => {
                        setSid(e.target.value)
                        clearError("sid")
                      }}
                      placeholder="e.g. STU-2025-001"
                      className={`rounded-md ${errors.sid ? "border-red-400" : "border-gray-200"}`}
                    />
                    <FieldError message={errors.sid} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-gray-700">
                      Gender <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={gender}
                      onValueChange={(v) => {
                        setGender(v as Gender)
                        clearError("gender")
                      }}
                    >
                      <SelectTrigger
                        className={`w-full rounded-md ${errors.gender ? "border-red-400" : "border-gray-200"}`}
                      >
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        {["Male", "Female", "Other"].map((g) => (
                          <SelectItem key={g} value={g}>
                            {g}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldError message={errors.gender} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-gray-700">
                      First Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={firstName}
                      onChange={(e) => {
                        setFirstName(e.target.value)
                        clearError("firstName")
                      }}
                      className={`rounded-md ${errors.firstName ? "border-red-400" : "border-gray-200"}`}
                    />
                    <FieldError message={errors.firstName} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-gray-700">
                      Last Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={lastName}
                      onChange={(e) => {
                        setLastName(e.target.value)
                        clearError("lastName")
                      }}
                      className={`rounded-md ${errors.lastName ? "border-red-400" : "border-gray-200"}`}
                    />
                    <FieldError message={errors.lastName} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-gray-700">
                      Middle Name
                    </Label>
                    <Input
                      value={middleName}
                      onChange={(e) => setMiddleName(e.target.value)}
                      className="rounded-md border-gray-200"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-gray-700">
                      Date of Birth <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="date"
                      value={dob}
                      onChange={(e) => {
                        setDob(e.target.value)
                        clearError("dob")
                      }}
                      className={`w-full rounded-md ${errors.dob ? "border-red-400" : "border-gray-200"}`}
                    />
                    <FieldError message={errors.dob} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-gray-700">
                      Enrollment Status
                    </Label>
                    <Input
                      value={enrollmentStatusLabel}
                      readOnly
                      disabled
                      title="Enrollment status can't be changed from this form"
                      className="rounded-md border-gray-200 bg-gray-50 text-gray-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-gray-700">
                      Class
                    </Label>
                    <Input
                      value={
                        detail.schoolClassName
                          ? `${detail.schoolClassName}${detail.schoolArmName ? ` ${detail.schoolArmName}` : ""}`
                          : "Unassigned"
                      }
                      readOnly
                      disabled
                      title="Change class enrollment from the student list"
                      className="rounded-md border-gray-200 bg-gray-50 text-gray-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <p className="mb-3 text-xs font-semibold tracking-widest text-gray-400 uppercase">
                  Nationality & Origin
                </p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {/* Nationality */}
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-gray-700">
                      Nationality
                    </Label>
                    <Combobox
                      value={nationality}
                      onValueChange={(value) => {
                        setNationality(value)
                        if (value !== nationality) {
                          setStateOfOrigin("")
                          setLgaOfOrigin("")
                        }
                      }}
                      options={COUNTRIES}
                      placeholder="Select country"
                      searchPlaceholder="Search countries..."
                    />
                  </div>

                  {/* State of Origin */}
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-gray-700">
                      {isNigeria
                        ? "State of Origin"
                        : "State / Province / Region"}
                    </Label>
                    {isNigeria ? (
                      <Select
                        value={stateOfOrigin}
                        onValueChange={(value) => {
                          setStateOfOrigin(value)
                          setLgaOfOrigin("")
                        }}
                      >
                        <SelectTrigger className="w-full rounded-md border-gray-200">
                          <SelectValue placeholder="Select a state" />
                        </SelectTrigger>
                        <SelectContent className="max-h-64">
                          {ALL_STATES.map((state) => (
                            <SelectItem key={state} value={state}>
                              {state}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        value={stateOfOrigin}
                        onChange={(e) => setStateOfOrigin(e.target.value)}
                        placeholder="e.g. State, province or region"
                        className="rounded-md border-gray-200"
                      />
                    )}
                  </div>

                  {/* LGA */}
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-gray-700">
                      {isNigeria ? "Local Government Area" : "City / District"}
                    </Label>
                    {isNigeria ? (
                      <Select
                        value={lgaOfOrigin}
                        onValueChange={setLgaOfOrigin}
                        disabled={!stateOfOrigin}
                      >
                        <SelectTrigger className="w-full rounded-md border-gray-200 disabled:opacity-50">
                          <SelectValue
                            placeholder={
                              stateOfOrigin
                                ? "Select a local government area"
                                : "Select a state first"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent className="max-h-64">
                          {lgas.map((lga) => (
                            <SelectItem key={lga} value={lga}>
                              {lga}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        value={lgaOfOrigin}
                        onChange={(e) => setLgaOfOrigin(e.target.value)}
                        placeholder="e.g. City or district"
                        className="rounded-md border-gray-200"
                      />
                    )}
                  </div>
                </div>
              </div>

              <div>
                <p className="mb-3 text-xs font-semibold tracking-widest text-gray-400 uppercase">
                  Guardian / Parent
                  {!hasGuardian && (
                    <span className="ml-2 font-normal text-gray-400 normal-case">
                      (no guardian linked to this student)
                    </span>
                  )}
                </p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-gray-700">
                      First Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={guardianFirstName}
                      disabled={!hasGuardian}
                      onChange={(e) => {
                        setGuardianFirstName(e.target.value)
                        clearError("guardianFirstName")
                      }}
                      className={`rounded-md ${errors.guardianFirstName ? "border-red-400" : "border-gray-200"}`}
                    />
                    <FieldError message={errors.guardianFirstName} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-gray-700">
                      Last Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={guardianLastName}
                      disabled={!hasGuardian}
                      onChange={(e) => {
                        setGuardianLastName(e.target.value)
                        clearError("guardianLastName")
                      }}
                      className={`rounded-md ${errors.guardianLastName ? "border-red-400" : "border-gray-200"}`}
                    />
                    <FieldError message={errors.guardianLastName} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-gray-700">
                      Relationship <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={guardianRelationship}
                      disabled={!hasGuardian}
                      onValueChange={(v) => {
                        setGuardianRelationship(v)
                        clearError("guardianRelationship")
                      }}
                    >
                      <SelectTrigger
                        className={`w-full rounded-md ${errors.guardianRelationship ? "border-red-400" : "border-gray-200"}`}
                      >
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {[
                          "Father",
                          "Mother",
                          "Guardian",
                          "Uncle",
                          "Aunt",
                          "Sibling",
                          "Other",
                        ].map((r) => (
                          <SelectItem key={r} value={r}>
                            {r}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldError message={errors.guardianRelationship} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-gray-700">
                      Phone <span className="text-red-500">*</span>
                    </Label>
                    <PhoneInput
                      value={guardianPhone}
                      disabled={!hasGuardian}
                      onChange={(v) => {
                        setGuardianPhone(v)
                        clearError("guardianPhone")
                      }}
                      onBlur={validateGuardianPhone}
                      error={!!errors.guardianPhone}
                    />
                    <FieldError message={errors.guardianPhone} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-gray-700">
                      Email
                    </Label>
                    <Input
                      value={guardianEmail}
                      disabled
                      className="rounded-md border-gray-200 opacity-60"
                    />
                    <p className="text-xs text-gray-400">
                      Email address can&apos;t be changed here.
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-gray-700">
                      Occupation
                    </Label>
                    <Input
                      value={guardianOccupation}
                      disabled={!hasGuardian}
                      onChange={(e) => setGuardianOccupation(e.target.value)}
                      className="rounded-md border-gray-200"
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label className="text-sm font-medium text-gray-700">
                      Address
                    </Label>
                    <Input
                      value={guardianAddress}
                      disabled={!hasGuardian}
                      onChange={(e) => setGuardianAddress(e.target.value)}
                      className="rounded-md border-gray-200"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    navigate(
                      DashboardRoutes.toStudentProfile(
                        productId,
                        detail.studentId,
                      ),
                    )
                  }
                  className="w-full rounded-md border-gray-200 sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={saveBasic}
                  className="w-full rounded-md bg-blue-600 text-white hover:bg-blue-700 sm:w-auto"
                >
                  Continue
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </div>
          )}

          {/* ── STANDARD ── */}
          {activeStep === "standard" && (
            <div className="space-y-6 px-4 pb-6 sm:px-6">
              <div>
                <p className="mb-3 text-xs font-semibold tracking-widest text-gray-400 uppercase">
                  Personal Details
                </p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* Religion */}
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-gray-700">
                      Religion
                    </Label>
                    {religion === "Other" && !isEditingOtherReligion ? (
                      <div className="relative">
                        <Input
                          value={religionOther}
                          readOnly
                          placeholder="Please specify religion"
                          className="rounded-md border-gray-200 pr-9"
                        />
                        <button
                          type="button"
                          onClick={() => setIsEditingOtherReligion(true)}
                          className="absolute top-1/2 right-2.5 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          title="Edit religion"
                        >
                          <Pencil className="size-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Select
                          value={religion}
                          onValueChange={(v) => {
                            setReligion(v as Religion)
                            setIsEditingOtherReligion(v === "Other")
                          }}
                        >
                          <SelectTrigger className="w-full rounded-md border-gray-200">
                            <SelectValue placeholder="Select religion (optional)" />
                          </SelectTrigger>
                          <SelectContent>
                            {[
                              "Christianity",
                              "Islam",
                              "Traditional",
                              "Other",
                            ].map((r) => (
                              <SelectItem key={r} value={r}>
                                {r}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {religion === "Other" && (
                          <Input
                            autoFocus
                            value={religionOther}
                            onChange={(e) => setReligionOther(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && religionOther.trim()) {
                                e.preventDefault()
                                setIsEditingOtherReligion(false)
                              }
                            }}
                            placeholder="Type religion and press Enter"
                            className="rounded-md border-gray-200"
                          />
                        )}
                      </>
                    )}
                  </div>

                  {/* Home Address */}
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-gray-700">
                      Home Address
                    </Label>
                    <Input
                      value={homeAddress}
                      onChange={(e) => setHomeAddress(e.target.value)}
                      placeholder="Student's home address"
                      className="rounded-md border-gray-200"
                    />
                  </div>
                </div>
              </div>

              <div>
                <p className="mb-3 text-xs font-semibold tracking-widest text-gray-400 uppercase">
                  Academic History
                </p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-gray-700">
                      Admission Date
                    </Label>
                    <Input
                      type="date"
                      value={admissionDate}
                      onChange={(e) => setAdmissionDate(e.target.value)}
                      className="w-full rounded-md border-gray-200"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-gray-700">
                      Previous School
                    </Label>
                    <Input
                      value={previousSchool}
                      onChange={(e) => setPreviousSchool(e.target.value)}
                      placeholder="Previous school name (optional)"
                      className="rounded-md border-gray-200"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveStep("basic")}
                  className="w-full rounded-md border-gray-200 sm:w-auto"
                >
                  <ArrowLeft className="size-4" />
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={saveStandard}
                  className="w-full rounded-md bg-blue-600 text-white hover:bg-blue-700 sm:w-auto"
                >
                  Continue
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </div>
          )}

          {/* ── ADVANCED ── */}
          {activeStep === "advanced" && (
            <div className="space-y-6 px-4 pb-6 sm:px-6">
              <div>
                <p className="mb-3 text-xs font-semibold tracking-widest text-gray-400 uppercase">
                  Medical Information
                </p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-gray-700">
                      Blood Group
                    </Label>
                    <Select
                      value={bloodGroup}
                      onValueChange={(v) => setBloodGroup(v as BloodGroup)}
                    >
                      <SelectTrigger className="w-full rounded-md border-gray-200">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(
                          (bg) => (
                            <SelectItem key={bg} value={bg}>
                              {bg}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-gray-700">
                      Genotype
                    </Label>
                    <Select value={genotype} onValueChange={setGenotype}>
                      <SelectTrigger className="w-full rounded-md border-gray-200">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {["AA", "AS", "SS", "AC", "SC"].map((g) => (
                          <SelectItem key={g} value={g}>
                            {g}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label className="text-sm font-medium text-gray-700">
                      Allergies
                    </Label>
                    <Input
                      value={allergies}
                      onChange={(e) => setAllergies(e.target.value)}
                      className="rounded-md border-gray-200"
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label className="text-sm font-medium text-gray-700">
                      Chronic Conditions
                    </Label>
                    <Input
                      value={chronicConditions}
                      onChange={(e) => setChronicConditions(e.target.value)}
                      className="rounded-md border-gray-200"
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label className="text-sm font-medium text-gray-700">
                      Disabilities
                    </Label>
                    <Input
                      value={disabilities}
                      onChange={(e) => setDisabilities(e.target.value)}
                      className="rounded-md border-gray-200"
                    />
                  </div>
                </div>
              </div>

              <div>
                <p className="mb-3 text-xs font-semibold tracking-widest text-gray-400 uppercase">
                  Special Needs
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setHasSpecialNeeds((p) => !p)}
                      className={`relative h-6 w-11 rounded-full transition-colors ${hasSpecialNeeds ? "bg-blue-600" : "bg-gray-200"}`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${hasSpecialNeeds ? "translate-x-5" : ""}`}
                      />
                    </button>
                    <Label className="text-sm font-medium text-gray-700">
                      This student has special needs
                    </Label>
                  </div>
                  {hasSpecialNeeds && (
                    <Textarea
                      value={specialNeedsDesc}
                      onChange={(e) => setSpecialNeedsDesc(e.target.value)}
                      rows={3}
                      className="resize-none rounded-md border-gray-200"
                    />
                  )}
                </div>
              </div>

              <ProfileRecordsEditor value={profile} onChange={setProfile} />
              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveStep("standard")}
                  disabled={isSubmitting}
                  className="w-full rounded-md border-gray-200 sm:w-auto"
                >
                  <ArrowLeft className="size-4" />
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={saveAdvanced}
                  disabled={isSubmitting}
                  className="w-full rounded-md bg-blue-600 text-white hover:bg-blue-700 sm:w-auto"
                >
                  {isSubmitting && <Loader2 className="size-4 animate-spin" />}
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
