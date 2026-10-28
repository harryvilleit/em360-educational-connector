import axios, { type AxiosAdapter } from "axios"
import { gatewayRoute, localOperation, portalRequest } from "./runtime"
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
  // Some frames answer identity reads (for example the student's own profile) from their signed-in context.
  const local = await localOperation(method, target.pathname)
  if (local !== undefined)
    return { data: local, status: 200, statusText: "OK", headers: {}, config }
  try {
    const data = await portalRequest(gatewayRoute, {
      method,
      path: target.pathname,
      query,
      body: body ?? null,
      files,
      multipart,
    })
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
export const elearningApiClient = axios.create({
  adapter: async () => {
    throw new Error("LMS is outside this connector module.")
  },
})
export function createAuthenticatedApiClient() {
  return elearningApiClient
}
export async function refreshAccessToken() {
  throw new Error("Sign in again through the WordPress portal.")
}
export default apiClient
