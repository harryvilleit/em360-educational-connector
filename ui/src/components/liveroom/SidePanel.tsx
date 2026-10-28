import { AnimatePresence, motion } from "framer-motion"
import { X } from "lucide-react"
import { useLiveRoomStore } from "@/store/liveroom.store"
import PeoplePanel from "./panels/PeoplePanel"
import PollsPanel from "./panels/PollsPanel"
import BreakoutPanel from "./panels/BreakoutPanel"
import { CaptionsPanel, SummaryPanel } from "./panels/SummaryPanel"

export default function SidePanel() {
  const panel = useLiveRoomStore((s) => s.panel)
  const setPanel = useLiveRoomStore((s) => s.setPanel)

  return (
    <AnimatePresence initial={false}>
      {panel && (
        <motion.aside
          key="side-panel"
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 340, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative shrink-0 overflow-hidden border-l border-white/10 bg-[#0E131C]"
        >
          <div className="flex h-full w-[340px] flex-col">
            <button
              type="button"
              onClick={() => setPanel(panel)}
              aria-label="Close panel"
              className="absolute top-3 right-3 z-10 flex size-6 items-center justify-center rounded-lg text-white/40 transition hover:bg-white/10 hover:text-white"
            >
              <X className="size-3.5" />
            </button>

            {panel === "people" && <PeoplePanel />}
            {panel === "polls" && <PollsPanel />}
            {panel === "breakouts" && <BreakoutPanel />}
            {panel === "captions" && <CaptionsPanel />}
            {panel === "summary" && <SummaryPanel />}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
