import { useState } from "react"
import { BarChart3, Check, Plus, Trash2, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useLiveRoomStore, selectIsHost } from "@/store/liveroom.store"
import { PanelEmpty, PanelHeader, RoomSwitch, Segmented } from "../primitives"
import type { LivePoll, PollKind } from "@/types/liveroom"

function PollResult({ poll }: { poll: LivePoll }) {
  const max = Math.max(...poll.options.map((o) => o.votes), 1)
  return (
    <div className="space-y-1.5">
      {poll.options.map((o) => {
        const pct = poll.totalResponses
          ? Math.round((o.votes / poll.totalResponses) * 100)
          : 0
        const isMine = poll.myVote?.includes(o.id)
        return (
          <div key={o.id}>
            <div className="mb-0.5 flex items-baseline justify-between gap-2">
              <span className="flex min-w-0 items-center gap-1.5 truncate text-xs text-white/80">
                {isMine && <Check className="size-3 shrink-0 text-blue-400" />}
                {o.label}
              </span>
              <span className="shrink-0 text-[11px] font-medium text-white/50">
                {pct}% · {o.votes}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/8">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  o.votes === max ? "bg-blue-500" : "bg-white/25"
                )}
                style={{ width: `${(o.votes / max) * 100}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

function PollVote({ poll }: { poll: LivePoll }) {
  const votePoll = useLiveRoomStore((s) => s.votePoll)
  const [picked, setPicked] = useState<string[]>([])

  const toggle = (id: string) => {
    if (poll.kind === "multiple") {
      setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]))
    } else {
      setPicked([id])
    }
  }

  return (
    <div className="space-y-1.5">
      {poll.options.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => toggle(o.id)}
          className={cn(
            "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs transition ring-1",
            picked.includes(o.id)
              ? "bg-blue-600/20 text-white ring-blue-500"
              : "bg-white/5 text-white/80 ring-white/10 hover:bg-white/8"
          )}
        >
          <span
            className={cn(
              "flex size-4 shrink-0 items-center justify-center border transition",
              poll.kind === "multiple" ? "rounded" : "rounded-full",
              picked.includes(o.id)
                ? "border-blue-500 bg-blue-500 text-white"
                : "border-white/25"
            )}
          >
            {picked.includes(o.id) && <Check className="size-2.5" />}
          </span>
          {o.label}
        </button>
      ))}
      <button
        type="button"
        disabled={picked.length === 0}
        onClick={() => votePoll(poll.id, picked)}
        className="mt-1 w-full rounded-lg bg-blue-600 py-2 text-xs font-medium text-white transition hover:bg-blue-500 disabled:bg-white/8 disabled:text-white/35"
      >
        Submit answer
      </button>
    </div>
  )
}

export default function PollsPanel() {
  const isHost = useLiveRoomStore(selectIsHost)
  const polls = useLiveRoomStore((s) => s.polls)
  const createPoll = useLiveRoomStore((s) => s.createPoll)
  const setPollStatus = useLiveRoomStore((s) => s.setPollStatus)

  const [composing, setComposing] = useState(false)
  const [question, setQuestion] = useState("")
  const [kind, setKind] = useState<PollKind>("single")
  const [anonymous, setAnonymous] = useState(false)
  const [options, setOptions] = useState(["", ""])

  const submit = () => {
    const clean = options.map((o) => o.trim()).filter(Boolean)
    if (!question.trim() || clean.length < 2) return
    createPoll({
      question: question.trim(),
      kind,
      anonymous,
      status: "open",
      options: clean.map((label, i) => ({ id: `o-${Date.now()}-${i}`, label, votes: 0 })),
    })
    setComposing(false)
    setQuestion("")
    setOptions(["", ""])
  }

  const visible = isHost ? polls : polls.filter((p) => p.status !== "draft")

  return (
    <div className="flex h-full flex-col">
      <PanelHeader
        title="Polls"
        count={visible.length}
        action={
          isHost && (
            <button
              type="button"
              onClick={() => setComposing((v) => !v)}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-blue-300 hover:bg-white/8"
            >
              {composing ? <X className="size-3" /> : <Plus className="size-3" />}
              {composing ? "Cancel" : "New poll"}
            </button>
          )
        }
      />

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
        {composing && (
          <div className="space-y-2.5 rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
            <textarea
              rows={2}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask the class a question…"
              className="w-full resize-none rounded-lg bg-white/6 px-3 py-2 text-xs text-white ring-1 ring-white/10 placeholder:text-white/35 focus:ring-blue-500 focus:outline-none"
            />
            <Segmented
              value={kind}
              onChange={setKind}
              size="sm"
              options={[
                { value: "single", label: "One answer" },
                { value: "multiple", label: "Several" },
                { value: "wordCloud", label: "Word cloud" },
              ]}
            />
            {kind !== "wordCloud" && (
              <div className="space-y-1.5">
                {options.map((o, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <input
                      value={o}
                      onChange={(e) =>
                        setOptions((prev) =>
                          prev.map((p, idx) => (idx === i ? e.target.value : p))
                        )
                      }
                      placeholder={`Option ${i + 1}`}
                      className="flex-1 rounded-lg bg-white/6 px-3 py-1.5 text-xs text-white ring-1 ring-white/10 placeholder:text-white/35 focus:ring-blue-500 focus:outline-none"
                    />
                    {options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => setOptions((p) => p.filter((_, idx) => idx !== i))}
                        aria-label={`Remove option ${i + 1}`}
                        className="flex size-7 items-center justify-center rounded-lg text-white/40 hover:bg-white/10 hover:text-red-300"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setOptions((p) => [...p, ""])}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-300 hover:underline"
                >
                  <Plus className="size-3" />
                  Add option
                </button>
              </div>
            )}
            <RoomSwitch
              label="Hide who answered what"
              hint="Students answer more honestly when it's anonymous"
              checked={anonymous}
              onChange={setAnonymous}
            />
            <button
              type="button"
              onClick={submit}
              className="w-full rounded-lg bg-blue-600 py-2 text-xs font-medium text-white hover:bg-blue-500"
            >
              Launch poll
            </button>
          </div>
        )}

        {visible.length === 0 && !composing ? (
          <PanelEmpty
            icon={<BarChart3 />}
            title="No polls yet"
            body={
              isHost
                ? "Check understanding mid-lesson without stopping to call on anyone."
                : "Your teacher hasn't asked anything yet."
            }
          />
        ) : (
          visible.map((poll) => (
            <div key={poll.id} className="rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
              <div className="mb-2 flex items-start justify-between gap-2">
                <p className="text-xs leading-relaxed font-medium text-white">
                  {poll.question}
                </p>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium",
                    poll.status === "open"
                      ? "bg-emerald-500/15 text-emerald-300"
                      : "bg-white/10 text-white/50"
                  )}
                >
                  {poll.status === "open" ? "Open" : "Closed"}
                </span>
              </div>

              {poll.status === "open" && !isHost && !poll.myVote ? (
                <PollVote poll={poll} />
              ) : (
                <PollResult poll={poll} />
              )}

              <div className="mt-2.5 flex items-center justify-between border-t border-white/8 pt-2">
                <span className="text-[10px] text-white/35">
                  {poll.totalResponses} responses{poll.anonymous ? " · anonymous" : ""}
                </span>
                {isHost && (
                  <button
                    type="button"
                    onClick={() =>
                      setPollStatus(poll.id, poll.status === "open" ? "closed" : "open")
                    }
                    className="text-[11px] font-medium text-blue-300 hover:underline"
                  >
                    {poll.status === "open" ? "Close poll" : "Reopen"}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
