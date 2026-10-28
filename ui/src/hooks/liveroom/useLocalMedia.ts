import { useCallback, useEffect, useRef, useState } from "react"
import type { MediaProfile } from "@/types/liveroom"

/** Resolution ladder. Mirrors what we ask the SFU to encode at. */
const VIDEO_CONSTRAINTS: Record<
  Exclude<MediaProfile, "audio">,
  MediaTrackConstraints
> = {
  hd: { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 } },
  sd: { width: { ideal: 640 }, height: { ideal: 360 }, frameRate: { ideal: 24 } },
  low: { width: { ideal: 426 }, height: { ideal: 240 }, frameRate: { ideal: 15 } },
}

export type LocalMediaErrorKind =
  | "denied"
  | "notFound"
  | "inUse"
  | "insecure"
  | "unsupported"
  | "unknown"

export interface LocalMediaError {
  kind: LocalMediaErrorKind
  title: string
  detail: string
}

function describe(err: unknown): LocalMediaError {
  const name = (err as DOMException)?.name ?? ""

  switch (name) {
    case "NotAllowedError":
    case "SecurityError":
      return {
        kind: "denied",
        title: "Camera and microphone are blocked",
        detail:
          "Allow access from the padlock icon in the address bar, then reload the page.",
      }
    case "NotFoundError":
    case "OverconstrainedError":
      return {
        kind: "notFound",
        title: "No camera found",
        detail:
          "Check the device is plugged in and not disabled. You can still join with audio only.",
      }
    case "NotReadableError":
    case "AbortError":
      return {
        kind: "inUse",
        title: "Camera is being used by another app",
        detail:
          "Close Zoom, Teams, or any other tab using the camera, then press Retry.",
      }
    default:
      return {
        kind: "unknown",
        title: "Couldn't start your camera",
        detail: "Press Retry, or join with audio only and turn video on later.",
      }
  }
}

interface UseLocalMediaOptions {
  camOn: boolean
  micOn: boolean
  mediaProfile: MediaProfile
  cameraDeviceId: string
  micDeviceId: string
  /** Skip acquisition entirely (e.g. before the user has chosen to join). */
  enabled?: boolean
}

/**
 * Owns the local MediaStream for the whole room.
 *
 * Video tracks are stopped rather than disabled when the camera is turned off,
 * so the hardware indicator light actually goes out — students notice when it
 * doesn't. Audio uses `enabled` instead, because re-acquiring the mic produces
 * an audible click on every mute.
 */
export function useLocalMedia({
  camOn,
  micOn,
  mediaProfile,
  cameraDeviceId,
  micDeviceId,
  enabled = true,
}: UseLocalMediaOptions) {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<LocalMediaError | null>(null)
  const [acquiring, setAcquiring] = useState(false)
  const [nonce, setNonce] = useState(0)
  const streamRef = useRef<MediaStream | null>(null)

  const retry = useCallback(() => {
    setError(null)
    setNonce((n) => n + 1)
  }, [])

  const wantsVideo = enabled && camOn && mediaProfile !== "audio"

  useEffect(() => {
    if (!enabled) return

    let cancelled = false

    const stop = () => {
      streamRef.current?.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }

    const acquire = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError(
          window.isSecureContext
            ? {
                kind: "unsupported",
                title: "This browser can't access the camera",
                detail: "Try Chrome, Edge, Firefox or Safari.",
              }
            : {
                kind: "insecure",
                title: "Camera needs a secure connection",
                detail:
                  "Browsers only allow camera access over HTTPS or on localhost.",
              }
        )
        return
      }

      setAcquiring(true)
      try {
        const constraints: MediaStreamConstraints = {
          audio: {
            ...(micDeviceId !== "default" ? { deviceId: { exact: micDeviceId } } : {}),
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
          video: wantsVideo
            ? {
                ...VIDEO_CONSTRAINTS[mediaProfile as Exclude<MediaProfile, "audio">],
                ...(cameraDeviceId !== "default"
                  ? { deviceId: { exact: cameraDeviceId } }
                  : {}),
              }
            : false,
        }

        const next = await navigator.mediaDevices.getUserMedia(constraints)

        if (cancelled) {
          next.getTracks().forEach((t) => t.stop())
          return
        }

        stop()
        streamRef.current = next
        setStream(next)
        setError(null)
      } catch (err) {
        if (!cancelled) {
          setError(describe(err))
          setStream(null)
        }
      } finally {
        if (!cancelled) setAcquiring(false)
      }
    }

    void acquire()

    return () => {
      cancelled = true
    }
  }, [enabled, wantsVideo, mediaProfile, cameraDeviceId, micDeviceId, nonce])

  // Mute without tearing the track down.
  useEffect(() => {
    stream?.getAudioTracks().forEach((t) => {
      t.enabled = micOn
    })
  }, [stream, micOn])

  // Release the devices when the room unmounts.
  useEffect(
    () => () => {
      streamRef.current?.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    },
    []
  )

  return { stream, error, acquiring, retry }
}

/**
 * Device lists for the settings picker. Labels are empty until the user has
 * granted permission once, so call this after the stream is acquired.
 */
export function useMediaDevices(ready: boolean) {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])

  useEffect(() => {
    if (!ready || !navigator.mediaDevices?.enumerateDevices) return

    let cancelled = false
    const load = async () => {
      try {
        const list = await navigator.mediaDevices.enumerateDevices()
        if (!cancelled) setDevices(list)
      } catch {
        /* enumeration is best-effort */
      }
    }

    void load()
    navigator.mediaDevices.addEventListener("devicechange", load)
    return () => {
      cancelled = true
      navigator.mediaDevices.removeEventListener("devicechange", load)
    }
  }, [ready])

  return {
    cameras: devices.filter((d) => d.kind === "videoinput"),
    microphones: devices.filter((d) => d.kind === "audioinput"),
    speakers: devices.filter((d) => d.kind === "audiooutput"),
  }
}
