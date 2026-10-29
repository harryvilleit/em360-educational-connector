/** Metadata is a reservation hint; Cloudflare enforces the limit and confirms actual duration. */
export async function readVideoDuration(file: File, signal: AbortSignal): Promise<number> {
  if (signal.aborted) throw new DOMException("Aborted", "AbortError")
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const video = document.createElement("video")
    const cleanup = () => {
      window.clearTimeout(timer)
      signal.removeEventListener("abort", abort)
      video.onloadedmetadata = null
      video.onerror = null
      video.removeAttribute("src")
      video.load()
      URL.revokeObjectURL(url)
    }
    const fail = () => { cleanup(); reject(new Error("Could not read this video's duration. Please select a supported video file before uploading.")) }
    const abort = () => { cleanup(); reject(new DOMException("Aborted", "AbortError")) }
    const timer = window.setTimeout(fail, 15000)
    signal.addEventListener("abort", abort, { once: true })
    video.preload = "metadata"
    video.onloadedmetadata = () => {
      const seconds = video.duration
      if (!Number.isFinite(seconds) || seconds <= 0) { fail(); return }
      cleanup()
      resolve(Math.ceil(seconds))
    }
    video.onerror = fail
    video.src = url
  })
}
