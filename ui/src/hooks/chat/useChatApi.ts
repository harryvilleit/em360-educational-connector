import { useCallback } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  getChatClassesApi,
  getChatContactsApi,
  getChatConversationsApi,
  getChatMessagesApi,
  markChatConversationReadApi,
  openClassChatRoomApi,
  sendChatMessageApi,
  startChatConversationApi,
} from "@/api/chat.api"
import type {
  ChatClassI,
  ChatContactI,
  ChatConversationI,
  ChatMessageI,
  GetChatClassesResponseI,
  GetChatContactsResponseI,
  GetChatConversationsResponseI,
  GetChatMessagesResponseI,
  MarkChatReadResponseI,
  OpenClassChatRoomPayloadI,
  OpenClassChatRoomResponseI,
  SendChatMessagePayloadI,
  SendChatMessageResponseI,
  StartChatConversationPayloadI,
  StartChatConversationResponseI,
} from "@/api/chat.api/types"
import { queryKeys } from "@/utils/queryKeys"

/** How many contacts the "New chat" dialog asks for. */
export const DEFAULT_CONTACT_PAGE_SIZE = 10

/**
 * People the caller may message.
 *
 * The list arrives already filtered by the server's permission matrix — a parent receives
 * exactly one contact. Never re-derive who is reachable on the client; the matrix in
 * `src/lib/chat/permissions.ts` exists to explain the UI, not to decide access.
 */
export const useChatContacts = (
  schoolId: string,
  search?: string,
  enabled = true,
  take: number = DEFAULT_CONTACT_PAGE_SIZE
) => {
  const term = search?.trim() ?? ""

  const { data, isPending, isFetching, isError, error, isSuccess, refetch } =
    useQuery<GetChatContactsResponseI>({
      queryKey: [queryKeys.chatContacts, schoolId, term, take],
      queryFn: () => getChatContactsApi({ schoolId, search: term || undefined, take }),
      enabled: enabled && !!schoolId,
      staleTime: 2 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      // Keep the previous results on screen while a new search term is in flight. Without
      // this the list empties on every keystroke and the dialog flickers between "10 people"
      // and "nothing", which reads as slowness even when the request itself is quick.
      placeholderData: (previous) => previous,
    })

  return {
    contacts: (data?.value ?? []) as ChatContactI[],
    isLoading: isPending,
    isPending,
    /** True while a new search resolves and stale results are still on screen. */
    isFetching,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

/**
 * The caller's threads, newest activity first.
 *
 * `refetchInterval` is a safety net, not the delivery mechanism: the SignalR bridge in
 * `useChatRealtime` invalidates this key the instant a message arrives. The poll only
 * covers the case where the socket is down, which is why it is slow enough not to matter.
 */
export const useChatConversations = (
  schoolId: string,
  enabled = true,
  /**
   * Whether the SignalR socket is up. When it is, the poll stretches right out — it exists
   * only to cover a dead socket, and polling every minute on top of working realtime is a
   * request per user per minute buying nothing.
   */
  realtimeConnected = false
) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetChatConversationsResponseI>({
      queryKey: [queryKeys.chatConversations, schoolId],
      queryFn: () => getChatConversationsApi({ schoolId }),
      enabled: enabled && !!schoolId,
      staleTime: 15 * 1000,
      gcTime: 10 * 60 * 1000,
      // 15s while the socket is down so a degraded chat still feels close to live; 5 minutes
      // when realtime is healthy, purely as a consistency backstop.
      refetchInterval: realtimeConnected ? 5 * 60 * 1000 : 15 * 1000,
      // A background tab does not need either.
      refetchIntervalInBackground: false,
    })

  return {
    conversations: (data?.value ?? []) as ChatConversationI[],
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

/**
 * One page of messages. Page 1 is the most recent page; items within a page are in
 * reading order.
 */
export const useChatMessages = (
  schoolId: string,
  conversationId: string | null,
  pageNumber = 1,
  pageSize = 30,
  enabled = true
) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetChatMessagesResponseI>({
      queryKey: [queryKeys.chatMessages, schoolId, conversationId, pageNumber, pageSize],
      queryFn: () =>
        getChatMessagesApi({
          schoolId,
          conversationId: conversationId as string,
          pageNumber,
          pageSize,
        }),
      enabled: enabled && !!schoolId && !!conversationId,
      staleTime: 10 * 1000,
      gcTime: 5 * 60 * 1000,
    })

  return {
    messages: (data?.value?.items ?? []) as ChatMessageI[],
    pageNumber: data?.value?.pageNumber ?? 1,
    pageSize: data?.value?.pageSize ?? pageSize,
    totalItems: data?.value?.totalItems ?? 0,
    totalPages: data?.value?.totalPages ?? 0,
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

interface UseStartChatConversationOptions {
  onSuccess?: (data: StartChatConversationResponseI) => void
  onError?: (error: Error) => void
}

/**
 * Opens (or reuses) a direct thread.
 *
 * A 403 here is the server refusing the pair — a parent picking a teacher, say. The error
 * message is the server's own wording, so it is safe to surface directly.
 */
export const useStartChatConversation = ({
  onSuccess,
  onError,
}: UseStartChatConversationOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<StartChatConversationResponseI, Error, StartChatConversationPayloadI>({
      mutationFn: startChatConversationApi,
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: [queryKeys.chatConversations] })
        onSuccess?.(data)
      },
      onError: (err) => {
        toast.error(err?.message ?? "Failed to start the conversation")
        onError?.(err)
      },
    })

  return {
    startConversation: mutate,
    startConversationAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

interface UseSendChatMessageOptions {
  onSuccess?: (data: SendChatMessageResponseI) => void
  onError?: (error: Error) => void
}

/** Ids for optimistic rows. Prefixed so a local row is never mistaken for a server id. */
export const OPTIMISTIC_ID_PREFIX = "local:"

export const isOptimisticMessageId = (id: string) => id.startsWith(OPTIMISTIC_ID_PREFIX)

export const newClientMessageId = () =>
  `${OPTIMISTIC_ID_PREFIX}${
    globalThis.crypto?.randomUUID?.() ??
    `${Date.now()}-${Math.random().toString(36).slice(2)}`
  }`

/**
 * Applies a change to the newest cached page of one thread.
 *
 * Only page 1 is touched. It is the page on screen and the only one a new message belongs
 * on; editing an older page would drop a fresh message into the middle of history.
 */
function updateNewestMessagePage(
  queryClient: ReturnType<typeof useQueryClient>,
  schoolId: string,
  conversationId: string,
  update: (items: ChatMessageI[]) => ChatMessageI[]
) {
  queryClient.setQueriesData<GetChatMessagesResponseI>(
    { queryKey: [queryKeys.chatMessages, schoolId, conversationId], exact: false },
    (previous) => {
      if (!previous?.value) return previous
      if ((previous.value.pageNumber ?? 1) !== 1) return previous

      const items = previous.value.items ?? []
      const next = update(items)
      if (next === items) return previous

      return {
        ...previous,
        value: {
          ...previous.value,
          items: next,
          totalItems: Math.max(
            0,
            (previous.value.totalItems ?? items.length) + (next.length - items.length)
          ),
        },
      }
    }
  )
}

/**
 * Sends a message and shows it immediately.
 *
 * The previous version waited for the POST to return, then invalidated two queries and
 * waited for both to refetch before the sender saw their own message — three sequential
 * round trips before a bubble appeared. Over a dev tunnel that is seconds of the input
 * looking broken, which is exactly what "chat is slow" described.
 *
 * Now the message is written into the cache synchronously in `onMutate`, marked
 * `deliveryStatus: "sending"`, and reconciled in place when the server answers. The
 * reconciliation replaces the local row rather than appending, so the message never
 * flickers or doubles.
 *
 * On failure the row is kept and marked `"failed"` instead of vanishing. A message that
 * disappears silently is how people lose text they have already typed; leaving it visible
 * lets them retry or copy it out.
 */
export const useSendChatMessage = ({
  onSuccess,
  onError,
}: UseSendChatMessageOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<
      SendChatMessageResponseI,
      Error,
      SendChatMessagePayloadI,
      { clientId: string }
    >({
      mutationFn: sendChatMessageApi,

      onMutate: async (variables) => {
        const clientId = variables.clientId ?? newClientMessageId()

        // Stop an in-flight refetch from landing after the insert and wiping it out.
        await queryClient.cancelQueries({
          queryKey: [queryKeys.chatMessages, variables.schoolId, variables.conversationId],
        })

        const optimistic: ChatMessageI = {
          id: clientId,
          clientId,
          conversationId: variables.conversationId,
          senderUserId: variables.sender?.userId ?? "",
          senderName: variables.sender?.name ?? "You",
          senderRole: variables.sender?.role ?? "student",
          body: variables.body,
          kind: variables.kind ?? "text",
          attachmentName: variables.attachmentName ?? null,
          attachmentUrl: variables.attachmentUrl ?? null,
          // The server assigns the real timestamp. This one exists so the bubble sorts to
          // the bottom immediately; it is overwritten on reconciliation.
          sentAtUtc: new Date().toISOString(),
          deliveryStatus: "sending",
        }

        updateNewestMessagePage(
          queryClient,
          variables.schoolId,
          variables.conversationId,
          (items) =>
            items.some((item) => item.clientId === clientId)
              ? items
              : [...items, optimistic]
        )

        // Move the thread to the top of the sidebar with the right preview text, so the
        // list agrees with the thread instantly rather than a round trip later.
        queryClient.setQueryData<GetChatConversationsResponseI>(
          [queryKeys.chatConversations, variables.schoolId],
          (previous) => {
            if (!previous?.value) return previous
            return {
              ...previous,
              value: previous.value.map((conversation) =>
                conversation.id === variables.conversationId
                  ? {
                      ...conversation,
                      lastMessage: optimistic,
                      lastMessageAtUtc: optimistic.sentAtUtc,
                    }
                  : conversation
              ),
            }
          }
        )

        return { clientId }
      },

      onSuccess: (data, variables, context) => {
        const clientId = context?.clientId ?? variables.clientId
        const confirmed: ChatMessageI = { ...data.value, clientId }

        updateNewestMessagePage(
          queryClient,
          variables.schoolId,
          variables.conversationId,
          (items) => {
            const index = items.findIndex((item) => item.clientId === clientId)

            // The hub can deliver the sender's own message back before this resolves (the
            // notifier addresses every device the user has open, including this one). If it
            // already landed, drop the optimistic row rather than showing the message twice.
            const alreadyPresent = items.some(
              (item) => item.id === confirmed.id && item.clientId !== clientId
            )

            if (index === -1) return alreadyPresent ? items : [...items, confirmed]

            if (alreadyPresent) return items.filter((_, i) => i !== index)

            const next = [...items]
            next[index] = confirmed
            return next
          }
        )

        // Refresh unread counts and ordering in the background. The thread itself is
        // already correct, so nothing on screen is waiting on this.
        queryClient.invalidateQueries({
          queryKey: [queryKeys.chatConversations],
          refetchType: "active",
        })

        onSuccess?.(data)
      },

      onError: (err, variables, context) => {
        const clientId = context?.clientId ?? variables.clientId

        if (clientId) {
          updateNewestMessagePage(
            queryClient,
            variables.schoolId,
            variables.conversationId,
            (items) => {
              const index = items.findIndex((item) => item.clientId === clientId)
              if (index === -1) return items
              const next = [...items]
              next[index] = { ...next[index], deliveryStatus: "failed" }
              return next
            }
          )
        }

        toast.error(err?.message ?? "Failed to send the message")
        onError?.(err)
      },
    })

  return {
    sendMessage: mutate,
    sendMessageAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

/**
 * The classes the caller can open a group chat for.
 *
 * Fetched only while the "New chat" dialog is open, like contacts — nothing on the main
 * chat screen needs it, because class rooms the caller has already opened arrive in the
 * conversation list.
 *
 * An empty list is the normal answer for admins, the Owner and parents. It means "you belong
 * to no class", not "something went wrong", so the dialog renders no class section rather
 * than an error.
 */
export const useChatClasses = (schoolId: string, enabled = true) => {
  const { data, isPending, isError, error, refetch } =
    useQuery<GetChatClassesResponseI>({
      queryKey: [queryKeys.chatClasses, schoolId],
      queryFn: () => getChatClassesApi({ schoolId }),
      enabled: enabled && !!schoolId,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })

  return {
    classes: (data?.value ?? []) as ChatClassI[],
    isLoading: isPending,
    isPending,
    isError,
    error,
    refetch,
  }
}

interface UseOpenClassChatRoomOptions {
  onSuccess?: (data: OpenClassChatRoomResponseI) => void
  onError?: (error: Error) => void
}

/**
 * Opens a class group chat, creating it if this is the first time anyone has.
 *
 * The room is created on demand by someone who belongs to the class, rather than depending
 * on an administrator having run the school-wide reconcile first. Before this existed the
 * class group was simply absent from every thread list with no way to ask for it.
 *
 * A 403 is the server refusing the class — someone posting a class id they are not enrolled
 * in and do not teach. The message is the server's own wording, so it is safe to show.
 */
export const useOpenClassChatRoom = ({
  onSuccess,
  onError,
}: UseOpenClassChatRoomOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isError, error, reset } = useMutation<
    OpenClassChatRoomResponseI,
    Error,
    OpenClassChatRoomPayloadI
  >({
    mutationFn: openClassChatRoomApi,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.chatConversations] })
      // The room now has an id, so the picker should stop offering to create it.
      queryClient.invalidateQueries({ queryKey: [queryKeys.chatClasses] })
      onSuccess?.(data)
    },
    onError: (err) => {
      toast.error(err?.message ?? "Failed to open the class group chat")
      onError?.(err)
    },
  })

  return {
    openClassRoom: mutate,
    openClassRoomAsync: mutateAsync,
    isPending,
    isError,
    error,
    reset,
  }
}

/**
 * Removes a locally-inserted message from the thread cache.
 *
 * Used when retrying a failed send: the old row is dropped and the retry inserts a fresh
 * one under a new client id, so a message that eventually succeeds does not leave its
 * failed twin behind. Server-assigned messages are never removed by this — deleting a
 * delivered message is a different operation with different consequences.
 */
export const useRemoveOptimisticMessage = () => {
  const queryClient = useQueryClient()

  return useCallback(
    (schoolId: string, conversationId: string, clientId: string) => {
      if (!isOptimisticMessageId(clientId)) return

      updateNewestMessagePage(queryClient, schoolId, conversationId, (items) => {
        const next = items.filter((item) => item.clientId !== clientId)
        return next.length === items.length ? items : next
      })
    },
    [queryClient]
  )
}

/**
 * Clears the caller's unread badge.
 *
 * Failures are swallowed: this fires on every thread selection, and a toast telling
 * someone their badge did not clear is noise. The badge corrects itself on the next
 * conversation fetch.
 */
export const useMarkChatRead = () => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending } = useMutation<
    MarkChatReadResponseI,
    Error,
    { schoolId: string; conversationId: string }
  >({
    mutationFn: markChatConversationReadApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.chatConversations] })
    },
    onError: () => {
      /* intentionally silent — see doc comment */
    },
  })

  return { markRead: mutate, markReadAsync: mutateAsync, isPending }
}
