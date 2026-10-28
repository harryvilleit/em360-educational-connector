import { useCallback, useEffect, useRef, useState } from "react"
import AgoraRTM from "agora-rtm-sdk"

/**
 * Thin wrapper over Agora Signaling (RTM 2.x) for the live room's realtime data
 * plane: chat, reactions, hand-raise, polls and host moderation signals. Media
 * (audio/video/screen) is RTC and handled by `useAgoraRoom`; this is everything
 * that isn't a media track.
 *
 * Requires the SDK:  npm i agora-rtm-sdk
 *
 * The backend mints the RTM token against the *participant id* (see
 * JoinLiveClassCommand → BuildRtmToken(participant.Id)), so `userId` MUST be the
 * join DTO's `participantId`, not the numeric RTC uid. Identity is bridged to
 * RTC uids via a hello message in `useLiveRoomRtm`.
 *
 * Messages are JSON — pass any serialisable payload to `publish`; `onEvent`
 * receives the parsed payload plus the publisher's RTM userId (participantId).
 */

// The SDK's exact TS surface shifts across 2.x minors; we only touch a small,
// stable slice, so type the instance loosely and keep our own surface strict.
/* eslint-disable @typescript-eslint/no-explicit-any */
type RtmInstance = any

export interface UseAgoraRtmParams<TEvent> {
  enabled: boolean
  appId?: string | null
  token?: string | null
  /** RTM userId — the backend binds the token to the participant id. */
  userId?: string | null
  channelName?: string | null
  /** Called for every inbound channel message (already JSON-parsed). */
  onEvent?: (publisher: string, payload: TEvent) => void
}

export interface UseAgoraRtmResult<TEvent> {
  connected: boolean
  error: string | null
  /** Broadcast a payload to the class channel. No-op until connected. */
  publish: (payload: TEvent) => Promise<void>
  /** Direct send to a single RTM user id (participantId). */
  publishTo: (recipientUserId: string, payload: TEvent) => Promise<void>
}

export function useAgoraRtm<TEvent = unknown>(
  params: UseAgoraRtmParams<TEvent>
): UseAgoraRtmResult<TEvent> {
  const { enabled, appId, token, userId, channelName, onEvent } = params

  const clientRef = useRef<RtmInstance | null>(null)
  const channelRef = useRef<string | null>(null)
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Keep the latest onEvent without re-connecting the client on every render.
  const onEventRef = useRef(onEvent)
  useEffect(() => {
    onEventRef.current = onEvent
  }, [onEvent])

  const ready = enabled && !!appId && !!token && !!userId && !!channelName

  useEffect(() => {
    if (!ready) return

    let cancelled = false
    let client: RtmInstance | null = null

    const handleMessage = (event: any) => {
      // Two kinds of inbound message matter:
      //  - MESSAGE: broadcast on our class channel.
      //  - USER: addressed directly to us, used for scoped chat so a
      //    "Teacher only" message is never delivered to the class channel.
      // For a USER message `channelName` is the recipient id, not the class, so
      // filtering purely on channelName would silently drop every direct message.
      const isDirect = event?.channelType === "USER"
      if (!isDirect && event?.channelName && event.channelName !== channelName)
        return
      const raw = event?.message
      if (typeof raw !== "string") return
      let payload: TEvent
      try {
        payload = JSON.parse(raw) as TEvent
      } catch {
        return
      }
      onEventRef.current?.(String(event.publisher ?? ""), payload)
    }

    async function connect() {
      setError(null)
      try {
        const { RTM } = AgoraRTM as any
        // RTM 2.x accepts the token on `login`, not in the constructor config.
        // Passing it to the constructor silently leaves login unauthenticated
        // when the Agora project has an App Certificate enabled: RTC video can
        // still connect while every data-plane feature appears local-only.
        client = new RTM(appId as string, userId as string)
        clientRef.current = client

        client.addEventListener("message", handleMessage)

        await client.login({ token: token as string })
        if (cancelled) return

        await client.subscribe(channelName as string, {
          withMessage: true,
          withPresence: false,
          withMetadata: false,
          withLock: false,
        })
        if (cancelled) return

        channelRef.current = channelName as string
        setConnected(true)
      } catch (err) {
        if (!cancelled)
          setError((err as Error)?.message ?? "Realtime channel unavailable")
      }
    }

    connect()

    return () => {
      cancelled = true
      setConnected(false)
      const c = clientRef.current
      clientRef.current = null
      const ch = channelRef.current
      channelRef.current = null
      if (c) {
        try {
          c.removeEventListener?.("message", handleMessage)
        } catch {
          /* noop */
        }
        // Best-effort teardown; ignore rejections from an already-closed client.
        Promise.resolve()
          .then(() => (ch ? c.unsubscribe(ch) : undefined))
          .catch(() => {})
          .then(() => c.logout())
          .catch(() => {})
      }
    }
    // Reconnect only when identity/channel/token actually change.
  }, [ready, appId, token, userId, channelName])

  const publish = useCallback(async (payload: TEvent) => {
    const c = clientRef.current
    const ch = channelRef.current
    if (!c || !ch) return
    try {
      await c.publish(ch, JSON.stringify(payload), { channelType: "MESSAGE" })
    } catch (err) {
      // A failed publish shouldn't take down the room; surface for logs only.
      setError((err as Error)?.message ?? "Couldn't send")
    }
  }, [])

  /**
   * Send to one specific participant instead of the whole channel.
   *
   * Required for anything that is not meant for everyone. Publishing a
   * "Teacher only" message to the class channel and filtering it in the UI
   * delivers the plaintext to every student's browser — it is visible in
   * DevTools and sits in their local store regardless of what the UI shows.
   */
  const publishTo = useCallback(
    async (recipientUserId: string, payload: TEvent) => {
      const c = clientRef.current
      if (!c || !recipientUserId) return
      try {
        await c.publish(recipientUserId, JSON.stringify(payload), {
          channelType: "USER",
        })
      } catch (err) {
        setError((err as Error)?.message ?? "Couldn't send")
      }
    },
    []
  )

  return { connected, error, publish, publishTo }
}
