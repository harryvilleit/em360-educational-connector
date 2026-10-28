import { Volume2, VolumeX } from "lucide-react"
import type { VideoAudio } from "@/lib/video-audio"

type Props = {
  audio: VideoAudio
  ready: boolean
  onChange: (audio: VideoAudio) => void
  onRestore: () => void
  notice?: string
}

export default function VideoAudioControls({
  audio,
  ready,
  onChange,
  onRestore,
  notice,
}: Props) {
  const silent = audio.muted || audio.volume === 0
  return (
    <div className="shrink-0 space-y-1 border-t border-white/10 bg-slate-950 px-3 py-2 text-white">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          aria-label={silent ? "Unmute video" : "Mute video"}
          disabled={!ready}
          onClick={() =>
            onChange({ volume: audio.volume || 100, muted: !silent })
          }
          className="rounded p-1.5 hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-blue-400 disabled:opacity-50"
        >
          {silent ? (
            <VolumeX className="size-4" />
          ) : (
            <Volume2 className="size-4" />
          )}
        </button>
        <input
          type="range"
          aria-label="Video volume"
          aria-valuetext={`${audio.volume}%${audio.muted ? ", muted" : ""}`}
          min={0}
          max={100}
          step={1}
          value={audio.volume}
          disabled={!ready}
          onChange={(event) => {
            const volume = Number(event.target.value)
            onChange({ volume, muted: volume === 0 })
          }}
          className="w-24 min-w-0 cursor-pointer accent-blue-400 disabled:opacity-50 sm:w-32"
        />
        <span className="min-w-12 text-xs text-slate-200 tabular-nums">
          {silent ? "Muted" : `${audio.volume}%`}
        </span>
        <button
          type="button"
          disabled={!ready}
          onClick={onRestore}
          title="Unmute, set volume to 100%, and play"
          className="ml-auto rounded border border-white/25 px-2 py-1 text-xs font-medium hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-blue-400 disabled:opacity-50"
        >
          Restore sound
        </button>
      </div>
      {notice && (
        <p role="status" className="text-xs text-amber-200">
          {notice}
        </p>
      )}
    </div>
  )
}
