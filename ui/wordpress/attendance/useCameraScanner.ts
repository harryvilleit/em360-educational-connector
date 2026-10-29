// Camera QR scanner for ID cards. Same contract as src/hooks/useQrCameraScanner, plus a
// generation counter so a stop (or unmount) during camera start-up cannot leave the camera on.
import { useCallback, useEffect, useRef, useState } from "react"
import jsQR from "jsqr"

type ScannerStatus = "idle" | "starting" | "scanning" | "error"
const REDECODE_INTERVAL_MS = 3000

export function useCameraScanner(onDecode: (text: string) => void) {
  const generation = useRef(0)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const frameRef = useRef<number | null>(null)
  const lastDecodeRef = useRef<{ text: string; at: number } | null>(null)
  const onDecodeRef = useRef(onDecode)
  useEffect(() => {
    onDecodeRef.current = onDecode
  }, [onDecode])
  const [status, setStatus] = useState<ScannerStatus>("idle")
  const [error, setError] = useState<string | null>(null)

  const stop = useCallback(() => {
    generation.current++
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
    frameRef.current = null
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    setStatus("idle")
  }, [])

  const tickRef = useRef(() => {})
  useEffect(() => {
    tickRef.current = () => {
      if (!streamRef.current) return
      const video = videoRef.current,
        canvas = canvasRef.current
      if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        const context = canvas.getContext("2d")
        if (context) {
          context.drawImage(video, 0, 0, canvas.width, canvas.height)
          const image = context.getImageData(0, 0, canvas.width, canvas.height)
          const code = jsQR(image.data, image.width, image.height)
          if (code?.data) {
            const now = Date.now(),
              last = lastDecodeRef.current
            if (!last || last.text !== code.data || now - last.at > REDECODE_INTERVAL_MS) {
              lastDecodeRef.current = { text: code.data, at: now }
              onDecodeRef.current(code.data)
            }
          }
        }
      }
      if (streamRef.current) frameRef.current = requestAnimationFrame(() => tickRef.current())
    }
  }, [])

  const start = useCallback(async () => {
    stop()
    const current = generation.current
    setError(null)
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("This browser can't access the camera.")
      setStatus("error")
      return
    }
    setStatus("starting")
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
      if (current !== generation.current) {
        stream.getTracks().forEach((track) => track.stop())
        return
      }
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      if (current !== generation.current) return
      setStatus("scanning")
      if (streamRef.current) frameRef.current = requestAnimationFrame(() => tickRef.current())
    } catch {
      if (current !== generation.current) return
      stop()
      setError("Camera access was denied or unavailable. Allow camera access and try again.")
      setStatus("error")
    }
  }, [stop])

  useEffect(() => stop, [stop])
  return { videoRef, canvasRef, status, error, start, stop }
}
