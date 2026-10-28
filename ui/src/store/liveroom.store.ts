import { create } from "zustand"
import type {
  AdmissionState,
  AiSummary,
  BreakoutConfig,
  CaptionCue,
  ChatScope,
  LiveChatMessage,
  LiveParticipant,
  LivePoll,
  LiveRoomRole,
  MediaProfile,
  ReactionKind,
  RecordingState,
  RoomPolicy,
  RoomSettings,
  SharedFile,
  SidePanelTab,
  StageLayout,
  WaitingParticipant,
  WhiteboardStroke,
} from "@/types/liveroom"

const DEFAULT_SETTINGS: RoomSettings = {
  mediaProfile: "sd",
  dataSaver: false,
  virtualBackground: { kind: "none" },
  captionsOn: false,
  captionLanguage: "en",
  noiseSuppression: true,
  mirrorSelfView: true,
  encryption: "transport",
  micDeviceId: "default",
  cameraDeviceId: "default",
  speakerDeviceId: "default",
}

const DEFAULT_POLICY: RoomPolicy = {
  waitingRoomEnabled: true,
  participantsCanShareScreen: false,
  participantsCanUnmute: true,
  participantsCanChat: false,
  participantsCanShareFiles: false,
  participantsCanAnnotate: false,
  lockRoom: false,
}

const DEFAULT_RECORDING: RecordingState = {
  status: "idle",
  startedAt: null,
  consentAcknowledged: false,
  includeChatTranscript: true,
  retentionDays: 90,
}

interface FloatingReaction {
  id: string
  kind: ReactionKind
  name: string
  offset: number
}

interface LiveRoomState {
  // identity
  role: LiveRoomRole
  selfId: string
  selfName: string
  /** Joined via a share link rather than a school account. */
  isGuest: boolean
  admission: AdmissionState

  // media
  micOn: boolean
  camOn: boolean
  screenSharing: boolean
  handRaised: boolean

  // layout
  layout: StageLayout
  panel: SidePanelTab
  pinnedParticipantId: string | null
  /** Shared whiteboard content — see the whiteboard actions below. */
  whiteboardStrokes: WhiteboardStroke[]
  settingsOpen: boolean
  leaveConfirmOpen: boolean

  // collections
  participants: LiveParticipant[]
  waiting: WaitingParticipant[]
  messages: LiveChatMessage[]
  files: SharedFile[]
  polls: LivePoll[]
  captions: CaptionCue[]
  breakouts: BreakoutConfig
  summary: AiSummary
  floatingReactions: FloatingReaction[]

  // config
  settings: RoomSettings
  policy: RoomPolicy
  recording: RecordingState
  chatScope: ChatScope
  unreadChat: number

  // actions — identity / lifecycle
  initRoom: (
    role: LiveRoomRole,
    selfName: string,
    admission: AdmissionState,
    isGuest?: boolean
  ) => void
  setAdmission: (state: AdmissionState) => void

  // actions — media
  toggleMic: () => void
  toggleCam: () => void
  toggleScreenShare: () => void
  toggleHand: () => void
  sendReaction: (kind: ReactionKind) => void
  clearReaction: (id: string) => void

  // actions — layout
  setLayout: (layout: StageLayout) => void
  setPanel: (panel: SidePanelTab) => void
  pinParticipant: (id: string | null) => void
  setSettingsOpen: (open: boolean) => void
  setLeaveConfirmOpen: (open: boolean) => void

  // actions — moderation
  admit: (id: string) => void
  admitAll: () => void
  deny: (id: string) => void
  muteParticipant: (id: string) => void
  muteEveryone: () => void
  lowerHand: (id: string) => void
  lowerAllHands: () => void
  removeParticipant: (id: string) => void
  promoteToCohost: (id: string) => void
  updatePolicy: (patch: Partial<RoomPolicy>) => void

  // actions — chat & files
  setChatScope: (scope: ChatScope) => void
  sendMessage: (body: string, file?: SharedFile) => void
  pinMessage: (id: string) => void
  shareFile: (file: Omit<SharedFile, "id" | "sharedAt" | "sharedBy">) => void

  // actions — polls
  createPoll: (
    poll: Omit<LivePoll, "id" | "createdAt" | "totalResponses" | "createdBy">
  ) => void
  votePoll: (pollId: string, optionIds: string[]) => void
  setPollStatus: (pollId: string, status: LivePoll["status"]) => void

  // actions — breakouts
  updateBreakouts: (patch: Partial<BreakoutConfig>) => void
  addBreakoutRoom: () => void
  renameBreakoutRoom: (id: string, name: string) => void
  removeBreakoutRoom: (id: string) => void
  assignToBreakout: (participantId: string, roomId: string | null) => void
  autoAssignBreakouts: (roomCount: number) => void
  startBreakouts: () => void
  closeBreakouts: () => void

  // actions — whiteboard
  /**
   * Board strokes live in the store, not in the Whiteboard component, so the
   * RTM layer can apply remote strokes to the same state the canvas renders.
   * While they were component state nothing could be shared: each person drew
   * on their own private board under a caption promising the opposite.
   */
  addStroke: (stroke: WhiteboardStroke) => void
  removeStroke: (strokeId: string) => void
  clearBoard: () => void
  /** Replace everything — used to seed a newcomer from an existing board. */
  replaceStrokes: (strokes: WhiteboardStroke[]) => void

  // actions — settings & recording
  updateSettings: (patch: Partial<RoomSettings>) => void
  setMediaProfile: (profile: MediaProfile) => void
  startRecording: () => void
  pauseRecording: () => void
  stopRecording: () => void
  acknowledgeConsent: () => void
  updateRecording: (patch: Partial<RecordingState>) => void

  // actions — captions & summary
  toggleCaptions: () => void
  pushCaption: (cue: CaptionCue) => void
  toggleActionItem: (id: string) => void

  reset: () => void
}

const emptyBreakouts = (): BreakoutConfig => ({
  rooms: [],
  durationMinutes: 10,
  startedAt: null,
  allowReturnToMain: true,
  autoCloseOnTimer: true,
})

const emptySummary = (): AiSummary => ({
  status: "unavailable",
  sections: [],
  actionItems: [],
  topicsCovered: [],
})

const now = () =>
  new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })

export const useLiveRoomStore = create<LiveRoomState>((set) => ({
  role: "participant",
  selfId: "self",
  selfName: "You",
  isGuest: false,
  admission: "prejoin",

  micOn: false,
  camOn: true,
  screenSharing: false,
  handRaised: false,

  layout: "speaker",
  panel: null,
  pinnedParticipantId: null,
  whiteboardStrokes: [],
  settingsOpen: false,
  leaveConfirmOpen: false,

  participants: [],
  waiting: [],
  messages: [],
  files: [],
  polls: [],
  captions: [],
  breakouts: emptyBreakouts(),
  summary: emptySummary(),
  floatingReactions: [],

  settings: DEFAULT_SETTINGS,
  policy: DEFAULT_POLICY,
  recording: DEFAULT_RECORDING,
  chatScope: "everyone",
  unreadChat: 0,

  initRoom: (role, selfName, admission, isGuest = false) =>
    set({
      role,
      selfName,
      admission,
      isGuest,
      micOn: role === "host",
      panel: null,
      layout: "speaker",
    }),

  setAdmission: (admission) => set({ admission }),

  toggleMic: () =>
    set((s) => {
      if (
        s.role === "participant" &&
        !s.policy.participantsCanUnmute &&
        !s.micOn
      )
        return s
      return { micOn: !s.micOn }
    }),

  toggleCam: () => set((s) => ({ camOn: !s.camOn })),

  toggleScreenShare: () =>
    set((s) => {
      if (s.role === "participant" && !s.policy.participantsCanShareScreen)
        return s
      const next = !s.screenSharing
      return { screenSharing: next, layout: next ? "shared-screen" : "speaker" }
    }),

  toggleHand: () => set((s) => ({ handRaised: !s.handRaised })),

  sendReaction: (kind) =>
    set((s) => ({
      floatingReactions: [
        ...s.floatingReactions,
        {
          id: `r-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          kind,
          name: s.selfName,
          offset: Math.random() * 60 - 30,
        },
      ],
    })),

  clearReaction: (id) =>
    set((s) => ({
      floatingReactions: s.floatingReactions.filter((r) => r.id !== id),
    })),

  setLayout: (layout) => set({ layout }),

  setPanel: (panel) =>
    set((s) => ({
      panel: s.panel === panel ? null : panel,
      unreadChat: 0,
    })),

  pinParticipant: (id) =>
    set({ pinnedParticipantId: id, layout: id ? "speaker" : "grid" }),

  setSettingsOpen: (settingsOpen) => set({ settingsOpen }),
  setLeaveConfirmOpen: (leaveConfirmOpen) => set({ leaveConfirmOpen }),

  admit: (id) =>
    set((s) => {
      const person = s.waiting.find((w) => w.id === id)
      if (!person) return s
      return {
        waiting: s.waiting.filter((w) => w.id !== id),
        participants: [
          ...s.participants,
          {
            id: person.id,
            name: person.name,
            initials: person.initials,
            role: "participant",
            micOn: false,
            camOn: true,
            connection: "good",
            joinedAt: now(),
          },
        ],
      }
    }),

  admitAll: () =>
    set((s) => ({
      waiting: [],
      participants: [
        ...s.participants,
        ...s.waiting.map((w) => ({
          id: w.id,
          name: w.name,
          initials: w.initials,
          role: "participant" as const,
          micOn: false,
          camOn: true,
          connection: "good" as const,
          joinedAt: now(),
        })),
      ],
    })),

  deny: (id) => set((s) => ({ waiting: s.waiting.filter((w) => w.id !== id) })),

  muteParticipant: (id) =>
    set((s) => ({
      participants: s.participants.map((p) =>
        p.id === id ? { ...p, micOn: false } : p
      ),
    })),

  muteEveryone: () =>
    set((s) => ({
      participants: s.participants.map((p) =>
        p.role === "participant" ? { ...p, micOn: false } : p
      ),
    })),

  lowerHand: (id) =>
    set((s) => ({
      participants: s.participants.map((p) =>
        p.id === id ? { ...p, handRaisedAt: null } : p
      ),
    })),

  lowerAllHands: () =>
    set((s) => ({
      participants: s.participants.map((p) => ({ ...p, handRaisedAt: null })),
      handRaised: false,
    })),

  removeParticipant: (id) =>
    set((s) => ({ participants: s.participants.filter((p) => p.id !== id) })),

  promoteToCohost: (id) =>
    set((s) => ({
      participants: s.participants.map((p) =>
        p.id === id
          ? { ...p, role: p.role === "cohost" ? "participant" : "cohost" }
          : p
      ),
    })),

  updatePolicy: (patch) => set((s) => ({ policy: { ...s.policy, ...patch } })),

  setChatScope: (chatScope) => set({ chatScope }),

  sendMessage: (body, file) =>
    set((s) => ({
      messages: [
        ...s.messages,
        {
          id: `m-${Date.now()}`,
          senderId: s.selfId,
          senderName: s.selfName,
          senderRole: s.role,
          body,
          sentAt: now(),
          scope: s.chatScope,
          file,
        },
      ],
      files: file ? [...s.files, file] : s.files,
    })),

  pinMessage: (id) =>
    set((s) => ({
      messages: s.messages.map((m) =>
        m.id === id ? { ...m, pinned: !m.pinned } : { ...m, pinned: false }
      ),
    })),

  shareFile: (file) =>
    set((s) => {
      const full: SharedFile = {
        ...file,
        id: `f-${Date.now()}`,
        sharedBy: s.selfName,
        sharedAt: now(),
      }
      return {
        files: [...s.files, full],
        messages: [
          ...s.messages,
          {
            id: `m-${Date.now()}`,
            senderId: s.selfId,
            senderName: s.selfName,
            senderRole: s.role,
            body: "",
            sentAt: now(),
            scope: s.chatScope,
            file: full,
          },
        ],
      }
    }),

  createPoll: (poll) =>
    set((s) => ({
      polls: [
        {
          ...poll,
          id: `poll-${Date.now()}`,
          createdAt: now(),
          createdBy: s.selfName,
          totalResponses: 0,
        },
        ...s.polls,
      ],
    })),

  votePoll: (pollId, optionIds) =>
    set((s) => ({
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
    })),

  setPollStatus: (pollId, status) =>
    set((s) => ({
      polls: s.polls.map((p) => (p.id === pollId ? { ...p, status } : p)),
    })),

  updateBreakouts: (patch) =>
    set((s) => ({ breakouts: { ...s.breakouts, ...patch } })),

  addBreakoutRoom: () =>
    set((s) => ({
      breakouts: {
        ...s.breakouts,
        rooms: [
          ...s.breakouts.rooms,
          {
            id: `br-${Date.now()}`,
            name: `Group ${s.breakouts.rooms.length + 1}`,
            memberIds: [],
            status: "draft",
          },
        ],
      },
    })),

  renameBreakoutRoom: (id, name) =>
    set((s) => ({
      breakouts: {
        ...s.breakouts,
        rooms: s.breakouts.rooms.map((r) => (r.id === id ? { ...r, name } : r)),
      },
    })),

  removeBreakoutRoom: (id) =>
    set((s) => ({
      breakouts: {
        ...s.breakouts,
        rooms: s.breakouts.rooms.filter((r) => r.id !== id),
      },
    })),

  assignToBreakout: (participantId, roomId) =>
    set((s) => ({
      breakouts: {
        ...s.breakouts,
        rooms: s.breakouts.rooms.map((r) => ({
          ...r,
          memberIds:
            r.id === roomId
              ? [...new Set([...r.memberIds, participantId])]
              : r.memberIds.filter((m) => m !== participantId),
        })),
      },
    })),

  autoAssignBreakouts: (roomCount) =>
    set((s) => {
      const students = s.participants.filter((p) => p.role === "participant")
      const rooms = Array.from({ length: roomCount }, (_, i) => ({
        id: `br-auto-${i}`,
        name: `Group ${i + 1}`,
        memberIds: [] as string[],
        status: "draft" as const,
      }))
      students.forEach((p, i) => rooms[i % roomCount].memberIds.push(p.id))
      return { breakouts: { ...s.breakouts, rooms } }
    }),

  startBreakouts: () =>
    set((s) => ({
      breakouts: {
        ...s.breakouts,
        startedAt: Date.now(),
        rooms: s.breakouts.rooms.map((r) => ({
          ...r,
          status: "open" as const,
        })),
      },
    })),

  closeBreakouts: () =>
    set((s) => ({
      breakouts: {
        ...s.breakouts,
        startedAt: null,
        rooms: s.breakouts.rooms.map((r) => ({
          ...r,
          status: "closed" as const,
        })),
      },
    })),

  addStroke: (stroke) =>
    set((s) =>
      s.whiteboardStrokes.some((x) => x.id === stroke.id)
        ? s
        : { whiteboardStrokes: [...s.whiteboardStrokes, stroke] }
    ),

  removeStroke: (strokeId) =>
    set((s) => ({
      whiteboardStrokes: s.whiteboardStrokes.filter((x) => x.id !== strokeId),
    })),

  clearBoard: () => set({ whiteboardStrokes: [] }),

  replaceStrokes: (whiteboardStrokes) => set({ whiteboardStrokes }),

  updateSettings: (patch) =>
    set((s) => ({ settings: { ...s.settings, ...patch } })),

  setMediaProfile: (mediaProfile) =>
    set((s) => ({
      settings: {
        ...s.settings,
        mediaProfile,
        dataSaver: mediaProfile !== "hd",
      },
      camOn: mediaProfile === "audio" ? false : s.camOn,
    })),

  // Live-class recording is disabled. Retain no-op actions temporarily to
  // preserve the store's public shape for older cached chunks during rollout.
  startRecording: () => {},
  pauseRecording: () => {},
  stopRecording: () => {},
  acknowledgeConsent: () => {},
  updateRecording: () => {},

  toggleCaptions: () =>
    set((s) => ({
      settings: { ...s.settings, captionsOn: !s.settings.captionsOn },
    })),

  pushCaption: (cue) =>
    set((s) => ({ captions: [...s.captions.slice(-6), cue] })),

  toggleActionItem: (id) =>
    set((s) => ({
      summary: {
        ...s.summary,
        actionItems: s.summary.actionItems.map((a) =>
          a.id === id ? { ...a, done: !a.done } : a
        ),
      },
    })),

  reset: () =>
    set({
      admission: "prejoin",
      micOn: false,
      camOn: true,
      screenSharing: false,
      handRaised: false,
      layout: "speaker",
      panel: null,
      pinnedParticipantId: null,
      settingsOpen: false,
      leaveConfirmOpen: false,
      participants: [],
      waiting: [],
      messages: [],
      files: [],
      polls: [],
      captions: [],
      breakouts: emptyBreakouts(),
      summary: emptySummary(),
      settings: DEFAULT_SETTINGS,
      policy: DEFAULT_POLICY,
      recording: DEFAULT_RECORDING,
      floatingReactions: [],
    }),
}))

/**
 * Ordered queue of raised hands.
 *
 * NOT a store selector. `filter().sort()` builds a new array every call, and
 * zustand v5 compares snapshots by reference — passing this to useLiveRoomStore
 * would re-render forever. Select `participants` (stable) and memoise this:
 *
 *   const participants = useLiveRoomStore((s) => s.participants)
 *   const raised = useMemo(() => getRaisedHands(participants), [participants])
 */
export const getRaisedHands = (participants: LiveParticipant[]) =>
  participants
    .filter((p) => p.handRaisedAt)
    .sort((a, b) => (a.handRaisedAt ?? 0) - (b.handRaisedAt ?? 0))

export const selectIsHost = (s: LiveRoomState) =>
  s.role === "host" || s.role === "cohost"

export const getRoomStore = () => useLiveRoomStore.getState()
