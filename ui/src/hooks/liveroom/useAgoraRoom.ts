import { useCallback, useEffect, useRef, useState } from "react"
import AgoraRTC, {
  type IAgoraRTCClient,
  type IAgoraRTCRemoteUser,
  type ICameraVideoTrack,
  type IMicrophoneAudioTrack,
  type ILocalVideoTrack,
  type UID,
} from "agora-rtc-sdk-ng"

/**
 * Real-time video/audio for the live room, backed by Agora RTC.
 *
 * Requires the SDK:  npm i agora-rtc-sdk-ng
 *
 * Flow: call the backend Join (see `useJoinLiveClass`) to get the join DTO,
 * map it to `AgoraJoinInfo`, and pass it in. The hook joins the channel,
 * publishes local mic/cam when `canPublish` is true, subscribes to everyone
 * else, and exposes each peer's video as a `MediaStream` you can hand straight
 * to `VideoSurface` / `ParticipantTile`.
 *
 * `canPublish` is enforced server-side by the token privileges — this flag only
 * decides whether we *attempt* to publish, so the UI stays honest.
 */

export interface AgoraJoinInfo {
  appId: string
  channelName: string
  uid: number
  rtcToken: string
  canPublish: boolean
}

export interface RemotePeer {
  uid: string
  hasAudio: boolean
  hasVideo: boolean
  videoStream: MediaStream | null
}

export interface UseAgoraRoomOptions {
  renewToken?: () => Promise<string | null>
  codec?: "vp8" | "vp9" | "h264"
}

function wrapTrack(track: { getMediaStreamTrack(): MediaStreamTrack } | undefined | null) {
  const mst = track?.getMediaStreamTrack()
  return mst ? new MediaStream([mst]) : null
}

export function useAgoraRoom(
  joinInfo: AgoraJoinInfo | null,
  options: UseAgoraRoomOptions = {}
) {
  const { renewToken, codec = "vp8" } = options

  const clientRef = useRef<IAgoraRTCClient | null>(null)
  const micRef = useRef<IMicrophoneAudioTrack | null>(null)
  const camRef = useRef<ICameraVideoTrack | null>(null)
  const screenRef = useRef<ILocalVideoTrack | null>(null)

  const [joined, setJoined] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [micOn, setMicOn] = useState(true)
  const [camOn, setCamOn] = useState(true)
  const [sharingScreen, setSharingScreen] = useState(false)
  const [localVideoStream, setLocalVideoStream] = useState<MediaStream | null>(null)
  /**
   * Your own screen track as a MediaStream, so the presenter can actually see
   * what they are sharing. Agora publishes the track to the channel, but the
   * publisher never receives their own stream back — without surfacing it here
   * the presenter was shown a placeholder card reading "Shared screen renders
   * here".
   */
  const [localScreenStream, setLocalScreenStream] = useState<MediaStream | null>(null)
  const [remotePeers, setRemotePeers] = useState<Record<string, RemotePeer>>({})

  // Keep the latest renewToken without re-subscribing the client listeners.
  const renewRef = useRef(renewToken)
  useEffect(() => {
    renewRef.current = renewToken
  }, [renewToken])

  const upsertPeer = useCallback((uid: UID, patch: Partial<RemotePeer>) => {
    const key = String(uid)
    setRemotePeers((prev) => {
      const base: RemotePeer = prev[key] ?? {
        uid: key,
        hasAudio: false,
        hasVideo: false,
        videoStream: null,
      }
      return {
        ...prev,
        [key]: { ...base, ...patch },
      }
    })
  }, [])

  const dropPeer = useCallback((uid: UID) => {
    const key = String(uid)
    setRemotePeers((prev) => {
      const next = { ...prev }
      delete next[key]
      return next
    })
  }, [])

  // ── Join / leave lifecycle, driven by joinInfo ────────────────────────────────
  useEffect(() => {
    if (!joinInfo) return

    let cancelled = false
    const client = AgoraRTC.createClient({ mode: "rtc", codec })
    clientRef.current = client

    const handleUserPublished = async (
      user: IAgoraRTCRemoteUser,
      mediaType: "audio" | "video"
    ) => {
      await client.subscribe(user, mediaType)
      if (mediaType === "audio") {
        user.audioTrack?.play()
        upsertPeer(user.uid, { hasAudio: true })
      } else {
        upsertPeer(user.uid, {
          hasVideo: true,
          videoStream: wrapTrack(user.videoTrack),
        })
      }
    }

    const handleUserUnpublished = (
      user: IAgoraRTCRemoteUser,
      mediaType: "audio" | "video"
    ) => {
      if (mediaType === "audio") upsertPeer(user.uid, { hasAudio: false })
      else upsertPeer(user.uid, { hasVideo: false, videoStream: null })
    }

    const handleUserJoined = (user: IAgoraRTCRemoteUser) =>
      upsertPeer(user.uid, {})
    const handleUserLeft = (user: IAgoraRTCRemoteUser) => dropPeer(user.uid)

    const handleTokenWillExpire = async () => {
      const fresh = await renewRef.current?.()
      if (fresh) await client.renewToken(fresh)
    }

    client.on("user-published", handleUserPublished)
    client.on("user-unpublished", handleUserUnpublished)
    client.on("user-joined", handleUserJoined)
    client.on("user-left", handleUserLeft)
    client.on("token-privilege-will-expire", handleTokenWillExpire)

    async function connect() {
      setConnecting(true)
      setError(null)
      try {
        await client.join(
          joinInfo!.appId,
          joinInfo!.channelName,
          joinInfo!.rtcToken,
          joinInfo!.uid
        )
        if (cancelled) return

        if (joinInfo!.canPublish) {
          const [mic, cam] = await Promise.all([
            AgoraRTC.createMicrophoneAudioTrack(),
            AgoraRTC.createCameraVideoTrack(),
          ])
          if (cancelled) {
            mic.close()
            cam.close()
            return
          }
          micRef.current = mic
          camRef.current = cam
          setLocalVideoStream(wrapTrack(cam))
          await client.publish([mic, cam])
        }
        if (!cancelled) setJoined(true)
      } catch (err) {
        if (!cancelled) setError((err as Error)?.message ?? "Failed to join the class")
      } finally {
        if (!cancelled) setConnecting(false)
      }
    }

    connect()

    return () => {
      cancelled = true
      client.off("user-published", handleUserPublished)
      client.off("user-unpublished", handleUserUnpublished)
      client.off("user-joined", handleUserJoined)
      client.off("user-left", handleUserLeft)
      client.off("token-privilege-will-expire", handleTokenWillExpire)

      screenRef.current?.close()
      camRef.current?.close()
      micRef.current?.close()
      screenRef.current = null
      camRef.current = null
      micRef.current = null

      client.leave().catch(() => {})
      clientRef.current = null

      setJoined(false)
      setLocalVideoStream(null)
      setRemotePeers({})
      setSharingScreen(false)
    }
    // Re-join only when the channel/identity/token actually changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [joinInfo?.channelName, joinInfo?.uid, joinInfo?.rtcToken, codec])

  // ── Controls ──────────────────────────────────────────────────────────────────
  const toggleMic = useCallback(async () => {
    const mic = micRef.current
    if (!mic) return
    const next = !micOn
    await mic.setEnabled(next)
    setMicOn(next)
  }, [micOn])

  const toggleCam = useCallback(async () => {
    const cam = camRef.current
    if (!cam) return
    const next = !camOn
    await cam.setEnabled(next)
    setCamOn(next)
  }, [camOn])

  const startScreenShare = useCallback(async () => {
    const client = clientRef.current
    if (!client || sharingScreen) return
    try {
      const screen = await AgoraRTC.createScreenVideoTrack({}, "disable")
      const screenTrack = Array.isArray(screen) ? screen[0] : screen
      screenRef.current = screenTrack as ILocalVideoTrack
      if (camRef.current) await client.unpublish(camRef.current)
      await client.publish(screenRef.current)
      setSharingScreen(true)
      const mst = screenRef.current.getMediaStreamTrack?.()
      setLocalScreenStream(mst ? new MediaStream([mst]) : null)
      // Chrome's native "Stop sharing" button ends the track — reflect that.
      screenRef.current.on("track-ended", () => {
        stopScreenShare()
      })
    } catch (err) {
      setError((err as Error)?.message ?? "Couldn't start screen share")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sharingScreen])

  const stopScreenShare = useCallback(async () => {
    const client = clientRef.current
    if (!client || !screenRef.current) return
    await client.unpublish(screenRef.current).catch(() => {})
    screenRef.current.close()
    screenRef.current = null
    setLocalScreenStream(null)
    if (camRef.current) await client.publish(camRef.current)
    setSharingScreen(false)
  }, [])

  /**
   * Point the live tracks at different hardware.
   *
   * The Settings dialog wrote the chosen device ids into the store and stopped
   * there — nothing ever told Agora, so picking a different camera or mic in
   * the middle of a class did nothing at all. Agora exposes setDevice on the
   * published track, which switches without republishing.
   */
  const setDevices = useCallback(
    async (devices: { micDeviceId?: string; cameraDeviceId?: string }) => {
      try {
        if (devices.micDeviceId && micRef.current) {
          await micRef.current.setDevice(devices.micDeviceId)
        }
        if (devices.cameraDeviceId && camRef.current) {
          await camRef.current.setDevice(devices.cameraDeviceId)
        }
      } catch (err) {
        // A device that vanished (unplugged headset) shouldn't kill the call.
        setError((err as Error)?.message ?? "Couldn't switch device")
      }
    },
    []
  )

  const leave = useCallback(async () => {
    screenRef.current?.close()
    camRef.current?.close()
    micRef.current?.close()
    screenRef.current = null
    camRef.current = null
    micRef.current = null
    await clientRef.current?.leave().catch(() => {})
    setJoined(false)
    setLocalVideoStream(null)
    setRemotePeers({})
    setSharingScreen(false)
    setLocalScreenStream(null)
  }, [])

  return {
    joined,
    connecting,
    error,
    micOn,
    camOn,
    sharingScreen,
    /** Your own camera preview (mirror it in the UI). */
    localVideoStream,
    /** Your own screen share, for the presenter's own stage. */
    localScreenStream,
    /** Remote peers keyed by Agora uid; feed `videoStream` to VideoSurface. */
    remotePeers: Object.values(remotePeers),
    remotePeersByUid: remotePeers,
    toggleMic,
    toggleCam,
    setDevices,
    startScreenShare,
    stopScreenShare,
    leave,
  }
}