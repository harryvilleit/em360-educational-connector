import type { AxiosProgressEvent, AxiosRequestConfig } from "axios"

export type UploadRequestOptions = {
  onProgress?: (percentage: number) => void
  signal?: AbortSignal
}

/**
 * File transfers must not inherit the normal API timeout. A fixed 30-second
 * deadline makes otherwise valid uploads fail for users with slow upstream
 * connections. The browser and AbortSignal still allow the request to be
 * cancelled, while the API remains responsible for enforcing file-size and
 * file-type limits.
 */
export function createUploadRequestConfig(
  file: File,
  options: UploadRequestOptions = {}
): Pick<AxiosRequestConfig, "timeout" | "signal" | "onUploadProgress"> {
  return {
    timeout: 0,
    signal: options.signal,
    onUploadProgress: (event: AxiosProgressEvent) => {
      if (!options.onProgress) return

      const total = event.total && event.total > 0 ? event.total : file.size
      if (total <= 0) return

      options.onProgress(
        Math.min(100, Math.max(0, Math.round((event.loaded / total) * 100)))
      )
    },
  }
}
