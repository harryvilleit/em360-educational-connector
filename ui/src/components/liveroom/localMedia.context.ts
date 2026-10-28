import { createContext, useContext } from "react"
import type { LocalMediaError } from "@/hooks/liveroom/useLocalMedia"

export interface LocalMediaValue {
  stream: MediaStream | null
  error: LocalMediaError | null
  acquiring: boolean
  retry: () => void
}

const FALLBACK: LocalMediaValue = {
  stream: null,
  error: null,
  acquiring: false,
  retry: () => {},
}

export const LocalMediaContext = createContext<LocalMediaValue>(FALLBACK)

/** Acquired once in RoomShell so the camera is only opened a single time. */
export const useLocalMediaContext = () => useContext(LocalMediaContext)
