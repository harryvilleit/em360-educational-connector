import { useMemo } from "react"
import type {
  ChatContactI,
  ChatConversationI,
  ChatMessageI,
} from "@/api/chat.api/types"
import type {
  ChatMessage,
  ChatParticipant,
  ChatThreadPreview,
} from "@/types/chat"

/**
 * Adapters from the API's DTOs to the view models the chat components already speak.
 *
 * The presentational layer (ChatSidebar, ChatThread, ConversationListItem, NewChatDialog,
 * ChatMediaModal) is good and did not need rewriting when the mock store went away — it
 * just needed a different source. Keeping the mapping in one place means the components
 * stay unaware of the wire format, and a backend field rename touches this file only.
 */

const AVATAR_PALETTE = [
  "bg-violet-600",
  "bg-sky-600",
  "bg-emerald-600",
  "bg-amber-600",
  "bg-rose-600",
  "bg-indigo-600",
  "bg-teal-600",
  "bg-cyan-700",
  "bg-lime-600",
  "bg-blue-700",
]

/**
 * Deterministic avatar colour from an id.
 *
 * The mock data hand-picked a colour per person; real users arrive without one. Hashing
 * the id keeps a given person the same colour on every device and across reloads, which
 * a random pick would not.
 */
export function avatarColorFor(id: string): string {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) | 0
  }
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length]
}

export function toParticipant(contact: ChatContactI): ChatParticipant {
  return {
    id: contact.userId,
    name: contact.name,
    role: contact.role,
    email: contact.email ?? undefined,
    avatarColor: avatarColorFor(contact.userId),
    classNames: contact.classNames,
    subjects: contact.subjects,
    // Presence is not modelled server-side yet. Left undefined rather than defaulted to
    // false so the UI omits the dot entirely instead of showing everyone as offline.
    online: undefined,
  }
}

export function toViewMessage(message: ChatMessageI): ChatMessage {
  return {
    id: message.id,
    conversationId: message.conversationId,
    senderId: message.senderUserId,
    body: message.body,
    kind: message.kind,
    sentAt: message.sentAtUtc,
    attachmentName: message.attachmentName ?? undefined,
    attachmentUrl: message.attachmentUrl ?? undefined,
    // Carried through so the thread can show a clock or a retry affordance on the sender's
    // own in-flight messages. Undefined for everything the server has confirmed.
    deliveryStatus: message.deliveryStatus,
    clientId: message.clientId,
  }
}

export function toThreadPreview(conversation: ChatConversationI): ChatThreadPreview {
  const isGroup = conversation.kind === "class"

  const memberIds = isGroup
    ? conversation.members.map((m) => m.userId)
    : conversation.peer
      ? [conversation.peer.userId]
      : []

  const subtitle = isGroup
    ? `${conversation.studentCount} student${conversation.studentCount === 1 ? "" : "s"} · ` +
      `${conversation.teacherCount} teacher${conversation.teacherCount === 1 ? "" : "s"} · Class group`
    : conversation.peer?.classNames?.[0]

  return {
    conversation: {
      id: conversation.id,
      kind: conversation.kind,
      participantIds: memberIds,
      className: conversation.className ?? undefined,
      title: conversation.title,
      updatedAt: conversation.lastMessageAtUtc,
      unreadBy: {},
    },
    peer: conversation.peer ? toParticipant(conversation.peer) : null,
    title: conversation.title,
    subtitle,
    avatarName: isGroup ? (conversation.className ?? conversation.title) : conversation.title,
    avatarColor: avatarColorFor(conversation.schoolClassId ?? conversation.id),
    isGroup,
    memberCount: conversation.memberCount,
    lastMessage: conversation.lastMessage ? toViewMessage(conversation.lastMessage) : undefined,
    unread: conversation.unread,
  }
}

/** Maps a conversation list to thread previews, memoised on the source array. */
export function useThreadPreviews(conversations: ChatConversationI[]): ChatThreadPreview[] {
  return useMemo(() => conversations.map(toThreadPreview), [conversations])
}

/**
 * Everyone the UI might need to name, keyed by user id.
 *
 * Built from contacts, conversation peers, class-room members AND message senders —
 * a sender can be someone who has since left the contact list (a teacher who changed
 * role, say), and their old messages must still render with a name rather than "Unknown".
 */
export function useParticipantsById(
  contacts: ChatContactI[],
  conversations: ChatConversationI[],
  messages: ChatMessageI[]
): Record<string, ChatParticipant> {
  return useMemo(() => {
    const map: Record<string, ChatParticipant> = {}

    const add = (contact: ChatContactI) => {
      if (!map[contact.userId]) map[contact.userId] = toParticipant(contact)
    }

    contacts.forEach(add)

    for (const conversation of conversations) {
      if (conversation.peer) add(conversation.peer)
      conversation.members.forEach(add)
    }

    for (const message of messages) {
      if (map[message.senderUserId]) continue
      map[message.senderUserId] = {
        id: message.senderUserId,
        name: message.senderName,
        role: message.senderRole,
        avatarColor: avatarColorFor(message.senderUserId),
      }
    }

    return map
  }, [contacts, conversations, messages])
}
