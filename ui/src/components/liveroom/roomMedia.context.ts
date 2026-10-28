import { createContext, useContext } from "react"

export interface RoomMediaValue {
  /**
   * Remote participant video streams, keyed by the same id used for that
   * participant in `store.participants` (the Agora uid, as a string). Stage
   * looks a stream up here for every non-self tile.
   */
  remoteStreams: Record<string, MediaStream | null>
  /**
   * Your own screen share while presenting. Agora never echoes a publisher's
   * own track back, so the presenter's stage has to render this directly.
   */
  localScreenStream?: MediaStream | null
}

const FALLBACK: RoomMediaValue = { remoteStreams: {}, localScreenStream: null }

export const RoomMediaContext = createContext<RoomMediaValue>(FALLBACK)

export const useRoomMediaContext = () => useContext(RoomMediaContext)
