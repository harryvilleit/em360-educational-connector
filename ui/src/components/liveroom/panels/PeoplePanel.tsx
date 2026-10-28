import { useMemo, useState } from "react"
import {
  AlertTriangle,
  Check,
  Hand,
  MicOff,
  MoreVertical,
  Search,
  ShieldCheck,
  UserMinus,
  UserPlus,
  VideoOff,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  useLiveRoomStore,
  selectIsHost,
  getRaisedHands,
} from "@/store/liveroom.store"
import {
  ConnectionBars,
  PanelHeader,
  RoomAvatar,
  RoomSwitch,
} from "../primitives"

export default function PeoplePanel() {
  const isHost = useLiveRoomStore(selectIsHost)
  const participants = useLiveRoomStore((s) => s.participants)
  const waiting = useLiveRoomStore((s) => s.waiting)
  const raisedHands = useMemo(
    () => getRaisedHands(participants),
    [participants]
  )
  const policy = useLiveRoomStore((s) => s.policy)
  const {
    admit,
    admitAll,
    deny,
    muteParticipant,
    muteEveryone,
    lowerHand,
    lowerAllHands,
    removeParticipant,
    promoteToCohost,
    updatePolicy,
  } = useLiveRoomStore()

  const [query, setQuery] = useState("")
  const [menuFor, setMenuFor] = useState<string | null>(null)
  const [showControls, setShowControls] = useState(false)

  const filtered = participants.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="flex h-full flex-col">
      <PanelHeader
        title="People"
        count={participants.length + 1}
        action={
          isHost && (
            <button
              type="button"
              onClick={() => setShowControls((v) => !v)}
              className="rounded-md px-2 py-1 text-[11px] font-medium text-blue-300 hover:bg-white/8"
            >
              {showControls ? "Hide controls" : "Class controls"}
            </button>
          )
        }
      />

      <div className="min-h-0 flex-1 overflow-y-auto">
        {/* Host: class controls */}
        {isHost && showControls && (
          <div className="border-b border-white/10 bg-white/[0.03] px-4 py-2">
            <RoomSwitch
              label="Waiting room"
              hint="Students wait for you to admit them"
              checked={policy.waitingRoomEnabled}
              onChange={(v) => updatePolicy({ waitingRoomEnabled: v })}
            />
            <RoomSwitch
              label="Lock the class"
              hint="No one new can join, even from the register"
              checked={policy.lockRoom}
              onChange={(v) => updatePolicy({ lockRoom: v })}
            />
            <RoomSwitch
              label="Students can unmute"
              checked={policy.participantsCanUnmute}
              onChange={(v) => updatePolicy({ participantsCanUnmute: v })}
            />
            <RoomSwitch
              label="Students can share their screen"
              checked={policy.participantsCanShareScreen}
              onChange={(v) => updatePolicy({ participantsCanShareScreen: v })}
            />
            <RoomSwitch
              label="Students can draw on the board"
              checked={policy.participantsCanAnnotate}
              onChange={(v) => updatePolicy({ participantsCanAnnotate: v })}
            />
            <div className="mt-2 flex gap-2 pb-1">
              <button
                type="button"
                onClick={muteEveryone}
                className="flex-1 rounded-lg bg-white/8 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/15"
              >
                Mute everyone
              </button>
              <button
                type="button"
                onClick={lowerAllHands}
                className="flex-1 rounded-lg bg-white/8 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/15"
              >
                Lower all hands
              </button>
            </div>
          </div>
        )}

        {/* Waiting room */}
        {isHost && waiting.length > 0 && (
          <section className="border-b border-white/10 px-4 py-3">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-[11px] font-semibold tracking-wide text-amber-300 uppercase">
                Waiting to join · {waiting.length}
              </h3>
              <button
                type="button"
                onClick={admitAll}
                className="text-[11px] font-medium text-blue-300 hover:underline"
              >
                Admit all on register
              </button>
            </div>
            <ul className="space-y-1.5">
              {waiting.map((w) => (
                <li
                  key={w.id}
                  className="flex items-center gap-2.5 rounded-lg bg-white/5 p-2"
                >
                  <RoomAvatar initials={w.initials} seed={w.id} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-white">
                      {w.name}
                    </p>
                    <p className="flex items-center gap-1 text-[10px] text-white/40">
                      {w.onRegister ? (
                        <>
                          <ShieldCheck className="size-2.5 text-emerald-400" />
                          On the class register
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="size-2.5 text-amber-400" />
                          Not on the register — check before admitting
                        </>
                      )}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => deny(w.id)}
                    aria-label={`Deny ${w.name}`}
                    className="flex size-7 items-center justify-center rounded-lg bg-white/8 text-white/60 hover:bg-red-500/20 hover:text-red-300"
                  >
                    <X className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => admit(w.id)}
                    aria-label={`Admit ${w.name}`}
                    className="flex size-7 items-center justify-center rounded-lg bg-blue-600 text-white hover:bg-blue-500"
                  >
                    <Check className="size-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Raised hands queue — ordered, so the teacher takes them fairly */}
        {raisedHands.length > 0 && (
          <section className="border-b border-white/10 px-4 py-3">
            <h3 className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-amber-300 uppercase">
              <Hand className="size-3" />
              Hands up · {raisedHands.length}
            </h3>
            <ol className="space-y-1.5">
              {raisedHands.map((p, i) => (
                <li key={p.id} className="flex items-center gap-2.5">
                  <span className="w-4 text-center text-[11px] font-semibold text-white/40">
                    {i + 1}
                  </span>
                  <RoomAvatar initials={p.initials} seed={p.id} size="sm" />
                  <span className="min-w-0 flex-1 truncate text-xs text-white">
                    {p.name}
                  </span>
                  {isHost && (
                    <button
                      type="button"
                      onClick={() => lowerHand(p.id)}
                      className="rounded-md px-2 py-1 text-[11px] font-medium text-blue-300 hover:bg-white/8"
                    >
                      Call on
                    </button>
                  )}
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* Roster */}
        <section className="px-4 py-3">
          <div className="relative mb-2">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-white/35" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Find a student"
              className="w-full rounded-lg bg-white/6 py-1.5 pr-3 pl-8 text-xs text-white ring-1 ring-white/10 placeholder:text-white/35 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <ul className="space-y-0.5">
            {filtered.map((p) => (
              <li
                key={p.id}
                className="group relative flex items-center gap-2.5 rounded-lg px-1.5 py-1.5 hover:bg-white/5"
              >
                <RoomAvatar initials={p.initials} seed={p.id} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 truncate text-xs font-medium text-white">
                    {p.name}
                    {p.role !== "participant" && (
                      <span className="rounded bg-blue-500/20 px-1 py-px text-[9px] tracking-wide text-blue-300 uppercase">
                        {p.role === "host" ? "Teacher" : "Co-host"}
                      </span>
                    )}
                  </p>
                  <p className="text-[10px] text-white/35">
                    Joined {p.joinedAt}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-white/40">
                  {!p.micOn && <MicOff className="size-3.5" />}
                  {!p.camOn && <VideoOff className="size-3.5" />}
                  <ConnectionBars quality={p.connection} />
                </div>
                {isHost && p.role !== "host" && (
                  <button
                    type="button"
                    onClick={() => setMenuFor(menuFor === p.id ? null : p.id)}
                    aria-label={`Manage ${p.name}`}
                    className="flex size-6 items-center justify-center rounded-md text-white/40 opacity-0 transition group-hover:opacity-100 hover:bg-white/10 hover:text-white"
                  >
                    <MoreVertical className="size-3.5" />
                  </button>
                )}

                {menuFor === p.id && (
                  <div className="absolute top-full right-0 z-20 mt-1 w-44 overflow-hidden rounded-lg bg-[#1A2130] py-1 shadow-xl ring-1 ring-white/10">
                    {[
                      {
                        label: "Mute",
                        icon: <MicOff />,
                        onClick: () => muteParticipant(p.id),
                      },
                      {
                        label:
                          p.role === "cohost"
                            ? "Remove co-host"
                            : "Make co-host",
                        icon: <UserPlus />,
                        onClick: () => promoteToCohost(p.id),
                      },
                      {
                        label: "Remove from class",
                        icon: <UserMinus />,
                        onClick: () => removeParticipant(p.id),
                        danger: true,
                      },
                    ].map((item) => (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => {
                          item.onClick()
                          setMenuFor(null)
                        }}
                        className={cn(
                          "flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs hover:bg-white/8 [&_svg]:size-3.5",
                          item.danger ? "text-red-300" : "text-white/80"
                        )}
                      >
                        {item.icon}
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}
