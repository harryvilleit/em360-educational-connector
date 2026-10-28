import { useState } from "react"
import { Play, Plus, Shuffle, Split, Square, Trash2, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useLiveRoomStore, selectIsHost } from "@/store/liveroom.store"
import { PanelEmpty, PanelHeader, RoomAvatar, RoomSwitch } from "../primitives"

export default function BreakoutPanel() {
  const isHost = useLiveRoomStore(selectIsHost)
  const breakouts = useLiveRoomStore((s) => s.breakouts)
  const participants = useLiveRoomStore((s) => s.participants)
  const {
    addBreakoutRoom,
    renameBreakoutRoom,
    removeBreakoutRoom,
    assignToBreakout,
    autoAssignBreakouts,
    startBreakouts,
    closeBreakouts,
    updateBreakouts,
  } = useLiveRoomStore()

  const [roomCount, setRoomCount] = useState(3)

  const assignedIds = new Set(breakouts.rooms.flatMap((r) => r.memberIds))
  const unassigned = participants.filter(
    (p) => p.role === "participant" && !assignedIds.has(p.id)
  )
  const running = breakouts.startedAt !== null

  if (!isHost) {
    const myRoom = breakouts.rooms.find((r) => r.memberIds.includes("self"))
    return (
      <div className="flex h-full flex-col">
        <PanelHeader title="Groups" />
        {running && myRoom ? (
          <div className="p-4">
            <div className="rounded-xl bg-blue-600/15 p-4 text-center ring-1 ring-blue-500/30">
              <p className="text-xs text-white/60">You're in</p>
              <p className="mt-1 text-sm font-semibold text-white">{myRoom.name}</p>
              <p className="mt-2 text-xs text-white/50">
                {breakouts.durationMinutes} minutes · you'll return to the main class
                automatically
              </p>
              {breakouts.allowReturnToMain && (
                <button
                  type="button"
                  className="mt-3 w-full rounded-lg bg-white/10 py-2 text-xs font-medium text-white hover:bg-white/20"
                >
                  Ask to return to the main class
                </button>
              )}
            </div>
          </div>
        ) : (
          <PanelEmpty
            icon={<Split />}
            title="No group work right now"
            body="If your teacher splits the class into groups, you'll be moved automatically."
          />
        )}
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <PanelHeader
        title="Breakout rooms"
        count={breakouts.rooms.length}
        action={
          <button
            type="button"
            onClick={addBreakoutRoom}
            disabled={running}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-blue-300 hover:bg-white/8 disabled:opacity-40"
          >
            <Plus className="size-3" />
            Add room
          </button>
        }
      />

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {/* Setup */}
        {!running && (
          <div className="mb-3 space-y-2.5 rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
            <div className="flex items-center gap-2">
              <label className="flex-1 text-xs text-white/70">
                Split the class into
                <input
                  type="number"
                  min={2}
                  max={12}
                  value={roomCount}
                  onChange={(e) => setRoomCount(Number(e.target.value))}
                  className="mx-1.5 w-12 rounded bg-white/8 px-1.5 py-0.5 text-center text-xs text-white ring-1 ring-white/10 focus:ring-blue-500 focus:outline-none"
                />
                groups
              </label>
              <button
                type="button"
                onClick={() => autoAssignBreakouts(roomCount)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-white/20"
              >
                <Shuffle className="size-3.5" />
                Assign randomly
              </button>
            </div>
            <label className="flex items-center gap-2 text-xs text-white/70">
              Run for
              <input
                type="number"
                min={1}
                max={60}
                value={breakouts.durationMinutes}
                onChange={(e) => updateBreakouts({ durationMinutes: Number(e.target.value) })}
                className="w-12 rounded bg-white/8 px-1.5 py-0.5 text-center text-xs text-white ring-1 ring-white/10 focus:ring-blue-500 focus:outline-none"
              />
              minutes
            </label>
            <RoomSwitch
              label="Bring everyone back when time is up"
              checked={breakouts.autoCloseOnTimer}
              onChange={(v) => updateBreakouts({ autoCloseOnTimer: v })}
            />
            <RoomSwitch
              label="Students can return to the main class early"
              checked={breakouts.allowReturnToMain}
              onChange={(v) => updateBreakouts({ allowReturnToMain: v })}
            />
          </div>
        )}

        {breakouts.rooms.length === 0 ? (
          <PanelEmpty
            icon={<Split />}
            title="No groups set up"
            body="Split the class for discussion or paired practice, then bring everyone back."
          />
        ) : (
          <ul className="space-y-2">
            {breakouts.rooms.map((room) => (
              <li key={room.id} className="rounded-xl bg-white/5 p-2.5 ring-1 ring-white/10">
                <div className="mb-1.5 flex items-center gap-2">
                  <input
                    value={room.name}
                    disabled={running}
                    onChange={(e) => renameBreakoutRoom(room.id, e.target.value)}
                    className="min-w-0 flex-1 rounded bg-transparent px-1 py-0.5 text-xs font-medium text-white hover:bg-white/5 focus:bg-white/8 focus:outline-none disabled:hover:bg-transparent"
                  />
                  <span className="shrink-0 text-[10px] text-white/40">
                    {room.memberIds.length}
                  </span>
                  {!running && (
                    <button
                      type="button"
                      onClick={() => removeBreakoutRoom(room.id)}
                      aria-label={`Delete ${room.name}`}
                      className="flex size-6 shrink-0 items-center justify-center rounded text-white/35 hover:bg-white/10 hover:text-red-300"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-1">
                  {room.memberIds.map((id) => {
                    const p = participants.find((x) => x.id === id)
                    if (!p) return null
                    return (
                      <span
                        key={id}
                        className="inline-flex items-center gap-1 rounded-full bg-white/8 py-0.5 pr-1.5 pl-0.5 text-[10px] text-white/80"
                      >
                        <RoomAvatar initials={p.initials} seed={p.id} size="sm" className="size-5 text-[9px]" />
                        {p.name.split(" ")[0]}
                        {!running && (
                          <button
                            type="button"
                            onClick={() => assignToBreakout(id, null)}
                            aria-label={`Remove ${p.name} from ${room.name}`}
                            className="text-white/40 hover:text-white"
                          >
                            <X className="size-2.5" />
                          </button>
                        )}
                      </span>
                    )
                  })}
                  {room.memberIds.length === 0 && (
                    <span className="text-[10px] text-white/30">Empty</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}

        {unassigned.length > 0 && !running && (
          <div className="mt-3">
            <p className="mb-1.5 text-[11px] font-semibold tracking-wide text-white/45 uppercase">
              Not in a group · {unassigned.length}
            </p>
            <div className="flex flex-wrap gap-1">
              {unassigned.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => assignToBreakout(p.id, breakouts.rooms[0]?.id ?? null)}
                  className="inline-flex items-center gap-1 rounded-full bg-white/8 py-0.5 pr-2 pl-0.5 text-[10px] text-white/70 hover:bg-white/15 hover:text-white"
                >
                  <RoomAvatar initials={p.initials} seed={p.id} size="sm" className="size-5 text-[9px]" />
                  {p.name.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-white/10 p-3">
        <button
          type="button"
          onClick={running ? closeBreakouts : startBreakouts}
          disabled={breakouts.rooms.length === 0}
          className={cn(
            "inline-flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition disabled:opacity-40",
            running
              ? "bg-white/10 text-white hover:bg-white/20"
              : "bg-blue-600 text-white hover:bg-blue-500"
          )}
        >
          {running ? <Square className="size-4" /> : <Play className="size-4" />}
          {running ? "Bring everyone back" : "Open the groups"}
        </button>
      </div>
    </div>
  )
}
