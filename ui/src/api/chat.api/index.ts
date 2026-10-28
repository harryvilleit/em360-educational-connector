import apiClient from "../api"
import { normalizeResponse } from "@/utils/apiResponse"
import {
  parseChatRole,
  parseConversationKind,
  parseMessageKind,
  serializeMessageKind,
  type ChatContactI,
  type ChatConversationI,
  type ChatMessageI,
  type GetChatClassesParamsI,
  type GetChatClassesResponseI,
  type GetChatContactsParamsI,
  type GetChatContactsResponseI,
  type OpenClassChatRoomPayloadI,
  type OpenClassChatRoomResponseI,
  type GetChatConversationsParamsI,
  type GetChatConversationsResponseI,
  type GetChatMessagesParamsI,
  type GetChatMessagesResponseI,
  type MarkChatReadPayloadI,
  type MarkChatReadResponseI,
  type SendChatMessagePayloadI,
  type SendChatMessageResponseI,
  type StartChatConversationPayloadI,
  type StartChatConversationResponseI,
} from "./types"

// ── Normalisers ──────────────────────────────────────────────────────────────────────
// normalizeResponse camelCases keys but leaves values alone, so enums arrive as the
// backend serialised them. These coerce every enum to the lowercase union the UI uses,
// once, at the boundary — so no component ever has to care.

function toContact(raw: ChatContactI): ChatContactI {
  return {
    ...raw,
    role: parseChatRole(raw?.role),
    classNames: raw?.classNames ?? [],
    subjects: raw?.subjects ?? [],
  }
}

function toMessage(raw: ChatMessageI): ChatMessageI {
  return {
    ...raw,
    kind: parseMessageKind(raw?.kind),
    senderRole: parseChatRole(raw?.senderRole),
  }
}

function toConversation(raw: ChatConversationI): ChatConversationI {
  return {
    ...raw,
    kind: parseConversationKind(raw?.kind),
    peer: raw?.peer ? toContact(raw.peer) : null,
    members: (raw?.members ?? []).map(toContact),
    lastMessage: raw?.lastMessage ? toMessage(raw.lastMessage) : null,
  }
}

// ── Endpoints ────────────────────────────────────────────────────────────────────────

/**
 * People the caller may message.
 *
 * The server has already applied the permission matrix, so this list is authoritative —
 * do not filter it again client-side, and do not assume anything absent from it can be
 * reached by other means.
 */
export const getChatContactsApi = async (
  params: GetChatContactsParamsI
): Promise<GetChatContactsResponseI> => {
  const res = await apiClient.get("/Chat/Contacts", { params })
  const data = normalizeResponse<GetChatContactsResponseI>(res)
  return { ...data, value: (data.value ?? []).map(toContact) }
}

/**
 * Contacts scoped to what the "New chat" dialog actually shows.
 *
 * Separate from `getChatContactsApi` only so the caller cannot forget `take`. The dialog
 * renders a short list and a search box, so pulling the entire school directory to filter
 * it in the browser was paying a full-directory query and transfer for ten visible rows.
 * The search term goes to the server, which matches on first name, last name and email.
 */
export const searchChatContactsApi = async (
  params: GetChatContactsParamsI & { take: number }
): Promise<GetChatContactsResponseI> => getChatContactsApi(params)

export const getChatConversationsApi = async (
  params: GetChatConversationsParamsI
): Promise<GetChatConversationsResponseI> => {
  const res = await apiClient.get("/Chat/Conversations", { params })
  const data = normalizeResponse<GetChatConversationsResponseI>(res)
  return { ...data, value: (data.value ?? []).map(toConversation) }
}

export const getChatMessagesApi = async ({
  conversationId,
  ...params
}: GetChatMessagesParamsI): Promise<GetChatMessagesResponseI> => {
  const res = await apiClient.get(
    `/Chat/Conversations/${conversationId}/Messages`,
    {
      params,
    }
  )
  const data = normalizeResponse<GetChatMessagesResponseI>(res)

  return {
    ...data,
    value: {
      items: (data.value?.items ?? []).map(toMessage),
      pageNumber: data.value?.pageNumber ?? 1,
      pageSize: data.value?.pageSize ?? 30,
      totalItems: data.value?.totalItems ?? 0,
      totalPages: data.value?.totalPages ?? 0,
    },
  }
}

/**
 * Opens the direct thread with one person, or returns the existing one.
 * Safe to call repeatedly — the same pair always resolves to the same conversation.
 */
export const startChatConversationApi = async (
  payload: StartChatConversationPayloadI
): Promise<StartChatConversationResponseI> => {
  const res = await apiClient.post("/Chat/Conversations/Start", payload)
  const data = normalizeResponse<StartChatConversationResponseI>(res)
  return { ...data, value: toConversation(data.value) }
}

export const sendChatMessageApi = async (
  payload: SendChatMessagePayloadI
): Promise<SendChatMessageResponseI> => {
  const { conversationId, kind = "text" } = payload

  // The body is built field by field rather than spread. `clientId` and `sender` exist only
  // to render the message locally before the server answers; the server assigns the real
  // sender from the bearer token and would ignore them. Listing what goes on the wire means
  // a future client-only field cannot leak by being added to the payload type.
  const res = await apiClient.post(
    `/Chat/Conversations/${conversationId}/Messages`,
    {
      schoolId: payload.schoolId,
      conversationId,
      body: payload.body,
      kind: serializeMessageKind(kind),
      attachmentName: payload.attachmentName,
      attachmentUrl: payload.attachmentUrl,
    }
  )

  const data = normalizeResponse<SendChatMessageResponseI>(res)
  return { ...data, value: toMessage(data.value) }
}

/**
 * Classes the caller may open a group chat for.
 *
 * Empty for admins, the Owner and parents — none of them belong to a class room, and the
 * picker simply renders no class section for them. That is a normal response, not an error.
 */
export const getChatClassesApi = async (
  params: GetChatClassesParamsI
): Promise<GetChatClassesResponseI> => {
  const res = await apiClient.get("/Chat/Classes", { params })
  const data = normalizeResponse<GetChatClassesResponseI>(res)
  return { ...data, value: data.value ?? [] }
}

/**
 * Opens the group chat for one class, creating it on first use.
 *
 * The server populates a new room from enrolment and teaching assignments rather than
 * adding only the caller, so whoever opens it first creates it correctly for the whole
 * class. Safe to call repeatedly — the same class always resolves to the same room.
 */
export const openClassChatRoomApi = async (
  payload: OpenClassChatRoomPayloadI
): Promise<OpenClassChatRoomResponseI> => {
  const res = await apiClient.post("/Chat/ClassRooms/Open", payload)
  const data = normalizeResponse<OpenClassChatRoomResponseI>(res)
  return { ...data, value: toConversation(data.value) }
}

export const markChatConversationReadApi = async ({
  conversationId,
  ...payload
}: MarkChatReadPayloadI): Promise<MarkChatReadResponseI> => {
  const res = await apiClient.post(
    `/Chat/Conversations/${conversationId}/Read`,
    {
      ...payload,
      conversationId,
    }
  )
  return normalizeResponse<MarkChatReadResponseI>(res)
}
