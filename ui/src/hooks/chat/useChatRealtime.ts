import { useCallback, useEffect, useRef, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import {
  HttpTransportType,
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from "@microsoft/signalr"
import { baseUrl } from "@/api/api"
import { useAuthStore } from "@/store/auth.store"
import {
  parseChatRole,
  parseMessageKind,
  type ChatMessageI,
  type GetChatConversationsResponseI,
  type GetChatMessagesResponseI,
} from "@/api/chat.api/types"
import { queryKeys } from "@/utils/queryKeys"

const MESSAGE_RECEIVED = "chatMessageReceived"

/**
 * Turns the REST base URL into the hub URL.
 *
 * VITE_BASE_URL points at the versioned API root (".../api/v1") because that is what every
 * controller call needs. The hub is NOT versioned — Program.cs maps it at the application
 * root with `app.MapHub<ChatHub>("/hubs/chat")` — so appending "/hubs/chat" to the REST base
 * produced ".../api/v1/hubs/chat", which 404s on negotiate.
 *
 * The failure mode was quiet and expensive: the connection never established, the hook
 * logged a warning nobody reads, the UI showed "Reconnecting" forever, and every message
 * arrived via the 60-second conversation poll instead of instantly.
 *
 * Stripping a trailing "/api/vN" (and a bare "/api") makes the derivation survive a bump to
 * v2 and the localhost / devtunnel / Azure differences between environments.
 */
export function resolveChatHubUrl(apiBaseUrl: string): string {
  const trimmed = (apiBaseUrl ?? "").trim().replace(/\/+$/, "")
  if (!trimmed) return ""

  const origin = trimmed.replace(/\/api(?:\/v[\d.]+)?$/i, "")
  return `${origin}/hubs/chat`
}

/**
 * Live chat delivery over SignalR.
 *
 * This hook only *receives*. Sending always goes through
 * `POST /Chat/Conversations/{id}/Messages` so that persistence and the permission check
 * happen in one place — a socket send path would be a second, easy-to-forget enforcement
 * point.
 *
 * On an incoming message it now *writes the message into the cache* rather than invalidating
 * and refetching. Over a dev tunnel an invalidate cost two extra round trips (messages +
 * conversations) before the recipient saw anything, which is most of what "chat is slow"
 * meant. Splicing is safe here because the payload is the complete server-assigned DTO —
 * the same shape the messages endpoint returns — and the merge is keyed on message id, so a
 * duplicate arriving from a concurrent refetch collapses instead of rendering twice.
 *
 * The conversation list is patched for preview text and ordering, then invalidated in the
 * background so the authoritative unread counts still come from the server.
 */
export function useChatRealtime(schoolId: string, enabled = true) {
  const queryClient = useQueryClient()
  const [connected, setConnected] = useState(false)
  const connectionRef = useRef<HubConnection | null>(null)

  const applyIncoming = useCallback(
    (message: ChatMessageI) => {
      // Merge into every cached page of this thread. Page 1 is the newest page and the one
      // on screen; older pages are left alone.
      queryClient.setQueriesData<GetChatMessagesResponseI>(
        {
          queryKey: [queryKeys.chatMessages, schoolId, message.conversationId],
          exact: false,
        },
        (previous) => {
          if (!previous?.value) return previous
          if ((previous.value.pageNumber ?? 1) !== 1) return previous

          const items = previous.value.items ?? []
          if (items.some((item) => item.id === message.id)) return previous

          return {
            ...previous,
            value: {
              ...previous.value,
              items: [...items, message],
              totalItems: (previous.value.totalItems ?? items.length) + 1,
            },
          }
        }
      )

      // Nudge the sidebar preview and ordering without waiting for a refetch.
      queryClient.setQueryData<GetChatConversationsResponseI>(
        [queryKeys.chatConversations, schoolId],
        (previous) => {
          if (!previous?.value) return previous
          return {
            ...previous,
            value: previous.value.map((conversation) =>
              conversation.id === message.conversationId
                ? {
                    ...conversation,
                    lastMessage: message,
                    lastMessageAtUtc: message.sentAtUtc,
                  }
                : conversation
            ),
          }
        }
      )

      queryClient.invalidateQueries({
        queryKey: [queryKeys.chatConversations],
        refetchType: "active",
      })
    },
    [queryClient, schoolId]
  )

  useEffect(() => {
    if (!enabled || !schoolId || !baseUrl) return

    const hubUrl = resolveChatHubUrl(baseUrl)
    if (!hubUrl) return

    let disposed = false

    const connection = new HubConnectionBuilder()
      .withUrl(hubUrl, {
        // Read lazily on every (re)connect so a token refreshed mid-session is picked up
        // rather than the connection dying at expiry.
        accessTokenFactory: () => useAuthStore.getState().token ?? "",
        transport: HttpTransportType.WebSockets | HttpTransportType.LongPolling,
      })
      // Retry indefinitely rather than giving up after the last entry of a fixed array. A
      // laptop that sleeps for an hour should come back to a working chat, not a dead socket
      // that only a page reload fixes.
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (context) => {
          const schedule = [0, 2000, 5000, 10000, 30000]
          return schedule[
            Math.min(context.previousRetryCount, schedule.length - 1)
          ]
        },
      })
      .configureLogging(LogLevel.Warning)
      .build()

    // Long-haul transports (dev tunnels, corporate proxies) can stall past the 30s default
    // and get torn down mid-conversation. The keep-alive stays frequent so a genuinely dead
    // socket is still noticed quickly.
    connection.serverTimeoutInMilliseconds = 60_000
    connection.keepAliveIntervalInMilliseconds = 15_000

    connectionRef.current = connection

    connection.on(MESSAGE_RECEIVED, (raw: ChatMessageI) => {
      if (!raw?.conversationId || !raw?.id) return

      applyIncoming({
        ...raw,
        kind: parseMessageKind(raw.kind),
        senderRole: parseChatRole(raw.senderRole),
      })
    })

    connection.onreconnected(() => {
      if (disposed) return
      setConnected(true)
      // Anything that happened while the socket was down is invisible to this client,
      // so treat a reconnect as "resync everything".
      queryClient.invalidateQueries({ queryKey: [queryKeys.chatConversations] })
      queryClient.invalidateQueries({ queryKey: [queryKeys.chatMessages] })
    })

    connection.onreconnecting(() => {
      if (!disposed) setConnected(false)
    })

    connection.onclose(() => {
      if (!disposed) setConnected(false)
    })

    connection
      .start()
      .then(() => {
        if (!disposed) setConnected(true)
      })
      .catch((err) => {
        // We tore this connection down ourselves. React StrictMode mounts an effect, runs
        // cleanup, then mounts again in development, so the first connection is always
        // stopped mid-negotiate — SignalR surfaces that as
        // "The connection was stopped during negotiation" (an AbortError). It is the
        // cleanup working, not a failure, and the second connection is the live one.
        // Reporting it would train everyone to ignore this warning, which is the one place
        // a real misconfiguration shows up.
        if (disposed) return

        // A genuine failure. Worth a loud line: a permanently failing handshake is a
        // misconfiguration (wrong hub URL, CORS, auth scheme, expired token), not weather.
        console.warn(
          `[chat] realtime unavailable at ${hubUrl}; falling back to polling.`,
          err
        )
      })

    return () => {
      disposed = true
      connectionRef.current = null
      if (connection.state !== HubConnectionState.Disconnected) {
        void connection.stop()
      }
    }
  }, [enabled, schoolId, queryClient, applyIncoming])

  return { connected, polling: false }
}
