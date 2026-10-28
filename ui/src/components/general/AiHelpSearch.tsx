import { useState } from "react"
import { Search, Sparkles } from "lucide-react"
import { useLocation, useNavigate } from "react-router"
import { HomeRoutes } from "@/routes"
import { cn } from "@/lib/utils"

type AiHelpSearchProps = {
  portal?: "public" | "school" | "lms" | "student" | "parent"
  schoolId?: string
  className?: string
  compact?: boolean
}

export default function AiHelpSearch({
  portal = "public",
  schoolId,
  className,
  compact = false,
}: AiHelpSearchProps) {
  const [question, setQuestion] = useState("")
  const navigate = useNavigate()
  const location = useLocation()

  function submit(event: React.FormEvent) {
    event.preventDefault()
    const value = question.trim()
    if (value.length < 3) return

    const search = new URLSearchParams({
      q: value,
      from: location.pathname,
      portal,
    })
    if (schoolId) search.set("schoolId", schoolId)
    navigate(`${HomeRoutes.help}?${search.toString()}`)
  }

  return (
    <form
      onSubmit={submit}
      className={cn("relative min-w-0", className)}
      role="search"
      aria-label="Ask the EM360 assistant"
    >
      {compact ? (
        <Sparkles className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-blue-600" />
      ) : (
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
      )}
      <input
        type="search"
        value={question}
        onChange={(event) => setQuestion(event.target.value)}
        placeholder={compact ? "Ask EM360…" : "Ask how to use EM360…"}
        className={cn(
          "w-full border border-gray-200 bg-white pr-12 pl-9 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100",
          compact ? "h-9 rounded-full" : "h-10 rounded-xl"
        )}
      />
      <button
        type="submit"
        disabled={question.trim().length < 3}
        className="absolute top-1/2 right-1.5 flex size-7 -translate-y-1/2 items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300"
        aria-label="Ask EM360 assistant"
      >
        <Search className="size-3.5" />
      </button>
    </form>
  )
}
