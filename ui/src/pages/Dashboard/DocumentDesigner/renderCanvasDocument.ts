import type {
  CanvasElement,
  DocumentData,
  DocumentKind,
  DocumentLayout,
} from "@/api/schoolDocuments.api"
import {
  fontData,
  substitute,
  type DrawCommand,
  type RenderedDocument,
} from "./renderDocument"
import sans from "@/assets/document-fonts/DejaVuSans.ttf?url"
import sansBold from "@/assets/document-fonts/DejaVuSans-Bold.ttf?url"
import serif from "@/assets/document-fonts/DejaVuSerif.ttf?url"
import serifBold from "@/assets/document-fonts/DejaVuSerif-Bold.ttf?url"

const mm = 25.4 / 72
const family = (e: CanvasElement) =>
  e.font === "serif" ? "DocumentSerif" : "DocumentSans"
export async function renderCanvasDocument(
  _kind: DocumentKind,
  layout: DocumentLayout,
  data: DocumentData,
  status: "sample" | "preview" | "issued" | "revoked"
): Promise<RenderedDocument> {
  const { jsPDF } = await import("jspdf")
  const pdf = new jsPDF({
    unit: "mm",
    format: layout.paper.toLowerCase(),
    orientation: layout.orientation,
    putOnlyUsedFonts: true,
    compress: true,
  })
  const definitions = [
    [sans, "DocumentSans", "normal"],
    [sansBold, "DocumentSans", "bold"],
    [serif, "DocumentSerif", "normal"],
    [serifBold, "DocumentSerif", "bold"],
  ]
  const encoded = await Promise.all(definitions.map((d) => fontData(d[0])))
  definitions.forEach((d, i) => {
    pdf.addFileToVFS(`canvas-${i}.ttf`, encoded[i])
    pdf.addFont(`canvas-${i}.ttf`, d[1], d[2])
  })
  const width = pdf.internal.pageSize.getWidth(),
    height = pdf.internal.pageSize.getHeight()
  const pages: DrawCommand[][] = []
  const pushPage = (background: string) => {
    if (pages.length >= 100)
      throw new Error(
        "This document exceeds 100 pages. Reduce the results or message lengths."
      )
    const commands: DrawCommand[] = [
      {
        type: "rect",
        x: 0,
        y: 0,
        width,
        height,
        fill: background,
        stroke: null,
      },
    ]
    pages.push(commands)
    return commands
  }
  const lines = (text: string, e: CanvasElement, w: number) => {
    pdf.setFont(family(e), e.bold ? "bold" : "normal")
    pdf.setFontSize(e.fontSize)
    return pdf.splitTextToSize(text || "", Math.max(0.5, w)) as string[]
  }
  const rect = (out: DrawCommand[], e: CanvasElement) => {
    if (e.fill || e.borderColor || e.type === "shape")
      out.push({
        type: "rect",
        x: e.x,
        y: e.y,
        width: e.width,
        height: e.height,
        fill: e.fill,
        stroke: e.borderColor,
        strokeWidth: e.borderWidth,
        shape: e.shape,
      })
  }
  const text = (out: DrawCommand[], e: CanvasElement, value: string) => {
    const wrapped = lines(value, e, e.width - 2 * e.padding),
      lh = e.fontSize * mm * e.lineHeight
    if (wrapped.length * lh + 2 * e.padding > e.height + 0.05)
      throw new Error(
        `“${e.label}” has more text than its box can hold. Increase its height, width or reduce the font size.`
      )
    wrapped.forEach((value, i) =>
      out.push({
        type: "text",
        x:
          e.align === "center"
            ? e.x + e.width / 2
            : e.align === "right"
              ? e.x + e.width - e.padding
              : e.x + e.padding,
        y: e.y + e.padding + e.fontSize * mm + i * lh,
        value,
        size: e.fontSize,
        bold: e.bold,
        font: family(e),
        colour: e.color,
        align: e.align,
      })
    )
  }
  const element = (out: DrawCommand[], e: CanvasElement) => {
    const start = out.length
    rect(out, e)
    if (e.type === "text") text(out, e, substitute(e.text, data))
    if (e.type === "image") {
      const url =
        e.imageSource === "logo"
          ? layout.logoDataUrl
          : e.imageSource === "signature"
            ? layout.signatureDataUrl
            : e.imageSource === "studentPhoto"
              ? data.studentPhotoDataUrl
              : e.imageDataUrl
      if (url) {
        const props = pdf.getImageProperties(url),
          w = e.width - 2 * e.padding,
          h = e.height - 2 * e.padding,
          scale = Math.min(w / props.width, h / props.height),
          iw = props.width * scale,
          ih = props.height * scale
        out.push({
          type: "image",
          x: e.x + (e.width - iw) / 2,
          y: e.y + (e.height - ih) / 2,
          width: iw,
          height: ih,
          url,
        })
      } else if (status === "sample") {
        out.push({
          type: "rect",
          x: e.x,
          y: e.y,
          width: e.width,
          height: e.height,
          fill: "#f1f5f9",
          stroke: "#cbd5e1",
        })
        text(
          out,
          { ...e, fontSize: 8, padding: 1, color: "#64748b", align: "center" },
          e.imageSource === "studentPhoto" ? "Student photo" : e.label
        )
      }
    }
    out.slice(start).forEach((c) => {
      c.elementId = e.id
    })
  }
  const value = (row: DocumentData["results"][number], key: string) => {
    if (key.startsWith("assessment:")) {
      const a = row.assessmentScores?.find((a) => a.name === key.slice(11))
      return a ? `${a.score} / ${a.maxScore}` : "—"
    }
    return String(row[key as keyof typeof row] ?? "—")
  }
  for (const page of layout.pages ?? []) {
    let out = pushPage(page.background)
    const first = out
    for (const e of page.elements) {
      if (e.type !== "results") {
        element(out, e)
        continue
      }
      const sum = e.columns.reduce((s, c) => s + c.weight, 0),
        widths = e.columns.map((c) => (e.width * c.weight) / sum)
      if (widths.some((w) => w <= e.padding * 2 + 1))
        throw new Error(
          "A results column is too narrow. Increase the table or column width, or reduce cell padding."
        )
      const head = { ...e, bold: true },
        lh = e.fontSize * mm * e.lineHeight
      const headings = e.columns.map((c, i) =>
        lines(c.label, head, widths[i] - e.padding * 2)
      )
      const headerHeight = Math.max(
        e.rowHeight,
        Math.max(...headings.map((c) => c.length)) * lh + e.padding * 2
      )
      if (headerHeight + Math.max(e.rowHeight, lh + e.padding * 2) > e.height)
        throw new Error(
          "Increase the results table height so that its header and at least one row fit."
        )
      let y = e.y
      const cells = (
        values: string[][],
        py: number,
        h: number,
        header: boolean,
        index: number,
        from = 0,
        take = Infinity
      ) => {
        let x = e.x
        values.forEach((cell, i) => {
          out.push({
            type: "rect",
            elementId: e.id,
            x,
            y: py,
            width: widths[i],
            height: h,
            fill: header
              ? e.headerFill
              : index % 2
                ? e.alternateFill
                : (e.fill ?? "#ffffff"),
            stroke: e.borderColor,
            strokeWidth: e.borderWidth,
          })
          cell.slice(from, from + take).forEach((line, n) =>
            out.push({
              type: "text",
              elementId: e.id,
              x:
                e.columns[i].align === "center"
                  ? x + widths[i] / 2
                  : e.columns[i].align === "right"
                    ? x + widths[i] - e.padding
                    : x + e.padding,
              y: py + e.padding + e.fontSize * mm + n * lh,
              value: line,
              font: family(e),
              size: e.fontSize,
              bold: header || e.bold,
              colour: header ? e.headerColor : e.color,
              align: e.columns[i].align,
            })
          )
          x += widths[i]
        })
      }
      const header = () => {
        cells(headings, y, headerHeight, true, 0)
        y += headerHeight
      }
      const continuation = () => {
        out = pushPage(page.background)
        page.elements
          .filter((x) => x.repeat && x.type !== "results")
          .forEach((x) => element(out, x))
        y = e.y
        header()
      }
      header()
      for (let index = 0; index < data.results.length; index++) {
        const row = data.results[index],
          wrapped = e.columns.map((c, i) =>
            lines(value(row, c.key), e, widths[i] - e.padding * 2)
          )
        const count = Math.max(1, ...wrapped.map((c) => c.length)),
          rowHeight = Math.max(e.rowHeight, count * lh + e.padding * 2)
        if (
          rowHeight <= e.height - headerHeight &&
          y + rowHeight > e.y + e.height + 0.01
        )
          continuation()
        let from = 0
        while (from < count) {
          const capacity = Math.floor(
            (e.y + e.height - y - e.padding * 2 + 0.001) / lh
          )
          if (capacity < 1 || e.y + e.height - y < e.rowHeight - 0.01) {
            continuation()
            continue
          }
          const take = Math.min(count - from, capacity),
            h = Math.max(e.rowHeight, take * lh + 2 * e.padding)
          cells(wrapped, y, h, false, index, from, take)
          y += h
          from += take
          if (from < count) continuation()
        }
      }
      out = first
    }
  }
  if (!pages.length) throw new Error("Add a page to this document.")
  pages.forEach((commands, i) => {
    const marker =
      status === "revoked"
        ? "REVOKED"
        : status === "sample"
          ? "SAMPLE · NOT ISSUED"
          : status === "preview"
            ? "PREVIEW · NOT ISSUED"
            : ""
    if (marker)
      commands.push({
        type: "text",
        x: width / 2,
        y: height - 8,
        value: marker,
        size: 8,
        bold: true,
        colour: status === "revoked" ? "#b91c1c" : "#526078",
        align: "center",
        font: "DocumentSans",
      })
    commands.push({
      type: "text",
      x: 8,
      y: height - 4,
      value: `${data.documentNumber} · ${data.issueDate} · Page ${i + 1} of ${pages.length}`,
      size: 7,
      bold: false,
      colour: "#526078",
      align: "left",
      font: "DocumentSans",
    })
    if (i) pdf.addPage()
    for (const c of commands) {
      if (c.type === "text") {
        pdf.setFont(c.font ?? "DocumentSans", c.bold ? "bold" : "normal")
        pdf.setFontSize(c.size)
        pdf.setTextColor(c.colour)
        pdf.text(c.value, c.x, c.y, { align: c.align })
      } else if (c.type === "image")
        pdf.addImage(c.url, c.x, c.y, c.width, c.height)
      else {
        if (!c.fill && !c.stroke) continue
        if (c.fill) pdf.setFillColor(c.fill)
        if (c.stroke) {
          pdf.setDrawColor(c.stroke)
          pdf.setLineWidth(c.strokeWidth ?? 0.2)
        }
        const mode = c.fill ? (c.stroke ? "FD" : "F") : "S"
        if (c.shape === "ellipse")
          pdf.ellipse(
            c.x + c.width / 2,
            c.y + c.height / 2,
            c.width / 2,
            c.height / 2,
            mode
          )
        else if (c.shape === "line") {
          pdf.setDrawColor(c.stroke ?? c.fill ?? "#172033")
          pdf.setLineWidth(c.strokeWidth ?? 0.2)
          pdf.line(c.x, c.y + c.height / 2, c.x + c.width, c.y + c.height / 2)
        } else pdf.rect(c.x, c.y, c.width, c.height, mode)
      }
    }
  })
  pdf.setProperties({
    title: `${data.schoolName} — ${layout.heading}`,
    subject: data.documentNumber,
    creator: "EM360 Document Designer",
  })
  return { pdf, pages, width, height, font: "DocumentSans" }
}
