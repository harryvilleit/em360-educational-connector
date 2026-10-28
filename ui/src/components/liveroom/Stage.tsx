import { useMemo } from "react"
import { MonitorUp, WifiOff } from "lucide-react"
import { cn } from "@/lib/utils"
import { useLiveRoomStore } from "@/store/liveroom.store"
import { useLocalMediaContext } from "./localMedia.context"
import { useRoomMediaContext } from "./roomMedia.context"
import ParticipantTile from "./ParticipantTile"
import VideoSurface from "./VideoSurface"
import Whiteboard from "./Whiteboard"
import { CaptionBar, ReactionLayer } from "./CaptionBar"
import type { LiveParticipant } from "@/types/liveroom"

export default function Stage() {
  const layout = useLiveRoomStore((s) => s.layout)
  const participants = useLiveRoomStore((s) => s.participants)
  const pinnedId = useLiveRoomStore((s) => s.pinnedParticipantId)
  const pinParticipant = useLiveRoomStore((s) => s.pinParticipant)
  const settings = useLiveRoomStore((s) => s.settings)
  const selfName = useLiveRoomStore((s) => s.selfName)
  const camOn = useLiveRoomStore((s) => s.camOn)
  const micOn = useLiveRoomStore((s) => s.micOn)
  const handRaised = useLiveRoomStore((s) => s.handRaised)
  const screenSharing = useLiveRoomStore((s) => s.screenSharing)

  const { stream: localStream } = useLocalMediaContext()
  const { remoteStreams, localScreenStream } = useRoomMediaContext()
  const audioOnly = settings.mediaProfile === "audio"

  /** Own tracks render locally; remote peers come from the Agora bridge. */
  const trackFor = (id: string) =>
    id === "self" ? localStream : remoteStreams[id] ?? null


  const self: LiveParticipant = useMemo(
    () => ({
      id: "self",
      name: selfName,
      initials: selfName
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase(),
      role: "participant",
      isSelf: true,
      micOn,
      camOn,
      isSharingScreen: screenSharing,
      handRaisedAt: handRaised ? 1 : null,
      connection: "good",
      joinedAt: "—",
    }),
    [selfName, micOn, camOn, screenSharing, handRaised]
  )

  const everyone = useMemo(() => [...participants, self], [participants, self])
  const speaker =
    everyone.find((p) => p.id === pinnedId) ??
    everyone.find((p) => p.isSharingScreen) ??
    everyone.find((p) => p.role === "host") ??
    everyone[0]

  /**
   * What to show on the shared-screen stage: our own screen track while we are
   * the presenter, otherwise the presenting peer's video (which IS their screen
   * once they start sharing).
   */
  const screenStream = screenSharing
    ? localScreenStream ?? null
    : speaker && !speaker.isSelf
      ? remoteStreams[speaker.id] ?? null
      : null

  const others = everyone.filter((p) => p.id !== speaker?.id)

  return (
    <div className="relative flex-1 overflow-hidden p-3">
      {/* Weak-connection notice — the most common failure in low-bandwidth schools. */}
      {settings.mediaProfile === "low" && (
        <div className="absolute inset-x-3 top-3 z-20 flex items-center justify-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-amber-500/15 px-3 py-1.5 text-[11px] font-medium text-amber-200">
            <WifiOff className="size-3.5" />
            Data saver on — video is limited to 240p so the class doesn't drop
          </span>
        </div>
      )}

      {layout === "whiteboard" && <Whiteboard />}

      {layout === "shared-screen" && (
        <div className="flex h-full gap-3">
          <div className="relative flex-1 overflow-hidden rounded-2xl bg-[#0E131C] ring-1 ring-white/10">
            {/*
              The presenter renders their own screen track — Agora never echoes a
              publisher's own stream back, so this is the only way they can see
              what they are sharing. Everyone else receives the screen on the
              presenter's existing uid, because startScreenShare unpublishes the
              camera and publishes the screen in its place.
            */}
            {screenStream ? (
              <VideoSurface stream={screenStream} />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                <span className="flex size-14 items-center justify-center rounded-2xl bg-blue-600/20 text-blue-300">
                  <MonitorUp className="size-6" />
                </span>
                <p className="text-sm font-medium text-white">
                  {speaker?.isSelf ? "You are presenting" : `${speaker?.name} is presenting`}
                </p>
                <p className="max-w-xs text-xs leading-relaxed text-white/45">
                  Waiting for the shared screen to arrive…
                </p>
              </div>
            )}
            <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-2.5 py-1 text-[11px] font-medium text-white">
              <MonitorUp className="size-3" />
              Screen share
            </span>
          </div>
          <div className="hidden w-36 shrink-0 flex-col gap-2 overflow-y-auto md:flex">
            {everyone.slice(0, 8).map((p) => (
              <ParticipantTile
                key={p.id}
                participant={p}
                size="thumb"
                audioOnly={audioOnly}
                stream={trackFor(p.id)}
                mirrored={p.isSelf && settings.mirrorSelfView}
                className="w-full"
              />
            ))}
          </div>
        </div>
      )}

      {layout === "speaker" && (
        <div className="flex h-full flex-col gap-3">
          <div className="min-h-0 flex-1">
            {speaker && (
              <ParticipantTile
                participant={speaker}
                size="stage"
                audioOnly={audioOnly}
                stream={trackFor(speaker.id)}
                mirrored={speaker.isSelf && settings.mirrorSelfView}
                pinned={pinnedId === speaker.id}
                onPin={() => pinParticipant(pinnedId === speaker.id ? null : speaker.id)}
              />
            )}
          </div>
          <div className="flex shrink-0 gap-2 overflow-x-auto pb-1">
            {others.map((p) => (
              <ParticipantTile
                key={p.id}
                participant={p}
                size="thumb"
                audioOnly={audioOnly}
                stream={trackFor(p.id)}
                mirrored={p.isSelf && settings.mirrorSelfView}
                className="shrink-0"
              />
            ))}
          </div>
        </div>
      )}

      {layout === "grid" && (
        <div
          className={cn(
            "grid h-full auto-rows-fr gap-2 overflow-y-auto",
            everyone.length <= 4
              ? "grid-cols-2"
              : everyone.length <= 9
                ? "grid-cols-2 sm:grid-cols-3"
                : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
          )}
        >
          {everyone.map((p) => (
            <ParticipantTile
              key={p.id}
              participant={p}
              audioOnly={audioOnly}
              stream={trackFor(p.id)}
              mirrored={p.isSelf && settings.mirrorSelfView}
              pinned={pinnedId === p.id}
              onPin={() => pinParticipant(pinnedId === p.id ? null : p.id)}
            />
          ))}
        </div>
      )}

      <CaptionBar />
      <ReactionLayer />
    </div>
  )
}
