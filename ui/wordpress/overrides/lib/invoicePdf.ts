// WordPress version: invoices are printed and turned into PDFs from an off-screen frame
// inside the portal (no pop-up window, which the WordPress page may block), wait for the
// school logo to load, run over several A4 pages when long, and report failures.
import html2canvas from "html2canvas"
import jsPDF from "jspdf"
import { toast } from "sonner"

async function prepareFrame(el: HTMLElement, title: string) {
  const frame = document.createElement("iframe")
  frame.title = title
  frame.style.cssText = "position:fixed;left:-10000px;top:0;width:794px;height:1123px;border:0"
  document.body.appendChild(frame)
  const page = frame.contentDocument
  const win = frame.contentWindow
  if (!page || !win) {
    frame.remove()
    throw new Error("Unable to prepare invoice")
  }
  page.title = title
  const style = page.createElement("style")
  style.textContent =
    "@page{size:A4;margin:0}*{box-sizing:border-box}body{margin:0;background:white;color:#1a1a1a}table{border-collapse:collapse}tr{break-inside:avoid}thead{display:table-header-group}"
  page.head.appendChild(style)
  const copy = el.cloneNode(true) as HTMLElement
  page.body.appendChild(copy)
  await Promise.all(
    [...page.images].map((img) =>
      img.complete
        ? Promise.resolve()
        : new Promise<void>((done) => {
            const timer = setTimeout(done, 5000)
            img.onload = img.onerror = () => {
              clearTimeout(timer)
              done()
            }
          }),
    ),
  )
  await page.fonts.ready
  return { frame, win, copy }
}

export async function downloadInvoicePdf(el: HTMLElement, fileName: string) {
  let frame: HTMLIFrameElement | undefined
  try {
    const prepared = await prepareFrame(el, fileName)
    frame = prepared.frame
    const canvas = await html2canvas(prepared.copy, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      imageTimeout: 5000,
    })
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true })
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const slice = Math.ceil((canvas.width * pageHeight) / pageWidth)
    for (let top = 0; top < canvas.height; top += slice) {
      if (top) pdf.addPage()
      const part = document.createElement("canvas")
      part.width = canvas.width
      part.height = Math.min(slice, canvas.height - top)
      const context = part.getContext("2d")
      if (!context) throw new Error("Unable to prepare invoice")
      context.drawImage(canvas, 0, top, canvas.width, part.height, 0, 0, part.width, part.height)
      pdf.addImage(
        part.toDataURL("image/png"),
        "PNG",
        0,
        0,
        pageWidth,
        Math.min(pageHeight, (part.height * pageWidth) / part.width),
      )
    }
    pdf.save(`${fileName.replace(/[^a-zA-Z0-9_-]+/g, "_")}.pdf`)
  } catch (error) {
    toast.error(error instanceof Error ? error.message : "Unable to download invoice")
  } finally {
    frame?.remove()
  }
}

export async function printInvoiceElement(el: HTMLElement, title: string) {
  let frame: HTMLIFrameElement | undefined
  try {
    const prepared = await prepareFrame(el, title)
    frame = prepared.frame
    const { win } = prepared
    win.addEventListener("afterprint", () => frame?.remove(), { once: true })
    win.focus()
    win.print()
    setTimeout(() => frame?.remove(), 300000)
  } catch (error) {
    frame?.remove()
    toast.error(error instanceof Error ? error.message : "Unable to print invoice")
  }
}
