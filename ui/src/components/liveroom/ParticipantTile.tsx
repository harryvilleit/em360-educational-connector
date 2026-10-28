import { Hand, MicOff, MonitorUp, Pin, VideoOff } from "lucide-react"
import { cn } from "@/lib/utils"
import { ConnectionBars, RoomAvatar } from "./primitives"
import VideoSurface from "./VideoSurface"
import { reactionEmoji } from "./constants"
import type { LiveParticipant } from "@/types/liveroom"

interface ParticipantTileProps {
  participant: LiveParticipant
  size?: "thumb" | "grid" | "stage"
  pinned?: boolean
  onPin?: () => void
  /** In audio-only / data-saver mode we never paint a video surface. */
  audioOnly?: boolean
  /** Live track for this participant. Local media today, remote peers later. */
  stream?: MediaStream | null
  mirrored?: boolean
  className?: string
}

export default function ParticipantTile({
  participant,
  size = "grid",
  pinned,
  onPin,
  audioOnly,
  stream,
  mirrored,
  className,
}: ParticipantTileProps) {
  const showVideo = participant.camOn && !audioOnly
  const isThumb = size === "thumb"

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl bg-[#151B26] ring-1 transition",
        participant.isSpeaking && participant.micOn
          ? "ring-2 ring-emerald-400/80"
          : "ring-white/10",
        isThumb ? "aspect-video w-32" : "aspect-video w-full",
        size === "stage" && "h-full w-full rounded-2xl",
        className
      )}
    >
      {/* Video surface. Local media renders for real; remote peers still use the
          placeholder until the Agora track renderer is attached here. */}
      {showVideo ? (
        <div
          data-video-surface={participant.id}
          className="absolute inset-0 bg-gradient-to-br from-[#1E2634] via-[#161D28] to-[#10151E]"
        >
          {stream ? (
            <VideoSurface stream={stream} mirrored={mirrored} />
          ) : (
            <div className="flex h-full items-center justify-center">
              <RoomAvatar
                initials={participant.initials}
                seed={participant.id}
                size={size === "stage" ? "xl" : isThumb ? "sm" : "lg"}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#111722]">
          <RoomAvatar
            initials={participant.initials}
            seed={participant.id}
            size={size === "stage" ? "xl" : isThumb ? "sm" : "lg"}
          />
          {!isThumb && (
            <span className="inline-flex items-center gap-1 text-[10px] text-white/40">
              <VideoOff className="size-3" />
              {audioOnly ? "Audio only" : "Camera off"}
            </span>
          )}
        </div>
      )}

      {/* Raised hand */}
      {participant.handRaisedAt && (
        <span className="absolute top-2 left-2 flex size-6 items-center justify-center rounded-full bg-amber-400 text-gray-900 shadow-lg">
          <Hand className="size-3.5" />
        </span>
      )}

      {/* Live reaction */}
      {participant.reaction && (
        <span className="absolute top-2 right-2 text-lg">
          {reactionEmoji(participant.reaction.kind)}
        </span>
      )}

      {/* Screen share marker */}
      {participant.isSharingScreen && (
        <span className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-medium text-white">
          <MonitorUp className="size-3" />
          Presenting
        </span>
      )}

      {/* Name plate */}
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-black/80 to-transparent px-2 pt-6 pb-1.5">
        <span className="flex min-w-0 items-center gap-1.5">
          {!participant.micOn && <MicOff className="size-3 shrink-0 text-red-400" />}
          <span
            className={cn(
              "truncate font-medium text-white",
              isThumb ? "text-[10px]" : "text-xs"
            )}
          >
            {participant.isSelf ? "You" : participant.name}
          </span>
          {participant.role !== "participant" && !isThumb && (
            <span className="shrink-0 rounded bg-white/15 px-1 py-px text-[9px] tracking-wide text-white/70 uppercase">
              {participant.role === "host" ? "Host" : "Co-host"}
            </span>
          )}
        </span>
        <ConnectionBars quality={participant.connection} className="shrink-0" />
      </div>

      {/* Pin affordance */}
      {onPin && !isThumb && (
        <button
          type="button"
          onClick={onPin}
          aria-label={pinned ? `Unpin ${participant.name}` : `Pin ${participant.name}`}
          className={cn(
            "absolute top-2 right-2 flex size-7 items-center justify-center rounded-lg bg-black/50 text-white opacity-0 transition group-hover:opacity-100 focus-visible:opacity-100",
            pinned && "opacity-100 bg-blue-600"
          )}
        >
          <Pin className="size-3.5" />
        </button>
      )}
    </div>
  )
}
