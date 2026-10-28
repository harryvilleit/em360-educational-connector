import apiClient from "./api"
import { normalizeResponse, type ApiResultI } from "@/utils/apiResponse"

export type DocumentKind = "reportCard" | "certificate"
export const documentMenus = {
  reportCard: "/dashboard/report-card-designer",
  certificate: "/dashboard/certificate-designer",
  issued: "/dashboard/issued-documents",
  results: "/dashboard/exams_and_records/view-results",
  students: "/dashboard/students/list",
  training: "/dashboard/training-assignments",
} as const
export type BlockType =
  | "header"
  | "identity"
  | "summary"
  | "results"
  | "text"
  | "signatures"
  | "footer"
  | "award"
export interface DocumentBlock {
  id: string
  type: BlockType
  label: string
  text: string
  enabled: boolean
}
export interface DocumentLayout {
  schemaVersion: number
  paper: "A4" | "Letter"
  orientation: "portrait" | "landscape"
  style: "modern" | "classic" | "minimal"
  font: "sans" | "serif"
  fontSize: number
  marginMm: number
  accentColor: string
  alignment: "left" | "center"
  heading: string
  subtitle: string
  footer: string
  signatoryName: string
  signatoryTitle: string
  logoDataUrl: string | null
  signatureDataUrl: string | null
  resultColumns: string[]
  blocks: DocumentBlock[]
  pages?: CanvasPage[]
}
export interface CanvasPage {
  id: string
  background: string
  elements: CanvasElement[]
}
export interface TableColumn {
  key: string
  label: string
  weight: number
  align: "left" | "center" | "right"
}
export interface CanvasElement {
  id: string
  type: "text" | "image" | "shape" | "results"
  label: string
  x: number
  y: number
  width: number
  height: number
  text: string
  imageDataUrl: string | null
  imageSource: "upload" | "logo" | "signature" | "studentPhoto"
  groupId: string | null
  locked: boolean
  repeat: boolean
  font: "sans" | "serif"
  fontSize: number
  bold: boolean
  color: string
  fill: string | null
  borderColor: string | null
  borderWidth: number
  padding: number
  lineHeight: number
  align: "left" | "center" | "right"
  shape: "rectangle" | "ellipse" | "line"
  columns: TableColumn[]
  headerFill: string
  headerColor: string
  alternateFill: string
  rowHeight: number
}
export interface TemplateSummary {
  id: string
  name: string
  kind: DocumentKind
  publishedVersion: number
  hasUnpublishedChanges: boolean
  revision: string
  updatedAtUtc: string
}
export interface DocumentTemplate {
  summary: TemplateSummary
  draft: DocumentLayout
  published: DocumentLayout | null
}
export interface DocumentData {
  schoolName: string
  schoolAddress: string
  recipientName: string
  admissionNumber: string
  className: string
  sessionName: string
  termName: string
  averageScore: number
  totalScore: number
  position: number
  subjectCount: number
  results: {
    subject: string
    score: number
    maxScore: number
    grade: string
    remark: string
    assessments: string
    assessmentScores?: { name: string; score: number; maxScore: number }[]
  }[]
  awardTitle: string
  awardDate: string
  documentNumber: string
  issueDate: string
  comment: string
  attendancePresent?: number | null
  attendanceAbsent?: number | null
  attendanceLate?: number | null
  attendanceExcused?: number | null
  attendanceRecorded?: number | null
  studentPhotoDataUrl?: string | null
}
export interface DocumentPreview {
  kind: DocumentKind
  layout: DocumentLayout
  data: DocumentData
  contentHash: string
}
export interface SourceBody {
  templateId: string
  templateRevision: string
  sourceType: "result" | "studentAward" | "training"
  sourceId: string
  awardTitle: string
  awardDate: string | null
  comment: string
  previewHash?: string
  useDraft?: boolean
}
export interface SourceOption {
  id: string
  label: string
  details: string
}
export interface DocumentPage<T> {
  items: T[]
  totalCount: number
  pageNumber: number
  pageSize: number
}
export interface IssuedSummary {
  id: string
  kind: DocumentKind
  templateName: string
  templateVersion: number
  documentNumber: string
  recipientName: string
  issuedAtUtc: string
  revokedAtUtc: string | null
  revocationReason: string | null
  revision: string
}
export interface IssuedDocument {
  summary: IssuedSummary
  layout: DocumentLayout
  data: DocumentData
}
interface Response<T> extends ApiResultI {
  value: T
}
const value = <T>(r: unknown) => normalizeResponse<Response<T>>(r).value
const cfg = (schoolId: string) => ({ params: { schoolId } })
const root = "/SchoolDocuments"
const id = (s: string) => encodeURIComponent(s)
export const schoolDocumentApi = {
  templates: async (s: string, kind: DocumentKind) =>
    value<TemplateSummary[]>(
      await apiClient.get(`${root}/Templates`, {
        params: { schoolId: s, kind },
      })
    ),
  template: async (s: string, templateId: string) =>
    value<DocumentTemplate>(
      await apiClient.get(`${root}/Templates/${id(templateId)}`, cfg(s))
    ),
  create: async (s: string, kind: DocumentKind, name: string) =>
    value<DocumentTemplate>(
      await apiClient.post(`${root}/Templates`, { kind, name }, cfg(s))
    ),
  save: async (
    s: string,
    template: DocumentTemplate,
    name: string,
    layout: DocumentLayout
  ) =>
    value<DocumentTemplate>(
      await apiClient.put(
        `${root}/Templates/${id(template.summary.id)}`,
        { name, revision: template.summary.revision, layout },
        cfg(s)
      )
    ),
  publish: async (s: string, template: DocumentTemplate) =>
    value<DocumentTemplate>(
      await apiClient.post(
        `${root}/Templates/${id(template.summary.id)}/Publish`,
        { revision: template.summary.revision },
        cfg(s)
      )
    ),
  archive: async (s: string, template: TemplateSummary) =>
    value<boolean>(
      await apiClient.delete(`${root}/Templates/${id(template.id)}`, {
        params: { schoolId: s, revision: template.revision },
      })
    ),
  sources: async (
    s: string,
    kind: DocumentKind,
    sourceType: SourceBody["sourceType"],
    search: string,
    pageNumber: number
  ) =>
    value<DocumentPage<SourceOption>>(
      await apiClient.get(`${root}/Sources`, {
        params: { schoolId: s, kind, sourceType, search, pageNumber },
      })
    ),
  preview: async (s: string, body: SourceBody) =>
    value<DocumentPreview>(
      await apiClient.post(`${root}/Preview`, body, cfg(s))
    ),
  issue: async (s: string, body: SourceBody) =>
    value<IssuedDocument>(await apiClient.post(`${root}/Issued`, body, cfg(s))),
  issued: async (
    s: string,
    kind: DocumentKind,
    search: string,
    pageNumber: number
  ) =>
    value<DocumentPage<IssuedSummary>>(
      await apiClient.get(`${root}/Issued`, {
        params: { schoolId: s, kind, search, pageNumber },
      })
    ),
  document: async (s: string, documentId: string) =>
    value<IssuedDocument>(
      await apiClient.get(`${root}/Issued/${id(documentId)}`, cfg(s))
    ),
  revoke: async (s: string, document: IssuedSummary, reason: string) =>
    value<IssuedSummary>(
      await apiClient.post(
        `${root}/Issued/${id(document.id)}/Revoke`,
        { revision: document.revision, reason },
        cfg(s)
      )
    ),
}
