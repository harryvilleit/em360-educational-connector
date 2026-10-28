import { useEffect, useRef, useState, type RefObject } from "react"
import { uploadStudentAssignmentSnapshotApi } from "@/api/studentElearning.api"

type CaptureStatus = "idle" | "capturing" | "saved" | "retrying"

type ProctoringState = {
  videoRef: RefObject<HTMLVideoElement | null>
  isCameraReady: boolean
  snapshotCount: number
  captureStatus: CaptureStatus
  lastCapturedAt: Date | null
  error: string | null
  warning: string | null
}

function randomSnapshotDelays(horizonSeconds: number, count: number) {
  if (count <= 0) return []
  const safeHorizon = Math.max(15, horizonSeconds)
  const firstDelay = Math.min(5, Math.max(2, safeHorizon * 0.08))
  if (count === 1) return [firstDelay * 1000]

  const remainingWindow = Math.max(10, safeHorizon - firstDelay - 3)
  const segment = remainingWindow / (count - 1)
  return Array.from({ length: count }, (_, index) => {
    if (index === 0) return firstDelay * 1000
    const centre = firstDelay + segment * index
    const jitter = (Math.random() - 0.5) * segment * 0.6
    return Math.max(firstDelay + 2, Math.min(safeHorizon - 2, centre + jitter)) * 1000
  })
}

async function waitForVideo(video: HTMLVideoElement, timeoutMs = 5000) {
  if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && video.videoWidth) return true
  return new Promise<boolean>((resolve) => {
    const finish = (ready: boolean) => {
      window.clearTimeout(timeout)
      video.removeEventListener("loadeddata", onReady)
      video.removeEventListener("playing", onReady)
      resolve(ready)
    }
    const onReady = () => finish(Boolean(video.videoWidth && video.videoHeight))
    const timeout = window.setTimeout(() => finish(false), timeoutMs)
    video.addEventListener("loadeddata", onReady, { once: true })
    video.addEventListener("playing", onReady, { once: true })
  })
}

async function captureFrame(video: HTMLVideoElement): Promise<File | null> {
  if (!(await waitForVideo(video)) || !video.videoWidth || !video.videoHeight) return null
  const scale = Math.min(1, 960 / video.videoWidth)
  const canvas = document.createElement("canvas")
  canvas.width = Math.max(1, Math.round(video.videoWidth * scale))
  canvas.height = Math.max(1, Math.round(video.videoHeight * scale))
  const context = canvas.getContext("2d")
  if (!context) return null
  context.drawImage(video, 0, 0, canvas.width, canvas.height)
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", 0.72)
  )
  return blob
    ? new File([blob], `cbt-snapshot-${Date.now()}.jpg`, { type: "image/jpeg" })
    : null
}

export function useCbtProctoring({
  enabled,
  schoolId,
  attemptId,
  durationMinutes,
  remainingSeconds,
  existingSnapshots = 0,
  onFatal,
}: {
  enabled: boolean
  schoolId: string
  attemptId?: string
  durationMinutes: number
  remainingSeconds?: number | null
  existingSnapshots?: number
  onFatal: (reason: "camera_denied") => void
}): ProctoringState {
  const videoRef = useRef<HTMLVideoElement>(null)
  const fatalRef = useRef(onFatal)
  const snapshotCountRef = useRef(existingSnapshots)
  const scheduleHorizonRef = useRef<number | null>(null)
  const [isCameraReady, setCameraReady] = useState(false)
  const [snapshotCount, setSnapshotCount] = useState(existingSnapshots)
  const [captureStatus, setCaptureStatus] = useState<CaptureStatus>("idle")
  const [lastCapturedAt, setLastCapturedAt] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [warning, setWarning] = useState<string | null>(null)

  useEffect(() => {
    scheduleHorizonRef.current = remainingSeconds && remainingSeconds > 0
      ? remainingSeconds
      : durationMinutes > 0
        ? durationMinutes * 60
        : 60 * 60
  }, [attemptId, durationMinutes, remainingSeconds])

  useEffect(() => {
    fatalRef.current = onFatal
  }, [onFatal])

  useEffect(() => {
    if (!enabled || !attemptId) return
    let disposed = false
    let stream: MediaStream | undefined
    let videoElement: HTMLVideoElement | null = null
    const timers: number[] = []
    let statusTimer: number | undefined
    snapshotCountRef.current = existingSnapshots

    const scheduleCapture = (delay: number, retryCount = 0) => {
      timers.push(window.setTimeout(async () => {
        if (disposed || snapshotCountRef.current >= 10 || !videoRef.current) return
        setCaptureStatus(retryCount ? "retrying" : "capturing")
        const file = await captureFrame(videoRef.current)
        if (!file || disposed) {
          setWarning("The camera frame was not ready. Snapshot monitoring will retry.")
          if (retryCount < 2) scheduleCapture(4000, retryCount + 1)
          return
        }
        try {
          await uploadStudentAssignmentSnapshotApi(schoolId, attemptId, file)
          if (disposed) return
          snapshotCountRef.current += 1
          setSnapshotCount(snapshotCountRef.current)
          setLastCapturedAt(new Date())
          setWarning(null)
          setCaptureStatus("saved")
          if (statusTimer) window.clearTimeout(statusTimer)
          statusTimer = window.setTimeout(() => setCaptureStatus("idle"), 2200)
        } catch {
          if (disposed) return
          setCaptureStatus("retrying")
          setWarning("A snapshot could not reach the server. It will be retried automatically.")
          if (retryCount < 2) scheduleCapture(6000, retryCount + 1)
        }
      }, delay))
    }

    const run = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 960 }, height: { ideal: 540 } },
          audio: false,
        })
        if (disposed) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }
        setSnapshotCount(existingSnapshots)
        setCameraReady(false)
        setError(null)
        setWarning(null)
        if (videoRef.current) {
          videoElement = videoRef.current
          videoElement.srcObject = stream
          await videoElement.play()
          await waitForVideo(videoElement)
        }
        if (disposed) return
        setCameraReady(true)

        const available = Math.max(0, 10 - existingSnapshots)
        const horizon = scheduleHorizonRef.current ?? 60 * 60
        const desired = durationMinutes > 0
          ? Math.min(10, Math.max(3, Math.ceil(durationMinutes / 6)))
          : 6
        const count = Math.min(available, desired)
        randomSnapshotDelays(horizon, count).forEach((delay) => scheduleCapture(delay))
      } catch {
        if (disposed) return
        setError("Camera access is required for this assignment.")
        fatalRef.current("camera_denied")
      }
    }

    void run()
    return () => {
      disposed = true
      timers.forEach((timer) => window.clearTimeout(timer))
      if (statusTimer) window.clearTimeout(statusTimer)
      stream?.getTracks().forEach((track) => track.stop())
      if (videoElement) videoElement.srcObject = null
    }
    // remainingSeconds intentionally stays out of this dependency list. Including
    // the ticking countdown tears down the camera and all snapshot timers each second.
  }, [attemptId, durationMinutes, enabled, existingSnapshots, schoolId])

  return {
    videoRef,
    isCameraReady,
    snapshotCount: Math.max(existingSnapshots, snapshotCount),
    captureStatus,
    lastCapturedAt,
    error,
    warning,
  }
}
