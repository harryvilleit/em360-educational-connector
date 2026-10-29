// WordPress version: the invoice shows the connected school.
import { useNavigate, useParams } from "react-router"
import { PageHeader } from "@/components/general/PageHeader"
import { EmptyState } from "@/components/ui/empty-state"
import { Button } from "@/components/ui/button"
import { Download, FileText, PenLine, Printer } from "lucide-react"
import { useGetInvoiceDetails } from "@/hooks/feeManagement"
import { useInvoiceSchool } from "../../../../fees/invoiceSchool"
import { downloadInvoicePdf, printInvoiceElement } from "@/lib/invoicePdf"
import { DashboardRoutes } from "@/routes"
import { useRef, useState } from "react"
import InvoicePDFTemplate from "@/pages/Dashboard/FeeMgt/components/InvoiceTemplate"
import InvoiceSignatureModal from "@/pages/Dashboard/FeeMgt/components/InvoiceSignatureModal"

export default function ViewInvoicePage() {
  const school = useInvoiceSchool()
  const navigate = useNavigate()
  const { productId, invoiceId } = useParams<{
    productId: string
    invoiceId: string
  }>()
  const { invoiceDetails: invoice, isLoading } = useGetInvoiceDetails(
    invoiceId ?? ""
  )
  const printRef = useRef<HTMLDivElement>(null)
  const [signatureModalOpen, setSignatureModalOpen] = useState(false)

  const backToList = () =>
    navigate(`/dashboard/${productId}/${DashboardRoutes.generateInvoice}`)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Invoice" onBack={backToList} />
        <p className="py-10 text-center text-sm text-gray-400">Loading...</p>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="space-y-6">
        <PageHeader title="Invoice" onBack={backToList} />
        <EmptyState
          icon={FileText}
          title="Invoice not found"
          description="It may have been deleted."
          action={{ label: "Back to Invoices", onClick: backToList }}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Invoice ${invoice.invoiceNumber}`}
        description={`${invoice.studentName} · ${invoice.class} · ${invoice.term} · ${invoice.session}`}
        onBack={backToList}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 rounded-lg"
              onClick={() => setSignatureModalOpen(true)}
            >
              <PenLine className="size-4" />
              Set Signature
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 rounded-lg"
              onClick={() =>
                printRef.current &&
                printInvoiceElement(printRef.current, invoice.invoiceNumber)
              }
            >
              <Printer className="size-4" />
              Print
            </Button>
            <Button
              size="sm"
              className="gap-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              onClick={() =>
                printRef.current &&
                downloadInvoicePdf(printRef.current, invoice.invoiceNumber)
              }
            >
              <Download className="size-4" />
              Download PDF
            </Button>
          </div>
        }
      />

      <div className="overflow-x-auto rounded-2xl bg-gray-100 p-6">
        <div ref={printRef} className=" w-fit">
          <InvoicePDFTemplate invoice={invoice} school={school} />
        </div>
      </div>

      <InvoiceSignatureModal
        open={signatureModalOpen}
        onClose={() => setSignatureModalOpen(false)}
      />
    </div>
  )
}
