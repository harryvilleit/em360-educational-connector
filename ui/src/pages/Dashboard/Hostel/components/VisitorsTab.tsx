import { useState } from "react"
import { useParams } from "react-router"
import { useForm, Controller, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Plus,
  AlertCircle,
  LogIn,
  LogOut,
  Users,
  Gift,
  Search,
  ClipboardList,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PhoneInput } from "@/components/ui/phone-input"
import { SearchInput } from "@/components/ui/search-input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { EmptyState } from "@/components/ui/empty-state"
import { DataTable, type DataTableColumn } from "@/components/ui/data-table"
import { FormDraftBanner } from "@/components/general/FormDraftBanner"
import { useFormDraft } from "@/hooks/useFormDraft"
import { useSchoolId } from "@/contexts/SchoolContext"
import {
  useGetAllHostelVisitors,
  useRecordHostelVisitor,
  useSignInOutHostelVisitor,
} from "@/hooks/hostel"
import { useGetSchoolStudents } from "@/hooks/studentPortal"
import { visitorSchema, type VisitorFormData } from "@/schema/visitors.schema"
import type { HostelVisitorItemI } from "@/api/hostel.api/types"
import { DashboardRoutes } from "@/routes"
import { RequiredDataNotice } from "./RequiredDataNotice"

interface VisitorsTabProps {
  hostelId: string
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

function formatTime(value?: string) {
  if (!value) return "—"
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })
}

export default function VisitorsTab({ hostelId }: VisitorsTabProps) {
  const schoolId = useSchoolId()
  const { productId } = useParams<{ productId: string }>()
  const p = productId ?? ""

  const [modalOpen, setModalOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [studentSearch, setStudentSearch] = useState("")

  const { visitors, isLoading } = useGetAllHostelVisitors({
    hostelId,
    searchString: search || undefined,
    fromDate: dateFrom || undefined,
    toDate: dateTo || undefined,
    pageSize: 100,
  })

  const { students } = useGetSchoolStudents({
    schoolId,
    search: studentSearch || undefined,
    pageSize: 10,
  })
  const { pagination: studentTotals } = useGetSchoolStudents({
    schoolId,
    pageSize: 1,
  })
  const noStudentsExist = studentTotals.totalItems === 0

  const { recordHostelVisitor, isPending: isRecording } = useRecordHostelVisitor(
    { onSuccess: () => { reset(); setModalOpen(false); clearDraft() } }
  )
  const { signInOutHostelVisitor } = useSignInOutHostelVisitor()

  const {
    control,
    register,
    watch,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<VisitorFormData>({
    resolver: zodResolver(visitorSchema),
    defaultValues: {
      studentIds: [],
      visitorFirstName: "",
      visitorLastName: "",
      visitorPhone: "",
      relationship: "",
      visitDate: new Date().toISOString().split("T")[0],
      checkIn: "",
      checkOut: "",
      reason: "",
      broughtGift: "no",
      giftItems: "",
      extraVisitorsCount: "",
      extraVisitorsNames: "",
    },
  })

  const watchedAll = useWatch({ control })

  const {
    hasDraft,
    draftValues,
    draftSavedAt,
    acknowledgeDraft,
    discardDraft,
    clearDraft,
  } = useFormDraft<VisitorFormData>({
    formKey: "hostel-visitor-create",
    values: watchedAll as VisitorFormData,
    enabled: modalOpen,
  })

  function handleRestoreDraft() {
    if (!draftValues) return
    reset(draftValues)
    acknowledgeDraft()
  }

  const selectedStudentIds = watch("studentIds") ?? []
  const broughtGift = watch("broughtGift")
  const extraCount = watch("extraVisitorsCount")

  const [selectedStudents, setSelectedStudents] = useState<
    { id: string; name: string }[]
  >([])

  const toggleStudent = (id: string, name: string) => {
    if (selectedStudentIds.includes(id)) {
      setValue(
        "studentIds",
        selectedStudentIds.filter((sid) => sid !== id),
        { shouldValidate: true }
      )
      setSelectedStudents((prev) => prev.filter((s) => s.id !== id))
    } else {
      setValue("studentIds", [...selectedStudentIds, id], {
        shouldValidate: true,
      })
      setSelectedStudents((prev) => [...prev, { id, name }])
    }
  }

  const onSubmit = (data: VisitorFormData) => {
    const notesParts: string[] = []
    if (data.broughtGift === "yes" && data.giftItems)
      notesParts.push(data.giftItems)
    const additionalVisitorNames =
      data.extraVisitorsCount && parseInt(data.extraVisitorsCount) > 0
        ? data.extraVisitorsNames
        : undefined

    recordHostelVisitor({
      hostelId,
      studentIds: data.studentIds,
      visitorFirstName: data.visitorFirstName,
      visitorLastName: data.visitorLastName,
      visitorPhone: data.visitorPhone,
      relationship: data.relationship,
      reason: data.reason,
      visitDate: data.visitDate,
      expectedCheckInTime: data.checkIn,
      expectedCheckOutTime: data.checkOut,
      additionalVisitorCount: data.extraVisitorsCount
        ? parseInt(data.extraVisitorsCount) || 0
        : undefined,
      additionalVisitorNames,
      broughtPackage: data.broughtGift === "yes",
    })
  }

  const closeModal = () => {
    setModalOpen(false)
    reset()
    setSelectedStudents([])
    setStudentSearch("")
  }

  const columns: DataTableColumn<HostelVisitorItemI>[] = [
    {
      key: "index",
      header: "#",
      cellClassName: "font-mono text-xs text-gray-400",
      render: (_v, i) => i + 1,
    },
    {
      key: "date",
      header: "Date",
      cellClassName: "whitespace-nowrap text-gray-700",
      render: (v) =>
        new Date(v.visitDate).toLocaleDateString("en-NG", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
    },
    {
      key: "visitor",
      header: "Visitor",
      cellClassName: "font-medium text-gray-900",
      render: (v) => v.visitorFullName,
    },
    {
      key: "relationship",
      header: "Relationship",
      cellClassName: "text-gray-600",
      render: (v) => v.relationship,
    },
    {
      key: "students",
      header: "Student(s)",
      cellClassName: "text-gray-700",
      render: (v) => v.students.map((s) => s.studentName).join(", "),
    },
    {
      key: "phone",
      header: "Phone",
      cellClassName: "whitespace-nowrap text-gray-600",
      render: (v) => v.visitorPhone,
    },
    {
      key: "signIn",
      header: "Sign In",
      cellClassName: "whitespace-nowrap text-gray-600",
      render: (v) => formatTime(v.actualCheckInTime),
    },
    {
      key: "signOut",
      header: "Sign Out",
      cellClassName: "whitespace-nowrap text-gray-600",
      render: (v) => formatTime(v.actualCheckOutTime),
    },
    {
      key: "action",
      header: "Action",
      render: (v) =>
        !v.actualCheckInTime ? (
          <Button
            size="sm"
            variant="outline"
            onClick={() => signInOutHostelVisitor({ id: v.id, isSignIn: true })}
            className="border-blue-200 text-xs text-blue-600 hover:bg-blue-50"
          >
            <LogIn className="mr-1 h-3 w-3" />
            Sign In
          </Button>
        ) : !v.actualCheckOutTime ? (
          <Button
            size="sm"
            variant="outline"
            onClick={() => signInOutHostelVisitor({ id: v.id, isSignIn: false })}
            className="border-red-200 text-xs text-red-600 hover:bg-red-50"
          >
            <LogOut className="mr-1 h-3 w-3" />
            Sign Out
          </Button>
        ) : null,
    },
  ]

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Visitor Log</h2>
        <Button variant="primary" onClick={() => setModalOpen(true)}>
          <Plus className="size-4" />
          Record Visit
        </Button>
      </div>

      {/* Search + Date Range Filter */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by visitor name, student, or relationship…"
        />
        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-36"
            title="From"
          />
          <span className="text-xs text-gray-400">to</span>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-36"
            title="To"
          />
        </div>
        {(search || dateFrom || dateTo) && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearch("")
              setDateFrom("")
              setDateTo("")
            }}
          >
            Clear
          </Button>
        )}
      </div>

      {/* Logbook Table */}
      <DataTable
        columns={columns}
        data={visitors}
        getRowKey={(v) => v.id}
        isLoading={isLoading}
        emptyState={
          <EmptyState
            icon={ClipboardList}
            title="No visitor records"
            description="Records will appear here once visits are logged"
          />
        }
      />

      {/* Record Visit Modal */}
      <Dialog
        open={modalOpen}
        onOpenChange={(v) => {
          if (!v) closeModal()
          else setModalOpen(true)
        }}
      >
        <DialogContent className="flex max-h-[90vh] flex-col sm:max-w-lg">
          <DialogHeader className="shrink-0">
            <DialogTitle>Record Visit</DialogTitle>
          </DialogHeader>

          {hasDraft && draftSavedAt && (
            <FormDraftBanner
              savedAt={draftSavedAt}
              onRestore={handleRestoreDraft}
              onDiscard={discardDraft}
            />
          )}

          <div className="flex-1 overflow-y-auto pr-1">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Students */}
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Student(s) Visited <span className="text-red-500">*</span>
                </Label>

                {selectedStudents.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {selectedStudents.map((s) => (
                      <span
                        key={s.id}
                        className="flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700"
                      >
                        {s.name}
                        <button
                          type="button"
                          onClick={() => toggleStudent(s.id, s.name)}
                          className="rounded-full hover:text-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <div className="relative mt-1.5">
                  <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search students by name…"
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                {noStudentsExist ? (
                  <RequiredDataNotice
                    itemLabel="a student"
                    pageLabel="Students"
                    to={DashboardRoutes.toStudentAdd(p)}
                  />
                ) : (
                  studentSearch.trim() && (
                    <div className="mt-1 max-h-40 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-sm">
                      {students.length === 0 ? (
                        <div className="px-3 py-3 text-center text-sm text-gray-400">
                          No students found
                        </div>
                      ) : (
                        students.map((s) => {
                          const name = `${s.firstname} ${s.lastname}`
                          const checked = selectedStudentIds.includes(
                            s.studentId
                          )
                          return (
                            <button
                              key={s.studentId}
                              type="button"
                              onClick={() => toggleStudent(s.studentId, name)}
                              className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-blue-50 ${
                                checked ? "bg-blue-50" : ""
                              }`}
                            >
                              {name}
                            </button>
                          )
                        })
                      )}
                    </div>
                  )
                )}
                <FieldError
                  message={errors.studentIds?.message as string | undefined}
                />
              </div>

              {/* Visitor Name */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    First Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    {...register("visitorFirstName")}
                    placeholder="First name"
                    className={errors.visitorFirstName ? "border-red-400" : ""}
                  />
                  <FieldError message={errors.visitorFirstName?.message} />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Last Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    {...register("visitorLastName")}
                    placeholder="Last name"
                    className={errors.visitorLastName ? "border-red-400" : ""}
                  />
                  <FieldError message={errors.visitorLastName?.message} />
                </div>
              </div>

              {/* Phone & Relationship */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Phone <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    name="visitorPhone"
                    control={control}
                    render={({ field, fieldState }) => (
                      <PhoneInput
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        error={fieldState.invalid}
                      />
                    )}
                  />
                  <FieldError message={errors.visitorPhone?.message} />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Relationship <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    {...register("relationship")}
                    placeholder="e.g. Father, Uncle"
                    className={errors.relationship ? "border-red-400" : ""}
                  />
                  <FieldError message={errors.relationship?.message} />
                </div>
              </div>

              {/* Reason */}
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Reason / Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  {...register("reason")}
                  placeholder="e.g. Routine parental visit, brought school supplies…"
                  rows={2}
                  className={`mt-1 resize-none text-sm ${
                    errors.reason ? "border-red-400" : ""
                  }`}
                />
                <FieldError message={errors.reason?.message} />
              </div>

              {/* Visit Date */}
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Visit Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="date"
                  {...register("visitDate")}
                  className={errors.visitDate ? "border-red-400" : ""}
                />
                <FieldError message={errors.visitDate?.message} />
              </div>

              {/* Check In / Check Out */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Expected Check In <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="time"
                    {...register("checkIn")}
                    className={errors.checkIn ? "border-red-400" : ""}
                  />
                  <FieldError message={errors.checkIn?.message} />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Expected Check Out <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="time"
                    {...register("checkOut")}
                    className={errors.checkOut ? "border-red-400" : ""}
                  />
                  <FieldError message={errors.checkOut?.message} />
                </div>
              </div>

              {/* Extra Visitors */}
              <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <Label className="text-sm font-medium text-gray-700">
                    Additional Visitors
                  </Label>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-gray-600">
                      Number of extra persons
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      {...register("extraVisitorsCount")}
                      placeholder="0"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600">
                      Names (optional)
                    </Label>
                    <Input
                      {...register("extraVisitorsNames")}
                      placeholder="e.g. Mrs. Ada, John"
                      className="mt-1"
                    />
                  </div>
                </div>
                {extraCount && parseInt(extraCount) > 0 && (
                  <p className="text-xs text-blue-600">
                    {extraCount} extra person
                    {parseInt(extraCount) > 1 ? "s" : ""} accompanying
                  </p>
                )}
              </div>

              {/* Gift / Package */}
              <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
                <div className="flex items-center gap-2">
                  <Gift className="h-4 w-4 text-gray-500" />
                  <Label className="text-sm font-medium text-gray-700">
                    Did the visitor bring a gift or package?
                  </Label>
                </div>
                <Controller
                  control={control}
                  name="broughtGift"
                  render={({ field }) => (
                    <div className="flex gap-3">
                      {(["yes", "no"] as const).map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => field.onChange(option)}
                          className={`flex-1 rounded-md border py-2 text-sm font-medium capitalize transition-colors ${
                            field.value === option
                              ? option === "yes"
                                ? "border-blue-500 bg-blue-50 text-blue-700"
                                : "border-gray-400 bg-white text-gray-700"
                              : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                />
                {broughtGift === "yes" && (
                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      Describe the items brought
                    </Label>
                    <Textarea
                      {...register("giftItems")}
                      placeholder="e.g. Food items, clothing, books…"
                      rows={2}
                      className="mt-1 resize-none text-sm"
                    />
                  </div>
                )}
              </div>

              <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeModal}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isRecording}
                  className="w-full bg-blue-600 text-white hover:bg-blue-700 sm:w-auto"
                >
                  {isRecording ? "Recording…" : "Record Visit"}
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
