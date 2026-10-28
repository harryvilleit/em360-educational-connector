import { useEffect, useMemo, useState } from "react"
import { useLocation, useNavigate, useParams } from "react-router"
import { toast } from "sonner"
import { PageHeader } from "@/components/general/PageHeader"
import { FormDraftBanner } from "@/components/general/FormDraftBanner"
import { useSchoolId } from "@/contexts/SchoolContext"
import { useCreateStudent, useSearchStudents } from "@/hooks/studentPortal"
import { useGetGuardianById } from "@/hooks/guardian"
import { useDebouncedValue } from "@/hooks/useDebouncedValue"
import { useFormDraft } from "@/hooks/useFormDraft"
import { useStudentCreateFormStore } from "@/store/studentCreateForm.store"
import { genderToApi, genderFromApi } from "@/utils/studentEnums"
import { getErrorMessage } from "@/utils"
import {
  generateRandomPassword,
  generateStudentEmail,
} from "@/utils/credentialGenerator"
import { DashboardRoutes } from "@/routes"
import { StepTabs, type StepTabItem } from "./components/StepTabs"
import { StandardSection } from "./components/StandardSection"
import { AdvancedSection } from "./components/AdvancedSection"
import { BasicSection } from "./components/BasicSection"
import {
  validateStudentBasic,
  validateStudentEmail,
  validateStudentStandard,
} from "@/validations/student.validation"
import type {
  AddStudentDraftValues,
  Gender,
  Religion,
  BloodGroup,
  WelfareRecord,
} from "@/types/student"
import type { StudentSearchResultI } from "@/api/studentPortal.api/types"
import type { GuardianItemI } from "@/api/guardian.api/types"

export default function AddStudentPage() {
  const navigate = useNavigate()
  const { productId } = useParams()
  const schoolId = useSchoolId()
  const { createStudentAsync } = useCreateStudent()

  const updateBasicStep = useStudentCreateFormStore((s) => s.updateBasicStep)
  const updateStandardStep = useStudentCreateFormStore(
    (s) => s.updateStandardStep,
  )
  const updateAdvancedStep = useStudentCreateFormStore(
    (s) => s.updateAdvancedStep,
  )
  const setBasicComplete = useStudentCreateFormStore((s) => s.setBasicComplete)
  const setStandardComplete = useStudentCreateFormStore(
    (s) => s.setStandardComplete,
  )
  const getFormData = useStudentCreateFormStore((s) => s.getFormData)
  const resetForm = useStudentCreateFormStore((s) => s.resetForm)

  const steps: StepTabItem[] = [
    {
      key: "basic",
      title: "Basic Information",
      subtitle: "Identity & guardian",
    },
    {
      key: "standard",
      title: "Standard Profile",
      subtitle: "Origin & academic history",
    },
    {
      key: "advanced",
      title: "Advanced Profile",
      subtitle: "Medical & welfare",
    },
  ]
  const [activeStep, setActiveStep] = useState<
    "basic" | "standard" | "advanced"
  >("basic")
  const [basicComplete, setBasicCompleteLocal] = useState(false)
  const [standardComplete, setStandardCompleteLocal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const location = useLocation()
  const routeState = location.state as {
    guardianId?: string
    prefillFirstName?: string
    prefillLastName?: string
    pendingStudents?: string[]
  } | null

  const pendingStudents = routeState?.pendingStudents ?? []
  const [studentId, setStudentId] = useState("")
  const [firstName, setFirstName] = useState(routeState?.prefillFirstName ?? "")
  const [lastName, setLastName] = useState(routeState?.prefillLastName ?? "")
  const [middleName, setMiddleName] = useState("")
  const [email, setEmail] = useState("")
  const [isDefaultEmail, setIsDefaultEmail] = useState(true)
  const [generatedEmail, setGeneratedEmail] = useState("")
  const [password, setPassword] = useState("")
  const [gender, setGender] = useState<Gender | "">("")
  const [dob, setDob] = useState("")
  const [passport, setPassport] = useState<string | null>(null)
  const [selectedGuardian, setSelectedGuardian] =
    useState<GuardianItemI | null>(null)

  const { guardian: prefillGuardian } = useGetGuardianById({
    id: routeState?.guardianId ?? "",
  })

  useEffect(() => {
    if (selectedGuardian || !prefillGuardian) return
    setSelectedGuardian(prefillGuardian)
  }, [prefillGuardian, selectedGuardian])

  const [existingStudentQuery, setExistingStudentQuery] = useState("")
  const debouncedExistingStudentQuery = useDebouncedValue(
    existingStudentQuery,
    300,
  )
  const [linkedExistingStudent, setLinkedExistingStudent] =
    useState<StudentSearchResultI | null>(null)
  const { results: existingStudentResults, isLoading: existingStudentLoading } =
    useSearchStudents({
      schoolId,
      keyword: debouncedExistingStudentQuery,
    })

  const [religion, setReligion] = useState<Religion | "">("")
  const [religionOther, setReligionOther] = useState("")
  const [nationality, setNationality] = useState("Nigeria")
  const [stateOfOrigin, setStateOfOrigin] = useState("")
  const [lgaOfOrigin, setLgaOfOrigin] = useState("")
  const [homeAddress, setHomeAddress] = useState("")
  const [admissionDate, setAdmissionDate] = useState("")
  const [previousSchool, setPreviousSchool] = useState("")
  const [historySession, setHistorySession] = useState("")
  const [historyTerm, setHistoryTerm] = useState("")
  const [historyClass, setHistoryClass] = useState("")
  const [historyAverage, setHistoryAverage] = useState("")
  const [historyRemarks, setHistoryRemarks] = useState("")
  const [bloodGroup, setBloodGroup] = useState<BloodGroup | "">("")
  const [genotype, setGenotype] = useState("")
  const [allergies, setAllergies] = useState("")
  const [chronicConditions, setChronicConditions] = useState("")
  const [disabilities, setDisabilities] = useState("")
  const [hasSpecialNeeds, setHasSpecialNeeds] = useState(false)
  const [specialNeedsDesc, setSpecialNeedsDesc] = useState("")
  const [behavioralNotes, setBehavioralNotes] = useState("")
  const [extracurriculars, setExtracurriculars] = useState("")
  const [welfareType, setWelfareType] = useState("")
  const [welfareDate, setWelfareDate] = useState("")
  const [welfareDescription, setWelfareDescription] = useState("")
  const [welfareReportedBy, setWelfareReportedBy] = useState("")

  const [errors, setErrors] = useState<Record<string, string>>({})

  const currentDraftValues = useMemo<AddStudentDraftValues>(
    () => ({
      studentId,
      firstName,
      lastName,
      middleName,
      email,
      isDefaultEmail,
      generatedEmail,
      gender,
      dob,
      passport,
      selectedGuardian,
      linkedExistingStudent,
      religion,
      religionOther,
      nationality,
      stateOfOrigin,
      lgaOfOrigin,
      homeAddress,
      admissionDate,
      previousSchool,
      historySession,
      historyTerm,
      historyClass,
      historyAverage,
      historyRemarks,
    }),
    [
      studentId,
      firstName,
      lastName,
      middleName,
      email,
      isDefaultEmail,
      generatedEmail,
      gender,
      dob,
      passport,
      selectedGuardian,
      linkedExistingStudent,
      religion,
      religionOther,
      nationality,
      stateOfOrigin,
      lgaOfOrigin,
      homeAddress,
      admissionDate,
      previousSchool,
      historySession,
      historyTerm,
      historyClass,
      historyAverage,
      historyRemarks,
    ],
  )

  const {
    hasDraft,
    draftValues: savedDraftValues,
    draftSavedAt,
    acknowledgeDraft,
    discardDraft,
    clearDraft,
  } = useFormDraft<AddStudentDraftValues>({
    formKey: "student-add",
    values: currentDraftValues,
    enabled: !isSubmitting,
  })

  function handleRestoreDraft() {
    if (!savedDraftValues) return
    const d = savedDraftValues
    setStudentId(d.studentId)
    setFirstName(d.firstName)
    setLastName(d.lastName)
    setMiddleName(d.middleName)

    const hasEmailSelection = typeof d.isDefaultEmail === "boolean"
    const canRestoreEmail =
      hasEmailSelection &&
      (d.isDefaultEmail ? d.email === d.generatedEmail : !d.generatedEmail)
    setIsDefaultEmail(hasEmailSelection ? d.isDefaultEmail : true)
    setEmail(canRestoreEmail ? d.email : "")
    setGeneratedEmail(canRestoreEmail ? (d.generatedEmail ?? "") : "")
    setBasicComplete(false)
    setBasicCompleteLocal(false)
    setGender(d.gender)
    setDob(d.dob)
    setPassport(d.passport)
    setSelectedGuardian(d.selectedGuardian)
    setLinkedExistingStudent(d.linkedExistingStudent)
    setReligion(d.religion)
    setReligionOther(d.religionOther)
    setNationality(d.nationality)
    setStateOfOrigin(d.stateOfOrigin)
    setLgaOfOrigin(d.lgaOfOrigin)
    setHomeAddress(d.homeAddress)
    setAdmissionDate(d.admissionDate)
    setPreviousSchool(d.previousSchool)
    setHistorySession(d.historySession)
    setHistoryTerm(d.historyTerm)
    setHistoryClass(d.historyClass)
    setHistoryAverage(d.historyAverage)
    setHistoryRemarks(d.historyRemarks)
    acknowledgeDraft()
    toast.success("Draft restored — review each step and Save & Continue.")
  }

  function clearError(field: string) {
    setErrors((prev) => {
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  function navigateToNextPending(guardianId: string | undefined) {
    const [nextName, ...remaining] = pendingStudents
    const parts = nextName.trim().split(" ")
    navigate(DashboardRoutes.toStudentAdd(productId!), {
      state: {
        guardianId,
        prefillFirstName: parts[0] ?? "",
        prefillLastName: parts.slice(1).join(" "),
        pendingStudents: remaining,
      },
    })
  }

  function handleSelectExistingStudent(result: StudentSearchResultI) {
    setLinkedExistingStudent(result)
    setFirstName(result.firstname)
    setLastName(result.lastname)
    setGender(genderFromApi(result.gender))
    setDob(result.dateofBirth ?? "")

    if (result.nationality) setNationality(result.nationality)
    if (result.stateOfOrigin) setStateOfOrigin(result.stateOfOrigin)
    if (result.localGovernment) setLgaOfOrigin(result.localGovernment)
    if (result.homeAddress) setHomeAddress(result.homeAddress)

    if (result.religion) {
      const knownReligions: Religion[] = [
        "Christianity",
        "Islam",
        "Traditional",
      ]
      if (knownReligions.includes(result.religion as Religion)) {
        setReligion(result.religion as Religion)
        setReligionOther("")
      } else {
        setReligion("Other")
        setReligionOther(result.religion)
      }
    }

    if (result.specialNeeds) {
      setHasSpecialNeeds(true)
      setSpecialNeedsDesc(result.specialNeedsDescription ?? "")
    }

    setExistingStudentQuery("")
    clearError("firstName")
    clearError("lastName")
    clearError("gender")
    clearError("dob")
    toast.success(
      `Loaded existing profile for ${result.firstname} ${result.lastname} — review the other steps before submitting.`,
    )
  }

  function handleClearExistingStudent() {
    setLinkedExistingStudent(null)
  }

  function handleGenerateEmail() {
    if (!isDefaultEmail || email || !firstName.trim() || !lastName.trim())
      return
    const generated = generateStudentEmail(firstName, lastName)
    setEmail(generated)
    setGeneratedEmail(generated)
    setBasicComplete(false)
    setBasicCompleteLocal(false)
    clearError("email")
  }

  function handleDefaultEmailChange(value: boolean) {
    if (value === isDefaultEmail) return
    setIsDefaultEmail(value)
    setEmail("")
    setGeneratedEmail("")
    updateBasicStep({ email: "", isDefaultEmail: value })
    setBasicComplete(false)
    setBasicCompleteLocal(false)
    clearError("email")
  }

  function handleEmailChange(value: string) {
    if (isDefaultEmail) return
    setEmail(value)
    setGeneratedEmail("")
    setBasicComplete(false)
    setBasicCompleteLocal(false)
    clearError("email")
  }

  function handleGeneratePassword() {
    if (password) return
    setPassword(generateRandomPassword())
    clearError("password")
  }

  async function saveBasic() {
    const next = validateStudentBasic({ ...currentDraftValues, password })

    setErrors(next)
    if (Object.keys(next).length > 0) {
      toast.error(
        "Please fill in all required fields before continuing — check the highlighted fields below.",
      )
      return
    }

    try {
      updateBasicStep({
        studentId: studentId.trim() || undefined,
        firstname: firstName.trim(),
        lastname: lastName.trim(),
        middleName: middleName.trim() || undefined,
        email: email.trim(),
        isDefaultEmail,
        password,
        dateofBirth: dob || undefined,
        gender: genderToApi(gender),
        profilePicture: passport || undefined,
        guardianIds: [selectedGuardian!.id],
        linkedExistingStudentId: linkedExistingStudent?.studentId,
        nationality: nationality || undefined,
        stateOfOrigin: stateOfOrigin || undefined,
        localGovernment: lgaOfOrigin || undefined,
      })

      setBasicComplete(true)
      setBasicCompleteLocal(true)
      setActiveStep("standard")
      toast.success("Basic information ready. Continue to Standard Profile.")
    } catch (error) {
      const errorMsg = getErrorMessage(
        error,
        "Failed to save form data. Please try again.",
      )
      toast.error(errorMsg)
    }
  }

  async function saveStandard() {
    const next = validateStudentStandard({ homeAddress })
    if (admissionDate > new Date().toISOString().slice(0, 10))
      next.admissionDate = "Admission date cannot be in the future."
    if (
      historyAverage &&
      (Number(historyAverage) < 0 || Number(historyAverage) > 100)
    )
      next.historyAverage = "Average must be between 0 and 100."
    if (
      (historyClass ||
        historySession ||
        historyTerm ||
        historyAverage ||
        historyRemarks) &&
      !(historyClass && historySession && historyTerm)
    )
      next.history = "Complete class, session and term for academic history."
    setErrors(next)
    if (Object.keys(next).length > 0) {
      toast.error(
        "Please fill in all required fields before continuing — check the highlighted fields below.",
      )
      return
    }

    try {
      updateStandardStep({
        homeAddress: homeAddress || undefined,
        religion:
          religion === "Other"
            ? religionOther.trim() || "Other"
            : religion || undefined,
        admissionDate: admissionDate || undefined,
        previousSchool: previousSchool || undefined,
        academicHistory:
          historySession && historyTerm && historyClass
            ? [
                {
                  session: historySession,
                  term: historyTerm,
                  class: historyClass,
                  average: historyAverage
                    ? parseFloat(historyAverage)
                    : undefined,
                  remarks: historyRemarks || undefined,
                },
              ]
            : undefined,
      })

      setStandardComplete(true)
      setStandardCompleteLocal(true)
      setActiveStep("advanced")
      toast.success("Standard profile ready. Continue to Advanced Profile.")
    } catch (error) {
      const errorMsg = getErrorMessage(
        error,
        "Failed to save form data. Please try again.",
      )

      toast.error(errorMsg)
    }
  }

  async function saveAdvancedAndSubmit() {
    const emailError = validateStudentEmail({
      email,
      isDefaultEmail,
      generatedEmail,
    })
    if (emailError) {
      setErrors((previous) => ({ ...previous, email: emailError }))
      setActiveStep("basic")
      return
    }
    if (!basicComplete || !standardComplete) {
      toast.error("Please complete all form sections before submitting.")
      return
    }

    if (
      (welfareType || welfareDate || welfareDescription || welfareReportedBy) &&
      !(welfareType && welfareDate && welfareDescription)
    ) {
      toast.error("Complete welfare type, date and description.")
      return
    }
    setIsSubmitting(true)
    try {
      updateAdvancedStep({
        bloodGroup: bloodGroup || undefined,
        genotype: genotype || undefined,
        allergies: allergies || undefined,
        chronicCondtions: chronicConditions || undefined,
        disabilities: disabilities || undefined,
        specialNeeds: hasSpecialNeeds,
        specialNeedsDescription: specialNeedsDesc || undefined,
        behavioralNotes: behavioralNotes || undefined,
        welfareRecords:
          welfareType && welfareDate && welfareDescription
            ? [
                {
                  type: welfareType as WelfareRecord["type"],
                  date: welfareDate,
                  description: welfareDescription,
                  reportedBy: welfareReportedBy || undefined,
                  resolved: false,
                },
              ]
            : undefined,
        extracurriculars: extracurriculars
          ? extracurriculars
              .split(",")
              .map((e) => e.trim())
              .filter(Boolean)
          : [],
      })

      const allFormData = getFormData()

      await createStudentAsync({
        studentId: allFormData.linkedExistingStudentId,
        profile: {
          middleName: allFormData.middleName,
          admissionDate: allFormData.admissionDate,
          previousSchool: allFormData.previousSchool,
          academicHistory: allFormData.academicHistory ?? [],
          welfareRecords: allFormData.welfareRecords ?? [],
          extracurriculars: allFormData.extracurriculars ?? [],
          behavioralNotes: allFormData.behavioralNotes,
        },
        previousSchool: allFormData.previousSchool,
        guardianIds: allFormData.guardianIds,
        schoolId,
        studentGivenId: allFormData.studentId,
        firstname: allFormData.firstname,
        lastname: allFormData.lastname,
        email: email.trim(),
        isDefaultEmail,
        password: allFormData.password,
        dateofBirth: allFormData.dateofBirth,
        gender:
          typeof allFormData.gender === "number"
            ? allFormData.gender
            : genderToApi(allFormData.gender as Gender),
        profilePicture: allFormData.profilePicture || undefined,
        nationality: allFormData.nationality,
        stateOfOrigin: allFormData.stateOfOrigin,
        localGovernment: allFormData.localGovernment,
        homeAddress: allFormData.homeAddress,
        religion: allFormData.religion,
        bloodGroup: allFormData.bloodGroup,
        genotype: allFormData.genotype,
        allergies: allFormData.allergies,
        chronicCondtions: allFormData.chronicCondtions,
        disabilities: allFormData.disabilities,
        specialNeeds: allFormData.specialNeeds,
        specialNeedsDescription: allFormData.specialNeedsDescription,
      })

      resetForm()
      clearDraft()
      if (pendingStudents.length > 0) {
        navigateToNextPending(routeState?.guardianId)
      } else {
        navigate(DashboardRoutes.toStudentList(productId!))
      }
    } catch (error) {
      const errorMsg = getErrorMessage(
        error,
        "Failed to create student. Please try again.",
      )
      toast.error(errorMsg)
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleCancel() {
    resetForm()
    clearDraft()
    navigate(DashboardRoutes.toStudentList(productId!))
  }

  function isStepComplete(step: StepTabItem["key"]) {
    if (step === "basic") return basicComplete
    if (step === "standard") return standardComplete
    return false
  }

  function isStepEnabled(step: StepTabItem["key"]) {
    if (step === "basic") return true
    if (step === "standard") return basicComplete
    return standardComplete
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Add Student"
        description={
          <>
            Step {steps.findIndex((s) => s.key === activeStep) + 1} of{" "}
            {steps.length} — {steps.find((s) => s.key === activeStep)?.subtitle}
            {pendingStudents.length > 0 && (
              <span className="mt-1 ml-2 inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-0.5 text-xs font-medium text-blue-600">
                {pendingStudents.length} more student
                {pendingStudents.length > 1 ? "s" : ""} to register after this
              </span>
            )}
          </>
        }
        onBack={() => navigate(DashboardRoutes.toStudentList(productId!))}
        backLabel="Back to Students"
      />

      {hasDraft && draftSavedAt && (
        <FormDraftBanner
          savedAt={draftSavedAt}
          onRestore={handleRestoreDraft}
          onDiscard={discardDraft}
        />
      )}

      <div className="s overflow-hidden rounded-2xl border border-gray-100 bg-white">
        <StepTabs
          steps={steps}
          activeStep={activeStep}
          isStepComplete={isStepComplete}
          isStepEnabled={isStepEnabled}
          onStepChange={setActiveStep}
        />

        <div className="pt-6">
          {activeStep === "basic" && (
            <BasicSection
              studentId={studentId}
              firstName={firstName}
              lastName={lastName}
              middleName={middleName}
              email={email}
              isDefaultEmail={isDefaultEmail}
              onDefaultEmailChange={handleDefaultEmailChange}
              password={password}
              gender={gender}
              dob={dob}
              nationality={nationality}
              stateOfOrigin={stateOfOrigin}
              lgaOfOrigin={lgaOfOrigin}
              passport={passport}
              onPassportChange={setPassport}
              selectedGuardian={selectedGuardian}
              onGuardianChange={(g: GuardianItemI | null) => {
                setSelectedGuardian(g)
                clearError("guardian")
              }}
              errors={errors}
              onStudentIdChange={setStudentId}
              onFirstNameChange={(v) => {
                setFirstName(v)
                clearError("firstName")
              }}
              onLastNameChange={(v) => {
                setLastName(v)
                clearError("lastName")
              }}
              onMiddleNameChange={setMiddleName}
              onGenerateEmail={handleGenerateEmail}
              onEmailChange={handleEmailChange}
              onGeneratePassword={handleGeneratePassword}
              onGenderChange={(v) => {
                setGender(v)
                clearError("gender")
              }}
              onDobChange={setDob}
              onNationalityChange={setNationality}
              onStateOfOriginChange={setStateOfOrigin}
              onLgaOfOriginChange={setLgaOfOrigin}
              clearError={clearError}
              onSave={saveBasic}
              onCancel={handleCancel}
              existingStudentQuery={existingStudentQuery}
              onExistingStudentQueryChange={setExistingStudentQuery}
              existingStudentResults={existingStudentResults}
              existingStudentLoading={existingStudentLoading}
              linkedExistingStudent={linkedExistingStudent}
              onSelectExistingStudent={handleSelectExistingStudent}
              onClearExistingStudent={handleClearExistingStudent}
            />
          )}

          {activeStep === "standard" && (
            <StandardSection
              religion={religion}
              religionOther={religionOther}
              homeAddress={homeAddress}
              admissionDate={admissionDate}
              previousSchool={previousSchool}
              historySession={historySession}
              historyTerm={historyTerm}
              historyClass={historyClass}
              historyAverage={historyAverage}
              historyLeaving={historyRemarks}
              errors={errors}
              clearError={clearError}
              onReligionChange={setReligion}
              onReligionOtherChange={setReligionOther}
              onHomeAddressChange={setHomeAddress}
              onAdmissionDateChange={setAdmissionDate}
              onPreviousSchoolChange={setPreviousSchool}
              onHistorySessionChange={setHistorySession}
              onHistoryTermChange={setHistoryTerm}
              onHistoryClassChange={setHistoryClass}
              onHistoryAverageChange={setHistoryAverage}
              onHistoryLeavingChange={setHistoryRemarks}
              onSave={saveStandard}
              onBack={() => setActiveStep("basic")}
            />
          )}

          {activeStep === "advanced" && (
            <AdvancedSection
              bloodGroup={bloodGroup}
              genotype={genotype}
              allergies={allergies}
              chronicConditions={chronicConditions}
              disabilities={disabilities}
              hasSpecialNeeds={hasSpecialNeeds}
              specialNeedsDesc={specialNeedsDesc}
              behavioralNotes={behavioralNotes}
              extracurriculars={extracurriculars}
              welfareType={welfareType}
              welfareDate={welfareDate}
              welfareDescription={welfareDescription}
              welfareReportedBy={welfareReportedBy}
              onBloodGroupChange={setBloodGroup}
              onGenotypeChange={setGenotype}
              onAllergiesChange={setAllergies}
              onChronicConditionsChange={setChronicConditions}
              onDisabilitiesChange={setDisabilities}
              onHasSpecialNeedsToggle={() => setHasSpecialNeeds((p) => !p)}
              onSpecialNeedsDescChange={setSpecialNeedsDesc}
              onBehavioralNotesChange={setBehavioralNotes}
              onExtracurricularsChange={setExtracurriculars}
              onWelfareTypeChange={setWelfareType}
              onWelfareDateChange={setWelfareDate}
              onWelfareDescriptionChange={setWelfareDescription}
              onWelfareReportedByChange={setWelfareReportedBy}
              onSave={saveAdvancedAndSubmit}
              onBack={() => setActiveStep("standard")}
              isSubmitting={isSubmitting}
            />
          )}
        </div>
      </div>
    </div>
  )
}
