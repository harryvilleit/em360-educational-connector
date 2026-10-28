export type {
  ChatRole,
  ChatMessageKind,
  ChatConversationKind,
  ChatParticipant,
  ChatConversation,
  ChatMessage,
  ChatDeliveryStatus,
  ChatPendingAttachment,
  ChatThreadPreview,
  ChatMediaFilter,
  ChatClassOption,
  ChatSendPayload,
  ChatThreadProps,
  ChatComposerProps,
  ChatSidebarProps,
  ChatMediaModalProps,
  NewChatDialogProps,
  ChatMessageBubbleProps,
  ConversationListItemProps,
  ChatAvatarProps,
  ChatRoleBadgeProps,
} from "@/types/chat"

// Presentation helpers. These explain and shape the UI; they are NOT the access control
// boundary — the server filters what each role can see and reach.
export {
  canChatWith,
  sharesClassOrSubject,
  belongsToClassRoom,
  canAccessClassGroup,
  roleLabel,
  roleBadgeClass,
} from "@/lib/chat"

export { resolveChatRoleFromAuth, useChatActor } from "./useChatActor"

export {
  useChatContacts,
  useChatConversations,
  useChatMessages,
  useStartChatConversation,
  useSendChatMessage,
  useMarkChatRead,
  useChatClasses,
  useOpenClassChatRoom,
  useRemoveOptimisticMessage,
  newClientMessageId,
  isOptimisticMessageId,
  DEFAULT_CONTACT_PAGE_SIZE,
  OPTIMISTIC_ID_PREFIX,
} from "./useChatApi"

export { useChatRealtime, resolveChatHubUrl } from "./useChatRealtime"

export {
  avatarColorFor,
  toParticipant,
  toViewMessage,
  toThreadPreview,
  useThreadPreviews,
  useParticipantsById,
} from "./useChatViewModel"
