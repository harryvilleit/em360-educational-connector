import axios, { type AxiosAdapter } from "axios"
// The staff-portal (User Management bundle) adapter: the shared api.ts behaviour plus the
// lookups, upload progress and fee-status mapping the Parents, Fees, Exams, E-Learning,
// Timetable and Attendance screens rely on inside WordPress.
import { gatewayRoute, localOperation, portalRequest, runtime } from "./runtime"
export class ApiError extends Error {
  status: number
  data?: unknown
  constructor(status: number, message: string, data?: unknown) {
    super(message)
    this.status = status
    this.data = data
  }
}
export class SessionExpiredError extends ApiError {}
export const AUTH_SESSION_EXPIRED_EVENT = "em360:session-ended"
export const isSessionExpiredError = (error: unknown) =>
  error instanceof ApiError && error.status === 401
async function filePayload(field: string, file: Blob) {
  if (file.size > 5 * 1024 * 1024)
    throw new Error("Each file must be 5 MB or smaller.")
  const bytes = new Uint8Array(await file.arrayBuffer())
  let text = ""
  for (let i = 0; i < bytes.length; i += 32768)
    text += String.fromCharCode(...bytes.subarray(i, i + 32768))
  return {
    field,
    name: file instanceof File ? file.name : "upload",
    mime: file.type,
    base64: btoa(text),
  }
}
const adapter: AxiosAdapter = async (config) => {
  const target = new URL(config.url || "", "https://connector.invalid")
  if (target.origin !== "https://connector.invalid" || target.hash)
    throw new Error("Only local school operations are available.")
  const query: Record<string, unknown> = Object.fromEntries(target.searchParams)
  for (const [key, value] of Object.entries(config.params || {}))
    if (value !== undefined && value !== null) query[key] = value
  let body: unknown = config.data,
    files: unknown[] = []
  const multipart = body instanceof FormData
  if (body instanceof FormData) {
    const fields: Record<string, unknown> = {}
    for (const [key, value] of body.entries()) {
      if (value instanceof Blob) files.push(await filePayload(key, value))
      else if (key in fields) fields[key] = [...[fields[key]].flat(), value]
      else fields[key] = value
    }
    body = fields
  } else if (typeof body === "string") {
    try {
      body = JSON.parse(body)
    } catch {
      throw new Error("Unsupported request body.")
    }
  }
  const method = (config.method || "GET").toUpperCase()
  const local = await localOperation(method, target.pathname)
  if (local !== undefined)
    return { data: local, status: 200, statusText: "OK", headers: {}, config }
  try {
    const request = {
      method,
      path: target.pathname,
      query,
      body: body ?? null,
      files,
      multipart,
    }
    const module = runtime().module
    // The WordPress gateway lists payment structures through the paged GetAll operation.
    const structures = target.pathname.match(
      /^\/SchoolPaymentStructure\/GetSchoolPaymentStructures\/([a-f0-9-]{36})$/i,
    )
    if (structures && method === "GET") {
      request.path = "/SchoolPaymentStructure/GetAll"
      request.query = { ...query, schoolId: structures[1] }
    }
    const staffTerm = target.pathname.match(/^\/StaffAttendance\/Staff\/([a-f0-9-]{36})\/Term$/i)
    if (module === "staff" && staffTerm) request.path = `/WordPressStaff/Attendance/${staffTerm[1]}/Term`
    // Lookup lists the screens expect in one response are read page by page (the gateway caps pages at 200).
    const pageSize = Number(query.pageSize)
    const wholeLookup =
      ["timetable", "attendance", "staff"].includes(module) &&
      (target.pathname === "/SchoolSession/GetAll" ||
        target.pathname === "/SchoolClass/GetAll" ||
        target.pathname.startsWith("/TimetablePeriodType/GetBySchool/"))
    let data: any
    if (method === "GET" && (structures || wholeLookup || (target.pathname === "/SchoolSubject/GetAll" && pageSize > 200))) {
      const wanted = structures || wholeLookup ? Number.MAX_SAFE_INTEGER : Math.min(pageSize, 1000)
      const items: unknown[] = []
      for (let page = 1; items.length < wanted; page++) {
        if (page > 100) throw new Error("This list is too large to load. Contact your school administrator.")
        const result = await portalRequest(gatewayRoute, {
          ...request,
          query: { ...request.query, pageNumber: page, pageSize: Math.min(200, wanted - items.length) },
        })
        const value = result.Value ?? result.value
        const pageItems = value?.Items ?? value?.items
        if (!Array.isArray(pageItems)) throw new Error("Unable to load the school lookup list.")
        data = result
        items.push(...pageItems)
        const totalPages = Number(value.TotalPages ?? value.totalPages ?? 1)
        if (!pageItems.length || page >= totalPages) break
      }
      const value = data.Value ?? data.value
      data = data.Value
        ? { ...data, Value: { ...value, Items: items, PageNumber: 1, PageSize: wanted } }
        : { ...data, value: { ...value, items, pageNumber: 1, pageSize: wanted } }
    } else
      data = await portalRequest(gatewayRoute, request, {
        signal: config.signal as AbortSignal | undefined,
        onUploadProgress:
          files.length && config.onUploadProgress
            ? (loaded, total) =>
                config.onUploadProgress!({
                  loaded,
                  total,
                  bytes: loaded,
                  lengthComputable: true,
                  progress: loaded / total,
                  upload: true,
                })
            : undefined,
      })
    // Uploads go through the WordPress gateway, which accepts files up to 5 MB.
    if (/^\/(?:ELearning|WordPressLearning\/Files)\/UploadPolicy$/.test(target.pathname)) {
      const value = data.Value ?? data.value
      if (value)
        for (const key of Object.keys(value))
          if (/^max(Image|Document|LessonMaterial)SizeMB$/i.test(key)) value[key] = Math.min(Number(value[key]), 5)
    }
    // Invoices and bills report FullyPaid/PartiallyPaid; the fee screens show Paid/Partial.
    if (/^\/(StudentInvoice|SchoolBill)\//.test(target.pathname)) {
      const names: Record<string, string> = { FullyPaid: "Paid", PartiallyPaid: "Partial" }
      const map = (v: unknown): unknown =>
        Array.isArray(v)
          ? v.map(map)
          : v && typeof v === "object"
            ? Object.fromEntries(
                Object.entries(v).map(([k, x]) => [
                  k,
                  k.toLowerCase() === "paymentstatus" && typeof x === "string" ? (names[x] ?? x) : map(x),
                ]),
              )
            : v
      data = map(data)
    }
    return { data, status: 200, statusText: "OK", headers: {}, config }
  } catch (error) {
    const e = error as { status?: number; message?: string; data?: unknown }
    throw new ApiError(
      e.status || 500,
      e.message || "The request failed.",
      e.data,
    )
  }
}
const apiClient = axios.create({ adapter })
apiClient.interceptors.response.use((response) => response.data)
export const baseUrl = ""
export const elearningBaseUrl = ""
/** School E-Learning reaches the separate E-Learning API through the gateway's request-bound bridge. */
export const elearningApiClient = axios.create({
  adapter: async (config) => {
    const url = config.url || ""
    if (!/^\/(school-learning\/schools\/|Files\/(?:Upload|UploadPolicy)$)/.test(url))
      throw new Error("This LMS operation is outside the school portal.")
    return adapter({ ...config, url: "/WordPressLearning" + url })
  },
})
elearningApiClient.interceptors.response.use((response) => response.data)
export function createAuthenticatedApiClient() {
  return elearningApiClient
}
export async function refreshAccessToken() {
  throw new Error("Sign in again through the WordPress portal.")
}
export default apiClient
