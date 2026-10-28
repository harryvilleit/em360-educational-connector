import { Captions, Copy, Lock, Search, Send, Sparkles } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { useLiveRoomStore } from "@/store/liveroom.store"
import { CAPTION_LANGUAGES } from "@/data/liveroom.options"
import { PanelEmpty, PanelHeader } from "../primitives"

export function SummaryPanel() {
  const summary = useLiveRoomStore((s) => s.summary)
  const encryption = useLiveRoomStore((s) => s.settings.encryption)
  const toggleActionItem = useLiveRoomStore((s) => s.toggleActionItem)

  if (encryption === "e2ee") {
    return (
      <div className="flex h-full flex-col">
        <PanelHeader title="Lesson summary" />
        <PanelEmpty
          icon={<Lock />}
          title="Not available with end-to-end encryption"
          body="Summaries are written from the transcript, which needs the audio to be readable on the server. Switch to standard encryption in Settings to use them."
        />
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <PanelHeader
        title="Lesson summary"
        action={
          summary.status === "ready" && (
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-blue-300 hover:bg-white/8"
            >
              <Copy className="size-3" />
              Copy
            </button>
          )
        }
      />

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {summary.status === "unavailable" && (
          <PanelEmpty
            icon={<Sparkles />}
            title="Summary is written after the lesson"
            body="Lesson summaries aren't available yet."
          />
        )}

        {summary.status === "generating" && (
          <div className="space-y-3 p-1">
            <p className="inline-flex items-center gap-2 text-xs text-white/50">
              <Sparkles className="size-3.5 animate-pulse text-blue-400" />
              Reading the transcript…
            </p>
            {[0, 1, 2].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 w-1/3 animate-pulse rounded bg-white/10" />
                <div className="h-2.5 w-full animate-pulse rounded bg-white/6" />
                <div className="h-2.5 w-4/5 animate-pulse rounded bg-white/6" />
              </div>
            ))}
          </div>
        )}

        {summary.status === "ready" && (
          <div className="space-y-4">
            <div>
              <p className="text-[10px] font-medium tracking-wide text-white/35 uppercase">
                Generated {summary.generatedAt} · review before sharing
              </p>
              <h3 className="mt-1 text-sm leading-snug font-semibold text-white">
                {summary.headline}
              </h3>
            </div>

            {summary.topicsCovered.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {summary.topicsCovered.map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-blue-500/15 px-2 py-0.5 text-[10px] font-medium text-blue-300"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}

            {summary.sections.map((s) => (
              <section key={s.id}>
                <h4 className="mb-1.5 text-[11px] font-semibold tracking-wide text-white/45 uppercase">
                  {s.heading}
                </h4>
                <ul className="space-y-1.5">
                  {s.bullets.map((b, i) => (
                    <li key={i} className="flex gap-2 text-xs leading-relaxed text-white/75">
                      <span className="mt-1.5 size-1 shrink-0 rounded-full bg-white/30" />
                      {b}
                    </li>
                  ))}
                </ul>
              </section>
            ))}

            {summary.actionItems.length > 0 && (
              <section>
                <h4 className="mb-1.5 text-[11px] font-semibold tracking-wide text-white/45 uppercase">
                  Follow-up
                </h4>
                <ul className="space-y-1">
                  {summary.actionItems.map((a) => (
                    <li key={a.id}>
                      <label className="flex cursor-pointer items-start gap-2 rounded-lg px-1.5 py-1.5 hover:bg-white/5">
                        <input
                          type="checkbox"
                          checked={a.done}
                          onChange={() => toggleActionItem(a.id)}
                          className="mt-0.5 size-3.5 shrink-0 rounded border-white/25 bg-white/8 accent-blue-600"
                        />
                        <span className="min-w-0 flex-1">
                          <span
                            className={cn(
                              "block text-xs leading-relaxed",
                              a.done ? "text-white/35 line-through" : "text-white/80"
                            )}
                          >
                            {a.text}
                          </span>
                          {a.due && (
                            <span className="text-[10px] text-white/35">Due {a.due}</span>
                          )}
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {summary.attendanceNote && (
              <p className="rounded-lg bg-white/5 px-3 py-2 text-[11px] leading-relaxed text-white/50">
                {summary.attendanceNote}
              </p>
            )}

            <div className="flex gap-2 border-t border-white/10 pt-3">
              <button
                type="button"
                className="flex-1 rounded-lg bg-white/8 py-2 text-xs font-medium text-white hover:bg-white/15"
              >
                Save to lesson record
              </button>
              <button
                type="button"
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-blue-600 py-2 text-xs font-medium text-white hover:bg-blue-500"
              >
                <Send className="size-3.5" />
                Send to students
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export function CaptionsPanel() {
  const captions = useLiveRoomStore((s) => s.captions)
  const settings = useLiveRoomStore((s) => s.settings)
  const updateSettings = useLiveRoomStore((s) => s.updateSettings)
  const [query, setQuery] = useState("")

  const filtered = captions.filter(
    (c) =>
      c.text.toLowerCase().includes(query.toLowerCase()) ||
      c.speakerName.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="flex h-full flex-col">
      <PanelHeader
        title="Transcript"
        action={
          <select
            value={settings.captionLanguage}
            onChange={(e) => updateSettings({ captionLanguage: e.target.value })}
            className="rounded-md bg-white/8 px-2 py-1 text-[11px] text-white ring-1 ring-white/10 focus:ring-blue-500 focus:outline-none"
          >
            {CAPTION_LANGUAGES.map((l) => (
              <option key={l.code} value={l.code} className="bg-[#1A2130]">
                {l.label}
              </option>
            ))}
          </select>
        }
      />

      <div className="shrink-0 px-3 pt-3">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-white/35" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search what was said"
            className="w-full rounded-lg bg-white/6 py-1.5 pr-3 pl-8 text-xs text-white ring-1 ring-white/10 placeholder:text-white/35 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-2.5 overflow-y-auto p-3">
        {filtered.length === 0 ? (
          <PanelEmpty
            icon={<Captions />}
            title="Nothing captioned yet"
            body="Turn captions on from the control bar and the transcript builds here as the lesson runs."
          />
        ) : (
          filtered.map((c) => (
            <div key={c.id}>
              <p className="text-[10px] font-medium text-blue-300">{c.speakerName}</p>
              <p className="text-xs leading-relaxed text-white/75">{c.text}</p>
            </div>
          ))
        )}
      </div>

      <div className="shrink-0 border-t border-white/10 p-3">
        <button
          type="button"
          className="w-full rounded-lg bg-white/8 py-2 text-xs font-medium text-white hover:bg-white/15"
        >
          Download transcript
        </button>
      </div>
    </div>
  )
}
