import { useCallback, useMemo } from "react"
import { useNavigate, useParams } from "react-router"
import {
  ArrowLeft,
  CalendarDays,
  Star,
  BookOpen,
  CheckCircle2,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { DashboardRoutes } from "@/routes"

import {
  useGetSchoolSessionById,
  useSetCurrentSchoolSession,
  useSetCurrentSchoolTerm,
} from "@/hooks/userMgt"
import { useCurrentAcademicStore } from "@/store/currentAcademic.store"
import { StatCard } from "@/components/general/StatCard"
import { TermCard } from "@/pages/Dashboard/UserManagement/Component/TermCard"
import { fmtDate } from "@/utils"



export default function AcademicSessionDetailPage() {
  const { productId, sessionId } = useParams<{
    productId: string
    sessionId: string
  }>()
  const navigate = useNavigate()

  const { session, isLoading } = useGetSchoolSessionById(sessionId ?? "")
  const { setCurrentSchoolSessionAsync } = useSetCurrentSchoolSession()
  const { setCurrentSchoolTermAsync } = useSetCurrentSchoolTerm()

  const currentSessionId = useCurrentAcademicStore((s) => s.currentSessionId)
  const currentTermId = useCurrentAcademicStore((s) => s.currentTermId)

  const sortedTerms = useMemo(
    () =>
      session?.Terms.slice().sort((a, b) => a.StartDate.localeCompare(b.StartDate)) ??
      [],
    [session]
  )
  const activeTerm = useMemo(
    () => sortedTerms.find((t) => t.Id === currentTermId || t.IsCurrent),
    [sortedTerms, currentTermId]
  )
  const sessionEnd = useMemo(
    () =>
      sortedTerms.reduce<string | undefined>(
        (max, t) => (!max || t.EndDate > max ? t.EndDate : max),
        undefined
      ),
    [sortedTerms]
  )
  const handleSetCurrentTerm = useCallback(
    async (termId: string) => {
      try {
        await setCurrentSchoolTermAsync({ schoolSessionTermId: termId })
      } catch {}
    },
    [setCurrentSchoolTermAsync]
  )

  // ── Loading / not found ─────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <CalendarDays className="mb-3 size-10 text-gray-300" />
        <p className="text-sm font-medium text-gray-500">Session not found</p>
        <button
          onClick={() => navigate(DashboardRoutes.toUsersAcademic(productId!))}
          className="mt-3 text-sm font-medium text-blue-600 hover:underline"
        >
          ← Back 
        </button>
      </div>
    )
  }

  const isCurrent =
    session.Id === currentSessionId ||
    session.IsCurrent === true ||
    session.Status === "Active"
  const sessionStart = sortedTerms[0]?.StartDate

  // ── Handlers ─────────────────────────────────────────────────────────────────

  async function handleSetCurrentSession() {
    try {
      await setCurrentSchoolSessionAsync({ schoolSessionId: session!.Id })
      toast.success(`"${session!.SessionName}" is now the current session`)
    } catch {}
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Back */}
      <button
        onClick={() => navigate(DashboardRoutes.toUsersAcademic(productId!))}
        className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-gray-900"
      >
        <ArrowLeft className="size-4" />
        Back to Sessions
      </button>

      {/* Hero */}
      <div
        className={`overflow-hidden rounded-2xl border shadow-sm ${
          isCurrent
            ? "border-blue-600 bg-linear-to-br from-blue-600 to-indigo-600"
            : "border-gray-100 bg-white"
        }`}
      >
        <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div
              className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${
                isCurrent ? "bg-white/15 text-white" : "bg-blue-50 text-blue-600"
              }`}
            >
              <CalendarDays className="size-7" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1
                  className={`text-2xl font-bold tracking-tight ${
                    isCurrent ? "text-white" : "text-gray-900"
                  }`}
                >
                  {session.SessionName}
                </h1>
                {isCurrent && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-xs font-semibold text-white">
                    <Star className="size-3 fill-current" />
                    Current Session
                  </span>
                )}
              </div>
              <p className={`mt-1 text-sm ${isCurrent ? "text-blue-100" : "text-muted-foreground"}`}>
                {session.SchoolName} · Created {fmtDate(session.DateCreated)}
              </p>
            </div>
          </div>

          {!isCurrent && (
            <Button
              variant="outline"
              onClick={handleSetCurrentSession}
              className="gap-2 rounded-xl border-blue-200 bg-white text-sm text-blue-600 hover:bg-blue-50"
            >
              <Star className="size-4" />
              Set as Current
            </Button>
          )}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total Terms" value={String(session.Terms.length)} icon={BookOpen} color="purple" />
        <StatCard label="Active Term" value={activeTerm?.TermName ?? "None set"} icon={CheckCircle2} color="green" />
        <StatCard
          label="Session Period"
          value={sessionStart && sessionEnd ? `${fmtDate(sessionStart)} – ${fmtDate(sessionEnd)}` : "Not set"}
          icon={CalendarDays}
          color="blue"
        />
        <StatCard label="Status" value={isCurrent ? "Current" : "Inactive"} icon={Star} color={isCurrent ? "amber" : "gray"} />
      </div>

      {/* Terms */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex items-center border-b border-gray-100 px-5 py-4">
          <BookOpen className="size-4 text-gray-400" />
          <h2 className="ml-2 text-sm font-semibold text-gray-900">Terms</h2>
          <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
            {session.Terms.length}
          </span>
        </div>

        {sortedTerms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-50">
              <BookOpen className="size-6 text-gray-300" />
            </div>
            <p className="text-sm font-medium text-gray-500">No terms yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Use "New Term" on the Sessions page to add terms to this session.
            </p>
          </div>
        ) : (
          <div className="space-y-6 p-5">
            {/* Timeline */}
            <div className="flex items-start overflow-x-auto pb-1">
              {sortedTerms.map((term, idx) => (
                <div key={term.Id} className="flex min-w-24 flex-1 items-start">
                  <div className="flex flex-1 flex-col items-center gap-1.5 text-center">
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        term.IsCurrent
                          ? "bg-green-500 text-white"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <p className="text-xs font-semibold text-gray-900">{term.TermName}</p>
                    <p className="text-[11px] text-muted-foreground">{fmtDate(term.StartDate)}</p>
                  </div>
                  {idx < sortedTerms.length - 1 && (
                    <div className={`mt-4 h-0.5 flex-1 ${term.IsCurrent ? "bg-green-300" : "bg-gray-100"}`} />
                  )}
                </div>
              ))}
            </div>

            {/* Term cards */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {sortedTerms.map((term) => (
                <TermCard
                  key={term.Id}
                  term={term}
                  onSetCurrent={handleSetCurrentTerm}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
