import { useState } from "react"
import {
  AlertTriangle,
  Camera,
  Gauge,
  Headphones,
  Image as ImageIcon,
  Lock,
  Sparkles,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useLiveRoomStore, selectIsHost } from "@/store/liveroom.store"
import {
  CAPTION_LANGUAGES,
  VIRTUAL_BACKGROUND_PRESETS,
} from "@/data/liveroom.options"
import { RoomSwitch, Segmented } from "./primitives"
import VideoSurface from "./VideoSurface"
import { useLocalMediaContext } from "./localMedia.context"
import { useMediaDevices } from "@/hooks/liveroom/useLocalMedia"
import type { MediaProfile } from "@/types/liveroom"

type Tab = "devices" | "video" | "background" | "captions" | "privacy"

const PROFILE_COPY: Record<MediaProfile, { label: string; hint: string }> = {
  hd: {
    label: "HD 720p",
    hint: "~1.5 Mbps per person. Best on school wifi or fibre.",
  },
  sd: {
    label: "Standard 360p",
    hint: "~600 Kbps. The right default for most classes.",
  },
  low: {
    label: "Data saver 240p",
    hint: "~250 Kbps. Video drops first if the line struggles.",
  },
  audio: {
    label: "Audio only",
    hint: "~40 Kbps. Works on 2G/3G and a shared phone.",
  },
}

export default function SettingsDialog() {
  const open = useLiveRoomStore((s) => s.settingsOpen)
  const setOpen = useLiveRoomStore((s) => s.setSettingsOpen)
  const isHost = useLiveRoomStore(selectIsHost)
  const settings = useLiveRoomStore((s) => s.settings)
  const updateSettings = useLiveRoomStore((s) => s.updateSettings)
  const setMediaProfile = useLiveRoomStore((s) => s.setMediaProfile)

  const [tab, setTab] = useState<Tab>("devices")
  const { stream, error } = useLocalMediaContext()
  const { cameras, microphones, speakers } = useMediaDevices(Boolean(stream))

  if (!open) return null

  const allTabs: { id: Tab; label: string; hostOnly?: boolean }[] = [
    { id: "devices", label: "Mic & camera" },
    { id: "video", label: "Video quality" },
    { id: "background", label: "Background" },
    { id: "captions", label: "Captions" },
    { id: "privacy", label: "Privacy", hostOnly: true },
  ]
  const tabs = allTabs.filter((t) => !t.hostOnly || isHost)

  const e2ee = settings.encryption === "e2ee"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close settings"
        onClick={() => setOpen(false)}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Class settings"
        className="relative flex max-h-[80vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-[#111827] shadow-2xl ring-1 ring-white/10"
      >
        {/* Tab rail */}
        <nav className="hidden w-44 shrink-0 border-r border-white/10 p-2 sm:block">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "block w-full rounded-lg px-3 py-2 text-left text-xs font-medium transition",
                tab === t.id
                  ? "bg-white/10 text-white"
                  : "text-white/50 hover:text-white"
              )}
            >
              {t.label}
            </button>
          ))}
        </nav>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex h-12 shrink-0 items-center justify-between border-b border-white/10 px-4">
            <h2 className="text-sm font-semibold text-white">Class settings</h2>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="flex size-7 items-center justify-center rounded-lg text-white/40 hover:bg-white/10 hover:text-white"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Mobile tabs */}
          <div className="flex gap-1 overflow-x-auto border-b border-white/10 px-3 py-2 sm:hidden">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={cn(
                  "shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-medium",
                  tab === t.id ? "bg-white/10 text-white" : "text-white/50"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            {tab === "devices" && (
              <div className="space-y-4">
                <div className="aspect-video overflow-hidden rounded-xl bg-[#10151E] ring-1 ring-white/10">
                  {stream && !error ? (
                    <VideoSurface
                      stream={stream}
                      mirrored={settings.mirrorSelfView}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center px-6 text-center text-xs text-white/40">
                      {error ? error.title : "Camera preview"}
                    </div>
                  )}
                </div>
                {[
                  {
                    icon: <Camera />,
                    label: "Camera",
                    key: "cameraDeviceId" as const,
                    list: cameras,
                    fallback: "Default camera",
                  },
                  {
                    icon: <Headphones />,
                    label: "Microphone",
                    key: "micDeviceId" as const,
                    list: microphones,
                    fallback: "Default microphone",
                  },
                  {
                    icon: <Headphones />,
                    label: "Speaker",
                    key: "speakerDeviceId" as const,
                    list: speakers,
                    fallback: "Default speaker",
                  },
                ].map((d) => (
                  <label key={d.label} className="block">
                    <span className="mb-1 flex items-center gap-1.5 text-xs font-medium text-white/70 [&_svg]:size-3.5">
                      {d.icon}
                      {d.label}
                    </span>
                    <select
                      value={settings[d.key]}
                      onChange={(e) =>
                        updateSettings({ [d.key]: e.target.value })
                      }
                      className="w-full rounded-lg bg-white/6 px-3 py-2 text-xs text-white ring-1 ring-white/10 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="default" className="bg-[#1A2130]">
                        {d.fallback}
                      </option>
                      {d.list.map((device, i) => (
                        <option
                          key={device.deviceId || i}
                          value={device.deviceId}
                          className="bg-[#1A2130]"
                        >
                          {device.label || `${d.label} ${i + 1}`}
                        </option>
                      ))}
                    </select>
                  </label>
                ))}
                <RoomSwitch
                  label="Reduce background noise"
                  hint="Filters out fans, traffic and classroom chatter"
                  checked={settings.noiseSuppression}
                  onChange={(v) => updateSettings({ noiseSuppression: v })}
                />
                <RoomSwitch
                  label="Mirror my own video"
                  checked={settings.mirrorSelfView}
                  onChange={(v) => updateSettings({ mirrorSelfView: v })}
                />
              </div>
            )}

            {tab === "video" && (
              <div className="space-y-2">
                <p className="mb-3 flex items-start gap-2 rounded-lg bg-amber-500/10 p-3 text-[11px] leading-relaxed text-amber-200">
                  <Gauge className="mt-0.5 size-3.5 shrink-0" />
                  Pick the lowest setting that still works. A class of 30 on HD
                  uses roughly 40&nbsp;GB an hour — Standard cuts that by
                  two-thirds.
                </p>
                {(Object.keys(PROFILE_COPY) as MediaProfile[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setMediaProfile(p)}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-xl p-3 text-left ring-1 transition",
                      settings.mediaProfile === p
                        ? "bg-blue-600/15 ring-blue-500"
                        : "bg-white/5 ring-white/10 hover:bg-white/8"
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border",
                        settings.mediaProfile === p
                          ? "border-blue-500 bg-blue-500"
                          : "border-white/25"
                      )}
                    >
                      {settings.mediaProfile === p && (
                        <span className="size-1.5 rounded-full bg-white" />
                      )}
                    </span>
                    <span>
                      <span className="block text-xs font-medium text-white">
                        {PROFILE_COPY[p].label}
                      </span>
                      <span className="mt-0.5 block text-[11px] leading-relaxed text-white/45">
                        {PROFILE_COPY[p].hint}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            )}

            {tab === "background" && (
              <div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      updateSettings({ virtualBackground: { kind: "none" } })
                    }
                    className={cn(
                      "flex aspect-video flex-col items-center justify-center gap-1 rounded-xl bg-white/5 text-[10px] text-white/60 ring-1 transition",
                      settings.virtualBackground.kind === "none"
                        ? "ring-2 ring-blue-500"
                        : "ring-white/10 hover:bg-white/8"
                    )}
                  >
                    <X className="size-4" />
                    None
                  </button>
                  {(["light", "strong"] as const).map((strength) => (
                    <button
                      key={strength}
                      type="button"
                      onClick={() =>
                        updateSettings({
                          virtualBackground: { kind: "blur", strength },
                        })
                      }
                      className={cn(
                        "flex aspect-video flex-col items-center justify-center gap-1 rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 text-[10px] text-white ring-1 transition",
                        settings.virtualBackground.kind === "blur" &&
                          settings.virtualBackground.strength === strength
                          ? "ring-2 ring-blue-500"
                          : "ring-white/10"
                      )}
                      style={{
                        filter: strength === "strong" ? "blur(1px)" : undefined,
                      }}
                    >
                      <ImageIcon className="size-4" />
                      {strength === "light" ? "Slight blur" : "Full blur"}
                    </button>
                  ))}
                  {VIRTUAL_BACKGROUND_PRESETS.map((bg) => (
                    <button
                      key={bg.id}
                      type="button"
                      onClick={() =>
                        updateSettings({
                          virtualBackground: {
                            kind: "image",
                            id: bg.id,
                            label: bg.label,
                            previewClass: bg.previewClass,
                          },
                        })
                      }
                      className={cn(
                        "relative flex aspect-video items-end justify-start overflow-hidden rounded-xl p-1.5 ring-1 transition",
                        bg.previewClass,
                        settings.virtualBackground.kind === "image" &&
                          settings.virtualBackground.id === bg.id
                          ? "ring-2 ring-blue-500"
                          : "ring-white/10"
                      )}
                    >
                      <span className="rounded bg-black/40 px-1.5 py-0.5 text-[9px] font-medium text-white">
                        {bg.label}
                      </span>
                    </button>
                  ))}
                </div>
                <p className="mt-3 flex items-start gap-2 rounded-lg bg-white/5 p-3 text-[11px] leading-relaxed text-white/50">
                  <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-amber-400" />
                  Backgrounds run on the device. On older phones they drain the
                  battery and can drop the frame rate — we hide them
                  automatically on data saver.
                </p>
              </div>
            )}

            {tab === "captions" && (
              <div className="space-y-4">
                <RoomSwitch
                  label="Show live captions"
                  hint="Helpful for noisy rooms and students following in a second language"
                  checked={settings.captionsOn}
                  onChange={() => useLiveRoomStore.getState().toggleCaptions()}
                  disabled={e2ee}
                />
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-white/70">
                    Caption language
                  </span>
                  <select
                    value={settings.captionLanguage}
                    onChange={(e) =>
                      updateSettings({ captionLanguage: e.target.value })
                    }
                    disabled={e2ee}
                    className="w-full rounded-lg bg-white/6 px-3 py-2 text-xs text-white ring-1 ring-white/10 focus:ring-blue-500 focus:outline-none disabled:opacity-40"
                  >
                    {CAPTION_LANGUAGES.map((l) => (
                      <option
                        key={l.code}
                        value={l.code}
                        className="bg-[#1A2130]"
                      >
                        {l.label}
                      </option>
                    ))}
                  </select>
                </label>
                {e2ee && (
                  <p className="flex items-start gap-2 rounded-lg bg-white/5 p-3 text-[11px] leading-relaxed text-white/50">
                    <Lock className="mt-0.5 size-3.5 shrink-0" />
                    Captions are off because this class is end-to-end encrypted.
                  </p>
                )}
              </div>
            )}

            {tab === "privacy" && (
              <div className="space-y-3">
                <Segmented
                  value={settings.encryption}
                  onChange={(v) => updateSettings({ encryption: v })}
                  options={[
                    { value: "transport", label: "Standard" },
                    { value: "e2ee", label: "End-to-end" },
                  ]}
                />
                <div className="rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
                  <p className="mb-1 text-xs font-medium text-white">
                    {e2ee ? "End-to-end encryption" : "Standard encryption"}
                  </p>
                  <p className="text-[11px] leading-relaxed text-white/50">
                    {e2ee
                      ? "Only the people in the room can read the audio and video. Because our servers can't read the stream, live captions and AI summaries are switched off."
                      : "Audio and video are encrypted in transit and at rest. Our servers can process the stream for captions and lesson summaries."}
                  </p>
                </div>
                {e2ee && (
                  <ul className="space-y-1.5">
                    {["Live captions", "Lesson summaries"].map((f) => (
                      <li
                        key={f}
                        className="flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-[11px] text-red-200"
                      >
                        <Lock className="size-3.5 shrink-0" />
                        {f} is unavailable
                      </li>
                    ))}
                  </ul>
                )}
                {!e2ee && (
                  <p className="flex items-start gap-2 rounded-lg bg-white/5 p-3 text-[11px] leading-relaxed text-white/50">
                    <Sparkles className="mt-0.5 size-3.5 shrink-0 text-blue-400" />
                    Standard encryption supports live captions and lesson
                    summaries.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
