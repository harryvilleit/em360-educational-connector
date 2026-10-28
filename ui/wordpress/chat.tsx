import { ChatShell } from "@/pages/Dashboard/Chat/components/ChatShell"
export default function Chat() {
  return (
    <div className="flex h-[calc(100vh-40px)] min-h-[560px] flex-col overflow-hidden rounded-2xl border bg-white">
      <ChatShell />
    </div>
  )
}
