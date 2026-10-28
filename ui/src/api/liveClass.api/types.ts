// Types for the school-management LiveClass module (EM360.API › LiveClassController).
// Backend bodies are PascalCase `Result<T>` envelopes; these are the camelCase
// shapes produced after `normalizeResponse` at the API boundary.

// ─── Shared envelopes ─────────────────────────────────────────────────────────

export interface ApiResultBaseI {
  isSuccess: boolean
  message?: string
  error: string
  isFailure: boolean
  statusCode?: number
}

export interface ResultI<T> extends ApiResultBaseI {
  value: T
}

export interface PaginatedValueI<T> {
  items: T[]
  pageNumber: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export type PaginatedResultI<T> = ResultI<PaginatedValueI<T>>

// ─── Domain DTOs ──────────────────────────────────────────────────────────────

/** Matches EM360.Domain.Enums.LiveClassStatus. */
export type LiveClassStatusName = "Scheduled" | "Live" | "Ended" | "Cancelled"

export interface LiveClassPolicyI {
  waitingRoomEnabled: boolean
  roomLocked: boolean
  participantsCanUnmute: boolean
  participantsCanShareScreen: boolean
  participantsCanChat: boolean
  participantsCanShareFiles: boolean
  participantsCanAnnotate: boolean
}

export interface LiveClassDtoI {
  id: string
  schoolId: string
  title: string
  subjectId?: string | null
  subjectName?: string | null
  schoolClassId: string
  className?: string | null
  teacherId: string
  teacherName?: string | null
  /** ISO date */
  scheduledDate: string
  /** "HH:mm" */
  startTime: string
  /** "HH:mm" */
  endTime: string
  status: LiveClassStatusName
  startedAtUtc?: string | null
  endedAtUtc?: string | null
  maxParticipants: number
  /** Current students on the target class register. */
  enrolledStudentCount: number
  participantCount: number
  waitingCount: number
  endToEndEncrypted: boolean
  recordingEnabled: boolean
  /** The virtual timetable period this class was started from, when it was. */
  timetableSlotId?: string | null
  /** Playback URL of the newest stored recording; null when there is none. */
  recordingUrl?: string | null
  policy: LiveClassPolicyI
  /** Resolved for the caller: "Host" | "CoHost" | "Participant". */
  yourRole?: string | null
  canStart: boolean
  canSpectate?: boolean
}

export interface LiveClassJoinDtoI {
  liveClassId: string
  participantId: string
  state: string
  role: string
  isSpectator?: boolean
  canPublish: boolean
  appId?: string | null
  channelName?: string | null
  uid: number
  rtcToken?: string | null
  rtmToken?: string | null
  tokenExpiresAtUtc?: string | null
  policy?: LiveClassPolicyI | null
  message?: string | null
}

export interface LiveClassParticipantDtoI {
  id: string
  userId?: string | null
  displayName: string
  /** Agora RTC uid — the key that joins this roster to the video tiles. */
  agoraUid?: number
  isGuest: boolean
  onRegister: boolean
  role: string
  state: string
  canPublishAudio: boolean
  canPublishVideo: boolean
  requestedAtUtc: string
  admittedAtUtc?: string | null
  leftAtUtc?: string | null
  minutesAttended: number
}

export interface LiveClassGuestLinkDtoI {
  id: string
  liveClassId: string
  /** Only present on the creation response — never returned again. */
  url?: string | null
  tokenHint: string
  enabled: boolean
  expiresAtUtc?: string | null
  maxUses?: number | null
  uses: number
  revokedAtUtc?: string | null
  revokedReason?: string | null
  status: string
}

export interface GuestLinkPreviewDtoI {
  liveClassId: string
  title: string
  subjectName?: string | null
  className?: string | null
  teacherName?: string | null
  scheduledDate: string
  startTime: string
  endTime: string
  status: LiveClassStatusName
  recordingEnabled: boolean
}

export interface LiveClassEndSummaryDtoI {
  liveClassId: string
  endedAtUtc: string
  durationMinutes: number
  totalAttended: number
  guestLinksRevoked: number
}

// ─── Query params ─────────────────────────────────────────────────────────────

export interface GetLiveClassesParams {
  schoolId: string
  schoolClassId?: string
  teacherId?: string
  /** "Scheduled" | "Live" | "Ended" | "Cancelled" */
  status?: LiveClassStatusName | string
  pageNumber?: number
  pageSize?: number
}

export interface GetLiveClassParticipantsParams {
  liveClassId: string
  /** "Waiting" | "Admitted" | ... */
  state?: string
}

// ─── Command payloads ─────────────────────────────────────────────────────────

export interface ScheduleLiveClassPayloadI {
  schoolId: string
  title: string
  subjectId?: string
  schoolClassId: string
  /** Defaults to the caller server-side when omitted. */
  teacherId?: string
  /** ISO date */
  scheduledDate: string
  /** "HH:mm" */
  startTime: string
  /** "HH:mm" */
  endTime: string
  timetableSlotId?: string
  recordingEnabled?: boolean
  endToEndEncrypted?: boolean
  coHostUserIds?: string[]
}

export interface JoinLiveClassPayloadI {
  liveClassId: string
  displayName?: string
  studentId?: string
}

export interface CreateGuestLinkPayloadI {
  liveClassId: string
  expiresAtUtc?: string
  maxUses?: number
}

export interface RevokeGuestLinkParams {
  liveClassId: string
  disableOnly?: boolean
}

export interface AdmitParticipantsPayloadI {
  liveClassId: string
  participantIds: string[]
  /**
   * Admit every waiting person the server can match to the class register.
   * Server-evaluated on purpose — the client's `onRegister` flag is display
   * data and must not be what decides who gets in.
   */
  admitAllOnRegister?: boolean
}

export interface RemoveParticipantPayloadI {
  liveClassId: string
  participantId: string
}

export interface MuteParticipantsPayloadI {
  liveClassId: string
  participantIds: string[]
  mute: boolean
}

export interface UpdateLiveClassPolicyPayloadI {
  liveClassId: string
  waitingRoomEnabled?: boolean
  roomLocked?: boolean
  participantsCanUnmute?: boolean
  participantsCanShareScreen?: boolean
  participantsCanChat?: boolean
  participantsCanShareFiles?: boolean
  participantsCanAnnotate?: boolean
}

// Guest (public) endpoints
export interface RedeemGuestLinkPayloadI {
  token: string
  displayName?: string
}

// ─── Timetable slot → LiveClass bridge (ELearningController) ───────────────────

export interface StartClassFromSlotPayloadI {
  schoolId: string
  /** Timetable period row id (the virtual class). */
  timetableSlotId: string
  /** ISO date of the occurrence being started, e.g. "2026-08-03". */
  date: string
}
