import { CircleAlert, Youtube } from "lucide-react"

export default function YouTubeVideoGuidance() {
  return (
    <div className="rounded-lg border border-blue-100 bg-blue-50/70 p-4">
      <div className="flex items-start gap-3">
        <Youtube className="mt-0.5 size-5 shrink-0 text-red-600" />
        <div className="space-y-2 text-sm text-gray-700">
          <p className="font-semibold text-gray-900">
            Add your lesson video through YouTube
          </p>
          <ol className="list-decimal space-y-1 pl-4">
            <li>Upload the video using YouTube Studio.</li>
            <li>
              Set its visibility to <strong>Unlisted</strong>, not Private.
              Private videos cannot play for students inside EM360.
            </li>
            <li>Keep embedding enabled, then copy and paste its link below.</li>
          </ol>
          <p className="flex items-start gap-1.5 text-xs text-amber-800">
            <CircleAlert className="mt-0.5 size-3.5 shrink-0" />
            Unlisted videos are hidden from YouTube search and public channel
            listings, but anyone who obtains the link can still view or share
            it. YouTube links cannot provide strict EM360-only access.
          </p>
        </div>
      </div>
    </div>
  )
}
