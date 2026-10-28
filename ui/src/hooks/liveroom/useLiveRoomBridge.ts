import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { joinLiveClassApi } from "@/api/liveClass.api"
import type { LiveClassJoinDtoI } from "@/api/liveClass.api/types"
import {
  useAdmitParticipants,
  useGetLiveClassParticipants,
  useRemoveParticipant,
} from "@/hooks/liveClass"
import { useLiveRoomStore } from "@/store/liveroom.store"
import type {
  LiveParticipant,
  LiveRoomRole,
  WaitingParticipant,
} from "@/types/liveroom"
import { useAgoraRoom, type AgoraJoinInfo } from "./useAgoraRoom"
import { useLiveRoomRtm } from "./useLiveRoomRtm"

/**
 * Bridges the existing liveroom store (built against mocks) onto the real Agora
 * RTC layer + backend admission, WITHOUT touching the many components that read
 * the store. It:
 *   - runs the backend Join when the user is admitted, then connects Agora;
 *   - polls Join while in the waiting room until the host admits;
 *   - re-points the store's media actions (mic/cam/screen) at Agora while in call;
 *   - mirrors Agora self-media + remote peers into the store so tiles render;
 *   - re-points host `admit`/`admitAll` at the backend and feeds the waiting list.
 *
 * When `liveClassId` is falsy the whole thing no-ops and the store keeps its
 * original mock behaviour, so nothing regresses.
 *
 * Still on the store for now (need the RTM layer): chat, polls, hand-raise,
 * reactions, captions. And mute/remove of in-call tiles needs `agoraUid` on the
 * participant DTO to correlate a tile to its backend participant — see
 * PATCHES.md; until then those stay local.
 */

function toJoinInfo(dto: LiveClassJoinDtoI | null): AgoraJoinInfo | null {
  if (!dto?.appId || !dto.channelName || !dto.rtcToken) return null
  return {
    appId: dto.appId,
    channelName: dto.channelName,
    uid: dto.uid,
    rtcToken: dto.rtcToken,
    canPublish: dto.canPublish,
  }
}

type RtmInfo = {
  appId: string
  rtmToken: string
  channelName: string
  participantId: string
  uid: number
  role?: string
}

function toRtmInfo(dto: LiveClassJoinDtoI | null): RtmInfo | null {
  if (!dto?.appId || !dto.channelName || !dto.rtmToken || !dto.participantId)
    return null
  return {
    appId: dto.appId,
    rtmToken: dto.rtmToken,
    channelName: dto.channelName,
    participantId: dto.participantId,
    uid: dto.uid,
    role: dto.role,
  }
}

function initialsOf(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

function roleOf(role?: string): LiveRoomRole {
  const r = (role ?? "").toLowerCase()
  return r === "host" ? "host" : r === "cohost" ? "cohost" : "participant"
}

export function useLiveRoomBridge(params: {
  liveClassId?: string | null
  displayName?: string
  studentId?: string
  isHost?: boolean
}) {
  const { liveClassId, displayName, studentId, isHost = false } = params
  const enabled = !!liveClassId

  const admission = useLiveRoomStore((s) => s.admission)

  const [joinInfo, setJoinInfo] = useState<AgoraJoinInfo | null>(null)
  const [rtmInfo, setRtmInfo] = useState<RtmInfo | null>(null)
  const [joinRole, setJoinRole] = useState<string | null>(null)
  const [joinSpectator, setJoinSpectator] = useState(false)
  const [joinError, setJoinError] = useState<string | null>(null)
  const [admitting, setAdmitting] = useState(false)
  const joiningRef = useRef(false)

  // The backend Join is authoritative for role; fall back to the caller's hint.
  const effectiveHost = joinRole == null
    ? isHost
    : roleOf(joinRole) === "host"

  const admit = useCallback(async () => {
    if (!liveClassId) return null
    const res = await joinLiveClassApi({ liveClassId, displayName, studentId })
    return res.value
  }, [liveClassId, displayName, studentId])

  const renewToken = useCallback(async () => {
    try {
      const dto = await admit()
      if (dto?.rtcToken) setJoinInfo(toJoinInfo(dto))
      return dto?.rtcToken ?? null
    } catch {
      return null
    }
  }, [admit])

  const room = useAgoraRoom(joinInfo, { renewToken })
  const roomRef = useRef(room)
  roomRef.current = room

  // ── Realtime data plane (chat / reactions / hands / polls / moderation) ───────
  const muteSelf = useCallback(() => {
    if (roomRef.current.micOn) void roomRef.current.toggleMic()
  }, [])
  const leaveRoom = useCallback(() => {
    void roomRef.current.leave()
  }, [])

  const { identityByUid, raisedHandsByUid, rtmError } = useLiveRoomRtm({
    enabled: enabled && admission === "admitted" && !!rtmInfo,
    appId: rtmInfo?.appId,
    rtmToken: rtmInfo?.rtmToken,
    channelName: rtmInfo?.channelName,
    liveClassId,
    self: {
      participantId: rtmInfo?.participantId,
      uid: rtmInfo?.uid ?? 0,
      name: displayName ?? "You",
      role: roleOf(joinRole ?? undefined),
    },
    isHost: effectiveHost,
    muteSelf,
    leaveRoom,
  })

  // ── Admission → backend Join → Agora ──────────────────────────────────────────
  useEffect(() => {
    if (!enabled) return
    if (admission !== "admitted" || joinInfo || joiningRef.current) return
    joiningRef.current = true
    setAdmitting(true)
    setJoinError(null)
    admit()
      .then((dto) => {
        if (!dto) return
        if ((dto.state ?? "").toLowerCase() === "waiting") {
          useLiveRoomStore.setState({ admission: "waiting" })
        } else {
          setJoinInfo(toJoinInfo(dto))
          setRtmInfo(toRtmInfo(dto))
          setJoinRole(dto.role ?? null)
          setJoinSpectator(dto.isSpectator === true)
          if (dto.role) useLiveRoomStore.setState({ role: roleOf(dto.role) })
        }
      })
      .catch((e) =>
        setJoinError((e as Error)?.message ?? "Unable to join this class")
      )
      .finally(() => {
        joiningRef.current = false
        setAdmitting(false)
      })
  }, [enabled, admission, joinInfo, admit])

  // ── Waiting-room poll until the host admits ───────────────────────────────────
  useEffect(() => {
    if (!enabled || admission !== "waiting") return
    let stopped = false
    const tick = async () => {
      try {
        const dto = await admit()
        if (stopped || !dto) return
        if ((dto.state ?? "").toLowerCase() === "admitted") {
          setJoinInfo(toJoinInfo(dto))
          setRtmInfo(toRtmInfo(dto))
          setJoinRole(dto.role ?? null)
          setJoinSpectator(dto.isSpectator === true)
          useLiveRoomStore.setState({
            admission: "admitted",
            ...(dto.role ? { role: roleOf(dto.role) } : {}),
          })
        }
      } catch {
        /* keep waiting */
      }
    }
    const iv = window.setInterval(tick, 4000)
    return () => {
      stopped = true
      window.clearInterval(iv)
    }
  }, [enabled, admission, admit])

  // ── Media actions → Agora, only while in call (prejoin keeps store preview) ────
  useEffect(() => {
    if (!enabled || admission !== "admitted") return
    const orig = {
      toggleMic: useLiveRoomStore.getState().toggleMic,
      toggleCam: useLiveRoomStore.getState().toggleCam,
      toggleScreenShare: useLiveRoomStore.getState().toggleScreenShare,
      updateSettings: useLiveRoomStore.getState().updateSettings,
    }
    useLiveRoomStore.setState({
      toggleMic: () => {
        void roomRef.current.toggleMic()
      },
      toggleCam: () => {
        void roomRef.current.toggleCam()
      },
      // Device changes have to reach the live tracks, not just the store.
      updateSettings: (patch) => {
        orig.updateSettings(patch)
        if (patch.micDeviceId || patch.cameraDeviceId) {
          void roomRef.current.setDevices({
            micDeviceId: patch.micDeviceId,
            cameraDeviceId: patch.cameraDeviceId,
          })
        }
      },

      toggleScreenShare: () => {
        const r = roomRef.current
        // Keep the store's own flag and layout switch. The override replaced
        // the store action wholesale, dropping `screenSharing` and
        // `layout: "shared-screen"` — so the presenter published their screen to
        // Agora and their stage never changed to show it.
        if (r.sharingScreen) {
          void r.stopScreenShare()
          useLiveRoomStore.setState((st) => ({
            screenSharing: false,
            layout: st.layout === "shared-screen" ? "speaker" : st.layout,
          }))
        } else {
          void r.startScreenShare()
          useLiveRoomStore.setState({
            screenSharing: true,
            layout: "shared-screen",
          })
        }
      },
    })
    return () => useLiveRoomStore.setState(orig)
  }, [enabled, admission])

  // ── Mirror Agora self-media → store (guarded), only in call ────────────────────
  useEffect(() => {
    if (!enabled || admission !== "admitted") return
    useLiveRoomStore.setState((s) =>
      s.micOn === room.micOn &&
      s.camOn === room.camOn &&
      s.screenSharing === room.sharingScreen
        ? s
        : {
            micOn: room.micOn,
            camOn: room.camOn,
            screenSharing: room.sharingScreen,
          }
    )
  }, [enabled, admission, room.micOn, room.camOn, room.sharingScreen])

  // ── Roster (for names/roles) + waiting list, polled while host is in call ──────
  const pollInterval =
    enabled && effectiveHost && admission === "admitted" ? 5000 : undefined
  const { participants: roster } = useGetLiveClassParticipants(
    { liveClassId: liveClassId ?? "" },
    { refetchInterval: pollInterval }
  )
  const { participants: waitingRaw } = useGetLiveClassParticipants(
    { liveClassId: liveClassId ?? "", state: "Waiting" },
    { refetchInterval: pollInterval }
  )

  const rosterByUid = useMemo(() => {
    const m: Record<string, { name: string; role: LiveRoomRole }> = {}
    for (const r of roster) {
      // agoraUid is now a real field on LiveClassParticipantDto, so this no
      // longer needs the cast that was standing in for an unapplied backend
      // patch — and, crucially, no longer resolves to undefined for every row,
      // which is what left remote tiles showing "Participant 2".
      if (r.agoraUid != null) {
        m[String(r.agoraUid)] = { name: r.displayName, role: roleOf(r.role) }
      }
    }
    return m
  }, [roster])

  // ── Remote peers → store.participants + remoteStreams (guarded by signature) ──
  const peersSig = room.remotePeers
    .map((p) => `${p.uid}:${p.hasVideo ? 1 : 0}:${p.hasAudio ? 1 : 0}`)
    .join("|")

  const remoteStreams = useMemo(() => {
    const map: Record<string, MediaStream | null> = {}
    for (const p of room.remotePeers) map[p.uid] = p.videoStream
    return map
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [peersSig])

  useEffect(() => {
    if (!enabled || admission !== "admitted") return
    const participants: LiveParticipant[] = room.remotePeers.map((p) => {
      const meta = identityByUid[p.uid] ?? rosterByUid[p.uid]
      const name = meta?.name ?? `Participant ${p.uid}`
      return {
        id: p.uid,
        name,
        initials: initialsOf(name),
        role: meta?.role ?? "participant",
        micOn: p.hasAudio,
        camOn: p.hasVideo,
        handRaisedAt: raisedHandsByUid[p.uid] ?? null,
        connection: "good",
        joinedAt: new Date().toISOString(),
      }
    })
    useLiveRoomStore.setState({ participants })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    enabled,
    admission,
    peersSig,
    rosterByUid,
    identityByUid,
    raisedHandsByUid,
  ])

  // ── Waiting list → store.waiting (host) ───────────────────────────────────────
  useEffect(() => {
    if (!enabled || !effectiveHost) return
    const waiting: WaitingParticipant[] = waitingRaw.map((w) => ({
      id: w.id,
      name: w.displayName,
      initials: initialsOf(w.displayName),
      requestedAt: new Date(w.requestedAtUtc).toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      onRegister: w.onRegister,
    }))
    useLiveRoomStore.setState((s) => {
      if (
        s.waiting.length === waiting.length &&
        s.waiting.every((x, i) => x.id === waiting[i]?.id)
      )
        return s
      return { waiting }
    })
  }, [enabled, effectiveHost, waitingRaw])

  // ── Host admit / deny → backend ───────────────────────────────────────────────
  const { admitParticipantsAsync } = useAdmitParticipants()
  const { removeParticipantAsync } = useRemoveParticipant()
  useEffect(() => {
    if (!enabled || !effectiveHost || !liveClassId) return
    const orig = {
      admit: useLiveRoomStore.getState().admit,
      admitAll: useLiveRoomStore.getState().admitAll,
      deny: useLiveRoomStore.getState().deny,
    }
    useLiveRoomStore.setState({
      admit: (id: string) => {
        void admitParticipantsAsync({
          liveClassId,
          participantIds: [id],
        }).catch(() => {})
      },

      // "Admit all ON REGISTER" now means what it says. It used to send every
      // waiting id, including the ones the panel itself flags as "Not on the
      // register — check before admitting", so one click let in exactly the
      // people the warning existed to stop. AdmitAllOnRegister is evaluated
      // server-side against the class register, which is the only place that
      // can be trusted to decide it.
      admitAll: () => {
        void admitParticipantsAsync({
          liveClassId,
          participantIds: [],
          admitAllOnRegister: true,
        }).catch(() => {})
      },

      // Deny was local-only: it dropped the row from `waiting`, and the 4s
      // roster poll below put it straight back. Denying now removes the
      // participant server-side, so the decision sticks.
      deny: (id: string) => {
        useLiveRoomStore.setState((s) => ({
          waiting: s.waiting.filter((w) => w.id !== id),
        }))
        void removeParticipantAsync({ liveClassId, participantId: id }).catch(
          () => {}
        )
      },
    })
    return () => useLiveRoomStore.setState(orig)
  }, [
    enabled,
    effectiveHost,
    liveClassId,
    admitParticipantsAsync,
    removeParticipantAsync,
  ])

  return {
    /** Feed to RoomMediaContext so tiles can render remote video. */
    remoteStreams,
    /** Your own screen share, so the presenter's stage shows the real thing. */
    localScreenStream: room.localScreenStream,
    /** Your own Agora camera stream once in call (feed to LocalMediaContext). */
    localStream: room.localVideoStream,
    admitting,
    connecting: room.connecting,
    joinError: joinError ?? room.error ?? rtmError,
    isSpectator: joinSpectator,
  }
}
