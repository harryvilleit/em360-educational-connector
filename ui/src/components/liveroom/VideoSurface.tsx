import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

interface VideoSurfaceProps {
  stream: MediaStream | null
  /** Always true for your own preview — prevents feedback howl. */
  muted?: boolean
  mirrored?: boolean
  className?: string
}

/**
 * Renders a MediaStream. This is the single place a `<video>` element exists,
 * so it's also where an Agora remote track gets attached later — pass
 * `new MediaStream([remoteVideoTrack.getMediaStreamTrack()])`.
 */
export default function VideoSurface({
  stream,
  muted = true,
  mirrored = false,
  className,
}: VideoSurfaceProps) {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (el.srcObject !== stream) el.srcObject = stream

    // Autoplay can still be refused if the element isn't muted yet.
    const play = async () => {
      try {
        await el.play()
      } catch {
        /* the browser will retry once the user interacts */
      }
    }
    void play()
  }, [stream])

  return (
    <video
      ref={ref}
      autoPlay
      playsInline
      muted={muted}
      className={cn(
        "h-full w-full object-cover",
        mirrored && "-scale-x-100",
        className
      )}
    />
  )
}
