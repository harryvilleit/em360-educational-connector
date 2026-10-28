/** Parse "25min", "7min", "1h 5m" → total minutes */
export function parseDurationToMinutes(duration: string): number {
  if (!duration) return 0
  const hMatch = duration.match(/(\d+)\s*h/i)
  const minMatch = duration.match(/(\d+)\s*m/i)
  const hours = hMatch ? parseInt(hMatch[1], 10) : 0
  const mins = minMatch ? parseInt(minMatch[1], 10) : 0
  if (hours || minMatch) return hours * 60 + mins
  const n = parseInt(duration, 10)
  return Number.isNaN(n) ? 0 : n
}

export function formatDurationMinutes(totalMinutes: number): string {
  if (totalMinutes <= 0) return "0min"
  if (totalMinutes < 60) return `${totalMinutes}min`
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

export function formatTimestamp(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
  }
  return `${m}:${s.toString().padStart(2, "0")}`
}

export function minutesFromSeconds(seconds: number): number {
  return Math.max(1, Math.round(seconds / 60))
}

export function lessonDurationMinutes(lesson: {
  duration: string
  durationMinutes?: number
}): number {
  return lesson.durationMinutes ?? parseDurationToMinutes(lesson.duration)
}

export function getYouTubeVideoId(url: string): string | null {
  const trimmed = url.trim()
  if (!trimmed) return null

  try {
    const parsed = new URL(trimmed)
    const host = parsed.hostname.replace(/^www\./, "").toLowerCase()

    if (host === "youtu.be") {
      return parsed.pathname.replace(/^\//, "").split("/")[0] || null
    }

    if (
      host === "youtube.com" ||
      host === "m.youtube.com" ||
      host === "youtube-nocookie.com"
    ) {
      const pathMatch = parsed.pathname.match(
        /^\/(?:embed|shorts|live)\/([^/?#]+)/
      )
      return parsed.searchParams.get("v") || pathMatch?.[1] || null
    }
  } catch {
    return null
  }

  return null
}

export function isYouTubeEmbedUrl(url: string): boolean {
  return Boolean(getYouTubeVideoId(url))
}

/** Convert watch/share YouTube URLs to an embeddable iframe src. */
export function toEmbedPlaybackUrl(url: string): string {
  const trimmed = url.trim()
  if (!trimmed) return ""
  const youtubeId = getYouTubeVideoId(trimmed)
  return youtubeId
    ? // Privacy-enhanced mode: YouTube sets no cookies until the viewer presses play.
      `https://www.youtube-nocookie.com/embed/${youtubeId}?controls=1&disablekb=0`
    : trimmed
}

export function isPdfUrl(url: string, fileName?: string): boolean {
  const name = (fileName || url).toLowerCase()
  return name.includes(".pdf") || /\/documents\/[^?]+\.pdf/i.test(url)
}
