// WordPress version: reminders are emailed to linked guardians (/WordPressFees/Reminders).
import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import apiClient from "@/api/api"
import { normalizeResponse } from "@/utils/apiResponse"
import { useNavigate, useParams } from "react-router"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { Filter, Send, Wallet } from "lucide-react"
import { PageHeader } from "@/components/general/PageHeader"
import { DashboardRoutes } from "@/routes"
import { useSchoolId } from "@/contexts/SchoolContext"
import { useGetAllSchoolSessions } from "@/hooks/userMgt"
import { useGetAllClasses } from "@/hooks/examAndRecords"
import { useGetPaymentReminders } from "@/hooks/feeManagement"
import { useDebouncedValue } from "@/hooks/useDebouncedValue"
import type { PaymentReminderBillI } from "@/api/feeManagement.api/types"
import type { PaymentReminderStatus } from "@/pages/Dashboard/FeeMgt/components/StatusBadge"
import { FilterBar } from "@/pages/Dashboard/FeeMgt/components/FilterBar"
import { StudentTable } from "@/pages/Dashboard/FeeMgt/components/StudentTable"
import SendReminderModal from "@/pages/Dashboard/FeeMgt/components/SendReminderModal"
import RecordPaymentModal from "@/pages/Dashboard/FeeMgt/components/RecordPaymentModal"
import BulkRecordPaymentModal from "@/pages/Dashboard/FeeMgt/components/BulkRecordPaymentModal"

const STATUS_PARAM: Record<PaymentReminderStatus, string> = {
  owing: "Owing",
  partial: "Partial",
  paid: "Paid",
}

export default function PaymentReminderPage() {
  const navigate = useNavigate()
  const { productId } = useParams()
  const schoolId = useSchoolId()

  const [search, setSearch] = useState("")
  const debouncedSearch = useDebouncedValue(search, 300)
  const [classFilter, setClassFilter] = useState("")
  const [termFilter, setTermFilter] = useState("")
  const [sessionFilter, setSessionFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState<PaymentReminderStatus | "all">(
    "all"
  )
  const [minBalance, setMinBalance] = useState("")
  const [maxBalance, setMaxBalance] = useState("")
  const [pageNumber, setPageNumber] = useState(1)

  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [reminderTargets, setReminderTargets] = useState<
    PaymentReminderBillI[] | null
  >(null)
  const [sentCount, setSentCount] = useState<number | null>(null)
  const [paymentTarget, setPaymentTarget] = useState<PaymentReminderBillI | null>(
    null
  )
  const [bulkPaymentOpen, setBulkPaymentOpen] = useState(false)

  const isReady = Boolean(sessionFilter && termFilter && classFilter)

  const { sessions, isLoading: sessionsLoading } = useGetAllSchoolSessions({
    schoolId,
    pageSize: 100,
  })
  const { classes: classItems, isLoading: classesLoading } = useGetAllClasses({
    schoolId,
    pageSize: 100,
  })

  const sessionOptions = useMemo(
    () => sessions.map((s) => ({ value: s.Id, label: s.SessionName })),
    [sessions]
  )

  const termOptions = useMemo(() => {
    const session = sessions.find((s) => s.Id === sessionFilter)
    return (session?.Terms ?? []).map((t) => ({
      value: t.Id,
      label: t.TermName,
    }))
  }, [sessions, sessionFilter])

  const classOptions = useMemo(
    () => classItems.map((c) => ({ value: c.Id, label: c.ClsName })),
    [classItems]
  )

  const handleSessionFilter = (v: string) => {
    setSessionFilter(v)
    setTermFilter("")
    setClassFilter("")
    setPageNumber(1)
  }

  const handleTermFilter = (v: string) => {
    setTermFilter(v)
    setClassFilter("")
    setPageNumber(1)
  }

  const handleClassFilter = (v: string) => {
    setClassFilter(v)
    setPageNumber(1)
  }

  const { paymentReminders, totalItems, pageSize, isLoading } =
    useGetPaymentReminders({
      schoolId,
      sessionId: sessionFilter,
      termId: termFilter,
      classId: classFilter,
      search: debouncedSearch || undefined,
      status: statusFilter !== "all" ? STATUS_PARAM[statusFilter] : undefined,
      minBalance: minBalance !== "" ? Number(minBalance) : undefined,
      maxBalance: maxBalance !== "" ? Number(maxBalance) : undefined,
      pageNumber,
      pageSize: 10,
    })

  // A selection only applies to the rows it was made from.
  useEffect(() => {
    setSelected(new Set())
  }, [sessionFilter, termFilter, classFilter, debouncedSearch, statusFilter, minBalance, maxBalance, pageNumber])

  const toggleOne = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })

  const toggleAll = (checked: boolean) =>
    setSelected((prev) => {
      const next = new Set(prev)
      paymentReminders.forEach((s) =>
        checked ? next.add(s.studentBillId) : next.delete(s.studentBillId)
      )
      return next
    })

  // Emails the linked guardians through the school's configured email service.
  const [sending, setSending] = useState(false)
  const handleSendReminder = async (data: { title: string; message: string }) => {
    if (!reminderTargets || sending) return
    setSending(true)
    try {
      const result = normalizeResponse<{
        isSuccess: boolean
        value: { emailsAccepted: number; emailsFailed: number; skippedBillCount: number }
      }>(
        await apiClient.post("/WordPressFees/Reminders", {
          studentBillIds: reminderTargets.map((s) => s.studentBillId),
          ...data,
        }),
      )
      if (!result.isSuccess) throw new Error("Unable to send reminders")
      setSentCount(result.value.emailsAccepted)
      if (result.value.emailsFailed)
        toast.error(
          `${result.value.emailsFailed} guardian emails were not accepted by the delivery service. Check email configuration before retrying.`,
        )
      if (result.value.skippedBillCount)
        toast.info(
          `${result.value.skippedBillCount} bills skipped: already paid, no guardian, or email delivery failed.`,
        )
      setReminderTargets(null)
      setSelected(new Set())
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to send reminders")
    } finally {
      setSending(false)
    }
  }

  const handleViewDetails = (student: PaymentReminderBillI) => {
    navigate(
      DashboardRoutes.toPaymentReminderDetails(productId!, {
        sessionId: sessionFilter,
        termId: termFilter,
        classId: classFilter,
        highlight: student.studentBillId,
      })
    )
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Payment reminder"
        description="Notify students and parents about outstanding balances"
      />

      {sentCount !== null && (
        <div className="rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-700">
          Email service accepted {sentCount} guardian reminder
          {sentCount !== 1 ? "s" : ""}. Delivery is handled by the configured email service.
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white ">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
          <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase">
            Select students
          </p>
          {selected.size > 0 && (
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                {selected.size} selected
              </span>
              <Button
                size="sm"
                variant="outline"
                className="rounded-md"
                onClick={() => setBulkPaymentOpen(true)}
              >
                <Wallet className="mr-1.5 size-3.5" />
                Make payment
              </Button>
              <Button
                size="sm"
                className="rounded-md"
                onClick={() =>
                  setReminderTargets(
                    paymentReminders.filter((s) => selected.has(s.studentBillId))
                  )
                }
              >
                <Send className="mr-1.5 size-3.5" />
                Send reminder
              </Button>
            </div>
          )}
        </div>

        <FilterBar
          search={search}
          classFilter={classFilter}
          termFilter={termFilter}
          sessionFilter={sessionFilter}
          statusFilter={statusFilter}
          minBalance={minBalance}
          maxBalance={maxBalance}
          sessionOptions={sessionOptions}
          termOptions={termOptions}
          classOptions={classOptions}
          sessionsLoading={sessionsLoading}
          classesLoading={classesLoading}
          onSearch={(v) => {
            setSearch(v)
            setPageNumber(1)
          }}
          onClassFilter={handleClassFilter}
          onTermFilter={handleTermFilter}
          onSessionFilter={handleSessionFilter}
          onStatusFilter={(v) => {
            setStatusFilter(v)
            setPageNumber(1)
          }}
          onMinBalance={(v) => {
            setMinBalance(v)
            setPageNumber(1)
          }}
          onMaxBalance={(v) => {
            setMaxBalance(v)
            setPageNumber(1)
          }}
        />

        {isReady ? (
          <StudentTable
            students={paymentReminders}
            selected={selected}
            isLoading={isLoading}
            onToggleOne={toggleOne}
            onToggleAll={toggleAll}
            onViewDetails={handleViewDetails}
            onMakePayment={setPaymentTarget}
            onSendReminder={(student) => setReminderTargets([student])}
            pagination={{
              page: pageNumber,
              total: totalItems,
              pageSize,
              onPageChange: setPageNumber,
            }}
          />
        ) : (
          <EmptyState
            icon={Filter}
            title="Select a session, term and class"
            description="Choose a session, term, and class above to view students with outstanding balances."
            size="sm"
          />
        )}
      </div>

      <SendReminderModal
        open={!!reminderTargets}
        onClose={() => {
          if (!sending) setReminderTargets(null)
        }}
        students={reminderTargets ?? []}
        onSend={(data) => void handleSendReminder(data)}
        isPending={sending}
      />

      <RecordPaymentModal
        open={!!paymentTarget}
        onClose={() => setPaymentTarget(null)}
        initialValues={
          paymentTarget
            ? {
                studentId: paymentTarget.studentId,
                sessionId: sessionFilter,
                termId: termFilter,
              }
            : undefined
        }
      />

      <BulkRecordPaymentModal
        open={bulkPaymentOpen}
        onClose={() => setBulkPaymentOpen(false)}
        students={paymentReminders.filter((s) => selected.has(s.studentBillId))}
        sessionId={sessionFilter}
        termId={termFilter}
        onDone={() => setSelected(new Set())}
      />
    </div>
  )
}
