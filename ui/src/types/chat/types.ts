export type ChatRole = "superadmin" | "admin" | "teacher" | "student" | "parent"

export type ChatMessageKind = "text" | "image" | "file"

export type ChatConversationKind = "direct" | "class"

export type ChatParticipant = {
  id: string
  name: string
  role: ChatRole
  email?: string
  avatarColor: string
  classNames?: string[]
  subjects?: string[]
  childIds?: string[]
  online?: boolean
}

export type ChatConversation = {
  id: string
  kind: ChatConversationKind
  participantIds: string[]
  className?: string
  title?: string
  updatedAt: string
  unreadBy: Record<string, number>
}

export type ChatDeliveryStatus = "sending" | "failed"

export type ChatMessage = {
  id: string
  conversationId: string
  senderId: string
  body: string
  kind: ChatMessageKind
  sentAt: string
  attachmentName?: string
  attachmentUrl?: string
  deliveryStatus?: ChatDeliveryStatus
  clientId?: string
}

export type ChatPendingAttachment = {
  kind: "image" | "file"
  name: string
  url: string
  mimeType: string
  size: number
}

export type ChatThreadPreview = {
  conversation: ChatConversation
  peer: ChatParticipant | null
  title: string
  subtitle?: string
  avatarName: string
  avatarColor: string
  isGroup: boolean
  memberCount?: number
  lastMessage?: ChatMessage
  unread: number
}

export type ChatMediaFilter = "all" | "media" | "documents" | "links"

export type ChatSendPayload = {
  body: string
  kind?: ChatMessageKind
  attachmentName?: string
  attachmentUrl?: string
}

export type ChatThreadProps = {
  thread: ChatThreadPreview | null
  messages: ChatMessage[]
  actorId: string
  participantsById: Record<string, ChatParticipant>
  onSend: (payload: ChatSendPayload) => void
  /** Re-sends a message whose delivery failed. Omitted where retry is not offered. */
  onRetry?: (message: ChatMessage) => void
}

export type ChatComposerProps = {
  onSend: (payload: ChatSendPayload) => void
  disabled?: boolean
  placeholder?: string
}

export type ChatSidebarProps = {
  role: ChatRole
  threads: ChatThreadPreview[]
  activeId: string | null
  onSelect: (conversationId: string) => void
  onNewChat: () => void
  isLoading?: boolean
}

export type ChatMediaModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  subtitle?: string
  avatarName: string
  avatarColor: string
  isGroup?: boolean
  memberCount?: number
  members?: ChatParticipant[]
  messages: ChatMessage[]
  participantsById: Record<string, ChatParticipant>
  initialTab?: ChatMediaFilter
}

/** A class the signed-in person belongs to, offered in the picker as a group chat. */
export type ChatClassOption = {
  schoolClassId: string
  className: string
  studentCount: number
  teacherCount: number
  /** Null until someone opens this class's chat for the first time. */
  conversationId?: string | null
}

export type NewChatDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** The current page of contacts. Already filtered and capped by the server. */
  contacts: ChatParticipant[]
  onPick: (peerId: string) => void
  /** Classes the person belongs to. Empty for admins, the Owner and parents. */
  classes?: ChatClassOption[]
  /** Opens (creating on first use) the group chat for a class. */
  onPickClass?: (schoolClassId: string) => void
  /** The class currently being opened, so the row can show progress. */
  pendingClassId?: string | null
  /** Current search term, owned by the parent so it can drive the server query. */
  search: string
  onSearchChange: (value: string) => void
  /** True on first load of a term; results are absent. */
  isLoading?: boolean
  /** True while a new term resolves and the previous results are still shown. */
  isFetching?: boolean
  /** How many rows the server was asked for, so the UI can say so honestly. */
  pageSize?: number
  /** Set while opening a thread, to disable the list and show which row was picked. */
  pendingPeerId?: string | null
}

export type ChatMessageBubbleProps = {
  message: ChatMessage
  isOwn: boolean
  senderName?: string
  showSender?: boolean
  onRetry?: () => void
}

export type ConversationListItemProps = {
  thread: ChatThreadPreview
  active: boolean
  onSelect: () => void
}

export type ChatAvatarProps = {
  name: string
  color: string
  online?: boolean
  size?: "sm" | "md" | "lg"
}

export type ChatRoleBadgeProps = {
  role: ChatRole
  className?: string
}
