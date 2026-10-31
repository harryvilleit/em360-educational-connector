import { useState } from "react"
import { PageHeader } from "@/components/general/PageHeader"
import { ChatShell } from "@/pages/Dashboard/Chat/components/ChatShell"
import { BroadcastsPanel } from "./components/BroadcastsPanel"
import { TabButton } from "./components/TabButton"

type Tab = "broadcasts" | "chat"

export default function ParentMessagesPage() {
  const [activeTab, setActiveTab] = useState<Tab>("broadcasts")

  return (
    <div>
      <PageHeader
        title="Messages"
        description="School announcements and messages with staff & admin"
        className="mb-6"
      />

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1 dark:border-white/10 dark:bg-white/3">
        <TabButton
          active={activeTab === "broadcasts"}
          onClick={() => setActiveTab("broadcasts")}
          label="School Messages"
        />
        <TabButton
          active={activeTab === "chat"}
          onClick={() => setActiveTab("chat")}
          label="Staff & Admin"
        />
      </div>

      {activeTab === "broadcasts" ? (
        <BroadcastsPanel />
      ) : (
        <ChatShell roleOverride="parent" />
      )}
    </div>
  )
}
