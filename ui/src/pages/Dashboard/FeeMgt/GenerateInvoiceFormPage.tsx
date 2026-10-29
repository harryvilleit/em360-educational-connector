import { useState } from "react"
import { useNavigate, useParams } from "react-router"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { PageHeader } from "@/components/general/PageHeader"
import { AlertCircle } from "lucide-react"
import { useSchoolId } from "@/contexts/SchoolContext"
import { useGetGuardianFeeManagement } from "@/hooks/guardian"
import {
  useGetInvoiceBillItems,
  useGenerateInvoice,
} from "@/hooks/feeManagement"
import { useGetAllSchoolSessions } from "@/hooks/userMgt"
import { useGetAllClasses } from "@/hooks/examAndRecords"
import type { StudentInvoiceI } from "@/api/feeManagement.api/types"
import type { GuardianChildI } from "@/api/guardian.api/types"
import { DashboardRoutes } from "@/routes"
import GuardianChildSelect from "./components/GuardianChildSelect"
import SessionTermClassSelect from "./components/SessionTermClassSelect"
import InvoiceSavedModal from "./components/InvoiceSavedModal"
import { useSchoolMoney } from "@/hooks/useSchoolMoney"

interface FormErrors {
  guardian?: string
  student?: string
  session?: string
  term?: string
  class?: string
  issueDate?: string
  dueDate?: string
  items?: string
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
      <AlertCircle className="size-3 shrink-0" />
      {message}
    </p>
  )
}

export default function GenerateInvoiceFormPage() {
  const navigate = useNavigate()
  const { productId } = useParams<{ productId: string }>()
  const schoolId = useSchoolId()
  const { formatMoney } = useSchoolMoney()

  const [guardianId, setGuardianId] = useState("")
  const [studentId, setStudentId] = useState("")
  const [sessionId, setSessionId] = useState("")
  const [termId, setTermId] = useState("")
  const [classId, setClassId] = useState("")
  const [issueDate, setIssueDate] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [notes, setNotes] = useState("")
  const [errors, setErrors] = useState<FormErrors>({})
  const [savedInvoice, setSavedInvoice] = useState<StudentInvoiceI | null>(null)
  const { sessions } = useGetAllSchoolSessions({ schoolId, pageSize: 100 })
  const { classes: classItems } = useGetAllClasses({ schoolId, pageSize: 100 })

  function handleStudentChange(id: string, student?: GuardianChildI) {
    setStudentId(id)
    clearError("student")
    if (!student) return

    const currentSession = student.currentSession?.trim()
    const currentClass = student.currentClass?.trim()

    const matchedSession = currentSession
      ? sessions.find((s) => s.SessionName.trim() === currentSession)
      : undefined
    if (matchedSession) {
      setSessionId(matchedSession.Id)
      clearError("session")
      const currentTerm = matchedSession.Terms.find((t) => t.IsCurrent)
      if (currentTerm) {
        setTermId(currentTerm.Id)
        clearError("term")
      }
    }

    const matchedClass = currentClass
      ? classItems.find((c) => c.ClsName.trim() === currentClass)
      : undefined
    if (matchedClass) {
      setClassId(matchedClass.Id)
      clearError("class")
    }
  }

  const {
    billItems,
    isLoading: itemsLoading,
    isError: itemsError,
    error: itemsErrorDetails,
  } = useGetInvoiceBillItems({
    schoolId,
    studentId,
    schoolSessionId: sessionId,
    schoolSessionTermId: termId,
    schoolClassId: classId,
  })

  const { feeManagement } = useGetGuardianFeeManagement({
    guardianId,
    schoolId,
    studentId,
    schoolSessionId: sessionId,
  })

  const { generateInvoice, isPending } = useGenerateInvoice({
    onSuccess: (data) => setSavedInvoice(data.value),
  })

  function clearError(field: keyof FormErrors) {
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const isOptionalItem = (item: (typeof billItems)[number]) =>
    item.paymentRequirement?.toLowerCase() === "optional"
  const requiredItems = billItems.filter((i) => !isOptionalItem(i))
  const optionalItems = billItems.filter(isOptionalItem)

  const totalAmount = requiredItems.reduce((s, i) => s + i.netAmount, 0)

  function validate(): boolean {
    const next: FormErrors = {}
    if (!guardianId) next.guardian = "Please select a guardian."
    if (!studentId) next.student = "Please select a student."
    if (!sessionId) next.session = "Please select a session."
    if (!termId) next.term = "Please select a term."
    if (!classId) next.class = "Please select a class."
    if (!issueDate) next.issueDate = "Issue date is required."
    if (!dueDate) next.dueDate = "Due date is required."
    if (issueDate && dueDate && dueDate < issueDate)
      next.dueDate = "Due date cannot be before issue date."
    if (billItems.length === 0)
      next.items = "No fee items found for this student's class/session/term."
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleSubmit() {
    if (!validate()) return
    const studentEnrollmentId = feeManagement?.student.studentEnrollmentId
    if (!studentEnrollmentId) {
      setErrors((prev) => ({
        ...prev,
        student:
          "Could not resolve this student's enrollment. Try reselecting.",
      }))
      return
    }

    generateInvoice({
      schoolId,
      guardianId,
      studentId,
      studentEnrollmentId,
      schoolSessionId: sessionId,
      schoolSessionTermId: termId,
      schoolClassId: classId,
      issueDate,
      dueDate,
      notes: notes || undefined,
    })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Generate Invoice"
        description="Select a student, session, term and class — payable fee items are added automatically."
        onBack={() => navigate(-1)}
      />

      <div className="space-y-6 rounded-2xl border border-gray-200 bg-white p-4 sm:p-6">
        <section>
          <GuardianChildSelect
            schoolId={schoolId}
            guardianId={guardianId}
            onGuardianChange={(id) => {
              setGuardianId(id)
              clearError("guardian")
            }}
            studentId={studentId}
            onStudentChange={handleStudentChange}
            guardianError={errors.guardian}
            studentError={errors.student}
          />
        </section>

        <section>
          <SessionTermClassSelect
            schoolId={schoolId}
            sessionId={sessionId}
            onSessionChange={(id) => {
              setSessionId(id)
              clearError("session")
            }}
            termId={termId}
            onTermChange={(id) => {
              setTermId(id)
              clearError("term")
            }}
            classId={classId}
            onClassChange={(id) => {
              setClassId(id)
              clearError("class")
            }}
            showClass
            sessionError={errors.session}
            termError={errors.term}
            classError={errors.class}
          />
        </section>

        {/* ── Invoice meta ── */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label className="mb-1 block text-xs text-gray-600">
              Issue Date *
            </Label>
            <Input
              type="date"
              value={issueDate}
              onChange={(e) => {
                setIssueDate(e.target.value)
                clearError("issueDate")
              }}
              className={`w-full rounded-md ${errors.issueDate ? "border-red-400" : ""}`}
            />
            <FieldError message={errors.issueDate} />
          </div>
          <div>
            <Label className="mb-1 block text-xs text-gray-600">
              Due Date *
            </Label>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => {
                setDueDate(e.target.value)
                clearError("dueDate")
              }}
              className={`w-full rounded-md ${errors.dueDate ? "border-red-400" : ""}`}
            />
            <FieldError message={errors.dueDate} />
          </div>
        </section>

        {/* ── Bill items ── */}
        <section>
          <Label className="mb-3 block text-sm font-semibold text-gray-700">
            Fee Items
          </Label>

          {!classId || !termId || !sessionId || !studentId ? (
            <p className="rounded-xl border border-dashed border-gray-200 px-4 py-6 text-center text-xs text-muted-foreground">
              Select a student, session, term, and class to see payable items.
            </p>
          ) : itemsLoading ? (
            <p className="rounded-xl border border-dashed border-gray-200 px-4 py-6 text-center text-xs text-muted-foreground">
              Loading fee items...
            </p>
          ) : itemsError || billItems.length === 0 ? (
            <div className="space-y-3 rounded-xl border border-dashed border-gray-200 px-4 py-6 text-center">
              <p className="text-xs text-muted-foreground">
                {itemsErrorDetails?.message ??
                  "No fee items found for this student's class/session/term."}{" "}
                A Payment Type needs to be set up for this class/session/term
                before an invoice can be generated.
              </p>
              <Button
                type="button"
                variant="outline"
                className="rounded-md"
                onClick={() =>
                  navigate(
                    `${DashboardRoutes.toCreatePaymentType(productId ?? "")}?sessionId=${sessionId}&termId=${termId}&classId=${classId}`
                  )
                }
              >
                Set Up Payment Type
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {requiredItems.map((item) => (
                <div
                  key={item.schoolStudentBillItemId}
                  className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {item.description}
                      {item.isCustom && (
                        <span className="ml-1.5 rounded-full bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-600">
                          Custom
                        </span>
                      )}
                    </p>
                    {item.notes && (
                      <p className="text-xs text-gray-400">{item.notes}</p>
                    )}
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatMoney(item.netAmount)}
                  </span>
                </div>
              ))}

              {optionalItems.length > 0 && (
                <>
                  <div className="flex items-center gap-3 pt-2">
                    <div className="h-px flex-1 bg-gray-200" />
                    <span className="text-[11px] font-semibold tracking-wide text-gray-400 uppercase">
                      Optional — not included in total
                    </span>
                    <div className="h-px flex-1 bg-gray-200" />
                  </div>

                  {optionalItems.map((item) => (
                    <div
                      key={item.schoolStudentBillItemId}
                      className="flex items-center justify-between rounded-xl border border-dashed border-gray-200 px-4 py-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {item.description}
                          {item.isCustom && (
                            <span className="ml-1.5 rounded-full bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-600">
                              Custom
                            </span>
                          )}
                        </p>
                        {item.notes && (
                          <p className="text-xs text-gray-400">{item.notes}</p>
                        )}
                      </div>
                      <span className="text-sm font-semibold text-gray-500">
                        {formatMoney(item.netAmount)}
                      </span>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
          <FieldError message={errors.items} />

          {requiredItems.length > 0 && (
            <div className="mt-4 space-y-1.5 rounded-xl bg-gray-50 p-4 text-sm">
              <div className="flex justify-between border-t border-gray-200 pt-1.5 font-semibold text-gray-900">
                <span>
                  Total ({requiredItems.length} item
                  {requiredItems.length !== 1 ? "s" : ""})
                </span>
                <span>{formatMoney(totalAmount)}</span>
              </div>
            </div>
          )}
        </section>

        {/* ── Notes ── */}
        <section>
          <Label className="mb-1 block text-xs text-gray-600">
            Notes (optional)
          </Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any additional notes for this invoice..."
            className="rounded-md"
          />
        </section>
      </div>

      {/* Footer */}
      <div className="flex flex-col-reverse gap-3 pb-10 sm:flex-row sm:justify-end">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="w-full rounded-md sm:w-auto"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isPending || itemsLoading || billItems.length === 0}
          className="w-full rounded-md bg-blue-600 text-white hover:bg-blue-700 sm:w-auto"
        >
          {isPending ? "Saving..." : "Save Invoice"}
        </Button>
      </div>

      {savedInvoice && (
        <InvoiceSavedModal
          invoice={savedInvoice}
          optionalItems={optionalItems}
          onClose={() => {
            setSavedInvoice(null)
            navigate(-1)
          }}
        />
      )}
    </div>
  )
}
