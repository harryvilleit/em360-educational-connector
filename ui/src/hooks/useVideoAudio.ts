import { useCallback, useState } from "react"
import {
  normalizeVideoAudio,
  readVideoAudio,
  saveVideoAudio,
  type VideoAudio,
} from "@/lib/video-audio"

export function useVideoAudio() {
  const [initialAudio] = useState(readVideoAudio)
  const [audio, setAudio] = useState(initialAudio)
  const syncAudio = useCallback((value: VideoAudio) => {
    const next = normalizeVideoAudio(value)
    setAudio((previous) =>
      previous.volume === next.volume && previous.muted === next.muted
        ? previous
        : next
    )
  }, [])
  const changeAudio = useCallback(
    (value: VideoAudio) => {
      syncAudio(value)
      // Persist deliberate EM360 control changes, not transient SDK startup values.
      saveVideoAudio(value)
    },
    [syncAudio]
  )
  return { audio, initialAudio, syncAudio, changeAudio }
}
