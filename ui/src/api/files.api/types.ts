import type { ApiResultI } from "@/utils/apiResponse"

export type UploadFileValue =
  | string
  | {
      url?: string
      fileUrl?: string
      blobUrl?: string
      path?: string
    }

export interface UploadFileResponseI extends ApiResultI {
  message?: string
  statusCode?: number
  value: UploadFileValue
}

export interface FileUploadPolicyI {
  maxImageSizeMB: number
  maxDocumentSizeMB: number
  maxMediaSizeMB: number
  allowedExtensions: string[]
}

export interface FileUploadPolicyResponseI extends ApiResultI {
  message?: string
  statusCode?: number
  value: FileUploadPolicyI
}

export function extractUploadUrl(response: UploadFileResponseI): string {
  const { value } = response
  if (typeof value === "string" && value.trim()) return value.trim()
  if (value && typeof value === "object") {
    const url = value.url ?? value.fileUrl ?? value.blobUrl ?? value.path ?? ""
    if (url.trim()) return url.trim()
  }
  throw new Error(
    response.message || "Upload succeeded but no file URL was returned"
  )
}
