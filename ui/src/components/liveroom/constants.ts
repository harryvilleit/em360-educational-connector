import type { ReactionKind } from "@/types/liveroom"

export const AVATAR_TONES = [
  "bg-blue-500/25 text-blue-200",
  "bg-emerald-500/25 text-emerald-200",
  "bg-violet-500/25 text-violet-200",
  "bg-amber-500/25 text-amber-200",
  "bg-rose-500/25 text-rose-200",
  "bg-cyan-500/25 text-cyan-200",
]

/** Deterministic avatar tint so the same person keeps the same colour. */
export function toneFor(seed: string) {
  let n = 0
  for (let i = 0; i < seed.length; i++) n = (n + seed.charCodeAt(i)) % AVATAR_TONES.length
  return AVATAR_TONES[n]
}

export const REACTIONS: { kind: ReactionKind; emoji: string; label: string }[] = [
  { kind: "clap", emoji: "👏", label: "Clap" },
  { kind: "thumbsUp", emoji: "👍", label: "Yes" },
  { kind: "heart", emoji: "❤️", label: "Love it" },
  { kind: "smile", emoji: "😄", label: "Smile" },
  { kind: "confused", emoji: "😕", label: "Lost me" },
  { kind: "celebrate", emoji: "🎉", label: "Celebrate" },
]

export const reactionEmoji = (kind: ReactionKind) =>
  REACTIONS.find((r) => r.kind === kind)?.emoji ?? "👍"
