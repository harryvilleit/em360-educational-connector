import type {
  CanvasElement,
  CanvasPage,
  DocumentKind,
  DocumentLayout,
} from "@/api/schoolDocuments.api"
import { resultLabels } from "./renderDocument"

export const uid = () => crypto.randomUUID()
export const paperSize = (
  layout: Pick<DocumentLayout, "paper" | "orientation">
) => {
  const size = layout.paper === "A4" ? [210, 297] : [215.9, 279.4]
  return layout.orientation === "portrait" ? size : size.reverse()
}
export function makeElement(
  type: CanvasElement["type"],
  patch: Partial<CanvasElement> = {}
): CanvasElement {
  return {
    id: uid(),
    type,
    label:
      type === "results"
        ? "Subject results"
        : type === "image"
          ? "Image"
          : type === "shape"
            ? "Shape"
            : "Text",
    x: 16,
    y: 16,
    width: type === "results" ? 178 : 80,
    height: type === "results" ? 125 : type === "image" ? 24 : 16,
    text: type === "text" ? "Double-click to edit" : "",
    imageDataUrl: null,
    imageSource: "upload",
    groupId: null,
    locked: false,
    repeat: false,
    font: "sans",
    fontSize: 11,
    bold: false,
    color: "#172033",
    fill: null,
    borderColor: null,
    borderWidth: 0.2,
    padding: 2,
    lineHeight: 1.4,
    align: "left",
    shape: "rectangle",
    columns: ["subject", "score", "maxScore", "grade", "remark"].map((key) => ({
      key,
      label: resultLabels[key],
      weight: key === "subject" ? 3 : key === "remark" ? 2 : 1,
      align: "left",
    })),
    headerFill: "#1e40af",
    headerColor: "#ffffff",
    alternateFill: "#f3f5fa",
    rowHeight: 9,
    ...patch,
  }
}
export const gallery = [
  {
    id: "primary",
    name: "Primary school",
    detail: "Clear student details, assessment breakdown and teacher comments",
  },
  {
    id: "secondary",
    name: "Secondary school",
    detail: "Academic summary, subject grades and attendance",
  },
  {
    id: "certificate",
    name: "Achievement certificate",
    detail: "Landscape, decorative border and signature",
  },
  {
    id: "blank",
    name: "Blank page",
    detail: "Start with an empty canvas and build your own layout",
  },
] as const
export function starter(
  layout: DocumentLayout,
  kind: DocumentKind,
  preset: string
): DocumentLayout {
  const report = kind === "reportCard",
    orientation =
      preset === "blank"
        ? layout.orientation
        : report
          ? "portrait"
          : "landscape"
  const next = {
    ...structuredClone(layout),
    schemaVersion: 2,
    orientation,
  } as DocumentLayout
  const [w, h] = paperSize(next),
    accent = preset === "primary" ? "#0f766e" : report ? "#4338ca" : "#795b20"
  const elements: CanvasElement[] = []
  const add = (type: CanvasElement["type"], patch: Partial<CanvasElement>) =>
    elements.push(
      makeElement(type, { font: next.font, headerFill: accent, ...patch })
    )
  if (preset !== "blank") {
    add("shape", {
      label: "Page accent",
      x: 0,
      y: 0,
      width: w,
      height: 4,
      fill: accent,
      padding: 0,
      locked: true,
      repeat: true,
    })
    if (report) {
      add("image", {
        label: "School logo",
        imageSource: "logo",
        x: 16,
        y: 13,
        width: 22,
        height: 22,
        repeat: true,
      })
      add("text", {
        label: "School name",
        text: "{{SchoolName}}",
        x: 42,
        y: 12,
        width: w - 58,
        height: 14,
        fontSize: 19,
        bold: true,
        color: accent,
        repeat: true,
      })
      add("text", {
        label: "Report heading",
        text: next.heading || "Academic Report",
        x: 42,
        y: 27,
        width: w - 58,
        height: 11,
        fontSize: 13,
        repeat: true,
      })
      add("text", {
        label: "Student name",
        text: "{{RecipientName}}",
        x: 16,
        y: 43,
        width: w - 59,
        height: 13,
        fontSize: 15,
        bold: true,
      })
      add("text", {
        label: "Student details",
        text: "Admission: {{AdmissionNumber}}\nClass: {{ClassName}} · {{SessionName}} · {{TermName}}",
        x: 16,
        y: 58,
        width: w - 59,
        height: 19,
        fontSize: 9,
      })
      add("image", {
        label: "Student photo",
        imageSource: "studentPhoto",
        x: w - 39,
        y: 43,
        width: 23,
        height: 30,
        borderColor: "#cbd5e1",
      })
      add("text", {
        label: "Academic summary",
        text: "Average: {{AverageScore}}%   Position: {{Position}}   Subjects: {{SubjectCount}}",
        x: 16,
        y: 80,
        width: w - 32,
        height: 13,
        bold: true,
        fontSize: 10,
        fill: "#eef2ff",
      })
      const table = makeElement("results", {
        x: 16,
        y: 99,
        width: w - 32,
        height: h - 184,
        fontSize: 9,
        borderColor: "#dbe2ed",
        headerFill: accent,
        padding: 1.5,
      })
      if (preset === "primary")
        table.columns = [
          table.columns[0],
          {
            key: "assessments",
            label: "Assessments",
            weight: 4,
            align: "left",
          },
          ...table.columns.slice(1, 4),
        ]
      elements.push(table)
      add("text", {
        label: "Teacher comments",
        text: "Teacher's comment: {{Comment}}",
        x: 16,
        y: h - 78,
        width: w - 32,
        height: 22,
        fontSize: 9,
      })
      if (preset === "secondary")
        add("text", {
          label: "Attendance",
          text: "Attendance (recorded days): {{AttendanceRecorded}} · Present: {{AttendancePresent}} · Absent: {{AttendanceAbsent}} · Late: {{AttendanceLate}}",
          x: 16,
          y: h - 52,
          width: w - 32,
          height: 15,
          fontSize: 8,
        })
      add("image", {
        label: "Signature",
        imageSource: "signature",
        x: w - 63,
        y: h - 32,
        width: 47,
        height: 10,
        padding: 0,
      })
      add("text", {
        label: "Signatory",
        text: [next.signatoryName, next.signatoryTitle || "Head of School"]
          .filter(Boolean)
          .join(" · "),
        x: w - 90,
        y: h - 21,
        width: 74,
        height: 8,
        fontSize: 8,
        padding: 1,
        align: "right",
      })
    } else {
      add("shape", {
        label: "Certificate border",
        x: 8,
        y: 8,
        width: w - 16,
        height: h - 21,
        fill: null,
        borderColor: accent,
        borderWidth: 0.6,
        padding: 0,
        locked: true,
      })
      add("image", {
        label: "School logo",
        imageSource: "logo",
        x: w / 2 - 12,
        y: 16,
        width: 24,
        height: 21,
      })
      add("text", {
        label: "School name",
        text: "{{SchoolName}}",
        x: 20,
        y: 40,
        width: w - 40,
        height: 15,
        fontSize: 20,
        bold: true,
        align: "center",
        color: accent,
      })
      add("text", {
        label: "Certificate title",
        text: next.heading || "Certificate of Achievement",
        x: 20,
        y: 58,
        width: w - 40,
        height: 18,
        fontSize: 23,
        font: "serif",
        bold: true,
        align: "center",
      })
      add("text", {
        label: "Introductory text",
        text: "This certificate is presented to",
        x: 20,
        y: 82,
        width: w - 40,
        height: 12,
        align: "center",
      })
      add("text", {
        label: "Recipient",
        text: "{{RecipientName}}",
        x: 20,
        y: 99,
        width: w - 40,
        height: 20,
        fontSize: 27,
        font: "serif",
        bold: true,
        align: "center",
        color: accent,
      })
      add("text", {
        label: "Award",
        text: "For {{AwardTitle}}",
        x: 20,
        y: 124,
        width: w - 40,
        height: 20,
        fontSize: 16,
        align: "center",
      })
      add("text", {
        label: "Award date",
        text: "Award date: {{AwardDate}}",
        x: 20,
        y: 146,
        width: w - 40,
        height: 12,
        align: "center",
        fontSize: 10,
      })
      add("image", {
        label: "Signature",
        imageSource: "signature",
        x: w / 2 - 22,
        y: 165,
        width: 44,
        height: 12,
        padding: 0,
      })
      add("text", {
        label: "Signatory",
        text: next.signatoryTitle || "Head of School",
        x: 20,
        y: 178,
        width: w - 40,
        height: 10,
        align: "center",
        fontSize: 9,
      })
    }
  }
  next.pages = [{ id: uid(), background: "#ffffff", elements }]
  return next
}
// Keep every enabled legacy block, branding image and message. Conversion affects drafts only.
export function convertLegacy(
  layout: DocumentLayout,
  kind: DocumentKind
): DocumentLayout {
  const next = starter(
    layout,
    kind,
    kind === "reportCard" ? "secondary" : "certificate"
  )
  const enabled = new Set(
      layout.blocks.filter((b) => b.enabled).map((b) => b.type)
    ),
    page = next.pages![0]
  const category = (e: CanvasElement) =>
    e.type === "results"
      ? "results"
      : e.label === "Academic summary"
        ? "summary"
        : [
              "School logo",
              "School name",
              "Report heading",
              "Certificate title",
              "Page accent",
              "Certificate border",
            ].includes(e.label)
          ? "header"
          : ["Signature", "Signatory"].includes(e.label)
            ? "signatures"
            : kind === "certificate"
              ? "award"
              : "identity"
  page.elements = page.elements.filter(
    (e) =>
      !["Teacher comments", "Attendance", "Student photo"].includes(e.label) &&
      enabled.has(category(e))
  )
  const table = page.elements.find((e) => e.type === "results")
  if (table) {
    table.columns = layout.resultColumns.map((key) => ({
      key,
      label: resultLabels[key] ?? key,
      weight: key === "subject" ? 3 : 1,
      align: "left",
    }))
    table.headerFill = layout.accentColor
  }
  let y = kind === "reportCard" ? 218 : 155
  const [w, h] = paperSize(next)
  const messages = layout.blocks.filter((b) => b.enabled && b.type === "text")
  if (layout.subtitle)
    messages.unshift({
      id: uid(),
      type: "text",
      label: "Subtitle",
      text: layout.subtitle,
      enabled: true,
    })
  if (enabled.has("footer") && layout.footer)
    messages.push({
      id: uid(),
      type: "text",
      label: "Footer",
      text: layout.footer,
      enabled: true,
    })
  for (const b of messages) {
    if (y + 24 > h - 40) {
      const extra: CanvasPage = {
        id: uid(),
        background: "#ffffff",
        elements: [],
      }
      next.pages!.push(extra)
      y = 16
    }
    next.pages![next.pages!.length - 1].elements.push(
      makeElement("text", {
        label: b.label || "Message",
        text: b.text,
        x: 16,
        y,
        width: w - 32,
        height: 24,
        fontSize: 9,
      })
    )
    y += 26
  }
  for (const e of page.elements)
    if (e.color === "#4338ca" || e.color === "#795b20")
      e.color = layout.accentColor
  return next
}
export function fitElement(
  e: CanvasElement,
  w: number,
  h: number
): CanvasElement {
  const width = Math.max(4, Math.min(e.width, w)),
    height = Math.max(4, Math.min(e.height, h - 12))
  const padding = Math.min(e.padding, (Math.min(width, height) - 0.1) / 2)
  return {
    ...e,
    width,
    height,
    padding,
    x: Math.max(0, Math.min(e.x, w - width)),
    y: Math.max(0, Math.min(e.y, h - 12 - height)),
  }
}
export function designWarnings(layout: DocumentLayout, kind: DocumentKind) {
  const issues: string[] = [],
    [w, h] = paperSize(layout),
    all = (layout.pages ?? []).flatMap((p) => p.elements)
  for (const e of all)
    if (
      e.x < 0 ||
      e.y < 0 ||
      e.x + e.width > w + 0.01 ||
      e.y + e.height > h - 12 + 0.01
    )
      issues.push(`${e.label} extends outside the printable area.`)
  const texts = all
    .filter((e) => e.type === "text")
    .map((e) => e.text)
    .join("\n")
  for (const key of kind === "reportCard"
    ? ["SchoolName", "RecipientName"]
    : ["SchoolName", "RecipientName", "AwardTitle"])
    if (!texts.includes(`{{${key}}}`))
      issues.push(`Add the ${key} field before publishing.`)
  if (kind === "reportCard" && !all.some((e) => e.type === "results"))
    issues.push("Add a results table before publishing.")
  for (const page of layout.pages ?? []) {
    for (const e of page.elements) {
      if (e.type === "image" && e.imageSource === "upload" && !e.imageDataUrl)
        issues.push(`Upload an image for ${e.label}.`)
      if (e.type === "results") {
        const overlap = page.elements.find(
          (o) =>
            o.id !== e.id &&
            o.x < e.x + e.width &&
            o.x + o.width > e.x &&
            o.y < e.y + e.height &&
            o.y + o.height > e.y
        )
        if (overlap)
          issues.push(
            `${overlap.label} overlaps the results table. Move it outside the table area.`
          )
      }
    }
  }
  return [...new Set(issues)]
}

export function overlapWarnings(layout: DocumentLayout): string[] {
  const warnings: string[] = []
  for (const page of layout.pages ?? []) {
    const foreground = page.elements.filter(
      (e) => e.type === "text" || e.type === "image"
    )
    for (let i = 0; i < foreground.length; i++)
      for (let j = i + 1; j < foreground.length; j++) {
        const a = foreground[i],
          b = foreground[j]
        if (
          a.x < b.x + b.width - 0.1 &&
          a.x + a.width > b.x + 0.1 &&
          a.y < b.y + b.height - 0.1 &&
          a.y + a.height > b.y + 0.1
        )
          warnings.push(
            `${a.label} overlaps ${b.label}. Check that this is intentional.`
          )
      }
  }
  return warnings
}
