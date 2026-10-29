import { readVideoDuration } from "./video-duration"
import localforage from "localforage"
import {
  completeLessonVideoUploadApi,
  createLessonVideoUploadApi,
  type LessonVideoUploadI,
} from "@/api/lesson.api"

const TUS_VERSION = "1.0.0"
const CHUNK_SIZE = 8 * 1024 * 1024
const MAX_RETRIES = 6

type StoredUploadSession = {
  uploadId: string
  uploadUrl: string
  uploadUrlExpiresAtUtc: string
  sectionId: string
  fingerprint: string
}

export type TusUploadProgress = {
  uploadedBytes: number
  totalBytes: number
  percentage: number
  bytesPerSecond: number
  remainingSeconds?: number
}

export type TusUploadApi = {
  requiresDuration?: boolean
  createUpload: (payload: {
    sectionId: string
    fileName: string
    contentType: string
    fileSizeBytes: number
    durationSeconds?: number
  }) => Promise<{ value: LessonVideoUploadI }>
  completeUpload: (uploadId: string) => Promise<{ value: LessonVideoUploadI }>
}

export type TusUploadArguments = {
  sectionId: string
  file: File
  signal: AbortSignal
  onProgress: (progress: TusUploadProgress) => void
  onRetry?: (attempt: number, delaySeconds: number) => void
  api?: TusUploadApi
  storageNamespace?: string
  /** Resume only a matching saved session; never reserve storage for a new one. */
  resumeOnly?: boolean
}

export class TusUploadPausedError extends Error {
  constructor() {
    super("Video upload paused")
    this.name = "TusUploadPausedError"
  }
}

const uploadStore = localforage.createInstance({
  name: "em360-lms",
  storeName: "cloudflare-video-uploads",
})

function fingerprint(sectionId: string, file: File) {
  return [sectionId, file.name, file.size, file.lastModified].join(":")
}

function storageKey(value: string) {
  return `lesson-video:${value}`
}

function abortError(error: unknown) {
  return error instanceof DOMException && error.name === "AbortError"
}

async function delay(milliseconds: number, signal: AbortSignal) {
  if (signal.aborted) throw new TusUploadPausedError()
  await new Promise<void>((resolve, reject) => {
    const abort = () => {
      window.clearTimeout(timeout)
      reject(new TusUploadPausedError())
    }
    const timeout = window.setTimeout(() => {
      signal.removeEventListener("abort", abort)
      resolve()
    }, milliseconds)
    signal.addEventListener("abort", abort, { once: true })
  })
}

function retryAfterMilliseconds(raw: string | null): number | undefined {
  if (raw === null || !raw.trim()) return undefined
  const seconds = Number(raw)
  if (Number.isFinite(seconds) && seconds >= 0) return seconds * 1000
  const date = Date.parse(raw)
  return Number.isFinite(date) ? Math.max(0, date - Date.now()) : undefined
}

function retryable(error: unknown): boolean {
  if (error instanceof TypeError) return true
  if (!(error instanceof Error)) return false
  const detail = error as Error & { retryable?: boolean; status?: number }
  return detail.retryable === true || detail.status === 408 || detail.status === 429 ||
    (typeof detail.status === "number" && detail.status >= 500)
}

async function waitToRetry(error: unknown, attempt: number, args: TusUploadArguments) {
  const supplied = error instanceof Error
    ? (error as Error & { retryAfterMs?: number }).retryAfterMs : undefined
  const waitMs = supplied ?? Math.min(30_000, 1000 * 2 ** (attempt - 1))
  args.onRetry?.(attempt, Math.ceil(waitMs / 1000))
  await delay(waitMs, args.signal)
}

async function withRetries<T>(action: () => Promise<T>, args: TusUploadArguments): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    if (args.signal.aborted) throw new TusUploadPausedError()
    try { return await action() } catch (error) {
      if (abortError(error) || args.signal.aborted) throw new TusUploadPausedError()
      if (!retryable(error) || attempt >= MAX_RETRIES) throw error
      await waitToRetry(error, attempt + 1, args)
    }
  }
}

async function readOffset(uploadUrl: string, signal: AbortSignal) {
  const response = await fetch(uploadUrl, {
    method: "HEAD",
    headers: { "Tus-Resumable": TUS_VERSION },
    signal,
  })
  if (!response.ok)
    throw Object.assign(new Error(`Unable to resume upload (HTTP ${response.status}).`), {
      status: response.status,
      retryAfterMs: retryAfterMilliseconds(response.headers.get("Retry-After")),
    })
  const raw = response.headers.get("Upload-Offset")
  const offset = Number(raw)
  if (raw === null || !Number.isSafeInteger(offset) || offset < 0)
    throw new Error("Cloudflare returned an invalid upload offset.")
  return offset
}

async function uploadChunk(
  uploadUrl: string,
  file: File,
  offset: number,
  signal: AbortSignal,
  onChunkProgress: (uploadedBytes: number) => void
) {
  const end = Math.min(file.size, offset + CHUNK_SIZE)
  return await new Promise<number | null>((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    const pause = () => xhr.abort()
    signal.addEventListener("abort", pause, { once: true })

    const cleanup = () => signal.removeEventListener("abort", pause)
    xhr.open("PATCH", uploadUrl)
    xhr.setRequestHeader("Content-Type", "application/offset+octet-stream")
    xhr.setRequestHeader("Tus-Resumable", TUS_VERSION)
    xhr.setRequestHeader("Upload-Offset", String(offset))
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onChunkProgress(offset + event.loaded)
    }
    xhr.onabort = () => {
      cleanup()
      reject(new TusUploadPausedError())
    }
    xhr.onerror = () => {
      cleanup()
      reject(new TypeError("The network connection was interrupted."))
    }
    xhr.onload = () => {
      cleanup()
      if (xhr.status === 409 || xhr.status === 412) {
        resolve(null)
        return
      }
      if (xhr.status < 200 || xhr.status >= 300) {
        const error = new Error(
          `Cloudflare upload failed (HTTP ${xhr.status}).`
        )
        Object.assign(error, {
          retryable:
            xhr.status === 408 || xhr.status === 429 || xhr.status >= 500,
          retryAfterMs: retryAfterMilliseconds(xhr.getResponseHeader("Retry-After")),
        })
        reject(error)
        return
      }
      const nextOffset = Number(xhr.getResponseHeader("Upload-Offset"))
      resolve(
        Number.isSafeInteger(nextOffset) && nextOffset >= end ? nextOffset : end
      )
    }
    xhr.send(file.slice(offset, end))
  })
}

export async function uploadLessonVideoTus(
  args: TusUploadArguments
): Promise<LessonVideoUploadI> {
  const { sectionId, file, signal, onProgress } = args
  const createUpload = args.api?.createUpload ?? createLessonVideoUploadApi
  const completeUpload =
    args.api?.completeUpload ?? completeLessonVideoUploadApi
  const fileFingerprint = fingerprint(sectionId, file)
  const key = storageKey(
    `${args.storageNamespace ?? "standalone-lms"}:${fileFingerprint}`
  )
  let session = await uploadStore.getItem<StoredUploadSession>(key)
  if (
    session &&
    new Date(session.uploadUrlExpiresAtUtc).getTime() <= Date.now() + 30_000
  ) {
    await uploadStore.removeItem(key)
    session = null
  }

  if (!session) {
    if (args.resumeOnly) throw new Error("No matching unexpired upload was found on this device. Select the same file used for the interrupted upload. Starting a new upload requires available storage.")
    if (signal.aborted) throw new TusUploadPausedError()
    let durationSeconds: number | undefined
    try {
      durationSeconds = (args.api?.requiresDuration ?? true) ? await readVideoDuration(file, signal) : undefined
    } catch (error) {
      if (abortError(error) || signal.aborted) throw new TusUploadPausedError()
      throw error
    }
    const created = await createUpload({
      sectionId,
      fileName: file.name,
      contentType: file.type || "video/mp4",
      fileSizeBytes: file.size,
      ...(durationSeconds !== undefined ? { durationSeconds } : {}),
    })
    if (!created.value.uploadUrl || !created.value.uploadUrlExpiresAtUtc)
      throw new Error("The API did not return a resumable upload URL.")
    session = {
      uploadId: created.value.id,
      uploadUrl: created.value.uploadUrl,
      uploadUrlExpiresAtUtc: created.value.uploadUrlExpiresAtUtc,
      sectionId,
      fingerprint: fileFingerprint,
    }
    await uploadStore.setItem(key, session)
  }

  let offset: number
  try {
    offset = await withRetries(() => readOffset(session!.uploadUrl, signal), args)
  } catch (error) {
    if (abortError(error) || signal.aborted) throw new TusUploadPausedError()
    // Temporary network errors must not discard a paid reservation or uploaded bytes.
    const status = error instanceof Error ? (error as Error & { status?: number }).status : undefined
    if (status && [401, 403, 404, 410].includes(status)) await uploadStore.removeItem(key)
    throw error
  }
  if (offset > file.size) throw new Error("The saved upload does not match this video's size.")

  const startedAt = performance.now()
  const startingOffset = offset
  const reportProgress = (uploadedBytes: number) => {
    const elapsedSeconds = Math.max((performance.now() - startedAt) / 1000, 0.1)
    const bytesPerSecond = Math.max(
      0,
      (uploadedBytes - startingOffset) / elapsedSeconds
    )
    onProgress({
      uploadedBytes,
      totalBytes: file.size,
      percentage: Math.min(100, (uploadedBytes / file.size) * 100),
      bytesPerSecond,
      remainingSeconds:
        bytesPerSecond > 0
          ? (file.size - uploadedBytes) / bytesPerSecond
          : undefined,
    })
  }
  reportProgress(offset)
  let conflicts = 0
  while (offset < file.size) {
    if (signal.aborted) throw new TusUploadPausedError()
    let attempt = 0
    for (;;) {
      try {
        const nextOffset = await uploadChunk(
          session.uploadUrl,
          file,
          offset,
          signal,
          reportProgress
        )
        if (nextOffset === null) {
          if (++conflicts > MAX_RETRIES) throw new Error("The upload offset could not be synchronised. Retry to resume this upload.")
          const confirmed = await withRetries(() => readOffset(session!.uploadUrl, signal), args)
          if (confirmed === offset) await waitToRetry(new Error("Upload offset conflict"), conflicts, args)
          else conflicts = 0
          offset = confirmed
        } else {
          conflicts = 0
          offset = nextOffset
        }
        if (offset > file.size) throw new Error("The upload returned an invalid offset.")
        break
      } catch (error) {
        if (abortError(error) || signal.aborted)
          throw new TusUploadPausedError()
        if (!retryable(error) || attempt >= MAX_RETRIES) throw error
        attempt += 1
        await waitToRetry(error, attempt, args)
        offset = await withRetries(() => readOffset(session!.uploadUrl, signal), args)
        if (offset > file.size) throw new Error("The upload returned an invalid offset.")
        if (offset === file.size) break
      }
    }

    reportProgress(offset)
  }

  const completed = await withRetries(() => completeUpload(session!.uploadId), args)
  await uploadStore.removeItem(key)
  return completed.value
}
