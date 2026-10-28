import { useEffect, useState } from "react"
import {
  ArrowLeft,
  CameraOff,
  Circle,
  Clock,
  Gauge,
  Loader2,
  Lock,
  Mic,
  MicOff,
  RefreshCw,
  Settings,
  ShieldCheck,
  UserCheck,
  Video,
  VideoOff,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useLiveRoomStore, selectIsHost } from "@/store/liveroom.store"
import { useGetEnrolledCount } from "@/hooks/liveClass"
import { ConnectionBars, RoomAvatar, Segmented } from "./primitives"
import VideoSurface from "./VideoSurface"
import { useLocalMediaContext } from "./localMedia.context"
import type { MediaProfile } from "@/types/liveroom"

interface LobbyProps {
  title: string
  subtitle: string
  onCancel: () => void
  assignedTeacherName?: string
}

interface PreJoinProps extends LobbyProps {
  sessionStarted?: boolean
  onStart?: () => Promise<boolean> | boolean | void
  liveClassId?: string
  viewOnly?: boolean
}

/**
 * Pre-join. Everything a student needs to check before they burn data:
 * their devices, what the class will cost them in bandwidth, and whether
 * the lesson is being recorded.
 */
export function PreJoin({
  title,
  subtitle,
  onCancel,
  sessionStarted = true,
  assignedTeacherName,
  onStart,
  liveClassId,
  viewOnly = false,
}: PreJoinProps) {
  const isHost = useLiveRoomStore(selectIsHost)
  const micOn = useLiveRoomStore((s) => s.micOn)
  const camOn = useLiveRoomStore((s) => s.camOn)
  const selfName = useLiveRoomStore((s) => s.selfName)
  const settings = useLiveRoomStore((s) => s.settings)
  const policy = useLiveRoomStore((s) => s.policy)
  const { enrolledCount } = useGetEnrolledCount(liveClassId)
  const toggleMic = useLiveRoomStore((s) => s.toggleMic)
  const toggleCam = useLiveRoomStore((s) => s.toggleCam)
  const setMediaProfile = useLiveRoomStore((s) => s.setMediaProfile)
  const setSettingsOpen = useLiveRoomStore((s) => s.setSettingsOpen)
  const setAdmission = useLiveRoomStore((s) => s.setAdmission)
  const { stream, error, acquiring, retry } = useLocalMediaContext()
  const [starting, setStarting] = useState(false)

  const initials = selfName
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  const isGuest = useLiveRoomStore((s) => s.isGuest)

  // An assigned teacher can claim the host role when starting the class.
  const canStart = isHost
  const blocked = !canStart && !sessionStarted

  const join = async () => {
    if (blocked || starting) return
    if (canStart && !sessionStarted && onStart) {
      setStarting(true)
      try {
        if (await onStart() === false) return
      } catch {
        return
      } finally {
        setStarting(false)
      }
    }
    // Guests always go through the waiting room, whatever the class policy says.
    if (!isHost && !viewOnly && (policy.waitingRoomEnabled || isGuest))
      setAdmission("waiting")
    else setAdmission("admitted")
  }

  return (
    <div className="flex h-full items-center justify-center overflow-y-auto p-4">
      <div className="w-full max-w-4xl">
        <button
          type="button"
          onClick={onCancel}
          className="mb-4 inline-flex items-center gap-1.5 text-xs text-white/50 transition hover:text-white"
        >
          <ArrowLeft className="size-3.5" />
          Back to classes
        </button>

        <div className="grid gap-5 md:grid-cols-[1.4fr_1fr]">
          {/* Camera preview */}
          <div>
            <div className="relative aspect-video overflow-hidden rounded-2xl bg-[#111722] ring-1 ring-white/10">
              {error ? (
                <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
                  <span className="flex size-10 items-center justify-center rounded-full bg-amber-500/15 text-amber-300">
                    <CameraOff className="size-5" />
                  </span>
                  <p className="text-sm font-medium text-white">
                    {error.title}
                  </p>
                  <p className="max-w-xs text-xs leading-relaxed text-white/50">
                    {error.detail}
                  </p>
                  <button
                    type="button"
                    onClick={retry}
                    className="mt-1 inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/20"
                  >
                    <RefreshCw className="size-3.5" />
                    Retry
                  </button>
                </div>
              ) : camOn && stream ? (
                <VideoSurface
                  stream={stream}
                  mirrored={settings.mirrorSelfView}
                />
              ) : acquiring ? (
                <div className="flex h-full items-center justify-center">
                  <Loader2 className="size-5 animate-spin text-white/40" />
                </div>
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2">
                  <RoomAvatar initials={initials} seed={selfName} size="xl" />
                  <span className="inline-flex items-center gap-1.5 text-xs text-white/40">
                    <VideoOff className="size-3.5" />
                    Camera off
                  </span>
                </div>
              )}

              <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 p-3">
                <button
                  type="button"
                  onClick={toggleMic}
                  disabled={viewOnly}
                  aria-label={micOn ? "Mute microphone" : "Unmute microphone"}
                  className={cn(
                    "flex size-10 items-center justify-center rounded-full transition [&_svg]:size-4",
                    micOn
                      ? "bg-white/15 text-white hover:bg-white/25"
                      : "bg-red-500 text-white"
                  )}
                >
                  {micOn ? <Mic /> : <MicOff />}
                </button>
                <button
                  type="button"
                  onClick={toggleCam}
                  disabled={viewOnly}
                  aria-label={camOn ? "Turn camera off" : "Turn camera on"}
                  className={cn(
                    "flex size-10 items-center justify-center rounded-full transition [&_svg]:size-4",
                    camOn
                      ? "bg-white/15 text-white hover:bg-white/25"
                      : "bg-red-500 text-white"
                  )}
                >
                  {camOn ? <Video /> : <VideoOff />}
                </button>
                <button
                  type="button"
                  onClick={() => setSettingsOpen(true)}
                  aria-label="Open settings"
                  className="flex size-10 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25 [&_svg]:size-4"
                >
                  <Settings />
                </button>
              </div>
            </div>

            {/* Bandwidth choice up front — this is the decision that matters most here */}
            <div className="mt-3 rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
              <div className="mb-2 flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-white">
                  <Gauge className="size-3.5 text-blue-400" />
                  Video quality
                </span>
                <span className="inline-flex items-center gap-1.5 text-[11px] text-white/45">
                  <ConnectionBars quality="fair" />
                  Your connection looks fair
                </span>
              </div>
              <Segmented
                value={settings.mediaProfile}
                onChange={(v: MediaProfile) => setMediaProfile(v)}
                size="sm"
                options={[
                  { value: "hd", label: "HD" },
                  { value: "sd", label: "Standard" },
                  { value: "low", label: "Data saver" },
                  { value: "audio", label: "Audio only" },
                ]}
              />
              <p className="mt-2 text-[11px] leading-relaxed text-white/45">
                {settings.mediaProfile === "hd" &&
                  "About 1.4 GB an hour. Use on wifi."}
                {settings.mediaProfile === "sd" &&
                  "About 500 MB an hour. Recommended."}
                {settings.mediaProfile === "low" &&
                  "About 200 MB an hour on a 3G phone."}
                {settings.mediaProfile === "audio" &&
                  "About 30 MB an hour. You'll still get the board and polls."}
              </p>
            </div>
          </div>

          {/* Class details */}
          <div className="flex flex-col">
            <h1 className="text-lg leading-snug font-semibold text-white">
              {title}
            </h1>
            <p className="mt-1 text-xs text-white/50">{subtitle}</p>

            <div className="mt-4 space-y-2 border-y border-white/10 py-4">
              {enrolledCount > 0 && (
                <div className="flex items-center gap-2 text-xs text-white/60">
                  <span className="flex size-5 items-center justify-center rounded-full bg-blue-500/15 text-blue-300">
                    <UserCheck className="size-3" />
                  </span>
                  {enrolledCount} student{enrolledCount !== 1 ? "s" : ""}{" "}
                  enrolled
                </div>
              )}
              <p className="flex items-center gap-2 text-xs text-white/60">
                <Circle className="size-3.5 shrink-0 fill-red-500 text-red-500" />
                This lesson will be recorded and saved to Recordings
              </p>
              <p className="flex items-center gap-2 text-xs text-white/60">
                {settings.encryption === "e2ee" ? (
                  <Lock className="size-3.5 shrink-0 text-emerald-400" />
                ) : (
                  <ShieldCheck className="size-3.5 shrink-0 text-blue-400" />
                )}
                Encrypted in transit and at rest
              </p>
              {isGuest && (
                <p className="flex items-center gap-2 text-xs text-white/60">
                  <UserCheck className="size-3.5 shrink-0 text-blue-400" />
                  Joining as a guest — the teacher approves you before you enter
                </p>
              )}
              {viewOnly && (
                <p className="text-xs text-blue-300">
                  Joining as an assigned teacher spectator. Your microphone and camera stay off.
                </p>
              )}
              {!isHost && !isGuest && policy.waitingRoomEnabled && (
                <p className="text-xs text-white/45">
                  Your teacher will let you in when the class starts.
                </p>
              )}
            </div>

            {blocked && (
              <p className="mt-4 flex items-start gap-2 rounded-xl bg-white/5 p-3 text-xs leading-relaxed text-white/60">
                <Clock className="mt-0.5 size-3.5 shrink-0 text-amber-400" />
                {assignedTeacherName
                  ? `${assignedTeacherName} hasn't started this class yet. The Join button turns on when they do.`
                  : "The teacher hasn't started this class yet."}
              </p>
            )}

            <button
              type="button"
              onClick={join}
              disabled={blocked || starting}
              className="mt-4 w-full rounded-xl bg-blue-600 py-3 text-sm font-medium text-white transition hover:bg-blue-500 focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-white/8 disabled:text-white/35"
            >
              {starting ? "Starting…" : canStart
                ? sessionStarted
                  ? "Rejoin the class"
                  : "Start the class"
                : blocked
                  ? "Waiting for the teacher"
                  : "Join class"}
            </button>
            <button
              type="button"
              disabled={blocked || starting}
              onClick={() => {
                setMediaProfile("audio")
                join()
              }}
              className="mt-2 w-full rounded-xl bg-white/8 py-2.5 text-xs font-medium text-white/80 transition hover:bg-white/15 disabled:cursor-not-allowed disabled:text-white/25"
            >
              Join with audio only
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/** Student-side waiting room. Deliberately calm and low-data. */
export function WaitingScreen({
  title,
  subtitle,
  onCancel,
  assignedTeacherName,
}: LobbyProps) {
  const setAdmission = useLiveRoomStore((s) => s.setAdmission)
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-blue-600/15">
        <Loader2 className="size-6 animate-spin text-blue-400" />
      </span>
      <div>
        <h1 className="text-base font-semibold text-white">
          {assignedTeacherName
            ? `Waiting for ${assignedTeacherName}`
            : "Waiting for your teacher"}
        </h1>
        <p className="mt-1 max-w-sm text-xs leading-relaxed text-white/50">
          You're in the waiting room for{" "}
          <span className="text-white/80">{title}</span>. You'll join
          automatically when you're admitted.
        </p>
        <p className="mt-1 text-xs text-white/35">{subtitle}</p>
      </div>

      <p className="text-[11px] text-white/30">
        Waiting {Math.floor(seconds / 60)}m {seconds % 60}s
      </p>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl bg-white/8 px-4 py-2 text-xs font-medium text-white/80 hover:bg-white/15"
        >
          Leave
        </button>
        {/* Demo affordance — the real app admits from the host's People panel. */}
        <button
          type="button"
          onClick={() => setAdmission("admitted")}
          className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-medium text-white hover:bg-blue-500"
        >
          Simulate being admitted
        </button>
      </div>
    </div>
  )
}

/** Shown when a host removes someone, or denies entry. */
export function DeniedScreen({ onCancel }: { onCancel: () => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
      <h1 className="text-base font-semibold text-white">
        You've left the class
      </h1>
      <p className="max-w-sm text-xs leading-relaxed text-white/50">
        If this was a mistake, ask your teacher to let you back in.
      </p>
      <button
        type="button"
        onClick={onCancel}
        className="mt-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-medium text-white hover:bg-blue-500"
      >
        Back to classes
      </button>
    </div>
  )
}
