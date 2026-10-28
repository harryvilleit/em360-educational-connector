import { useEffect, useMemo, useRef, useState } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { isCloudflarePlayerUrl } from "@/lib/video-audio"
import { getYouTubeVideoId } from "@/utils/lmsDuration"
import CourseVideoPlayer from "./CourseVideoPlayer"

const MIN_HEIGHT = 560
const MAX_HEIGHT = 1200

type LessonVideo = { url: string; title: string }

/**
 * The lesson runs in a sandboxed frame, and that sandbox is inherited by any YouTube or
 * Cloudflare player the tutor embedded — those players then fail or stay silent. Each such
 * embed becomes a "Play video" card; the video itself plays in the shared player (with sound)
 * outside the sandbox. Only URLs found here are ever played, never ones sent by the frame.
 */
function liftVideoEmbeds(content: string): {
  html: string
  videos: LessonVideo[]
} {
  if (!content || !/<iframe/i.test(content) || typeof DOMParser === "undefined")
    return { html: content, videos: [] }
  const doc = new DOMParser().parseFromString(
    `<body>${content}</body>`,
    "text/html"
  )
  const videos: LessonVideo[] = []
  doc.querySelectorAll("iframe[src]").forEach((frame) => {
    const url = (frame.getAttribute("src") ?? "").trim()
    const youTubeId = getYouTubeVideoId(url)
    if (!youTubeId && !isCloudflarePlayerUrl(url)) return
    const title =
      frame.getAttribute("title")?.trim() || `Video ${videos.length + 1}`
    const card = doc.createElement("button")
    card.type = "button"
    card.className = "em360-video"
    card.setAttribute("data-em360-video", String(videos.length))
    if (youTubeId)
      card.style.backgroundImage = `url("https://i.ytimg.com/vi/${youTubeId}/hqdefault.jpg")`
    const label = doc.createElement("span")
    label.textContent = `\u25B6  Play video: ${title}`
    card.appendChild(label)
    frame.replaceWith(card)
    videos.push({ url, title })
  })
  return { html: doc.body.innerHTML, videos }
}

function buildHtmlDocument(content: string, lessonId: string) {
  const safeLessonId = JSON.stringify(lessonId)

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <base target="_blank" />
  <style>
    :root { color-scheme: light; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    * { box-sizing: border-box; }
    body { margin: 0; background: #fff; color: #172033; font-size: 16px; line-height: 1.65; }
    main { width: min(100% - 40px, 920px); margin: 0 auto; padding: 40px 0 56px; }
    h1, h2, h3, h4 { color: #0f172a; line-height: 1.25; margin: 1.4em 0 .55em; }
    h1:first-child, h2:first-child, h3:first-child { margin-top: 0; }
    p, ul, ol, blockquote, pre, table, form, fieldset { margin: 0 0 1.1em; }
    img, video, iframe, canvas, svg { max-width: 100%; height: auto; }
    iframe, video { width: 100%; min-height: 320px; border: 0; border-radius: 12px; }
    a { color: #2563eb; }
    blockquote { border-left: 4px solid #93c5fd; background: #eff6ff; padding: 14px 18px; border-radius: 0 10px 10px 0; }
    pre, code { font-family: "SFMono-Regular", Consolas, monospace; }
    pre { overflow: auto; border-radius: 10px; background: #0f172a; color: #e2e8f0; padding: 16px; }
    table { width: 100%; border-collapse: collapse; overflow: hidden; border-radius: 10px; }
    th, td { border: 1px solid #dbe3ef; padding: 10px 12px; text-align: left; }
    th { background: #f8fafc; }
    form, fieldset, [data-poll], [data-exercise] { border: 1px solid #dbe3ef; border-radius: 14px; background: #f8fafc; padding: 20px; }
    label { display: block; margin: 10px 0 6px; font-weight: 600; }
    input, select, textarea, button { max-width: 100%; font: inherit; }
    input:not([type="radio"]):not([type="checkbox"]), select, textarea { width: 100%; border: 1px solid #cbd5e1; border-radius: 9px; background: white; padding: 10px 12px; }
    input[type="radio"], input[type="checkbox"] { margin-right: 8px; }
    button, input[type="submit"] { cursor: pointer; border: 0; border-radius: 9px; background: #2563eb; color: white; padding: 10px 16px; font-weight: 700; }
    button:hover, input[type="submit"]:hover { background: #1d4ed8; }
    .em360-video { position: relative; display: flex; width: 100%; aspect-ratio: 16 / 9; margin: 0 0 1.1em; align-items: center; justify-content: center; border-radius: 12px; background: #0f172a center / cover no-repeat; padding: 0; }
    .em360-video:hover { background-color: #0f172a; filter: brightness(1.08); }
    .em360-video span { border-radius: 999px; background: rgba(15, 23, 42, .82); padding: 12px 20px; font-weight: 700; color: #fff; }
    @media (max-width: 640px) { main { width: min(100% - 24px, 920px); padding-top: 24px; } }
  </style>
</head>
<body>
  <main id="lesson-content">${content || "<p>No content has been added yet.</p>"}</main>
  <script>
    (() => {
      const lessonId = ${safeLessonId};
      const send = (type, extra = {}) => parent.postMessage({ type, lessonId, ...extra }, "*");
      window.EM360Lesson = { complete: () => send("em360-lesson-complete") };
      document.addEventListener("em360:complete", () => send("em360-lesson-complete"));
      const reportHeight = () => send("em360-html-height", {
        height: Math.max(document.documentElement.scrollHeight, document.body.scrollHeight)
      });
      document.addEventListener("click", (event) => {
        const card = event.target instanceof Element ? event.target.closest("[data-em360-video]") : null;
        if (card) send("em360-play-video", { index: Number(card.getAttribute("data-em360-video")) });
      });
      window.addEventListener("load", reportHeight);
      new ResizeObserver(reportHeight).observe(document.body);
    })();
  </script>
</body>
</html>`
}

type InteractiveHtmlLessonProps = {
  lessonId: string
  title: string
  html: string
  onComplete: () => void
}

export default function InteractiveHtmlLesson({
  lessonId,
  title,
  html,
  onComplete,
}: InteractiveHtmlLessonProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [height, setHeight] = useState(MIN_HEIGHT)
  const lifted = useMemo(() => liftVideoEmbeds(html), [html])
  const source = useMemo(
    () => buildHtmlDocument(lifted.html, lessonId),
    [lifted.html, lessonId]
  )
  const [playing, setPlaying] = useState<LessonVideo | null>(null)
  const videosRef = useRef(lifted.videos)
  useEffect(() => {
    videosRef.current = lifted.videos
  }, [lifted.videos])

  useEffect(() => {
    const handleMessage = (event: MessageEvent<unknown>) => {
      if (event.source !== iframeRef.current?.contentWindow) return
      if (!event.data || typeof event.data !== "object") return

      const message = event.data as {
        type?: string
        lessonId?: string
        height?: number
        index?: number
      }
      if (message.lessonId !== lessonId) return

      if (message.type === "em360-lesson-complete") {
        onComplete()
      }
      if (
        message.type === "em360-play-video" &&
        typeof message.index === "number"
      ) {
        const video = videosRef.current[message.index]
        if (video) setPlaying(video)
      }
      if (
        message.type === "em360-html-height" &&
        typeof message.height === "number"
      ) {
        setHeight(Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, message.height)))
      }
    }

    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [lessonId, onComplete])

  return (
    <>
      <iframe
        ref={iframeRef}
        key={lessonId}
        title={title}
        srcDoc={source}
        sandbox="allow-forms allow-modals allow-popups allow-scripts"
        referrerPolicy="no-referrer"
        className="w-full border-0 bg-white"
        style={{ height }}
      />
      <Dialog
        open={playing !== null}
        onOpenChange={(open) => !open && setPlaying(null)}
      >
        <DialogContent className="gap-0 overflow-hidden border-0 bg-black p-0 sm:max-w-4xl">
          <DialogTitle className="sr-only">
            {playing?.title ?? "Lesson video"}
          </DialogTitle>
          <div className="aspect-video w-full">
            {playing && (
              <CourseVideoPlayer
                key={playing.url}
                url={playing.url}
                title={playing.title}
                autoPlay
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
