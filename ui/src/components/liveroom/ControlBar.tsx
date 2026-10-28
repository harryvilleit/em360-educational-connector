import { useMemo, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
  BarChart3,
  Captions,
  ChevronUp,
  DoorOpen,
  Hand,
  Mic,
  MicOff,
  MonitorUp,
  MoreHorizontal,
  PhoneOff,
  Settings,
  Smile,
  Sparkles,
  Split,
  Users,
  Video,
  VideoOff,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  useLiveRoomStore,
  selectIsHost,
  getRaisedHands,
} from "@/store/liveroom.store"
import { ControlButton } from "./primitives"
import { REACTIONS } from "./constants"

export default function ControlBar({ viewOnly = false }: { viewOnly?: boolean }) {
  const [reactionsOpen, setReactionsOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)

  const isHost = useLiveRoomStore(selectIsHost)
  const participants = useLiveRoomStore((s) => s.participants)
  const raisedHands = useMemo(
    () => getRaisedHands(participants),
    [participants]
  )
  const micOn = useLiveRoomStore((s) => s.micOn)
  const camOn = useLiveRoomStore((s) => s.camOn)
  const screenSharing = useLiveRoomStore((s) => s.screenSharing)
  const handRaised = useLiveRoomStore((s) => s.handRaised)
  const panel = useLiveRoomStore((s) => s.panel)
  const settings = useLiveRoomStore((s) => s.settings)
  const policy = useLiveRoomStore((s) => s.policy)
  const waiting = useLiveRoomStore((s) => s.waiting)
  const polls = useLiveRoomStore((s) => s.polls)

  // Actions are created once and never replaced, so these never re-render.
  const toggleMic = useLiveRoomStore((s) => s.toggleMic)
  const toggleCam = useLiveRoomStore((s) => s.toggleCam)
  const toggleScreenShare = useLiveRoomStore((s) => s.toggleScreenShare)
  const toggleHand = useLiveRoomStore((s) => s.toggleHand)
  const sendReaction = useLiveRoomStore((s) => s.sendReaction)
  const setPanel = useLiveRoomStore((s) => s.setPanel)
  const setSettingsOpen = useLiveRoomStore((s) => s.setSettingsOpen)
  const setLeaveConfirmOpen = useLiveRoomStore((s) => s.setLeaveConfirmOpen)
  const toggleCaptions = useLiveRoomStore((s) => s.toggleCaptions)

  const micLocked = !isHost && !policy.participantsCanUnmute && !micOn
  const sharingLocked = !isHost && !policy.participantsCanShareScreen
  const openPolls = polls.filter((p) => p.status === "open").length

  return (
    <footer className="relative flex shrink-0 items-center justify-between gap-2 border-t border-white/10 px-3 py-2">
      {/* Left: media */}
      <div className="flex items-center gap-1">
        <ControlButton
          label={micOn ? "Mute" : micLocked ? "Muted by host" : "Unmute"}
          icon={micOn ? <Mic /> : <MicOff />}
          tone={micOn ? "neutral" : "danger"}
          disabled={viewOnly || micLocked}
          onClick={toggleMic}
        />
        <ControlButton
          label={camOn ? "Stop video" : "Start video"}
          icon={camOn ? <Video /> : <VideoOff />}
          tone={camOn ? "neutral" : "danger"}
          disabled={viewOnly || settings.mediaProfile === "audio"}
          onClick={toggleCam}
        />
        <ControlButton
          label={
            screenSharing
              ? "Stop sharing"
              : sharingLocked
                ? "Sharing is off"
                : "Share screen"
          }
          icon={<MonitorUp />}
          tone={screenSharing ? "active" : "neutral"}
          disabled={viewOnly || sharingLocked}
          onClick={toggleScreenShare}
        />
      </div>

      {/* Centre: participation */}
      <div className="flex items-center gap-1">
        <ControlButton
          label="Raise hand"
          icon={<Hand />}
          tone={handRaised ? "active" : "neutral"}
          badge={isHost ? raisedHands.length : undefined}
          onClick={toggleHand}
        />

        <div className="relative">
          <ControlButton
            label="React"
            icon={<Smile />}
            tone={reactionsOpen ? "active" : "neutral"}
            aria-expanded={reactionsOpen}
            onClick={() => setReactionsOpen((v) => !v)}
          />
          <AnimatePresence>
            {reactionsOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute bottom-full left-1/2 z-40 mb-3 -translate-x-1/2 rounded-2xl bg-[#161C28] p-1.5 shadow-2xl ring-1 ring-white/10"
              >
                <div className="flex items-center gap-0.5">
                  {REACTIONS.map((r) => (
                    <button
                      key={r.kind}
                      type="button"
                      title={r.label}
                      aria-label={r.label}
                      onClick={() => {
                        sendReaction(r.kind)
                        setReactionsOpen(false)
                      }}
                      className="flex size-10 items-center justify-center rounded-xl text-xl transition hover:scale-110 hover:bg-white/10"
                    >
                      {r.emoji}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <ControlButton
          label="People"
          icon={<Users />}
          tone={panel === "people" ? "active" : "neutral"}
          badge={isHost ? waiting.length : undefined}
          onClick={() => setPanel("people")}
        />
        <ControlButton
          label="Polls"
          icon={<BarChart3 />}
          tone={panel === "polls" ? "active" : "neutral"}
          badge={openPolls}
          onClick={() => setPanel("polls")}
        />
        <ControlButton
          label="Captions"
          icon={<Captions />}
          tone={settings.captionsOn ? "active" : "neutral"}
          onClick={toggleCaptions}
          className="hidden sm:flex"
        />

        {/* Host-only cluster */}
        {isHost && (
          <>
            <span className="mx-1 hidden h-8 w-px bg-white/10 md:block" />
            <ControlButton
              label="Breakouts"
              icon={<Split />}
              tone={panel === "breakouts" ? "active" : "neutral"}
              onClick={() => setPanel("breakouts")}
              className="hidden md:flex"
            />
            <ControlButton
              label="Summary"
              icon={<Sparkles />}
              tone={panel === "summary" ? "active" : "neutral"}
              disabled={settings.encryption === "e2ee"}
              onClick={() => setPanel("summary")}
              className="hidden md:flex"
            />
          </>
        )}

        {/* Overflow for small screens */}
        <div className="relative md:hidden">
          <ControlButton
            label="More"
            icon={<MoreHorizontal />}
            tone={moreOpen ? "active" : "neutral"}
            onClick={() => setMoreOpen((v) => !v)}
          />
          <AnimatePresence>
            {moreOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="absolute right-0 bottom-full z-40 mb-3 w-52 overflow-hidden rounded-xl bg-[#161C28] py-1 shadow-2xl ring-1 ring-white/10"
              >
                {[
                  {
                    label: "Live captions",
                    icon: <Captions />,
                    onClick: toggleCaptions,
                  },
                  ...(isHost
                    ? [
                        {
                          label: "Breakout rooms",
                          icon: <Split />,
                          onClick: () => setPanel("breakouts"),
                        },
                        {
                          label: "AI summary",
                          icon: <Sparkles />,
                          onClick: () => setPanel("summary"),
                        },
                        {
                          label: "Waiting room",
                          icon: <DoorOpen />,
                          onClick: () => setPanel("people"),
                        },
                      ]
                    : []),
                  {
                    label: "Settings",
                    icon: <Settings />,
                    onClick: () => setSettingsOpen(true),
                  },
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => {
                      item.onClick()
                      setMoreOpen(false)
                    }}
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-white/80 hover:bg-white/8 hover:text-white [&_svg]:size-4"
                  >
                    {item.icon}
                    {item.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Right: settings + leave */}
      <div className="flex items-center gap-1">
        <ControlButton
          label="Settings"
          icon={<Settings />}
          onClick={() => setSettingsOpen(true)}
          className="hidden sm:flex"
        />
        <button
          type="button"
          onClick={() => setLeaveConfirmOpen(true)}
          className={cn(
            "inline-flex h-11 items-center gap-2 rounded-full bg-red-600 px-4 text-sm font-medium text-white transition",
            "hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none"
          )}
        >
          <PhoneOff className="size-4" />
          <span className="hidden sm:inline">
            {isHost ? "End class" : "Leave"}
          </span>
        </button>
      </div>
    </footer>
  )
}

export function CollapsedHint() {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] text-white/40">
      <ChevronUp className="size-3" />
      More controls
    </span>
  )
}
