export type LiveRoomRole = "host" | "cohost" | "participant"

export type ConnectionQuality = "good" | "fair" | "poor" | "offline"

/** Bandwidth profile. `audio` is the low-data fallback for weak connections. */
export type MediaProfile = "hd" | "sd" | "low" | "audio"

export type StageLayout = "speaker" | "grid" | "whiteboard" | "shared-screen"

export type SidePanelTab =
  | "people"
  | "polls"
  | "breakouts"
  | "captions"
  | "summary"
  | null

export type ReactionKind =
  | "clap"
  | "thumbsUp"
  | "heart"
  | "smile"
  | "confused"
  | "celebrate"

export type AdmissionState =
  | "prejoin"
  | "waiting"
  | "admitted"
  | "denied"
  | "removed"

export interface LiveParticipant {
  id: string
  name: string
  initials: string
  role: LiveRoomRole
  isSelf?: boolean
  micOn: boolean
  camOn: boolean
  isSharingScreen?: boolean
  handRaisedAt?: number | null
  reaction?: { kind: ReactionKind; at: number } | null
  connection: ConnectionQuality
  breakoutRoomId?: string | null
  isSpeaking?: boolean
  joinedAt: string
}

export interface WaitingParticipant {
  id: string
  name: string
  initials: string
  requestedAt: string
  onRegister: boolean
}

export type ChatScope = "everyone" | "hosts" | "breakout"

export interface LiveChatMessage {
  id: string
  senderId: string
  senderName: string
  senderRole: LiveRoomRole
  body: string
  sentAt: string
  scope: ChatScope
  file?: SharedFile
  pinned?: boolean
}

export interface SharedFile {
  id: string
  name: string
  sizeLabel: string
  kind: "pdf" | "image" | "doc" | "slide" | "sheet" | "other"
  sharedBy: string
  sharedAt: string
  url?: string
}

export interface CaptionCue {
  id: string
  speakerName: string
  text: string
  at: number
  isFinal: boolean
}

export type PollKind = "single" | "multiple" | "wordCloud"

export interface PollOption {
  id: string
  label: string
  votes: number
}

export interface LivePoll {
  id: string
  question: string
  kind: PollKind
  options: PollOption[]
  status: "draft" | "open" | "closed"
  anonymous: boolean
  createdBy: string
  createdAt: string
  totalResponses: number
  myVote?: string[]
}

export interface BreakoutRoom {
  id: string
  name: string
  memberIds: string[]
  status: "draft" | "open" | "closed"
}

export interface BreakoutConfig {
  rooms: BreakoutRoom[]
  durationMinutes: number
  startedAt: number | null
  allowReturnToMain: boolean
  autoCloseOnTimer: boolean
}

export interface RecordingState {
  status: "idle" | "starting" | "recording" | "paused" | "processing"
  startedAt: number | null
  consentAcknowledged: boolean
  includeChatTranscript: boolean
  retentionDays: number
}

export type VirtualBackground =
  | { kind: "none" }
  | { kind: "blur"; strength: "light" | "strong" }
  | { kind: "image"; id: string; label: string; previewClass: string }

export interface RoomSettings {
  mediaProfile: MediaProfile
  dataSaver: boolean
  virtualBackground: VirtualBackground
  captionsOn: boolean
  captionLanguage: string
  noiseSuppression: boolean
  mirrorSelfView: boolean
  encryption: "transport" | "e2ee"
  micDeviceId: string
  cameraDeviceId: string
  speakerDeviceId: string
}

export interface RoomPolicy {
  waitingRoomEnabled: boolean
  participantsCanShareScreen: boolean
  participantsCanUnmute: boolean
  participantsCanChat: boolean
  participantsCanShareFiles: boolean
  participantsCanAnnotate: boolean
  lockRoom: boolean
}

export interface AiSummarySection {
  id: string
  heading: string
  bullets: string[]
}

export interface AiActionItem {
  id: string
  text: string
  owner: string
  due?: string
  done: boolean
}

export interface AiSummary {
  status: "unavailable" | "generating" | "ready"
  generatedAt?: string
  headline?: string
  sections: AiSummarySection[]
  actionItems: AiActionItem[]
  topicsCovered: string[]
  attendanceNote?: string
}

export interface WhiteboardStroke {
  id: string
  points: { x: number; y: number }[]
  color: string
  width: number
  authorId: string
}

export type WhiteboardTool =
  | "pen"
  | "highlighter"
  | "eraser"
  | "text"
  | "shape"
  | "pointer"
