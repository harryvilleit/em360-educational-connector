import { useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Captions, X } from "lucide-react"
import { useLiveRoomStore } from "@/store/liveroom.store"
import { CAPTION_LANGUAGES } from "@/data/liveroom.options"
import { reactionEmoji } from "./constants"

/**
 * Live captions strip. Sits above the control bar so it never covers a speaker's
 * face. Two cues maximum — a longer history lives in the Captions side panel.
 */
export function CaptionBar() {
  const captionsOn = useLiveRoomStore((s) => s.settings.captionsOn)
  const language = useLiveRoomStore((s) => s.settings.captionLanguage)
  const captions = useLiveRoomStore((s) => s.captions)
  const toggleCaptions = useLiveRoomStore((s) => s.toggleCaptions)
  const setPanel = useLiveRoomStore((s) => s.setPanel)

  if (!captionsOn) return null

  const recent = captions.slice(-2)
  const languageLabel =
    CAPTION_LANGUAGES.find((l) => l.code === language)?.label ?? "English"

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-3 z-20 flex justify-center px-4">
      <div className="pointer-events-auto w-full max-w-2xl rounded-xl bg-black/75 px-4 py-2.5 backdrop-blur-sm">
        <div className="mb-1 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-medium tracking-wide text-white/45 uppercase">
            <Captions className="size-3" />
            Live captions · {languageLabel}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPanel("captions")}
              className="rounded px-1.5 py-0.5 text-[10px] text-white/50 hover:bg-white/10 hover:text-white"
            >
              Full transcript
            </button>
            <button
              type="button"
              onClick={toggleCaptions}
              aria-label="Turn off captions"
              className="rounded p-0.5 text-white/50 hover:bg-white/10 hover:text-white"
            >
              <X className="size-3.5" />
            </button>
          </div>
        </div>
        <div className="space-y-0.5">
          {recent.length === 0 && (
            <p className="text-sm text-white/40 italic">Listening…</p>
          )}
          {recent.map((cue) => (
            <p key={cue.id} className="text-[15px] leading-snug text-white">
              <span className="font-semibold text-blue-300">{cue.speakerName}:</span>{" "}
              <span className={cue.isFinal ? "" : "text-white/75"}>{cue.text}</span>
            </p>
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * Floating reactions. Each reaction drifts up from the control bar and clears
 * itself after the animation — reactions are ephemeral by design, nothing to
 * dismiss and no history kept.
 */
export function ReactionLayer() {
  const reactions = useLiveRoomStore((s) => s.floatingReactions)
  const clearReaction = useLiveRoomStore((s) => s.clearReaction)

  useEffect(() => {
    if (reactions.length === 0) return
    const timers = reactions.map((r) => setTimeout(() => clearReaction(r.id), 2800))
    return () => timers.forEach(clearTimeout)
  }, [reactions, clearReaction])

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex justify-center overflow-hidden">
      <div className="relative h-64 w-64">
        <AnimatePresence>
          {reactions.map((r) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 0, scale: 0.6 }}
              animate={{ opacity: [0, 1, 1, 0], y: -220, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2.8, ease: "easeOut" }}
              style={{ left: `calc(50% + ${r.offset}px)` }}
              className="absolute bottom-0 flex flex-col items-center gap-1"
            >
              <span className="text-3xl drop-shadow-lg">{reactionEmoji(r.kind)}</span>
              <span className="rounded-full bg-black/60 px-2 py-0.5 text-[10px] whitespace-nowrap text-white/80">
                {r.name}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
