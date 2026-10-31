import { useCallback, useMemo, useState } from "react"
import {
  Bell,
  CheckCheck,
  SlidersHorizontal,
  Search,
  X,
  AlertTriangle,
} from "lucide-react"
import { useParams } from "react-router"
import {
  createMockNotifications,
  type NotificationType,
} from "@/data/parentNotifications"
import { PageHeader } from "@/components/general/PageHeader"
import { Input } from "@/components/ui/input"
import { useResolvedParent } from "@/hooks/useResolvedParent"
import { useSchoolId } from "@/contexts/SchoolContext"
import { useGetConsentRequests } from "@/hooks/consent"
import { useGetCalendarEvents } from "@/hooks/calendar"
import { useGetStudentPortalHealthRecordsForChildren } from "@/hooks/studentPortal"
import { useConsentStore } from "@/store/consent.store"
import { useVisitationStore } from "@/store/visitation.store"
import type { LaunchSchoolPortalDataI } from "@/api/guardian.api/types"
import type { ConsentDecision } from "@/types/consent"
import { ConsentNotificationItem } from "./components/ConsentNotificationItem"
import { RegularNotificationItem } from "./components/RegularNotificationItem"
import type { ListItem } from "./components/notificationHelpers"
import { fmtDate } from "@/utils"
import { useSchoolMoney } from "@/hooks/useSchoolMoney"

// ─── Types ─────────────────────────────────────────────────────────────────────

type FilterType =
  | "All"
  | "Fee Reminders"
  | "Announcements"
  | "Events"
  | "Results"
  | "Consent"
  | "Visitation"
  | "Health"

const FILTER_TYPE_MAP: Record<FilterType, NotificationType | "consent" | null> =
  {
    All: null,
    "Fee Reminders": "fee_reminder",
    Announcements: "announcement",
    Events: "event",
    Results: "result",
    Consent: "consent",
    Visitation: "visitation",
    Health: "health",
  }

const TERMS = ["All Terms", "1st Term", "2nd Term", "3rd Term"] as const
const SESSIONS = ["All Sessions", "2024/2025", "2025/2026"] as const

// ─── Page ──────────────────────────────────────────────────────────────────────

interface ParentNotificationsPageProps {
  parentIdOverride?: string
  portalOverride?: LaunchSchoolPortalDataI
}

export default function ParentNotificationsPage({
  parentIdOverride,
  portalOverride,
}: ParentNotificationsPageProps = {}) {
  const { parentId: routeParentId } = useParams<{
    productId: string
    parentId?: string
  }>()
  const parentId = parentIdOverride ?? routeParentId

  const { parent } = useResolvedParent(parentId, portalOverride)
  const isPerParent = !!parent
  const schoolId = useSchoolId()
  const { formatMoney } = useSchoolMoney()

  const { requests } = useGetConsentRequests({
    schoolId,
    pageSize: 100,
  })

  const { events: calendarEvents } = useGetCalendarEvents({
    schoolId,
    eventType: 4,
  })
  const responses = useConsentStore((s) => s.responses)
  const respond = useConsentStore((s) => s.respond)

  const getResponse = useCallback(
    (requestId: string, studentId: string, parentId: string) =>
      responses.find(
        (r) =>
          r.requestId === requestId &&
          r.studentId === studentId &&
          r.parentId === parentId
      ),
    [responses]
  )
  const getVisitNotifs = useVisitationStore((s) => s.getParentNotifications)
  const { sickBayVisits } = useGetStudentPortalHealthRecordsForChildren(
    schoolId,
    isPerParent ? parent!.children.map((c) => c.id) : []
  )
  const [readIds, setReadIds] = useState<Set<string>>(new Set())
  const [expanded, setExpanded] = useState<string | null>(null)

  // Filters
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<FilterType>("All")
  const [termFilter, setTermFilter] = useState<string>("All Terms")
  const [sessionFilter, setSessionFilter] = useState<string>("All Sessions")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [showFilters, setShowFilters] = useState(false)

  const regularItems: ListItem[] = useMemo(
    () =>
      createMockNotifications(formatMoney).map((n) => ({
        kind: "regular" as const,
        id: n.id,
        type: n.type,
        title: n.title,
        body: n.body,
        date: n.date,
        read: readIds.has(n.id) ? true : n.read,
        priority: n.priority,
        term: n.term,
        session: n.session,
        metadata: n.metadata as Record<string, string> | undefined,
      })),
    [formatMoney, readIds]
  )

  const eventItems: ListItem[] = useMemo(
    () =>
      calendarEvents
        .filter(
          (e) =>
            !isPerParent ||
            e.affectsAllClasses ||
            parent!.children.some((c) =>
              e.affectedClasses.some((ac) => ac.schoolClassName === c.class)
            )
        )
        .map((e) => ({
          kind: "regular" as const,
          id: `event-${e.id}`,
          type: "event" as NotificationType,
          title: e.title,
          body: e.description,
          date: e.startDate.slice(0, 10),
          read: readIds.has(`event-${e.id}`),
          priority: "normal" as const,
        })),
    [calendarEvents, isPerParent, parent, readIds]
  )

  const consentItems: ListItem[] = useMemo(
    () =>
      isPerParent
        ? requests.map((req) => {
            const affectedChildren = parent!.children
            const allResponded = affectedChildren.every(
              (c) => !!getResponse(req.id, c.id, parent!.id)
            )
            return {
              kind: "consent" as const,
              id: `consent-${req.id}`,
              request: req,
              date: req.dateCreated.split("T")[0],
              read: allResponded || readIds.has(`consent-${req.id}`),
              affectedChildren,
            }
          })
        : [],
    [isPerParent, requests, parent, getResponse, readIds]
  )

  // Visitation approval/decline notifications
  const visitItems: ListItem[] = useMemo(
    () =>
      isPerParent
        ? getVisitNotifs(parent!.id).map((n) => ({
            kind: "regular" as const,
            id: `visit-${n.id}`,
            type: "visitation" as NotificationType,
            title:
              n.type === "approved"
                ? `Visit Approved — ${n.studentName}`
                : `Visit Declined — ${n.studentName}`,
            body:
              n.type === "approved"
                ? `Your visit request for ${n.studentName} at the ${n.location === "hostel" ? "hostel" : "school"} on ${fmtDate(n.visitDate)} at ${n.visitTime} has been approved. Please present this confirmation at the ${n.location === "hostel" ? "hostel reception" : "school gate"}.${n.adminNote ? ` Note from admin: ${n.adminNote}` : ""}`
                : `Your visit request for ${n.studentName} on ${fmtDate(n.visitDate)} has been declined.${n.adminNote ? ` Reason: ${n.adminNote}` : ""} Please contact the school for assistance.`,
            date: n.createdAt.split("T")[0],
            read: n.read || readIds.has(`visit-${n.id}`),
            priority: "normal" as const,
          }))
        : [],
    [isPerParent, getVisitNotifs, parent, readIds]
  )

  // Health / sick bay alerts — real data from GetStudentPortalHealthRecord,
  // one request per child. No guardian-facing read flag on the backend, so
  // "read" is tracked the same way as calendar events: purely local.
  const healthItems: ListItem[] = useMemo(
    () =>
      isPerParent
        ? sickBayVisits.map((v) => {
            const childName =
              parent!.children.find((c) => c.id === v.studentId)?.name ??
              "Your child"
            return {
              kind: "regular" as const,
              id: `health-${v.id}`,
              type: "health" as NotificationType,
              title: `Sick Bay Visit — ${childName}`,
              body: `${childName} was seen at the sick bay for ${v.complaint}.`,
              date: v.visitDate.slice(0, 10),
              read: readIds.has(`health-${v.id}`),
              priority: "normal" as const,
            }
          })
        : [],
    [isPerParent, sickBayVisits, parent, readIds]
  )

  const allItems: ListItem[] = useMemo(
    () =>
      [
        ...regularItems,
        ...eventItems,
        ...consentItems,
        ...visitItems,
        ...healthItems,
      ].sort((a, b) => b.date.localeCompare(a.date)),
    [regularItems, eventItems, consentItems, visitItems, healthItems]
  )

  // Apply filters
  const displayed = useMemo(
    () =>
      allItems.filter((item) => {
        // Type filter
        const targetType = FILTER_TYPE_MAP[typeFilter]
        if (targetType !== null) {
          if (item.kind === "consent" && targetType !== "consent") return false
          if (item.kind === "regular" && targetType !== item.type) return false
        }

        // Term filter
        if (termFilter !== "All Terms" && item.term && item.term !== termFilter)
          return false

        // Session filter
        if (
          sessionFilter !== "All Sessions" &&
          item.session &&
          item.session !== sessionFilter
        )
          return false

        // Date range filter
        if (dateFrom && item.date < dateFrom) return false
        if (dateTo && item.date > dateTo) return false

        // Search
        const query = search.trim().toLowerCase()
        if (query) {
          const haystack =
            item.kind === "consent"
              ? `${item.request.title} ${item.request.description}`
              : `${item.title} ${item.body}`
          if (!haystack.toLowerCase().includes(query)) return false
        }

        return true
      }),
    [allItems, typeFilter, termFilter, sessionFilter, dateFrom, dateTo, search]
  )

  const unreadCount = useMemo(
    () => allItems.filter((i) => !i.read).length,
    [allItems]
  )
  const pendingConsentCount = useMemo(
    () => consentItems.filter((i) => !i.read).length,
    [consentItems]
  )

  const tabCounts = useMemo(() => {
    const counts = {} as Record<FilterType, number>
    for (const key of Object.keys(FILTER_TYPE_MAP) as FilterType[]) {
      const targetType = FILTER_TYPE_MAP[key]
      counts[key] =
        key === "All"
          ? allItems.filter((i) => !i.read).length
          : targetType === "consent"
            ? consentItems.filter((i) => !i.read).length
            : allItems.filter(
                (i) => i.kind === "regular" && i.type === targetType && !i.read
              ).length
    }
    return counts
  }, [allItems, consentItems])

  const hasActiveFilters =
    !!search ||
    typeFilter !== "All" ||
    termFilter !== "All Terms" ||
    sessionFilter !== "All Sessions" ||
    !!dateFrom ||
    !!dateTo

  const markRead = useCallback((id: string) => {
    setReadIds((prev) => new Set([...prev, id]))
  }, [])

  const toggle = useCallback(
    (id: string) => {
      setExpanded((prev) => (prev === id ? null : id))
      markRead(id)
    },
    [markRead]
  )

  const handleConsentRespond = useCallback(
    (
      requestId: string,
      studentId: string,
      studentName: string,
      decision: ConsentDecision,
      notes?: string
    ) => {
      if (!parent) return
      respond({
        requestId,
        parentId: parent.id,
        studentId,
        studentName,
        decision,
        notes,
      })
    },
    [respond, parent]
  )

  const resolveConsentResponse = useCallback(
    (requestId: string, studentId: string) =>
      parent ? getResponse(requestId, studentId, parent.id) : undefined,
    [getResponse, parent]
  )

  function markAllRead() {
    const ids = allItems.map((i) => i.id)
    setReadIds((prev) => new Set([...prev, ...ids]))
  }

  function clearFilters() {
    setSearch("")
    setTypeFilter("All")
    setTermFilter("All Terms")
    setSessionFilter("All Sessions")
    setDateFrom("")
    setDateTo("")
  }

  return (
    <div>
      <PageHeader
        title="Notifications"
        description={
          <>
            {isPerParent
              ? `${parent!.firstName} ${parent!.lastName} — fee reminders, announcements & consent requests`
              : "Fee reminders, announcements and school updates"}
            {unreadCount > 0 && (
              <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-600">
                {unreadCount} unread
              </span>
            )}
          </>
        }
        actions={
          <>
            <button
              onClick={() => setShowFilters((p) => !p)}
              className={`flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-xs font-medium transition-colors ${
                showFilters || hasActiveFilters
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              <SlidersHorizontal size={13} />
              Filter
              {hasActiveFilters && (
                <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[10px] leading-none font-bold">
                  !
                </span>
              )}
            </button>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3.5 py-2 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50"
              >
                <CheckCheck size={13} />
                Mark all read
              </button>
            )}
          </>
        }
        className="mb-6"
      />

      {/* Consent pending banner — only in per-parent mode */}
      {isPerParent && pendingConsentCount > 0 && (
        <div className="mb-5 flex items-center gap-3 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 dark:border-orange-500/30 dark:bg-orange-900/10">
          <AlertTriangle size={16} className="shrink-0 text-orange-500" />
          <p className="text-sm text-orange-700 dark:text-orange-300">
            <span className="font-semibold">{pendingConsentCount}</span> consent
            request{pendingConsentCount > 1 ? "s" : ""} awaiting your response.
          </p>
        </div>
      )}

      {/* Search */}
      <div className="relative mb-3">
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Search notifications..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border-gray-200 pl-9"
        />
      </div>

      {/* Type filter tabs */}
      <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
        {(Object.keys(FILTER_TYPE_MAP) as FilterType[]).map((f) => {
          const count = tabCounts[f]

          return (
            <button
              key={f}
              onClick={() => setTypeFilter(f)}
              className={`flex shrink-0 items-center gap-1.5 rounded-lg border px-3.5 py-1.5 text-xs font-medium transition-all ${
                typeFilter === f
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 dark:border-white/10 dark:bg-white/3 dark:text-gray-300"
              }`}
            >
              {f}
              {count > 0 && (
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] leading-none font-semibold ${
                    typeFilter === f
                      ? "bg-white/20 text-white"
                      : "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Advanced filters panel */}
      {showFilters && (
        <div className="mb-4 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-white/10 dark:bg-white/3">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">
              Filter by
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 dark:text-red-400"
              >
                <X size={11} />
                Clear all
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {/* Session */}
            <div>
              <label className="mb-1.5 block text-[11px] font-medium text-gray-500 dark:text-gray-400">
                Session
              </label>
              <select
                value={sessionFilter}
                onChange={(e) => setSessionFilter(e.target.value)}
                className={selectCls}
              >
                {SESSIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Term */}
            <div>
              <label className="mb-1.5 block text-[11px] font-medium text-gray-500 dark:text-gray-400">
                Term
              </label>
              <select
                value={termFilter}
                onChange={(e) => setTermFilter(e.target.value)}
                className={selectCls}
              >
                {TERMS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Date from */}
            <div>
              <label className="mb-1.5 block text-[11px] font-medium text-gray-500 dark:text-gray-400">
                From date
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className={selectCls}
              />
            </div>

            {/* Date to */}
            <div>
              <label className="mb-1.5 block text-[11px] font-medium text-gray-500 dark:text-gray-400">
                To date
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className={selectCls}
              />
            </div>
          </div>
        </div>
      )}

      {/* Notification list */}
      {displayed.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white py-20 text-center dark:border-white/10 dark:bg-white/3">
          <Bell size={36} className="mb-3 text-gray-300 dark:text-gray-600" />
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            No notifications
          </p>
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
            {hasActiveFilters
              ? "Try adjusting or clearing your filters"
              : "Check back later for updates"}
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="mt-3 rounded-lg bg-gray-100 px-3.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-200 dark:bg-white/10 dark:text-gray-300"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2.5">
          {displayed.map((item) =>
            item.kind === "regular" ? (
              <RegularNotificationItem
                key={item.id}
                item={item}
                isExpanded={expanded === item.id}
                onToggle={toggle}
              />
            ) : (
              <ConsentNotificationItem
                key={item.id}
                item={item}
                isExpanded={expanded === item.id}
                onToggle={toggle}
                parentId={parent?.id ?? ""}
                getResponse={resolveConsentResponse}
                onRespond={handleConsentRespond}
              />
            )
          )}
        </div>
      )}
    </div>
  )
}

// ─── Helpers ────────────────────────────────────────────────────────────────────

const selectCls =
  "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700 focus:border-blue-400 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-gray-300"
