import type { VideoStorageOverview } from "../api/videoStorage.api"

export function schoolVideoUploadDisabledReason(storage?: VideoStorageOverview): string {
  if (!storage) return "School video storage could not be checked. Refresh and try again."
  const now = Date.now()
  const paidActive = !!storage.paidThroughUtc && Date.parse(storage.paidThroughUtc) > now
  const freeActive = storage.freeCapacityMinutes > 0 &&
    (!storage.freeExpiresAtUtc || Date.parse(storage.freeExpiresAtUtc) > now)
  if (!Number.isFinite(storage.capacityMinutes) || storage.capacityMinutes <= 0 || (!paidActive && !freeActive)) {
    return "No active video storage is available. Ask the school owner to buy minutes or contact EM360 about complimentary storage."
  }
  if (storage.unverifiedVideos > 0) return "Existing videos are being measured. Refresh storage usage before uploading another video."
  if (!Number.isFinite(storage.availableMinutes) || storage.availableMinutes <= 0) return "No video storage minutes remain. Ask the school owner to add storage."
  return ""
}

export function assertSchoolVideoCapacity(storage: VideoStorageOverview, durationSeconds?: number): void {
  const blocked = schoolVideoUploadDisabledReason(storage)
  if (blocked) throw new Error(blocked)
  if (!durationSeconds || !Number.isFinite(durationSeconds) || durationSeconds <= 0) throw new Error("The video's duration could not be read. Select a supported video file.")
  const required = Math.ceil(durationSeconds)
  const available = Math.round(storage.availableMinutes * 60)
  if (required > available) throw new Error(`Not enough school video storage. ${(available / 60).toFixed(2)} minutes remain; this video needs ${(required / 60).toFixed(2)} minutes. You can use a YouTube link instead.`)
}
