import { useNavigate, useParams } from "react-router"
import { PageHeader } from "@/components/general/PageHeader"
import { ChatShell } from "@/pages/Dashboard/Chat/components/ChatShell"
import { HomeRoutes } from "@/routes"

/**
 * Chat, for a signed-in parent or guardian.
 *
 * Kept separate from the existing "Messages" page rather than folded into it. Messages is
 * school announcements plus the older staff panel; this is the live one-to-one thread. They
 * are different things with different data behind them, and merging them would have meant
 * deleting a feature nobody asked to lose.
 *
 * A parent's contact list is exactly one person — the school's Super Admin — and that is
 * decided server-side, not here. GetContactsAsync short-circuits for parents and returns the
 * school Owner alone, and StartChatConversation returns 403 for any other peer, whatever the
 * UI displayed. The "New" button therefore opens a picker with a single entry, which is the
 * honest representation of what a parent may do.
 *
 * `roleOverride` is display only — see StudentChatPage for why it is needed at all.
 */
export default function ParentChatPage() {
  const navigate = useNavigate()
  // The raw route param, not the resolved UUID from useSchoolId(), so the back link keeps
  // the slug in the address bar rather than swapping it for a UUID.
  const { schoolId = "" } = useParams<{ schoolId: string }>()

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title="Chat"
        description="Message the school office directly"
        onBack={() => navigate(HomeRoutes.toParentHome(schoolId))}
        backLabel="Back to Overview"
        className="mb-4"
      />

      {/*
        Height is pinned rather than left to grow: ChatShell scrolls its own message list, so
        an unbounded height would scroll the page instead and push the composer off screen on
        any long conversation. The negative margins let the panel meet the content edges.
      */}
      <div className="-mx-6 -mb-6 flex h-[calc(100vh-14rem)] min-h-[520px] flex-col overflow-hidden border-t border-slate-200 bg-white">
        <ChatShell roleOverride="parent" />
      </div>
    </div>
  )
}
