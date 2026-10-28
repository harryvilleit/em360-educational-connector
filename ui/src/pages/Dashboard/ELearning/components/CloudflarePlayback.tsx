import { useEffect, useRef, useState } from "react"
import { useVideoAudio } from "@/hooks/useVideoAudio"
import {
  cloudflarePlayerUrl,
  DEFAULT_VIDEO_AUDIO,
  type VideoAudio,
} from "@/lib/video-audio"
import VideoAudioControls from "./VideoAudioControls"

type StreamPlayer = {
  volume: number
  muted: boolean
  currentTime: number
  play: () => Promise<void>
  pause: () => void
  destroy?: () => void
  addEventListener: (event: string, handler: () => void) => void
  removeEventListener: (event: string, handler: () => void) => void
}
type StreamApi = (iframe: HTMLIFrameElement) => StreamPlayer
declare global {
  interface Window {
    Stream?: StreamApi
  }
}

let streamApiPromise: Promise<StreamApi> | null = null
function loadStreamApi(): Promise<StreamApi> {
  if (window.Stream) return Promise.resolve(window.Stream)
  if (streamApiPromise) return streamApiPromise
  streamApiPromise = new Promise<StreamApi>((resolve, reject) => {
    const src = "https://embed.cloudflarestream.com/embed/sdk.latest.js"
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${src}"]`
    )
    const script = existing ?? document.createElement("script")
    const cleanup = () => {
      window.clearTimeout(timer)
      script.removeEventListener("load", finish)
      script.removeEventListener("error", fail)
    }
    const fail = () => {
      cleanup()
      script.remove()
      reject(new Error("Cloudflare sound controls could not be loaded"))
    }
    const finish = () => {
      if (!window.Stream) return fail()
      cleanup()
      resolve(window.Stream)
    }
    const timer = window.setTimeout(fail, 15_000)
    script.addEventListener("load", finish)
    script.addEventListener("error", fail)
    if (!existing) {
      script.src = src
      script.async = true
      document.head.appendChild(script)
    }
  }).catch((error: unknown) => {
    streamApiPromise = null
    throw error
  })
  return streamApiPromise
}

type Props = {
  url: string
  title: string
  autoPlay: boolean
  onEnded: () => void
  /** Stops after this many seconds (course preview excerpts). */
  clipSeconds?: number
}

export default function CloudflarePlayback({
  url,
  title,
  autoPlay,
  onEnded,
  clipSeconds,
}: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const playerRef = useRef<StreamPlayer | null>(null)
  const endedRef = useRef(onEnded)
  const autoPlayRef = useRef(autoPlay)
  const { audio, initialAudio, syncAudio, changeAudio } = useVideoAudio()
  const [ready, setReady] = useState(false)
  const [notice, setNotice] = useState("")
  useEffect(() => {
    endedRef.current = onEnded
  }, [onEnded])
  useEffect(() => {
    autoPlayRef.current = autoPlay
  }, [autoPlay])

  useEffect(() => {
    let cancelled = false
    let detach = () => {}
    void loadStreamApi()
      .then((stream) => {
        if (cancelled || !iframeRef.current) return
        const player = stream(iframeRef.current)
        playerRef.current = player
        const sync = () => {
          if (!cancelled)
            syncAudio({ volume: player.volume * 100, muted: player.muted })
        }
        const ended = () => {
          if (!cancelled) endedRef.current()
        }
        let clipDone = false
        const progress = () => {
          if (cancelled || !clipSeconds || clipDone) return
          if (player.currentTime >= clipSeconds) {
            clipDone = true
            player.pause()
            endedRef.current()
          }
        }
        const playing = () => {
          if (!cancelled) setNotice("")
        }
        const error = () => {
          if (!cancelled)
            setNotice(
              "Video could not load. Reload this lesson to renew playback access."
            )
        }
        player.addEventListener("volumechange", sync)
        player.addEventListener("ended", ended)
        player.addEventListener("timeupdate", progress)
        player.addEventListener("playing", playing)
        player.addEventListener("error", error)
        detach = () => {
          player.removeEventListener("volumechange", sync)
          player.removeEventListener("ended", ended)
          player.removeEventListener("timeupdate", progress)
          player.removeEventListener("playing", playing)
          player.removeEventListener("error", error)
          player.pause()
          player.destroy?.()
        }
        player.volume = initialAudio.volume / 100
        player.muted = initialAudio.muted
        setReady(true)
        if (autoPlayRef.current) {
          void player.play().catch(() => {
            if (!cancelled)
              setNotice(
                "Playback needs a click. Select Restore sound or use the video's Play button."
              )
          })
        }
      })
      .catch(() => {
        if (!cancelled)
          setNotice(
            "Extra sound controls are unavailable. Use the volume and Play controls inside the video."
          )
      })
    return () => {
      cancelled = true
      detach()
      playerRef.current = null
    }
  }, [url, initialAudio, syncAudio, clipSeconds])

  const applyAudio = (next: VideoAudio) => {
    const player = playerRef.current
    if (!player) return
    player.volume = next.volume / 100
    player.muted = next.muted
    changeAudio(next)
  }
  const restoreSound = () => {
    applyAudio(DEFAULT_VIDEO_AUDIO)
    void playerRef.current
      ?.play()
      .then(() => setNotice(""))
      .catch(() => {
        setNotice(
          "Select Play inside the video, then check your device volume if sound is still quiet."
        )
      })
  }

  return (
    <div className="flex h-full w-full flex-col bg-black">
      <iframe
        ref={iframeRef}
        src={cloudflarePlayerUrl(url, initialAudio)}
        title={title}
        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
        className="min-h-0 w-full flex-1 border-0"
      />
      <VideoAudioControls
        audio={audio}
        ready={ready}
        onChange={applyAudio}
        onRestore={restoreSound}
        notice={notice}
      />
    </div>
  )
}
