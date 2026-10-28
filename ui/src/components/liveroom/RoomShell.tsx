import { useEffect, useMemo } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Hand, Sparkles, X } from "lucide-react"
import {
  useLiveRoomStore,
  selectIsHost,
  getRaisedHands,
} from "@/store/liveroom.store"
import TopBar from "./TopBar"
import Stage from "./Stage"
import SidePanel from "./SidePanel"
import ControlBar from "./ControlBar"
import SettingsDialog from "./SettingsDialog"
import { DeniedScreen, PreJoin, WaitingScreen } from "./Lobby"
import { useLocalMedia } from "@/hooks/liveroom/useLocalMedia"
import { useLiveRoomBridge } from "@/hooks/liveroom/useLiveRoomBridge"
import { LocalMediaContext, type LocalMediaValue } from "./localMedia.context"
import { RoomMediaContext } from "./roomMedia.context"
import type { LiveRoomRole } from "@/types/liveroom"

interface RoomShellProps {
  title: string
  subtitle: string
  role: LiveRoomRole
  selfName: string
  onExit: () => void
  /**
   * The backend LiveClass id. When provided, the room runs on real Agora +
   * backend admission. When omitted, the room keeps its mock-store behaviour
   * (useful for design/preview).
   */
  liveClassId?: string
  /** Passed to the backend Join when a student joins (roster match). */
  studentId?: string
  /** False until the assigned teacher has started it — students wait. */
  sessionStarted?: boolean
  /** Shown to anyone waiting, so they know who they're waiting for. */
  assignedTeacherName?: string
  /** Host only. Flips the session to live. */
  onStart?: () => Promise<boolean> | boolean | void
  isGuest?: boolean
  viewOnly?: boolean
}

export default function RoomShell({
  title,
  subtitle,
  role,
  selfName,
  onExit,
  liveClassId,
  studentId,
  sessionStarted = true,
  assignedTeacherName,
  onStart,
  isGuest = false,
  viewOnly = false,
}: RoomShellProps) {
  const admission = useLiveRoomStore((s) => s.admission)
  const initRoom = useLiveRoomStore((s) => s.initRoom)
  const reset = useLiveRoomStore((s) => s.reset)
  const camOn = useLiveRoomStore((s) => s.camOn)
  const micOn = useLiveRoomStore((s) => s.micOn)
  const settings = useLiveRoomStore((s) => s.settings)

  // Real Agora + backend admission. No-ops (and the store keeps mock behaviour)
  // when liveClassId is not supplied.
  const bridge = useLiveRoomBridge({
    liveClassId,
    displayName: selfName,
    studentId,
    isHost: role === "host" || role === "cohost",
  })
  const spectator = viewOnly || bridge.isSpectator

  const usingAgora = !!liveClassId

  // Prejoin preview uses getUserMedia. Once admitted with a real class, Agora
  // owns the camera, so we stop this acquisition to avoid a "camera in use"
  // clash and feed Agora's own local stream into the self tile instead.
  const localMedia = useLocalMedia({
    camOn,
    micOn,
    mediaProfile: settings.mediaProfile,
    cameraDeviceId: settings.cameraDeviceId,
    micDeviceId: settings.micDeviceId,
    enabled: !spectator &&
      (admission === "prejoin" || (admission === "admitted" && !usingAgora)),
  })

  const localMediaValue: LocalMediaValue = useMemo(() => {
    if (usingAgora && admission === "admitted" && bridge.localStream) {
      return {
        stream: bridge.localStream,
        error: null,
        acquiring: false,
        retry: () => {},
      }
    }
    return localMedia
  }, [usingAgora, admission, bridge.localStream, localMedia])

  useEffect(() => {
    initRoom(role, selfName, "prejoin", isGuest)
    if (viewOnly) useLiveRoomStore.setState({ micOn: false, camOn: false })
    return () => reset()
  }, [initRoom, reset, role, selfName, isGuest, viewOnly])

  useEffect(() => {
    if (bridge.isSpectator) useLiveRoomStore.setState({ micOn: false, camOn: false })
  }, [bridge.isSpectator])

  return (
    <LocalMediaContext.Provider value={localMediaValue}>
      <RoomMediaContext.Provider
        value={{
          remoteStreams: bridge.remoteStreams,
          localScreenStream: bridge.localScreenStream,
        }}
      >
        <div className="fixed inset-0 z-40 flex flex-col bg-[#0B0F17] text-white">
          {admission === "prejoin" && (
            <PreJoin
              title={title}
              subtitle={subtitle}
              onCancel={onExit}
              sessionStarted={sessionStarted}
              assignedTeacherName={assignedTeacherName}
              onStart={onStart}
              liveClassId={liveClassId}
              viewOnly={viewOnly}
            />
          )}
          {admission === "waiting" && (
            <WaitingScreen
              title={title}
              subtitle={subtitle}
              onCancel={onExit}
              assignedTeacherName={assignedTeacherName}
            />
          )}
          {(admission === "denied" || admission === "removed") && (
            <DeniedScreen onCancel={onExit} />
          )}

          {admission === "admitted" && (
            <>
              <TopBar title={title} subtitle={subtitle} />
              <div className="flex min-h-0 flex-1">
                <div className="flex min-w-0 flex-1 flex-col">
                  <Stage />
                </div>
                <SidePanel />
              </div>
              <ControlBar viewOnly={spectator} />
              <HandRaiseToast />
            </>
          )}

          <SettingsDialog />
          <LeaveDialog onExit={onExit} />
        </div>
      </RoomMediaContext.Provider>
    </LocalMediaContext.Provider>
  )
}

/** Host-only nudge when a student raises a hand and the People panel is closed. */
function HandRaiseToast() {
  const isHost = useLiveRoomStore(selectIsHost)
  const participants = useLiveRoomStore((s) => s.participants)
  const raised = useMemo(() => getRaisedHands(participants), [participants])
  const panel = useLiveRoomStore((s) => s.panel)
  const setPanel = useLiveRoomStore((s) => s.setPanel)
  const lowerAllHands = useLiveRoomStore((s) => s.lowerAllHands)

  const show = isHost && raised.length > 0 && panel !== "people"

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          className="absolute right-4 bottom-24 z-30 flex items-center gap-3 rounded-xl bg-[#1A2130] py-2.5 pr-2 pl-3 shadow-2xl ring-1 ring-white/10"
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-amber-400 text-gray-900">
            <Hand className="size-4" />
          </span>
          <div>
            <p className="text-xs font-medium text-white">
              {raised[0].name.split(" ")[0]}
              {raised.length > 1 ? ` and ${raised.length - 1} more` : ""} raised
              a hand
            </p>
            <button
              type="button"
              onClick={() => setPanel("people")}
              className="text-[11px] font-medium text-blue-300 hover:underline"
            >
              See the queue
            </button>
          </div>
          <button
            type="button"
            onClick={lowerAllHands}
            aria-label="Dismiss"
            className="flex size-6 items-center justify-center rounded-lg text-white/35 hover:bg-white/10 hover:text-white"
          >
            <X className="size-3.5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/** Leave / end class. Hosts get the extra choice of ending it for everyone. */
function LeaveDialog({ onExit }: { onExit: () => void }) {
  const open = useLiveRoomStore((s) => s.leaveConfirmOpen)
  const setOpen = useLiveRoomStore((s) => s.setLeaveConfirmOpen)
  const isHost = useLiveRoomStore(selectIsHost)

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Cancel"
        onClick={() => setOpen(false)}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-sm rounded-2xl bg-[#111827] p-5 shadow-2xl ring-1 ring-white/10"
      >
        <h2 className="text-sm font-semibold text-white">
          {isHost ? "End the class for everyone?" : "Leave this class?"}
        </h2>
        <p className="mt-2 text-xs leading-relaxed text-white/55">
          {isHost
            ? "Everyone is returned to their portal. You can reopen the class from the timetable."
            : "You can rejoin while the class is still running."}
        </p>

        {isHost && (
          <label className="mt-3 flex cursor-pointer items-start gap-2 rounded-xl bg-white/5 p-3">
            <input
              type="checkbox"
              defaultChecked
              className="mt-0.5 size-3.5 rounded border-white/25 bg-white/8 accent-blue-600"
            />
            <span className="text-[11px] leading-relaxed text-white/60">
              <span className="inline-flex items-center gap-1 font-medium text-white">
                <Sparkles className="size-3 text-blue-400" />
                Write the lesson summary
              </span>
              <span className="mt-0.5 block">
                Keep a short recap for this lesson in the class history.
              </span>
            </span>
          </label>
        )}

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex-1 rounded-xl bg-white/8 py-2.5 text-xs font-medium text-white hover:bg-white/15"
          >
            Stay
          </button>
          <button
            type="button"
            onClick={() => {
              setOpen(false)
              onExit()
            }}
            className="flex-1 rounded-xl bg-red-600 py-2.5 text-xs font-medium text-white hover:bg-red-700"
          >
            {isHost ? "End class" : "Leave"}
          </button>
        </div>
      </div>
    </div>
  )
}
