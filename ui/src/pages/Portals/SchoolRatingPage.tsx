import { useEffect, useState } from "react"
import { LoaderCircle, Star } from "lucide-react"
import { useSchoolId } from "@/contexts/SchoolContext"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  useMySchoolRating,
  usePublicSchool,
  useRateSchool,
} from "@/hooks/publicSchools"
import { cn } from "@/lib/utils"

export default function SchoolRatingPage() {
  const schoolId = useSchoolId()
  const { data: school } = usePublicSchool(schoolId)
  const { data: current, isPending } = useMySchoolRating(schoolId)
  const save = useRateSchool(schoolId)
  const [score, setScore] = useState(0)
  const [comment, setComment] = useState("")
  const [loadedRatingId, setLoadedRatingId] = useState<string | null>(null)

  useEffect(() => {
    if (!current || loadedRatingId === current.id) return
    setScore(current.score)
    setComment(current.comment ?? "")
    setLoadedRatingId(current.id)
  }, [current, loadedRatingId])

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    if (score < 1) return
    await save.mutateAsync({ score, comment: comment.trim() || undefined })
  }

  return (
    <div className="mx-auto max-w-3xl p-4 md:p-8">
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
        <h1 className="text-2xl font-bold text-gray-900">Rate your school</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Share your experience with {school?.name || "your school"}. Only
          current students and parents of current students can submit a rating.
        </p>

        {school && (
          <div className="mt-6 flex items-center gap-4 rounded-xl bg-amber-50 p-4">
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {school.rating.toFixed(1)}
              </p>
              <p className="text-xs text-gray-600">Current rating</p>
            </div>
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star
                  key={index}
                  className={cn(
                    "size-5",
                    index < Math.round(school.rating)
                      ? "fill-amber-500 text-amber-500"
                      : "text-amber-200"
                  )}
                />
              ))}
            </div>
            <p className="text-xs text-gray-600">
              from {school.ratingCount} rating
              {school.ratingCount === 1 ? "" : "s"}
            </p>
          </div>
        )}

        {isPending ? (
          <div className="flex justify-center py-16">
            <LoaderCircle className="size-6 animate-spin text-blue-600" />
          </div>
        ) : (
          <form onSubmit={submit} className="mt-8 space-y-6">
            <fieldset>
              <legend className="text-sm font-semibold text-gray-800">
                Your rating
              </legend>
              <div className="mt-3 flex gap-2">
                {Array.from({ length: 5 }).map((_, index) => {
                  const value = index + 1
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setScore(value)}
                      aria-label={`${value} star rating`}
                      className="rounded-lg p-1 focus-visible:outline-2 focus-visible:outline-blue-600"
                    >
                      <Star
                        className={cn(
                          "size-9 transition",
                          value <= score
                            ? "fill-amber-500 text-amber-500"
                            : "text-gray-300 hover:text-amber-300"
                        )}
                      />
                    </button>
                  )
                })}
              </div>
            </fieldset>
            <label className="block space-y-2 text-sm font-semibold text-gray-800">
              Your review{" "}
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
              <Textarea
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                maxLength={1000}
                rows={6}
                placeholder="What should other families know about this school?"
              />
              <span className="block text-right text-xs font-normal text-muted-foreground">
                {comment.length}/1000
              </span>
            </label>
            <Button
              type="submit"
              disabled={score < 1 || save.isPending}
              className="bg-blue-600 px-8 text-white hover:bg-blue-700"
            >
              {save.isPending
                ? "Saving…"
                : current
                  ? "Update rating"
                  : "Submit rating"}
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
