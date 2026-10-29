import { useMemo, useState } from "react"
import { useNavigate, useSearchParams } from "react-router"
import { Users } from "lucide-react"
import { PageHeader } from "@/components/general/PageHeader"
import { EmptyState } from "@/components/ui/empty-state"
import Pagination from "@/components/ui/pagination"
import { useSchoolId } from "@/contexts/SchoolContext"
import { useGetAllSchoolSessions } from "@/hooks/userMgt"
import { useGetAllClasses } from "@/hooks/examAndRecords"
import { useGetPaymentReminders } from "@/hooks/feeManagement"
import type { PaymentReminderBillI } from "@/api/feeManagement.api/types"
import { BillDetailRow } from "./components/BillDetailRow"
import RecordPaymentModal from "./components/RecordPaymentModal"
import { useSchoolMoney } from "@/hooks/useSchoolMoney"

const PAGE_SIZE = 100

export default function PaymentReminderDetailsPage() {
  const navigate = useNavigate()
  const schoolId = useSchoolId()
  const { formatMoney } = useSchoolMoney()
  const [searchParams] = useSearchParams()

  const sessionId = searchParams.get("sessionId") ?? ""
  const termId = searchParams.get("termId") ?? ""
  const classId = searchParams.get("classId") ?? ""
  const highlight = searchParams.get("highlight") ?? ""

  const [pageNumber, setPageNumber] = useState(1)
  const [paymentTarget, setPaymentTarget] =
    useState<PaymentReminderBillI | null>(null)

  const { sessions } = useGetAllSchoolSessions({ schoolId, pageSize: 100 })
  const { classes } = useGetAllClasses({ schoolId, pageSize: 100 })

  const sessionName = sessions.find((s) => s.Id === sessionId)?.SessionName
  const termName = sessions
    .find((s) => s.Id === sessionId)
    ?.Terms.find((t) => t.Id === termId)?.TermName
  const className = classes.find((c) => c.Id === classId)?.ClsName

  const backToList = () => navigate(-1)
  const isReady = Boolean(sessionId && termId && classId)

  const { paymentReminders, totalItems, pageSize, isLoading } =
    useGetPaymentReminders({
      schoolId,
      sessionId,
      termId,
      classId,
      pageNumber,
      pageSize: PAGE_SIZE,
    })

  const totals = useMemo(
    () =>
      paymentReminders.reduce(
        (acc, s) => ({
          billed: acc.billed + s.totalBill,
          paid: acc.paid + s.amountPaid,
          outstanding: acc.outstanding + s.outstandingBalance,
        }),
        { billed: 0, paid: 0, outstanding: 0 }
      ),
    [paymentReminders]
  )

  if (!isReady) {
    return (
      <div className="space-y-6">
        <PageHeader title="Fee Reminder Details" onBack={backToList} />
        <EmptyState
          icon={Users}
          title="No session, term or class selected"
          description="Go back to Payment Reminder and choose a session, term and class first."
          action={{ label: "Back to Payment Reminder", onClick: backToList }}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={className ?? "Fee Reminder Details"}
        description={[sessionName, termName].filter(Boolean).join(" · ")}
        onBack={backToList}
        backLabel="Back to Payment Reminder"
        stats={[
          { label: "Students", value: totalItems },
          {
            label: "Total Billed",
            value: formatMoney(totals.billed),
          },
          { label: "Total Paid", value: formatMoney(totals.paid) },
          {
            label: "Outstanding",
            value: formatMoney(totals.outstanding),
          },
        ]}
      />

      {isLoading ? (
        <p className="py-10 text-center text-sm text-gray-400">Loading...</p>
      ) : paymentReminders.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No students found"
          description="No fee bills match this session, term and class."
          size="sm"
        />
      ) : (
        <div className="space-y-3">
          {paymentReminders.map((bill) => (
            <BillDetailRow
              key={bill.studentBillId}
              bill={bill}
              defaultExpanded={bill.studentBillId === highlight}
              onMakePayment={setPaymentTarget}
            />
          ))}
        </div>
      )}

      {totalItems > pageSize && (
        <Pagination
          page={pageNumber}
          total={totalItems}
          pageSize={pageSize}
          onPageChange={setPageNumber}
        />
      )}

      <RecordPaymentModal
        open={!!paymentTarget}
        onClose={() => setPaymentTarget(null)}
        initialValues={
          paymentTarget
            ? { studentId: paymentTarget.studentId, sessionId, termId }
            : undefined
        }
      />
    </div>
  )
}
