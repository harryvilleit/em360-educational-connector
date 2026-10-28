import type { LiveClassSession } from "@/types/elearning"

const DEFAULT_LIVE_THUMBNAILS = [
  "https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?w=640&h=360&fit=crop&q=80",
  "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=640&h=360&fit=crop&q=80",
  "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=640&h=360&fit=crop&q=80",
  "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=640&h=360&fit=crop&q=80",
  "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=640&h=360&fit=crop&q=80",
  "https://images.unsplash.com/photo-1497633768975-a78063f4cc6e?w=640&h=360&fit=crop&q=80",
]

const SUBJECT_THUMBNAILS: Record<string, string> = {
  biology:
    "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=640&h=360&fit=crop&q=80",
  chemistry:
    "https://images.unsplash.com/photo-1532187863486-abf9db5811bd?w=640&h=360&fit=crop&q=80",
  mathematics:
    "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=640&h=360&fit=crop&q=80",
  physics:
    "https://images.unsplash.com/photo-1636466497215-26a8cbeaf0b6?w=640&h=360&fit=crop&q=80",
  english:
    "https://images.unsplash.com/photo-1456513080250-7bf3a72b051f?w=640&h=360&fit=crop&q=80",
}

function hashIndex(seed: string, length: number) {
  return seed.split("").reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % length
}

function thumbnailForSubject(subject?: string) {
  if (!subject) return undefined
  const key = subject.toLowerCase()
  for (const [name, url] of Object.entries(SUBJECT_THUMBNAILS)) {
    if (key.includes(name)) return url
  }
  return undefined
}

export function getLiveSessionThumbnail(session: LiveClassSession) {
  if (session.coverImageUrl) return session.coverImageUrl

  return (
    thumbnailForSubject(session.subject) ??
    DEFAULT_LIVE_THUMBNAILS[
      hashIndex(session.id, DEFAULT_LIVE_THUMBNAILS.length)
    ]
  )
}
