import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useSearchParams } from "react-router"
import { Loader2, WifiOff } from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"
import { useSchoolId } from "@/contexts/SchoolContext"
import {
  useChatActor,
  useChatContacts,
  useChatConversations,
  useChatMessages,
  useChatClasses,
  useChatRealtime,
  useMarkChatRead,
  useOpenClassChatRoom,
  useRemoveOptimisticMessage,
  useSendChatMessage,
  useStartChatConversation,
  useParticipantsById,
  useThreadPreviews,
  newClientMessageId,
  toViewMessage,
  DEFAULT_CONTACT_PAGE_SIZE,
  type ChatMessage,
  type ChatRole,
  type ChatSendPayload,
} from "@/hooks/chat"
import type { GetChatConversationsResponseI } from "@/api/chat.api/types"
import { queryKeys } from "@/utils/queryKeys"
import { ChatSidebar } from "./ChatSidebar"
import { ChatThread } from "./ChatThread"
import { NewChatDialog } from "./NewChatDialog"

/** How long to wait after the last keystroke before asking the server for contacts. */
const CONTACT_SEARCH_DEBOUNCE_MS = 250

/**
 * One line describing this person's reach, for the banner above the thread list.
 *
 * Written from the reader's point of view rather than as a statement of the whole matrix.
 * The staff-facing wording ("everyone but parents can reach each other · parents reach the
 * Super Admin only") is accurate but describes the system; a parent reading it has to work
 * out which clause is about them.
 */
function reachSummary(role: ChatRole): string {
  switch (role) {
    case "parent":
      return "You can message the school's Super Admin. Staff and teachers reach you here too."
    case "student":
      return "You can message anyone at your school except parents, plus your class group."
    case "teacher":
      return "You can message anyone at the school except parents, plus the class groups you teach."
    case "admin":
      return "You can message anyone at the school except parents — only the Super Admin reaches parents."
    case "superadmin":
      return "You can message everyone at the school, and you are the only person parents can reach."
  }
}

export interface ChatShellProps {
  /**
   * States the caller's chat role instead of deriving it. Required in the student and parent
   * portals, whose routes carry no `productId` for the derivation to key on. Display only —
   * the server decides what each role may actually do and returns an already-filtered
   * contact list, so this cannot widen anyone's reach.
   */
  roleOverride?: ChatRole
}

export function ChatShell({ roleOverride }: ChatShellProps = {}) {
  const schoolId = useSchoolId()
  const [searchParams] = useSearchParams()
  const requestedClassId = searchParams.get("classId")
  const queryClient = useQueryClient()
  const { role, actorId, displayName, isResolving } = useChatActor(roleOverride)

  /** The thread the user explicitly picked. Null means "whatever is at the top". */
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [newOpen, setNewOpen] = useState(false)
  const [contactSearch, setContactSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [pendingPeerId, setPendingPeerId] = useState<string | null>(null)

  /**
   * A conversation this tab just created, held until it appears in the fetched list.
   *
   * `activeId` below falls back to the top of the list for any id it does not recognise,
   * and a thread created moments ago is not in the fetched list yet. Without this pin the
   * selection snapped straight back to the previous conversation, and the new one only
   * opened once the list refetched — which is where "it takes minutes to see the user"
   * came from.
   */
  const [pinnedConversationId, setPinnedConversationId] = useState<
    string | null
  >(null)

  // Debounce the search term rather than firing a request per keystroke. Each one is a full
  // round trip, and on a tunnelled dev API the responses can arrive out of order.
  useEffect(() => {
    const id = window.setTimeout(
      () => setDebouncedSearch(contactSearch),
      CONTACT_SEARCH_DEBOUNCE_MS
    )
    return () => window.clearTimeout(id)
  }, [contactSearch])

  // Live updates first: the poll interval below depends on whether the socket is healthy.
  const { connected, polling } = useChatRealtime(schoolId)

  const { conversations, isLoading: conversationsLoading } =
    useChatConversations(schoolId, true, connected || polling)

  /**
   * Contacts, fetched only while the dialog is open.
   *
   * This used to run on every mount of the chat page and pull the whole school. Nothing on
   * the main chat screen needs it: names on threads and messages come from the conversation
   * and message payloads, which carry their own participants.
   */
  const {
    contacts,
    isLoading: contactsLoading,
    isFetching: contactsFetching,
  } = useChatContacts(
    schoolId,
    debouncedSearch,
    newOpen,
    DEFAULT_CONTACT_PAGE_SIZE
  )

  // Also dialog-scoped. Class rooms the person has already opened arrive in the conversation
  // list, so nothing on the main screen needs this.
  const { classes } = useChatClasses(schoolId, newOpen)

  const threads = useThreadPreviews(conversations)

  /**
   * The thread actually on screen.
   *
   * Derived rather than corrected by an effect. The previous version stored `activeId` and
   * used an effect to snap it back to `threads[0]` whenever it did not appear in the list —
   * which fought every state change: selecting a brand-new conversation set the id, the
   * effect ran before the list had refetched, saw an id it did not recognise, and reset the
   * selection. Computing it makes the invalid state unrepresentable instead of transient.
   */
  const activeId = useMemo(() => {
    if (selectedId) {
      if (threads.some((t) => t.conversation.id === selectedId))
        return selectedId
      // A conversation this tab just created is legitimate before the list catches up.
      if (selectedId === pinnedConversationId) return selectedId
    }
    return threads[0]?.conversation.id ?? null
  }, [selectedId, threads, pinnedConversationId])

  const { messages: apiMessages } = useChatMessages(schoolId, activeId)

  const { markRead } = useMarkChatRead()
  const removeOptimisticMessage = useRemoveOptimisticMessage()
  const { sendMessage } = useSendChatMessage()

  // `pendingPeerId` (not the mutation's isPending) drives the dialog's busy state, because
  // it also names *which* row was clicked.
  const { startConversation } = useStartChatConversation({
    onSuccess: (data) => {
      const conversation = data.value

      // Seed the list from the response instead of waiting for a refetch. The start
      // endpoint returns the full conversation DTO, so the thread can be selected and
      // opened on this tick rather than a round trip later.
      queryClient.setQueryData<GetChatConversationsResponseI>(
        [queryKeys.chatConversations, schoolId],
        (previous) => {
          if (!previous?.value) return previous
          if (previous.value.some((c) => c.id === conversation.id))
            return previous
          return { ...previous, value: [conversation, ...previous.value] }
        }
      )

      setPinnedConversationId(conversation.id)
      setSelectedId(conversation.id)
      setNewOpen(false)
      setContactSearch("")
      setPendingPeerId(null)
    },
    onError: () => setPendingPeerId(null),
  })

  const [pendingClassId, setPendingClassId] = useState<string | null>(null)

  const { openClassRoom } = useOpenClassChatRoom({
    onSuccess: (data) => {
      const conversation = data.value

      // Same treatment as a new direct thread: seed it into the list from the response and
      // pin the selection, so the room opens on this tick instead of a refetch later. A
      // class room is often being created by this very call, so without the seed the list
      // genuinely does not contain it yet.
      queryClient.setQueryData<GetChatConversationsResponseI>(
        [queryKeys.chatConversations, schoolId],
        (previous) => {
          if (!previous?.value) return previous
          if (previous.value.some((c) => c.id === conversation.id)) return previous
          return { ...previous, value: [conversation, ...previous.value] }
        }
      )

      setPinnedConversationId(conversation.id)
      setSelectedId(conversation.id)
      setNewOpen(false)
      setContactSearch("")
      setPendingClassId(null)
    },
    onError: () => setPendingClassId(null),
  })

  // Course workspaces link here with classId. Open (or create) that exact class
  // room once, so the teacher lands in the correct course's class chat instead
  // of whichever conversation happened to be first in the sidebar.
  const autoOpenedClassKey = useRef<string | null>(null)
  useEffect(() => {
    if (!schoolId || !requestedClassId) return
    const key = `${schoolId}:${requestedClassId}`
    if (autoOpenedClassKey.current === key) return
    autoOpenedClassKey.current = key
    openClassRoom({ schoolId, schoolClassId: requestedClassId })
  }, [openClassRoom, requestedClassId, schoolId])

  const participantsById = useParticipantsById(
    contacts,
    conversations,
    apiMessages
  )
  const messages = useMemo(() => apiMessages.map(toViewMessage), [apiMessages])

  const contactParticipants = useMemo(
    () => contacts.map((c) => participantsById[c.userId]).filter(Boolean),
    [contacts, participantsById]
  )

  /** Picks a thread, dropping any pin — the pin only protects a just-created thread. */
  const handleSelect = useCallback((conversationId: string) => {
    setSelectedId(conversationId)
    setPinnedConversationId(null)
  }, [])

  // Coalesce read receipts. Arrowing through threads would otherwise fire a write per
  // thread touched, each racing the next.
  const markReadTimer = useRef<number | null>(null)

  useEffect(() => {
    if (!activeId || !schoolId) return
    const thread = threads.find((t) => t.conversation.id === activeId)
    // Only call the API when there is actually a badge to clear.
    if (!thread || thread.unread === 0) return

    if (markReadTimer.current) window.clearTimeout(markReadTimer.current)
    markReadTimer.current = window.setTimeout(() => {
      markRead({ schoolId, conversationId: activeId })
    }, 400)

    return () => {
      if (markReadTimer.current) window.clearTimeout(markReadTimer.current)
    }
  }, [activeId, schoolId, threads, markRead])

  const activeThread = threads.find((t) => t.conversation.id === activeId)

  const handleSend = useCallback(
    (payload: ChatSendPayload, conversationId?: string) => {
      const targetId = conversationId ?? activeId
      if (!targetId || !schoolId) return

      sendMessage({
        schoolId,
        conversationId: targetId,
        body: payload.body,
        kind: payload.kind ?? "text",
        attachmentName: payload.attachmentName,
        attachmentUrl: payload.attachmentUrl,
        clientId: newClientMessageId(),
        // Display only, and stripped before the request. The server assigns the real sender
        // from the bearer token; this just stops the optimistic bubble from reading as
        // "Unknown user" for the moment before the confirmed copy replaces it.
        sender: { userId: actorId, name: displayName, role },
      })
    },
    [activeId, schoolId, sendMessage, actorId, displayName, role]
  )

  /** Drops the failed row, then sends the same content again under a fresh client id. */
  const handleRetry = useCallback(
    (message: ChatMessage) => {
      if (!activeId || !schoolId) return
      if (message.deliveryStatus !== "failed" || !message.clientId) return

      removeOptimisticMessage(schoolId, activeId, message.clientId)
      handleSend(
        {
          body: message.body,
          kind: message.kind,
          attachmentName: message.attachmentName,
          attachmentUrl: message.attachmentUrl,
        },
        activeId
      )
    },
    [activeId, schoolId, removeOptimisticMessage, handleSend]
  )

  if (!schoolId) {
    return (
      <div className="flex h-full items-center justify-center bg-white px-6 text-center">
        <p className="text-sm text-slate-500">Select a school to open chat.</p>
      </div>
    )
  }

  if (isResolving) {
    return (
      <div className="flex h-full items-center justify-center bg-white">
        <Loader2 className="size-6 animate-spin text-slate-400" />
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 bg-slate-50 px-4 py-2">
        <p className="text-xs text-slate-500">{reachSummary(role)}</p>
        {!connected && (
          <span
            className="inline-flex items-center gap-1.5 text-[11px] text-slate-400"
            // Says what it means for the person reading it. "Live updates are unavailable"
            // described the transport; what someone needs to know is whether their message
            // will arrive, and that the answer is yes.
            title="Not connected for instant delivery. Messages still send and arrive — they may take a few seconds longer to appear."
          >
            <WifiOff className="size-3" />
            {polling ? "Updates every 10 seconds" : "Reconnecting"}
          </span>
        )}
      </div>

      <div className="flex min-h-0 flex-1">
        <ChatSidebar
          role={role}
          threads={threads}
          activeId={activeId}
          onSelect={handleSelect}
          onNewChat={() => setNewOpen(true)}
          isLoading={conversationsLoading}
        />
        <ChatThread
          thread={activeThread ?? null}
          messages={messages}
          actorId={actorId}
          participantsById={participantsById}
          onSend={handleSend}
          onRetry={handleRetry}
        />
      </div>

      <NewChatDialog
        open={newOpen}
        onOpenChange={setNewOpen}
        contacts={contactParticipants}
        search={contactSearch}
        onSearchChange={setContactSearch}
        isLoading={contactsLoading}
        isFetching={contactsFetching}
        pageSize={DEFAULT_CONTACT_PAGE_SIZE}
        pendingPeerId={pendingPeerId}
        onPick={(peerId) => {
          setPendingPeerId(peerId)
          startConversation({ schoolId, peerUserId: peerId })
        }}
        classes={classes}
        pendingClassId={pendingClassId}
        onPickClass={(schoolClassId) => {
          const existing = classes.find(
            (c) => c.schoolClassId === schoolClassId
          )?.conversationId

          // Already open — just select it. Calling the endpoint would work too (it is
          // idempotent), but it would cost a round trip and a membership reconcile to land
          // on a thread that is already in the list.
          if (existing) {
            setSelectedId(existing)
            setNewOpen(false)
            setContactSearch("")
            return
          }

          setPendingClassId(schoolClassId)
          openClassRoom({ schoolId, schoolClassId })
        }}
      />
    </div>
  )
}
