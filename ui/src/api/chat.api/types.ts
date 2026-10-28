// Backend bodies are PascalCase `Result<T>` envelopes; these are the camelCase shapes
// produced after `normalizeResponse` at the API boundary.
import type { ApiResultBaseI } from "../liveClass.api/types"

/**
 * A user's role within chat for one school.
 *
 * These are the numeric values of the backend's `ChatParticipantRole` enum. The API
 * serialises enums as strings (StringEnumConverter), so both forms are accepted on the
 * way in — see `parseChatRole`.
 *
 * IMPORTANT: this is a display and UX concern only. The server decides what a role may
 * actually do; the contact list it returns is already filtered.
 */
export const ChatRoleValue = {
  SuperAdmin: 0,
  Admin: 1,
  Teacher: 2,
  Student: 3,
  Parent: 4,
} as const

export type ChatRoleName =
  | "superadmin"
  | "admin"
  | "teacher"
  | "student"
  | "parent"

export const ChatConversationKindValue = {
  Direct: 0,
  Class: 1,
} as const

export type ChatConversationKindName = "direct" | "class"

export const ChatMessageKindValue = {
  Text: 0,
  Image: 1,
  File: 2,
} as const

export type ChatMessageKindName = "text" | "image" | "file"

/** A person the caller is allowed to message. Already filtered server-side. */
export interface ChatContactI {
  userId: string
  name: string
  email?: string | null
  role: ChatRoleName
  classNames: string[]
  subjects: string[]
}

/**
 * Where a message is in its journey to the server.
 *
 * Absent means "the server has it" — every message that came back from an API call or the
 * hub. Only locally-created messages awaiting a response carry a value, so code that never
 * sets this keeps behaving exactly as before.
 */
export type ChatDeliveryStatus = "sending" | "failed"

export interface ChatMessageI {
  id: string
  conversationId: string
  senderUserId: string
  senderName: string
  senderRole: ChatRoleName
  body: string
  kind: ChatMessageKindName
  attachmentName?: string | null
  attachmentUrl?: string | null
  sentAtUtc: string
  /**
   * Client-side only, never sent by the API. Set while an optimistic message is in flight
   * and cleared when the server's own copy replaces it.
   */
  deliveryStatus?: ChatDeliveryStatus
  /**
   * The id the message was optimistically inserted under. Kept on the reconciled message so
   * a retry can find and replace the right row rather than appending a second copy.
   */
  clientId?: string
}

export interface ChatConversationI {
  id: string
  kind: ChatConversationKindName
  title: string
  peer?: ChatContactI | null
  schoolClassId?: string | null
  className?: string | null
  studentCount: number
  teacherCount: number
  memberCount: number
  /** Class-room members, for the info panel. Empty for direct threads. */
  members: ChatContactI[]
  lastMessage?: ChatMessageI | null
  unread: number
  lastMessageAtUtc: string
}

// ── Params / payloads ────────────────────────────────────────────────────────────────

export interface GetChatContactsParamsI {
  schoolId: string
  search?: string
  /**
   * Maximum contacts to return. The server caps this; omitting it asks for the server's
   * own default rather than "everyone", so a forgotten `take` cannot re-introduce a
   * full-directory transfer.
   */
  take?: number
}

export interface GetChatConversationsParamsI {
  schoolId: string
}

export interface GetChatMessagesParamsI {
  schoolId: string
  conversationId: string
  pageNumber?: number
  pageSize?: number
}

export interface StartChatConversationPayloadI {
  schoolId: string
  peerUserId: string
}

export interface SendChatMessagePayloadI {
  schoolId: string
  conversationId: string
  body: string
  kind?: ChatMessageKindName
  attachmentName?: string | null
  attachmentUrl?: string | null
  /**
   * Stable id for this attempt, generated before the request leaves. It identifies the
   * optimistic row in the cache so success can replace it and failure can mark it — an
   * index or array position would break the moment another message arrives mid-flight.
   * Stripped in `sendChatMessageApi`; the server never sees it.
   */
  clientId?: string
  /**
   * Who to attribute the optimistic bubble to until the server's copy arrives. Display
   * only, and stripped before the request — the server stamps the real sender from the
   * bearer token regardless of what is in the body.
   */
  sender?: {
    userId: string
    name: string
    role: ChatRoleName
  }
}

export interface MarkChatReadPayloadI {
  schoolId: string
  conversationId: string
}

/** A class the caller belongs to, offered in the picker as a group chat they can open. */
export interface ChatClassI {
  schoolClassId: string
  className: string
  studentCount: number
  teacherCount: number
  /** The room's id, or null when nobody has opened this class's chat yet. */
  conversationId?: string | null
}

export interface GetChatClassesParamsI {
  schoolId: string
}

export interface OpenClassChatRoomPayloadI {
  schoolId: string
  schoolClassId: string
}

// ── Responses ────────────────────────────────────────────────────────────────────────

export interface GetChatContactsResponseI extends ApiResultBaseI {
  value: ChatContactI[]
}

export interface GetChatConversationsResponseI extends ApiResultBaseI {
  value: ChatConversationI[]
}

export interface PaginatedChatMessagesValueI {
  items: ChatMessageI[]
  pageNumber: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export interface GetChatMessagesResponseI extends ApiResultBaseI {
  value: PaginatedChatMessagesValueI
}

export interface StartChatConversationResponseI extends ApiResultBaseI {
  value: ChatConversationI
}

export interface SendChatMessageResponseI extends ApiResultBaseI {
  value: ChatMessageI
}

export type MarkChatReadResponseI = ApiResultBaseI

export interface GetChatClassesResponseI extends ApiResultBaseI {
  value: ChatClassI[]
}

export interface OpenClassChatRoomResponseI extends ApiResultBaseI {
  value: ChatConversationI
}

// ── Enum coercion ────────────────────────────────────────────────────────────────────

const ROLE_BY_NUMBER: Record<number, ChatRoleName> = {
  0: "superadmin",
  1: "admin",
  2: "teacher",
  3: "student",
  4: "parent",
}

/**
 * Coerces whatever the API sends for a role into the lowercase name the UI uses.
 *
 * The backend is configured with StringEnumConverter, so it normally sends
 * "SuperAdmin" — but a raw integer arrives from any endpoint that bypasses the
 * Newtonsoft pipeline, and getting this wrong silently mislabels every badge. Accepting
 * both is cheaper than depending on serializer configuration staying put.
 */
export function parseChatRole(raw: unknown): ChatRoleName {
  if (typeof raw === "number" && raw in ROLE_BY_NUMBER) return ROLE_BY_NUMBER[raw]

  if (typeof raw === "string") {
    const normalized = raw.trim().toLowerCase()
    if (normalized === "superadmin" || normalized === "super admin") return "superadmin"
    if (normalized === "admin") return "admin"
    if (normalized === "teacher") return "teacher"
    if (normalized === "student") return "student"
    if (normalized === "parent") return "parent"

    const asNumber = Number(normalized)
    if (!Number.isNaN(asNumber) && asNumber in ROLE_BY_NUMBER) return ROLE_BY_NUMBER[asNumber]
  }

  // Falling back to "student" rather than "superadmin" keeps an unknown value from being
  // rendered as the most privileged badge in the system.
  return "student"
}

export function parseConversationKind(raw: unknown): ChatConversationKindName {
  if (typeof raw === "number") return raw === 1 ? "class" : "direct"
  if (typeof raw === "string") return raw.trim().toLowerCase() === "class" ? "class" : "direct"
  return "direct"
}

export function parseMessageKind(raw: unknown): ChatMessageKindName {
  if (typeof raw === "number") return raw === 1 ? "image" : raw === 2 ? "file" : "text"
  if (typeof raw === "string") {
    const normalized = raw.trim().toLowerCase()
    if (normalized === "image") return "image"
    if (normalized === "file") return "file"
  }
  return "text"
}

/** Serialises a message kind back to the name the backend enum expects. */
export function serializeMessageKind(kind: ChatMessageKindName): string {
  if (kind === "image") return "Image"
  if (kind === "file") return "File"
  return "Text"
}
