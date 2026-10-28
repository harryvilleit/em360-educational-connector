import {
  Grid2x2,
  Lock,
  PanelsTopLeft,
  PenTool,
  ShieldCheck,
  Signal,
  Users,
} from "lucide-react"
import { useLiveRoomStore, selectIsHost } from "@/store/liveroom.store"
import { Pill, Segmented } from "./primitives"
import type { StageLayout } from "@/types/liveroom"

interface TopBarProps {
  title: string
  subtitle: string
}

export default function TopBar({ title, subtitle }: TopBarProps) {
  const isHost = useLiveRoomStore(selectIsHost)
  const layout = useLiveRoomStore((s) => s.layout)
  const setLayout = useLiveRoomStore((s) => s.setLayout)
  const setPanel = useLiveRoomStore((s) => s.setPanel)
  const participants = useLiveRoomStore((s) => s.participants)
  const settings = useLiveRoomStore((s) => s.settings)
  const breakouts = useLiveRoomStore((s) => s.breakouts)

  const layoutOptions: {
    value: StageLayout
    label: string
    icon: React.ReactNode
  }[] = [
    { value: "speaker", label: "Speaker", icon: <PanelsTopLeft /> },
    { value: "grid", label: "Grid", icon: <Grid2x2 /> },
    { value: "whiteboard", label: "Board", icon: <PenTool /> },
  ]

  return (
    <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-2.5">
      {/* Lesson identity — pulled straight from the timetable entry */}
      <div className="flex min-w-0 items-center gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-sm font-semibold text-white">
              {title}
            </h1>
            <Pill tone="live">
              <span className="size-1.5 animate-pulse rounded-full bg-red-400" />
              Live
            </Pill>
          </div>
          <p className="truncate text-xs text-white/45">{subtitle}</p>
        </div>
      </div>

      {/* Layout + room status */}
      <div className="flex items-center gap-2">
        <Segmented
          value={layout}
          onChange={setLayout}
          options={layoutOptions}
          size="sm"
        />

        {breakouts.startedAt && (
          <Pill tone="info">
            {breakouts.rooms.length} breakout rooms ·{" "}
            {breakouts.durationMinutes}m
          </Pill>
        )}

        <button
          type="button"
          onClick={() => setPanel("people")}
          className="inline-flex items-center gap-1.5 rounded-full bg-white/8 px-2.5 py-1 text-[11px] font-medium text-white/70 transition hover:bg-white/15 hover:text-white"
        >
          <Users className="size-3.5" />
          {participants.length + 1}
        </button>

        <button
          type="button"
          onClick={() =>
            isHost && useLiveRoomStore.getState().setSettingsOpen(true)
          }
          title={
            settings.encryption === "e2ee"
              ? "End-to-end encrypted — captions and AI summaries are off"
              : "Encrypted in transit (SRTP/TLS) and at rest"
          }
          className="inline-flex items-center gap-1.5 rounded-full bg-white/8 px-2.5 py-1 text-[11px] font-medium text-white/70 transition hover:bg-white/15 hover:text-white"
        >
          {settings.encryption === "e2ee" ? (
            <Lock className="size-3.5 text-emerald-400" />
          ) : (
            <ShieldCheck className="size-3.5 text-blue-400" />
          )}
          {settings.encryption === "e2ee" ? "E2E encrypted" : "Encrypted"}
        </button>

        <Pill tone={settings.dataSaver ? "warn" : "good"}>
          <Signal className="size-3" />
          {settings.mediaProfile === "hd"
            ? "HD"
            : settings.mediaProfile === "sd"
              ? "Standard"
              : settings.mediaProfile === "low"
                ? "Data saver"
                : "Audio only"}
        </Pill>
      </div>
    </header>
  )
}
