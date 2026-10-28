import { useEffect, useRef, useState } from "react"
import { AlertCircle, Pause, Play, RotateCcw, RotateCw } from "lucide-react"
import { formatTimestamp, getYouTubeVideoId } from "@/utils/lmsDuration"
import { useVideoAudio } from "@/hooks/useVideoAudio"
import {
  DEFAULT_VIDEO_AUDIO,
  isCloudflarePlayerUrl,
  type VideoAudio,
} from "@/lib/video-audio"
import VideoAudioControls from "./VideoAudioControls"
import CloudflarePlayback from "./CloudflarePlayback"

type YouTubePlayerInstance = {
  destroy: () => void
  playVideo: () => void
  pauseVideo: () => void
  seekTo: (seconds: number, allowSeekAhead: boolean) => void
  getCurrentTime: () => number
  getDuration: () => number
  setVolume: (volume: number) => void
  getVolume: () => number
  mute: () => void
  unMute: () => void
  isMuted: () => boolean
}

type YouTubePlayerEvent = {
  target: YouTubePlayerInstance
}

type YouTubeStateEvent = {
  data: number
}

type YouTubePlayerOptions = {
  host?: string
  width: string
  height: string
  videoId: string
  playerVars: Record<string, number>
  events: {
    onReady: (event: YouTubePlayerEvent) => void
    onStateChange: (event: YouTubeStateEvent) => void
    onError: () => void
    onAutoplayBlocked: () => void
  }
}

type YouTubeApi = {
  Player: new (
    element: HTMLElement,
    options: YouTubePlayerOptions
  ) => YouTubePlayerInstance
}

type VimeoPlayerInstance = {
  destroy: () => Promise<void>
  on: (event: "ended", callback: () => void) => void
  play: () => Promise<void>
}

type VimeoApi = {
  Player: new (
    element: HTMLElement,
    options: {
      id: number
      autoplay: boolean
      responsive: boolean
      title: boolean
      byline: boolean
      portrait: boolean
    }
  ) => VimeoPlayerInstance
}

declare global {
  interface Window {
    YT?: YouTubeApi
    Vimeo?: VimeoApi
    onYouTubeIframeAPIReady?: () => void
  }
}

let youtubeApiPromise: Promise<YouTubeApi> | null = null
let vimeoApiPromise: Promise<VimeoApi> | null = null

function loadYouTubeApi(): Promise<YouTubeApi> {
  if (window.YT?.Player) return Promise.resolve(window.YT)
  if (youtubeApiPromise) return youtubeApiPromise

  youtubeApiPromise = new Promise<YouTubeApi>((resolve, reject) => {
    const previousCallback = window.onYouTubeIframeAPIReady
    const timeout = window.setTimeout(() => {
      youtubeApiPromise = null
      reject(new Error("YouTube player took too long to load"))
    }, 15_000)

    window.onYouTubeIframeAPIReady = () => {
      window.clearTimeout(timeout)
      previousCallback?.()
      if (window.YT?.Player) resolve(window.YT)
      else reject(new Error("YouTube player is unavailable"))
    }

    if (
      !document.querySelector(
        'script[src="https://www.youtube.com/iframe_api"]'
      )
    ) {
      const script = document.createElement("script")
      script.src = "https://www.youtube.com/iframe_api"
      script.async = true
      script.onerror = () => {
        window.clearTimeout(timeout)
        youtubeApiPromise = null
        script.remove()
        reject(new Error("YouTube player could not be loaded"))
      }
      document.head.appendChild(script)
    }
  })

  return youtubeApiPromise
}

function getVimeoVideoId(url: string) {
  try {
    const parsed = new URL(url)
    const id = parsed.pathname.match(/\/(?:video\/)?(\d+)/)?.[1]
    return id ? Number(id) : null
  } catch {
    return null
  }
}

function loadVimeoApi(): Promise<VimeoApi> {
  if (window.Vimeo?.Player) return Promise.resolve(window.Vimeo)
  if (vimeoApiPromise) return vimeoApiPromise

  vimeoApiPromise = new Promise<VimeoApi>((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      vimeoApiPromise = null
      reject(new Error("Vimeo player took too long to load"))
    }, 15_000)
    const finish = () => {
      window.clearTimeout(timeout)
      if (window.Vimeo?.Player) resolve(window.Vimeo)
      else reject(new Error("Vimeo player is unavailable"))
    }

    const existing = document.querySelector<HTMLScriptElement>(
      'script[src="https://player.vimeo.com/api/player.js"]'
    )
    if (existing) {
      existing.addEventListener("load", finish, { once: true })
      existing.addEventListener(
        "error",
        () => {
          window.clearTimeout(timeout)
          vimeoApiPromise = null
          reject(new Error("Vimeo player could not be loaded"))
        },
        { once: true }
      )
      return
    }

    const script = document.createElement("script")
    script.src = "https://player.vimeo.com/api/player.js"
    script.async = true
    script.onload = finish
    script.onerror = () => {
      window.clearTimeout(timeout)
      vimeoApiPromise = null
      reject(new Error("Vimeo player could not be loaded"))
    }
    document.head.appendChild(script)
  })

  return vimeoApiPromise
}

type YouTubePlaybackProps = {
  videoId: string
  title: string
  autoPlay: boolean
  onEnded: () => void
  clipSeconds?: number
}

function YouTubePlayback({
  videoId,
  title,
  autoPlay,
  onEnded,
  clipSeconds,
}: YouTubePlaybackProps) {
  const mountRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<YouTubePlayerInstance | null>(null)
  const endedRef = useRef(onEnded)
  const autoPlayRef = useRef(autoPlay)
  const [error, setError] = useState(false)
  const [ready, setReady] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [notice, setNotice] = useState("")
  const { audio, initialAudio, syncAudio, changeAudio } = useVideoAudio()

  useEffect(() => {
    endedRef.current = onEnded
  }, [onEnded])

  useEffect(() => {
    autoPlayRef.current = autoPlay
  }, [autoPlay])

  useEffect(() => {
    let player: YouTubePlayerInstance | undefined
    let cancelled = false

    let clipDone = false
    const timer = window.setInterval(() => {
      const active = playerRef.current
      if (!active) return
      const now = active.getCurrentTime() || 0
      setCurrentTime(now)
      const full = active.getDuration() || 0
      setDuration(clipSeconds ? Math.min(full, clipSeconds) : full)
      // Preview clips stop after their excerpt even if the viewer seeks past it.
      if (clipSeconds && now >= clipSeconds && !clipDone) {
        clipDone = true
        active.pauseVideo()
        endedRef.current()
      }
      // YouTube has no volumechange event; also reflect its built-in controls.
      syncAudio({ volume: active.getVolume(), muted: active.isMuted() })
    }, 500)

    void loadYouTubeApi()
      .then((api) => {
        if (cancelled || !mountRef.current) return
        // The SDK replaces its mount with an iframe. Keep React's container intact.
        const target = document.createElement("div")
        mountRef.current.replaceChildren(target)
        player = new api.Player(target, {
          // Privacy-enhanced mode: YouTube sets no cookies until the viewer presses play.
          host: "https://www.youtube-nocookie.com",
          width: "100%",
          height: "100%",
          videoId,
          playerVars: {
            autoplay: 0,
            controls: 1,
            disablekb: 0,
            playsinline: 1,
            rel: 0,
            ...(clipSeconds ? { start: 0, end: Math.ceil(clipSeconds) } : {}),
          },
          events: {
            onReady: (event) => {
              if (cancelled) return
              playerRef.current = event.target
              setReady(true)
              setDuration(event.target.getDuration() || 0)
              event.target.setVolume(initialAudio.volume)
              if (initialAudio.muted) event.target.mute()
              else event.target.unMute()
              if (autoPlayRef.current) event.target.playVideo()
            },
            onStateChange: (event) => {
              if (cancelled) return
              setPlaying(event.data === 1)
              if (event.data === 1) setNotice("")
              if (event.data === 0) endedRef.current()
            },
            onError: () => {
              if (!cancelled) setError(true)
            },
            onAutoplayBlocked: () => {
              if (!cancelled)
                setNotice(
                  "Playback needs a click. Select Restore sound or Play to continue."
                )
            },
          },
        })
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })

    return () => {
      cancelled = true
      window.clearInterval(timer)
      playerRef.current = null
      player?.destroy()
    }
  }, [videoId, initialAudio, syncAudio, clipSeconds])

  const applyAudio = (next: VideoAudio) => {
    const player = playerRef.current
    if (!player) return
    player.setVolume(next.volume)
    if (next.muted) player.mute()
    else player.unMute()
    changeAudio(next)
  }

  const restoreSound = () => {
    applyAudio(DEFAULT_VIDEO_AUDIO)
    playerRef.current?.playVideo()
  }

  const skip = (seconds: number) => {
    const active = playerRef.current
    if (!active) return
    const target = Math.max(
      0,
      Math.min(duration || Infinity, active.getCurrentTime() + seconds)
    )
    active.seekTo(target, true)
    setCurrentTime(target)
  }

  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 bg-slate-950 px-6 text-center text-white">
        <AlertCircle className="size-7 text-amber-400" />
        <p className="text-sm font-medium">
          This YouTube video could not be played.
        </p>
        <a
          href={`https://www.youtube.com/watch?v=${videoId}`}
          target="_blank"
          rel="noreferrer"
          className="text-sm text-blue-300 underline underline-offset-4"
        >
          Open {title} on YouTube
        </a>
      </div>
    )
  }

  return (
    <div className="flex h-full w-full flex-col bg-black">
      <div className="min-h-0 w-full flex-1">
        <div ref={mountRef} className="h-full w-full" aria-label={title} />
      </div>
      <div className="flex min-h-11 shrink-0 items-center gap-2 bg-slate-950 px-3 text-white">
        <button
          type="button"
          aria-label={playing ? "Pause video" : "Play video"}
          disabled={!ready}
          onClick={() =>
            playing
              ? playerRef.current?.pauseVideo()
              : playerRef.current?.playVideo()
          }
          className="rounded p-1.5 hover:bg-white/15 disabled:opacity-50"
        >
          {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
        </button>
        <button
          type="button"
          aria-label="Rewind 10 seconds"
          disabled={!ready}
          onClick={() => skip(-10)}
          className="rounded p-1.5 hover:bg-white/15 disabled:opacity-50"
        >
          <RotateCcw className="size-4" />
        </button>
        <button
          type="button"
          aria-label="Fast forward 10 seconds"
          disabled={!ready || !duration}
          onClick={() => skip(10)}
          className="rounded p-1.5 hover:bg-white/15 disabled:opacity-50"
        >
          <RotateCw className="size-4" />
        </button>
        <input
          type="range"
          aria-label="Seek video"
          min={0}
          max={Math.max(duration, 1)}
          step={1}
          value={Math.min(currentTime, Math.max(duration, 1))}
          disabled={!ready || !duration}
          onChange={(event) => {
            const seconds = Number(event.target.value)
            playerRef.current?.seekTo(seconds, true)
            setCurrentTime(seconds)
          }}
          className="min-w-0 flex-1 cursor-pointer accent-blue-500 disabled:opacity-50"
        />
        <span className="shrink-0 text-xs text-slate-300 tabular-nums">
          {formatTimestamp(Math.floor(currentTime))} /{" "}
          {formatTimestamp(Math.floor(duration))}
        </span>
      </div>
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

type VimeoPlaybackProps = {
  videoId: number
  sourceUrl: string
  title: string
  autoPlay: boolean
  onEnded: () => void
}

function VimeoPlayback({
  videoId,
  sourceUrl,
  title,
  autoPlay,
  onEnded,
}: VimeoPlaybackProps) {
  const mountRef = useRef<HTMLDivElement>(null)
  const endedRef = useRef(onEnded)
  const autoPlayRef = useRef(autoPlay)
  const [error, setError] = useState(false)

  useEffect(() => {
    endedRef.current = onEnded
  }, [onEnded])

  useEffect(() => {
    autoPlayRef.current = autoPlay
  }, [autoPlay])

  useEffect(() => {
    let player: VimeoPlayerInstance | undefined
    let cancelled = false

    void loadVimeoApi()
      .then((api) => {
        if (cancelled || !mountRef.current) return
        player = new api.Player(mountRef.current, {
          id: videoId,
          autoplay: autoPlayRef.current,
          responsive: true,
          title: true,
          byline: true,
          portrait: false,
        })
        player.on("ended", () => endedRef.current())
        if (autoPlayRef.current) void player.play().catch(() => undefined)
      })
      .catch(() => setError(true))

    return () => {
      cancelled = true
      if (player) void player.destroy()
    }
  }, [videoId])

  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 bg-slate-950 px-6 text-center text-white">
        <AlertCircle className="size-7 text-amber-400" />
        <p className="text-sm font-medium">
          This Vimeo video could not be played.
        </p>
        <a
          href={sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="text-sm text-blue-300 underline underline-offset-4"
        >
          Open {title} on Vimeo
        </a>
      </div>
    )
  }

  return <div ref={mountRef} className="h-full w-full" aria-label={title} />
}

type CourseVideoPlayerProps = {
  url: string
  title: string
  autoPlay?: boolean
  onEnded?: () => void
  /** Plays only the first N seconds (course preview excerpts), then reports the end. */
  clipSeconds?: number
}

const noop = () => {}

export default function CourseVideoPlayer({
  url,
  title,
  autoPlay = false,
  onEnded = noop,
  clipSeconds,
}: CourseVideoPlayerProps) {
  const youtubeId = getYouTubeVideoId(url)
  const vimeoId = /vimeo\.com/i.test(url) ? getVimeoVideoId(url) : null

  if (isCloudflarePlayerUrl(url)) {
    return (
      <CloudflarePlayback
        key={url}
        url={url}
        title={title}
        autoPlay={autoPlay}
        onEnded={onEnded}
        clipSeconds={clipSeconds}
      />
    )
  }

  if (youtubeId) {
    return (
      <YouTubePlayback
        key={youtubeId}
        videoId={youtubeId}
        title={title}
        autoPlay={autoPlay}
        onEnded={onEnded}
        clipSeconds={clipSeconds}
      />
    )
  }

  if (vimeoId) {
    return (
      <VimeoPlayback
        videoId={vimeoId}
        sourceUrl={url}
        title={title}
        autoPlay={autoPlay}
        onEnded={onEnded}
      />
    )
  }

  return (
    <video
      key={url}
      src={url}
      title={title}
      controls
      autoPlay={autoPlay}
      playsInline
      className="h-full w-full bg-black"
      onEnded={onEnded}
      onTimeUpdate={(event) => {
        const video = event.currentTarget
        if (clipSeconds && video.currentTime >= clipSeconds && !video.paused) {
          video.pause()
          onEnded()
        }
      }}
    />
  )
}
