// Recovered from the 0.6 WordPress Parent Portal source; used only by the WordPress parent screens.
import { downloadParentInvoicePdf } from "@/lib/parentInvoicePdf"
import { useRef, useState } from "react"
import { useNavigate, useParams } from "react-router"
import { useSchoolId, useSchoolCurrency } from "@/contexts/SchoolContext"
import { useGetGuardianDetails, useGetGuardianChildren } from "@/hooks/guardian"
import { useGetAllSchoolSessions } from "@/hooks/userMgt"
import { useGetInvoices, useGetInvoiceDetails } from "@/hooks/feeManagement"
import { useSchoolCardBranding } from "@/hooks/useSchoolCardBranding"
import { PageHeader } from "@/components/general/PageHeader"
import { QueryErrorPanel } from "@/components/general/QueryErrorPanel"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import Pagination from "@/components/ui/pagination"
import { ChildPaymentHistory } from "@/pages/Dashboard/Parent/components/ChildPaymentHistory"
import { OverviewCard } from "@/pages/Dashboard/Parent/components/OverviewCard"
import { printInvoiceElement } from "@/lib/invoicePdf"
import { formatCurrency } from "@/utils/currency"
import { toast } from "sonner"
export default function ParentFeeLedger() {
  const { parentId = "" } = useParams(),
    schoolId = useSchoolId(),
    navigate = useNavigate()
  const [session, setSession] = useState(""),
    [term, setTerm] = useState(""),
    [child, setChild] = useState(""),
    [page, setPage] = useState(1),
    [status, setStatus] = useState(""),
    [invoice, setInvoice] = useState("")
  const guardian = useGetGuardianDetails({ guardianId: parentId }),
    children = useGetGuardianChildren({ guardianId: parentId, schoolId }),
    sessions = useGetAllSchoolSessions({ schoolId, pageSize: 100 })
  const activeSession =
    session ||
    sessions.sessions.find((s) => s.IsCurrent)?.Id ||
    sessions.sessions[0]?.Id ||
    ""
  const q = useGetInvoices({
    schoolId,
    guardianId: parentId,
    schoolSessionId: activeSession,
    schoolSessionTermId: term || undefined,
    studentId: child || undefined,
    paymentStatus: status ? Number(status) : undefined,
    pageNumber: page,
    pageSize: 20,
  })
  const currency = useSchoolCurrency(),
    money = (v: number) => formatCurrency(v, currency)
  return (
    <div className="space-y-6">
      <PageHeader
        title="School Fees"
        description={
          guardian.guardian?.fullName || "Parent invoices and recorded payments"
        }
        onBack={() => navigate(-1)}
      />
      <div className="flex flex-wrap gap-3">
        <label>
          Session
          <select
            aria-label="Fee session"
            className="ml-2 rounded-lg border bg-white p-2"
            value={activeSession}
            onChange={(e) => {
              setSession(e.target.value)
              setTerm("")
              setPage(1)
            }}
          >
            {sessions.sessions.map((s) => (
              <option key={s.Id} value={s.Id}>
                {s.SessionName}
              </option>
            ))}
          </select>
        </label>
        <label>
          Term
          <select
            aria-label="Fee term"
            className="ml-2 rounded-lg border bg-white p-2"
            value={term}
            onChange={(e) => {
              setTerm(e.target.value)
              setPage(1)
            }}
          >
            <option value="">All terms</option>
            {sessions.sessions
              .find((s) => s.Id === activeSession)
              ?.Terms.map((t) => (
                <option key={t.Id} value={t.Id}>
                  {t.TermName}
                </option>
              ))}
          </select>
        </label>
        <label>
          Child
          <select
            aria-label="Fee child"
            className="ml-2 rounded-lg border bg-white p-2"
            value={child}
            onChange={(e) => {
              setChild(e.target.value)
              setPage(1)
            }}
          >
            <option value="">All children</option>
            {children.children.map((c) => (
              <option key={c.studentId} value={c.studentId}>
                {c.fullName}
              </option>
            ))}
          </select>
        </label>
        <label>
          Status
          <select
            aria-label="Invoice status"
            className="ml-2 rounded-lg border bg-white p-2"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value)
              setPage(1)
            }}
          >
            <option value="">All statuses</option>
            {["Unpaid", "Partial", "Paid", "Overdue"].map((s, i) => (
              <option key={s} value={i + 1}>
                {s}
              </option>
            ))}
          </select>
        </label>
      </div>
      {sessions.isError || guardian.isError || children.isError ? (
        <QueryErrorPanel
          title="Unable to load fee filters"
          message="Reload the parent and academic records."
          onRetry={() => {
            void sessions.refetch()
            void guardian.refetch()
            void children.refetch()
          }}
        />
      ) : sessions.isLoading ? (
        <p>Loading sessions…</p>
      ) : !activeSession ? (
        <p>No academic sessions are configured.</p>
      ) : q.isError ? (
        <QueryErrorPanel
          title="Unable to load invoices"
          message={q.error?.message || "Please try again."}
          onRetry={() => void q.refetch()}
        />
      ) : q.isLoading ? (
        <p role="status">Loading invoices…</p>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <OverviewCard
              label="Total Billed"
              amount={q.totalInvoiced}
              color="gray"
            />
            <OverviewCard
              label="Total Collected"
              amount={q.totalCollected}
              color="green"
            />
            <OverviewCard
              label="Outstanding"
              amount={q.outstandingBalance}
              color="red"
            />
          </div>
          <div className="overflow-x-auto rounded-xl border bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50">
                <tr>
                  {[
                    "Invoice / Child",
                    "Session / Term",
                    "Billed",
                    "Paid",
                    "Outstanding",
                    "Status",
                    "",
                  ].map((h, i) => (
                    <th key={i} className="p-4">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {q.invoices.map((i) => (
                  <tr key={i.id} className="border-t">
                    <td className="p-4">
                      {i.invoiceNumber}
                      <p className="text-slate-500">{i.studentName}</p>
                    </td>
                    <td className="p-4">
                      {i.session} · {i.term}
                    </td>
                    <td className="p-4">{money(i.grandTotal)}</td>
                    <td className="p-4">{money(i.amountPaid)}</td>
                    <td className="p-4">{money(i.outstandingAmount)}</td>
                    <td className="p-4">{i.paymentStatus}</td>
                    <td className="p-4">
                      <Button
                        variant="outline"
                        onClick={() => setInvoice(i.id)}
                      >
                        View invoice
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!q.invoices.length && (
              <p className="p-8 text-center text-slate-500">
                No invoices match these filters.
              </p>
            )}
          </div>
          <Pagination
            page={page}
            total={q.totalItems}
            pageSize={20}
            onPageChange={setPage}
          />
        </>
      )}
      {child && (
        <ChildPaymentHistory
          key={child + activeSession}
          schoolId={schoolId}
          studentId={child}
          sessionId={activeSession}
          currencyCode={currency}
        />
      )}
      {!child && children.children.length > 0 && (
        <p className="text-sm text-slate-500">
          Select a child to review their recorded payment history.
        </p>
      )}
      {invoice && (
        <InvoicePreview id={invoice} onClose={() => setInvoice("")} />
      )}
    </div>
  )
}
function InvoicePreview({ id, onClose }: { id: string; onClose: () => void }) {
  const q = useGetInvoiceDetails(id),
    schoolId = useSchoolId(),
    currency = useSchoolCurrency(),
    brand = useSchoolCardBranding(schoolId)
  const ref = useRef<HTMLDivElement>(null),
    [exporting, setExporting] = useState(false)
  const i = q.invoiceDetails,
    money = (n: number) => formatCurrency(n, currency)
  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Invoice details</DialogTitle>
          <DialogDescription>
            Saved invoice and payment totals for this school.
          </DialogDescription>
        </DialogHeader>
        {q.isLoading ? (
          <p>Loading invoice…</p>
        ) : q.isError ? (
          <QueryErrorPanel
            title="Unable to load invoice"
            message={q.error?.message || "Try again."}
            onRetry={() => void q.refetch()}
          />
        ) : (
          i && (
            <>
              <div ref={ref} className="space-y-4 bg-white p-6 text-slate-900">
                <h2 className="text-xl font-bold">
                  {brand.branding?.schoolName || "School invoice"}
                </h2>
                <p>{brand.branding?.schoolAddress}</p>
                <h3 className="font-semibold">Invoice {i.invoiceNumber}</h3>
                <p>
                  {i.parentName} · {i.studentName}
                </p>
                <p>
                  {i.session} · {i.term} · {i.class}
                </p>
                <p>
                  Issued {i.issueDate.slice(0, 10)} · Due{" "}
                  {i.dueDate.slice(0, 10)}
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr>
                        <th className="py-2">Description</th>
                        <th>Amount</th>
                        <th>Discount</th>
                        <th>Net</th>
                      </tr>
                    </thead>
                    <tbody>
                      {i.items.map((line, index) => (
                        <tr className="border-t" key={index}>
                          <td className="py-3">{line.description}</td>
                          <td>{money(line.amount)}</td>
                          <td>{money(line.discount)}</td>
                          <td>{money(line.netAmount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p>
                  Total: {money(i.grandTotal)} · Paid: {money(i.amountPaid)} ·
                  Outstanding: {money(i.outstandingAmount)}
                </p>
                <p>Status: {i.paymentStatus}</p>
                {i.notes && <p className="whitespace-pre-wrap">{i.notes}</p>}
              </div>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  disabled={brand.isLoading || brand.isError}
                  onClick={() => {
                    try {
                      if (ref.current)
                        printInvoiceElement(
                          ref.current,
                          `Invoice ${i.invoiceNumber}`
                        )
                    } catch (e) {
                      toast.error(
                        e instanceof Error ? e.message : "Unable to print."
                      )
                    }
                  }}
                >
                  Print invoice
                </Button>
                <Button
                  disabled={exporting || brand.isLoading || brand.isError}
                  onClick={async () => {
                    if (!ref.current) return
                    setExporting(true)
                    try {
                      downloadParentInvoicePdf(
                        i,
                        brand.branding || {},
                        currency
                      )
                    } catch {
                      toast.error("Unable to export invoice. Please try again.")
                    } finally {
                      setExporting(false)
                    }
                  }}
                >
                  {exporting ? "Preparing PDF…" : "Download PDF"}
                </Button>
              </div>
              {brand.isError && (
                <p role="alert">
                  School branding could not be loaded.{" "}
                  <button onClick={() => void brand.refetch()}>
                    Try again
                  </button>
                </p>
              )}
            </>
          )
        )}
      </DialogContent>
    </Dialog>
  )
}
