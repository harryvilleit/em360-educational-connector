import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  useMuteParticipants,
  useRemoveParticipant,
  useUpdateLiveClassPolicy,
} from "@/hooks/liveClass"
import { useLiveRoomStore } from "@/store/liveroom.store"
import type {
  LivePoll,
  LiveRoomRole,
  ReactionKind,
  RoomPolicy,
  StageLayout,
  WhiteboardStroke,
} from "@/types/liveroom"
import { useAgoraRtm } from "./useAgoraRtm"

/**
 * Connects the live-room store's *data plane* to Agora Signaling (RTM), so
 * reactions, hand-raise, polls and host moderation are real and shared,
 * with no mock store. Media stays on RTC (`useAgoraRoom`); this owns everything
 * that isn't a track.
 *
 * How it works, without touching any component that reads the store:
 *   - on connect, it clears the mock seed collections and broadcasts a `hello`
 *     that maps this participant's RTM id ↔ RTC uid ↔ name/role;
 *   - it re-points the store's broadcast + moderation actions to publish over
 *     RTM (and hit the backend for the authoritative ones: mute / remove /
 *     policy), then restores the originals on unmount;
 *   - inbound events are applied to the store with raw `setState`, so they
 *     don't re-broadcast.
 *
 * Tiles are keyed by RTC uid (the bridge sets `participant.id = uid`). Host
 * actions arrive with that uid and are resolved to a backend participant id via
 * the identity map built from hellos.
 */

interface Identity {
  pid: string // RTM userId === backend participantId
  uid: string // RTC uid (string)
  name: string
  role: LiveRoomRole
}

type RtmEvent =
  | { t: "hello"; id: Identity }
  | { t: "reaction"; kind: ReactionKind; name: string }
  | { t: "hand"; raised: boolean }
  | { t: "poll:new"; poll: LivePoll }
  | { t: "poll:vote"; pollId: string; optionIds: string[] }
  | { t: "poll:status"; pollId: string; status: LivePoll["status"] }
  | { t: "mod:mute"; target: string }
  | { t: "mod:muteAll" }
  | { t: "mod:remove"; target: string }
  | { t: "mod:lowerHand"; target: string }
  | { t: "mod:lowerAll" }
  | { t: "mod:promote"; target: string }
  | { t: "mod:policy"; policy: RoomPolicy }
  // Whiteboard strokes are broadcast as they complete. A newcomer receives
  // the current board and poll state inside the direct room snapshot below.
  | { t: "wb:stroke"; stroke: WhiteboardStroke }
  | { t: "wb:undo"; strokeId: string }
  | { t: "wb:clear" }
  | { t: "wb:visibility"; visible: boolean }
  | {
      t: "room:sync"
      presenter: Identity
      polls: LivePoll[]
      strokes: WhiteboardStroke[]
      whiteboardVisible: boolean
    }

export interface UseLiveRoomRtmParams {
  enabled: boolean
  appId?: string | null
  rtmToken?: string | null
  channelName?: string | null
  liveClassId?: string | null
  self: {
    participantId?: string | null
    uid: number
    name: string
    role: LiveRoomRole
  }
  isHost: boolean
  /** Stop publishing our own mic (used when the host mutes us). */
  muteSelf: () => void
  /** Leave the RTC session (used when the host removes us). */
  leaveRoom: () => void
}

const clock = () =>
  new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })

const rid = (p: string) =>
  `${p}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

export function useLiveRoomRtm(params: UseLiveRoomRtmParams) {
  const {
    enabled,
    appId,
    rtmToken,
    channelName,
    liveClassId,
    self,
    isHost,
    muteSelf,
    leaveRoom,
  } = params

  const { muteParticipantsAsync } = useMuteParticipants()
  const { removeParticipantAsync } = useRemoveParticipant()
  const { updatePolicyAsync } = useUpdateLiveClassPolicy()

  // Identity maps, kept in a ref for action handlers + mirrored to state so the
  // bridge can re-render tiles with real names.
  const identityRef = useRef<Record<string, Identity>>({}) // by pid
  const [identityByUid, setIdentityByUid] = useState<Record<string, Identity>>(
    {}
  )
  // Raised hands are tracked independently from the RTC roster. Agora can
  // refresh that roster after a hand event, and rebuilding participant tiles
  // must not erase the state the host just received.
  const raisedHandsByPidRef = useRef<Record<string, number>>({})
  const [raisedHandsByUid, setRaisedHandsByUid] = useState<
    Record<string, number>
  >({})

  const selfPid = self.participantId ?? ""
  const selfIdentity = useMemo<Identity>(
    () => ({
      pid: selfPid,
      uid: String(self.uid),
      name: self.name,
      role: self.role,
    }),
    [selfPid, self.uid, self.name, self.role]
  )

  const refreshRaisedHands = useCallback(() => {
    const byUid: Record<string, number> = {}
    for (const [pid, raisedAt] of Object.entries(raisedHandsByPidRef.current)) {
      const uid = identityRef.current[pid]?.uid
      if (uid) byUid[uid] = raisedAt
    }
    setRaisedHandsByUid(byUid)
  }, [])

  const recordIdentity = useCallback(
    (id: Identity) => {
      if (!id.pid) return false
      const existing = identityRef.current[id.pid]
      if (
        existing &&
        existing.uid === id.uid &&
        existing.name === id.name &&
        existing.role === id.role
      )
        return false
      identityRef.current = { ...identityRef.current, [id.pid]: id }
      setIdentityByUid(() => {
        const byUid: Record<string, Identity> = {}
        for (const v of Object.values(identityRef.current)) byUid[v.uid] = v
        return byUid
      })
      refreshRaisedHands()
      return true
    },
    [refreshRaisedHands]
  )

  const pidToUid = useCallback(
    (pid: string) => identityRef.current[pid]?.uid ?? null,
    []
  )
  const uidToPid = useCallback((uid: string) => {
    for (const v of Object.values(identityRef.current))
      if (v.uid === uid) return v.pid
    return null
  }, [])

  // Publisher handle set once RTM is up.
  const publishRef = useRef<(e: RtmEvent) => Promise<void>>(async () => {})
  const publishToRef = useRef<(pid: string, e: RtmEvent) => Promise<void>>(
    async () => {}
  )

  // ── Inbound ────────────────────────────────────────────────────────────────
  const onEvent = useCallback(
    (publisher: string, e: RtmEvent) => {
      const set = useLiveRoomStore.setState
      const get = useLiveRoomStore.getState
      const fromSelf = publisher === selfPid

      switch (e.t) {
        case "hello": {
          const isNew = recordIdentity(e.id)
          // Reply to a newcomer so they learn about us (once per new peer).
          if (isNew && e.id.pid !== selfPid) {
            void publishRef.current({ t: "hello", id: selfIdentity })
          }
          if (isHost && e.id.pid !== selfPid) {
            // Seed shared room state directly from the host. This also runs
            // when a known participant reconnects, so a brief network drop
            // cannot leave them with an empty poll list or hidden board.
            void publishToRef.current(e.id.pid, {
              t: "room:sync",
              presenter: selfIdentity,
              strokes: get().whiteboardStrokes,
              polls: get().polls.map((poll) => ({
                ...poll,
                myVote: undefined,
              })),
              whiteboardVisible: get().layout === "whiteboard",
            })
          }
          return
        }
        case "room:sync": {
          if (fromSelf) return
          // The identity travels with the direct snapshot, avoiding a race
          // where the snapshot arrives just before the host's channel hello.
          if (
            e.presenter.pid !== publisher ||
            (e.presenter.role !== "host" && e.presenter.role !== "cohost")
          )
            return
          recordIdentity(e.presenter)
          if (get().whiteboardStrokes.length === 0)
            get().replaceStrokes(e.strokes)
          set((s) => {
            const votes = new Map(s.polls.map((poll) => [poll.id, poll.myVote]))
            return {
              layout: e.whiteboardVisible ? "whiteboard" : s.layout,
              polls: e.polls.map((poll) => ({
                ...poll,
                myVote: votes.get(poll.id),
              })),
            }
          })
          return
        }
        case "wb:stroke": {
          if (fromSelf) return
          // Honour the same permission the local canvas enforces: only a host
          // or co-host may draw unless the policy opens annotation up. A peer
          // that ignores its own UI must not be able to write to the board.
          const author = identityRef.current[publisher]
          const authorIsHost =
            author?.role === "host" || author?.role === "cohost"
          if (!authorIsHost && !get().policy.participantsCanAnnotate) return
          // Apply inbound board changes with raw state updates. Calling the
          // RTM-wrapped store action here would publish the same stroke again
          // and create an echo loop between every connected browser.
          set((s) =>
            s.whiteboardStrokes.some((stroke) => stroke.id === e.stroke.id)
              ? s
              : { whiteboardStrokes: [...s.whiteboardStrokes, e.stroke] }
          )
          return
        }
        case "wb:undo": {
          if (fromSelf) return
          set((s) => ({
            whiteboardStrokes: s.whiteboardStrokes.filter(
              (stroke) => stroke.id !== e.strokeId
            ),
          }))
          return
        }
        case "wb:clear": {
          if (fromSelf) return
          const clearer = identityRef.current[publisher]
          if (clearer?.role !== "host" && clearer?.role !== "cohost") return
          set({ whiteboardStrokes: [] })
          return
        }
        case "wb:visibility": {
          if (fromSelf) return
          const presenter = identityRef.current[publisher]
          if (presenter?.role !== "host" && presenter?.role !== "cohost") return
          set({ layout: e.visible ? "whiteboard" : "speaker" })
          return
        }
        case "reaction": {
          if (fromSelf) return
          set((s) => ({
            floatingReactions: [
              ...s.floatingReactions,
              {
                id: rid("r"),
                kind: e.kind,
                name: e.name,
                offset: Math.random() * 60 - 30,
              },
            ],
          }))
          return
        }
        case "hand": {
          if (e.raised) raisedHandsByPidRef.current[publisher] = Date.now()
          else delete raisedHandsByPidRef.current[publisher]
          refreshRaisedHands()
          return
        }
        case "poll:new": {
          if (fromSelf) return
          const creator = identityRef.current[publisher]
          if (creator?.role !== "host" && creator?.role !== "cohost") return
          set((s) =>
            s.polls.some((p) => p.id === e.poll.id)
              ? s
              : { polls: [e.poll, ...s.polls] }
          )
          return
        }
        case "poll:vote": {
          if (fromSelf) return
          set((s) => ({
            polls: s.polls.map((p) =>
              p.id !== e.pollId
                ? p
                : {
                    ...p,
                    totalResponses: p.totalResponses + 1,
                    options: p.options.map((o) =>
                      e.optionIds.includes(o.id)
                        ? { ...o, votes: o.votes + 1 }
                        : o
                    ),
                  }
            ),
          }))
          return
        }
        case "poll:status": {
          if (fromSelf) return
          const creator = identityRef.current[publisher]
          if (creator?.role !== "host" && creator?.role !== "cohost") return
          set((s) => ({
            polls: s.polls.map((p) =>
              p.id === e.pollId ? { ...p, status: e.status } : p
            ),
          }))
          return
        }
        case "mod:mute": {
          if (e.target === selfPid) muteSelf()
          return
        }
        case "mod:muteAll": {
          if (!isHost && get().role === "participant") muteSelf()
          return
        }
        case "mod:remove": {
          if (e.target === selfPid) {
            leaveRoom()
            set({ admission: "removed" })
          }
          return
        }
        case "mod:lowerHand": {
          delete raisedHandsByPidRef.current[e.target]
          refreshRaisedHands()
          if (e.target === selfPid) {
            set({ handRaised: false })
          }
          return
        }
        case "mod:lowerAll": {
          raisedHandsByPidRef.current = {}
          refreshRaisedHands()
          set((s) => ({
            handRaised: false,
            participants: s.participants.map((p) => ({
              ...p,
              handRaisedAt: null,
            })),
          }))
          return
        }
        case "mod:promote": {
          const uid = pidToUid(e.target)
          set((s) => ({
            ...(e.target === selfPid ? { role: "cohost" as LiveRoomRole } : {}),
            participants: uid
              ? s.participants.map((p) =>
                  p.id === uid ? { ...p, role: "cohost" } : p
                )
              : s.participants,
          }))
          return
        }
        case "mod:policy": {
          set({ policy: { ...e.policy, participantsCanChat: false } })
          return
        }
      }
    },
    [
      selfPid,
      selfIdentity,
      recordIdentity,
      refreshRaisedHands,
      pidToUid,
      isHost,
      muteSelf,
      leaveRoom,
    ]
  )

  const rtm = useAgoraRtm<RtmEvent>({
    enabled,
    appId,
    token: rtmToken,
    userId: self.participantId,
    channelName,
    onEvent,
  })

  useEffect(() => {
    publishRef.current = rtm.publish
    publishToRef.current = rtm.publishTo
  }, [rtm.publish, rtm.publishTo])

  // ── On connect: seed identity and announce ourselves ────────────────────────
  useEffect(() => {
    if (!rtm.connected) return
    recordIdentity(selfIdentity)
    void rtm.publish({ t: "hello", id: selfIdentity })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rtm.connected])

  // ── Re-point store actions onto RTM + backend while connected ────────────────
  useEffect(() => {
    if (!rtm.connected) return
    const store = useLiveRoomStore
    const pub = rtm.publish

    const orig = {
      sendMessage: store.getState().sendMessage,
      sendReaction: store.getState().sendReaction,
      toggleHand: store.getState().toggleHand,
      createPoll: store.getState().createPoll,
      votePoll: store.getState().votePoll,
      setPollStatus: store.getState().setPollStatus,
      muteParticipant: store.getState().muteParticipant,
      muteEveryone: store.getState().muteEveryone,
      removeParticipant: store.getState().removeParticipant,
      addStroke: store.getState().addStroke,
      removeStroke: store.getState().removeStroke,
      clearBoard: store.getState().clearBoard,
      lowerHand: store.getState().lowerHand,
      lowerAllHands: store.getState().lowerAllHands,
      promoteToCohost: store.getState().promoteToCohost,
      updatePolicy: store.getState().updatePolicy,
      setLayout: store.getState().setLayout,
    }

    store.setState({
      // Live-class chat is disabled. Keep a no-op action while connected so an
      // old cached panel or direct store call cannot publish chat messages.
      sendMessage: () => {},

      // ── Whiteboard → broadcast ────────────────────────────────────────────
      addStroke: (stroke) => {
        orig.addStroke(stroke)
        void pub({ t: "wb:stroke", stroke })
      },

      removeStroke: (strokeId: string) => {
        orig.removeStroke(strokeId)
        void pub({ t: "wb:undo", strokeId })
      },

      clearBoard: () => {
        orig.clearBoard()
        void pub({ t: "wb:clear" })
      },

      // The whiteboard is a shared stage, not a private local tab. When a host
      // opens or closes it, every participant follows that visibility state.
      setLayout: (layout: StageLayout) => {
        const previous = store.getState().layout
        orig.setLayout(layout)
        if (!isHost || previous === layout) return
        if (layout === "whiteboard")
          void pub({ t: "wb:visibility", visible: true })
        else if (previous === "whiteboard")
          void pub({ t: "wb:visibility", visible: false })
      },

      sendReaction: (kind: ReactionKind) => {
        store.setState((s) => ({
          floatingReactions: [
            ...s.floatingReactions,
            {
              id: rid("r"),
              kind,
              name: self.name,
              offset: Math.random() * 60 - 30,
            },
          ],
        }))
        void pub({ t: "reaction", kind, name: self.name })
      },

      toggleHand: () => {
        const next = !store.getState().handRaised
        store.setState({ handRaised: next })
        void pub({ t: "hand", raised: next })
      },

      createPoll: (poll) => {
        const full: LivePoll = {
          ...poll,
          id: rid("poll"),
          createdAt: clock(),
          createdBy: self.name,
          totalResponses: 0,
        }
        store.setState((s) => ({ polls: [full, ...s.polls] }))
        void pub({ t: "poll:new", poll: full })
      },

      votePoll: (pollId: string, optionIds: string[]) => {
        store.setState((s) => ({
          polls: s.polls.map((p) => {
            if (p.id !== pollId || p.myVote) return p
            return {
              ...p,
              myVote: optionIds,
              totalResponses: p.totalResponses + 1,
              options: p.options.map((o) =>
                optionIds.includes(o.id) ? { ...o, votes: o.votes + 1 } : o
              ),
            }
          }),
        }))
        void pub({ t: "poll:vote", pollId, optionIds })
      },

      setPollStatus: (pollId: string, status: LivePoll["status"]) => {
        store.setState((s) => ({
          polls: s.polls.map((p) => (p.id === pollId ? { ...p, status } : p)),
        }))
        void pub({ t: "poll:status", pollId, status })
      },

      muteParticipant: (uid: string) => {
        const pid = uidToPid(uid)
        if (pid && liveClassId)
          void muteParticipantsAsync({
            liveClassId,
            participantIds: [pid],
            mute: true,
          }).catch(() => {})
        if (pid) void pub({ t: "mod:mute", target: pid })
      },

      muteEveryone: () => {
        const pids = store
          .getState()
          .participants.map((p) => uidToPid(p.id))
          .filter((x): x is string => !!x)
        if (pids.length && liveClassId)
          void muteParticipantsAsync({
            liveClassId,
            participantIds: pids,
            mute: true,
          }).catch(() => {})
        void pub({ t: "mod:muteAll" })
      },

      removeParticipant: (uid: string) => {
        const pid = uidToPid(uid)
        if (pid && liveClassId)
          void removeParticipantAsync({
            liveClassId,
            participantId: pid,
          }).catch(() => {})
        if (pid) void pub({ t: "mod:remove", target: pid })
        store.setState((s) => ({
          participants: s.participants.filter((p) => p.id !== uid),
        }))
      },

      lowerHand: (uid: string) => {
        const pid = uidToPid(uid)
        if (pid) {
          delete raisedHandsByPidRef.current[pid]
          refreshRaisedHands()
        }
        store.setState((s) => ({
          participants: s.participants.map((p) =>
            p.id === uid ? { ...p, handRaisedAt: null } : p
          ),
        }))
        if (pid) void pub({ t: "mod:lowerHand", target: pid })
      },

      lowerAllHands: () => {
        raisedHandsByPidRef.current = {}
        refreshRaisedHands()
        store.setState((s) => ({
          handRaised: false,
          participants: s.participants.map((p) => ({
            ...p,
            handRaisedAt: null,
          })),
        }))
        void pub({ t: "mod:lowerAll" })
      },

      promoteToCohost: (uid: string) => {
        const pid = uidToPid(uid)
        store.setState((s) => ({
          participants: s.participants.map((p) =>
            p.id === uid
              ? { ...p, role: p.role === "cohost" ? "participant" : "cohost" }
              : p
          ),
        }))
        if (pid) void pub({ t: "mod:promote", target: pid })
      },

      updatePolicy: (patch: Partial<RoomPolicy>) => {
        const next = {
          ...store.getState().policy,
          ...patch,
          participantsCanChat: false,
        }
        store.setState({ policy: next })
        if (liveClassId)
          void updatePolicyAsync({
            liveClassId,
            waitingRoomEnabled: next.waitingRoomEnabled,
            roomLocked: next.lockRoom,
            participantsCanUnmute: next.participantsCanUnmute,
            participantsCanShareScreen: next.participantsCanShareScreen,
            participantsCanChat: false,
            participantsCanShareFiles: next.participantsCanShareFiles,
            participantsCanAnnotate: next.participantsCanAnnotate,
          }).catch(() => {})
        void pub({ t: "mod:policy", policy: next })
      },
    })

    return () => store.setState(orig)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    rtm.connected,
    selfPid,
    self.name,
    isHost,
    liveClassId,
    refreshRaisedHands,
  ])

  return {
    rtmReady: rtm.connected,
    rtmError: rtm.error,
    identityByUid,
    raisedHandsByUid,
  }
}
