// Recovered from the 0.6 WordPress Parent Portal source; used only by the WordPress parent screens.
import jsPDF from "jspdf"
import type { StudentInvoiceI } from "@/api/feeManagement.api/types"

/** Export saved invoice data directly, with repeatable headers on long invoices. */
export function downloadParentInvoicePdf(
  invoice: StudentInvoiceI,
  school: { schoolName?: string; schoolAddress?: string },
  currency: string
) {
  const pdf = new jsPDF({ unit: "mm", format: "a4" }),
    left = 16,
    right = 194,
    bottom = 275
  let y = 20
  const money = (value: number) =>
    `${currency} ${new Intl.NumberFormat("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)}`
  function text(value: string, size = 10) {
    pdf.setFontSize(size)
    const lines = pdf.splitTextToSize(value, right - left) as string[]
    for (const line of lines) {
      if (y > bottom) {
        pdf.addPage()
        y = 20
      }
      pdf.text(line, left, y)
      y += size === 10 ? 5 : 7
    }
  }
  function header() {
    pdf.setFont("helvetica", "bold")
    text(school.schoolName || "School invoice", 16)
    pdf.setFont("helvetica", "normal")
    if (school.schoolAddress) text(school.schoolAddress)
    y += 3
    text(`Invoice ${invoice.invoiceNumber}`, 12)
    text(`${invoice.parentName} | ${invoice.studentName}`)
    text(`${invoice.session} | ${invoice.term} | ${invoice.class}`)
    text(
      `Issued: ${invoice.issueDate.slice(0, 10)}   Due: ${invoice.dueDate.slice(0, 10)}`
    )
    y += 5
  }
  function columns() {
    pdf.setFont("helvetica", "bold")
    pdf.text("Description", left, y)
    pdf.text("Amount", 127, y, { align: "right" })
    pdf.text("Discount", 158, y, { align: "right" })
    pdf.text("Net", right, y, { align: "right" })
    y += 3
    pdf.line(left, y, right, y)
    y += 6
    pdf.setFont("helvetica", "normal")
  }
  header()
  columns()
  for (const item of invoice.items) {
    const lines = pdf.splitTextToSize(item.description, 75) as string[]
    if (y + lines.length * 5 > bottom) {
      pdf.addPage()
      y = 20
      text(`Invoice ${invoice.invoiceNumber} (continued)`, 12)
      y += 3
      columns()
    }
    pdf.setFontSize(9)
    pdf.text(money(item.amount), 127, y, { align: "right" })
    pdf.text(money(item.discount), 158, y, { align: "right" })
    pdf.text(money(item.netAmount), right, y, { align: "right" })
    for (const line of lines) {
      if (y > bottom) {
        pdf.addPage()
        y = 20
        columns()
      }
      pdf.text(line, left, y)
      y += 5
    }
    y += 3
  }
  if (y + 35 > bottom) {
    pdf.addPage()
    y = 20
  }
  y += 5
  text(`Total: ${money(invoice.grandTotal)}`, 12)
  text(`Paid: ${money(invoice.amountPaid)}`)
  text(`Outstanding: ${money(invoice.outstandingAmount)}`)
  text(`Status: ${invoice.paymentStatus}`)
  if (invoice.notes) {
    y += 5
    text(invoice.notes)
  }
  const pages = pdf.getNumberOfPages()
  for (let page = 1; page <= pages; page++) {
    pdf.setPage(page)
    pdf.setFontSize(8)
    pdf.text(`Page ${page} of ${pages}`, right, 290, { align: "right" })
  }
  pdf.save(
    `Invoice-${invoice.invoiceNumber.replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf`
  )
}
