import { useRef, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle, Download, Printer, Loader2 } from "lucide-react"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"
import type {
  InvoiceBillItemI,
  StudentInvoiceI,
} from "@/api/feeManagement.api/types"
import { printInvoiceElement } from "@/lib/invoicePdf"
import { useSchoolMoney } from "@/hooks/useSchoolMoney"

interface Props {
  invoice: StudentInvoiceI
  // Optional fee items aren't sent to /StudentInvoice/Generate and so never
  // land in invoice.items — passed through separately from the form so the
  // printed/downloaded invoice can still show them for reference.
  optionalItems?: InvoiceBillItemI[]
  onClose: () => void
}

export default function InvoiceSavedModal({
  invoice,
  optionalItems = [],
  onClose,
}: Props) {
  const printRef = useRef<HTMLDivElement>(null)
  const { currencyCode, formatMoney } = useSchoolMoney()
  const [downloading, setDownloading] = useState(false)

  function handlePrint() {
    const el = printRef.current
    if (!el) return

    printInvoiceElement(el, `Invoice ${invoice.invoiceNumber}`)
  }

  async function handleDownload() {
    const el = printRef.current
    if (!el) return

    setDownloading(true)
    try {
      const canvas = await html2canvas(el, {
        scale: 2, // 2x for sharp text on retina
        useCORS: true,
        backgroundColor: "#ffffff",
      })

      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      })

      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()

      // Scale image to fit page width, maintain aspect ratio
      const imgWidth = pageWidth
      const imgHeight = (canvas.height * pageWidth) / canvas.width

      // If content is taller than one page, jsPDF will clip — add extra pages
      let heightLeft = imgHeight
      let position = 0

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft > 0) {
        position -= pageHeight
        pdf.addPage()
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      pdf.save(`Invoice-${invoice.invoiceNumber}.pdf`)
    } catch (err) {
      console.error("PDF generation failed:", err)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="rounded-2xl p-6 sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="size-5 text-green-600" />
            </div>
            <DialogTitle className="text-lg font-bold text-gray-900">
              Invoice saved!
            </DialogTitle>
          </div>
        </DialogHeader>

        <p className="text-sm text-gray-500">
          Invoice{" "}
          <span className="font-medium text-gray-700">
            {invoice.invoiceNumber}
          </span>{" "}
          for{" "}
          <span className="font-medium text-gray-700">
            {invoice.studentName}
          </span>{" "}
          has been saved. What would you like to do next?
        </p>

        <DialogFooter className="flex-col gap-2 pt-2 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={onClose} className="rounded-xl">
            Cancel
          </Button>
          <Button
            variant="outline"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-xl"
          >
            <Printer className="size-4" />
            Print
          </Button>
          <Button
            onClick={handleDownload}
            disabled={downloading}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {downloading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Download className="size-4" />
            )}
            {downloading ? "Generating..." : "Download PDF"}
          </Button>
        </DialogFooter>
      </DialogContent>

      <div
        ref={printRef}
        style={{
          position: "absolute",
          left: "-9999px",
          top: 0,
          width: "794px", // A4 at 96dpi
          backgroundColor: "#ffffff",
          fontFamily: "sans-serif",
          padding: "48px",
          boxSizing: "border-box",
          color: "#111827",
        }}
      >
        {/* Invoice header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "32px",
          }}
        >
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: 700, margin: 0 }}>
              INVOICE
            </h1>
            <p style={{ fontSize: "13px", color: "#6b7280", marginTop: "4px" }}>
              {invoice.invoiceNumber}
            </p>
          </div>
          <div
            style={{ textAlign: "right", fontSize: "13px", color: "#374151" }}
          >
            <p>
              <strong>Issue Date:</strong> {invoice.issueDate}
            </p>
            <p>
              <strong>Due Date:</strong> {invoice.dueDate}
            </p>
            <p>
              <strong>Term:</strong> {invoice.term}
            </p>
            <p>
              <strong>Session:</strong> {invoice.session}
            </p>
          </div>
        </div>

        {/* Student info */}
        <div
          style={{
            backgroundColor: "#f9fafb",
            borderRadius: "8px",
            padding: "16px",
            marginBottom: "24px",
            fontSize: "13px",
          }}
        >
          <p style={{ fontWeight: 600, marginBottom: "4px" }}>Billed To</p>
          <p>{invoice.studentName}</p>
          <p>Class: {invoice.class}</p>
          <p>Parent: {invoice.parentName}</p>
        </div>

        {/* Line items table */}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "13px",
            marginBottom: "24px",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#f3f4f6" }}>
              <th
                style={{
                  textAlign: "left",
                  padding: "10px 12px",
                  fontWeight: 600,
                }}
              >
                Description
              </th>
              <th
                style={{
                  textAlign: "right",
                  padding: "10px 12px",
                  fontWeight: 600,
                }}
              >
                Amount ({currencyCode})
              </th>
              <th
                style={{
                  textAlign: "right",
                  padding: "10px 12px",
                  fontWeight: 600,
                }}
              >
                Discount ({currencyCode})
              </th>
              <th
                style={{
                  textAlign: "right",
                  padding: "10px 12px",
                  fontWeight: 600,
                }}
              >
                Net ({currencyCode})
              </th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, i) => (
              <tr
                key={`${item.description}-${i}`}
                style={{
                  borderBottom: "1px solid #e5e7eb",
                  backgroundColor: i % 2 === 0 ? "#fff" : "#f9fafb",
                }}
              >
                <td style={{ padding: "10px 12px" }}>{item.description}</td>
                <td style={{ padding: "10px 12px", textAlign: "right" }}>
                  {item.amount.toLocaleString()}
                </td>
                <td style={{ padding: "10px 12px", textAlign: "right" }}>
                  {item.discount.toLocaleString()}
                </td>
                <td style={{ padding: "10px 12px", textAlign: "right" }}>
                  {item.netAmount.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Optional fee items — shown for reference, excluded from totals */}
        {optionalItems.length > 0 && (
          <div style={{ marginBottom: "24px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "10px",
              }}
            >
              <div style={{ flex: 1, height: "1px", background: "#e5e7eb" }} />
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.5px",
                  color: "#9ca3af",
                  textTransform: "uppercase",
                }}
              >
                Optional — not included in total
              </span>
              <div style={{ flex: 1, height: "1px", background: "#e5e7eb" }} />
            </div>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "13px",
              }}
            >
              <tbody>
                {optionalItems.map((item, i) => (
                  <tr
                    key={item.schoolStudentBillItemId}
                    style={{
                      borderBottom: "1px dashed #e5e7eb",
                      backgroundColor: i % 2 === 0 ? "#fff" : "#f9fafb",
                    }}
                  >
                    <td style={{ padding: "10px 12px", color: "#6b7280" }}>
                      {item.description}
                    </td>
                    <td
                      style={{
                        padding: "10px 12px",
                        textAlign: "right",
                        color: "#6b7280",
                      }}
                    >
                      {item.netAmount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Totals */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: "32px",
          }}
        >
          <div style={{ width: "260px", fontSize: "13px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "6px 0",
              }}
            >
              <span style={{ color: "#6b7280" }}>Subtotal</span>
              <span>{formatMoney(invoice.subTotal)}</span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "6px 0",
              }}
            >
              <span style={{ color: "#6b7280" }}>Total Discount</span>
              <span style={{ color: "#ef4444" }}>
                {formatMoney(-invoice.totalDiscount)}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "10px 0",
                borderTop: "2px solid #111827",
                fontWeight: 700,
                fontSize: "15px",
              }}
            >
              <span>Grand Total</span>
              <span>{formatMoney(invoice.grandTotal)}</span>
            </div>
          </div>
        </div>

        {invoice.notes && (
          <div
            style={{
              borderTop: "1px solid #e5e7eb",
              paddingTop: "16px",
              fontSize: "12px",
              color: "#6b7280",
            }}
          >
            <p
              style={{ fontWeight: 600, color: "#374151", marginBottom: "4px" }}
            >
              Notes
            </p>
            <p style={{ whiteSpace: "pre-line" }}>{invoice.notes}</p>
          </div>
        )}
      </div>
    </Dialog>
  )
}
