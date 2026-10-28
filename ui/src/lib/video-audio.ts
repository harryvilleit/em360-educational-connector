export type VideoAudio = { volume: number; muted: boolean }

export const VIDEO_AUDIO_KEY = "em360.video-audio.v1"
export const DEFAULT_VIDEO_AUDIO: VideoAudio = { volume: 100, muted: false }

export function normalizeVideoAudio(audio: VideoAudio): VideoAudio {
  return {
    volume: Number.isFinite(audio.volume)
      ? Math.round(Math.max(0, Math.min(100, audio.volume)))
      : 100,
    muted: audio.muted === true,
  }
}

export function readVideoAudio(): VideoAudio {
  try {
    const value: unknown = JSON.parse(
      localStorage.getItem(VIDEO_AUDIO_KEY) ?? "null"
    )
    if (
      value &&
      typeof value === "object" &&
      "volume" in value &&
      typeof value.volume === "number" &&
      "muted" in value &&
      typeof value.muted === "boolean"
    ) {
      const saved = normalizeVideoAudio(value as VideoAudio)
      // Only the preferred loudness carries over. Every video starts unmuted and audible,
      // so one muted lesson (or a stale saved 0%) can never silence all later videos.
      return { volume: saved.volume >= 5 ? saved.volume : 100, muted: false }
    }
  } catch {
    /* Storage can be unavailable in private or restricted browsers. */
  }
  return { ...DEFAULT_VIDEO_AUDIO }
}

export function saveVideoAudio(audio: VideoAudio) {
  try {
    localStorage.setItem(
      VIDEO_AUDIO_KEY,
      JSON.stringify(normalizeVideoAudio(audio))
    )
  } catch {
    /* Playback must still work without storage. */
  }
}

export function isCloudflarePlayerUrl(url: string): boolean {
  try {
    const { protocol, hostname, pathname } = new URL(url)
    return (
      protocol === "https:" &&
      (hostname === "iframe.videodelivery.net" ||
        ((hostname === "cloudflarestream.com" ||
          hostname.endsWith(".cloudflarestream.com") ||
          hostname === "videodelivery.net" ||
          hostname.endsWith(".videodelivery.net")) &&
          /\/iframe\/?$/.test(pathname)))
    )
  } catch {
    return false
  }
}

export function cloudflarePlayerUrl(url: string, audio: VideoAudio): string {
  const parsed = new URL(url)
  // Keep the complete signed path and all access-related query parameters.
  // Stream treats `autoplay` and `muted` as presence flags: "autoplay=false" still
  // autoplays and "muted=false" still mutes. Browsers then block autoplay with sound,
  // so the player falls back to muted playback. Remove both and only add `muted` when wanted.
  // Playback is requested through the SDK after volume and mute are configured.
  parsed.searchParams.delete("autoplay")
  parsed.searchParams.delete("muted")
  parsed.searchParams.set("controls", "true")
  if (audio.muted) parsed.searchParams.set("muted", "true")
  return parsed.toString()
}
