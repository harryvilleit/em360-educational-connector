import { TabsContent } from "@/components/ui/tabs"
import {
  CalendarDays,
  Star,
  BookOpen,
  CheckCircle2,
} from "lucide-react"
import type { SchoolSessionItem, SchoolSessionTermItem } from "@/api/userMgt.api/types"
import { StatCard } from "@/components/general/StatCard"
import SessionsTable from "./SessionsTable"


interface SessionsTabProps {
  sessions: SchoolSessionItem[]
  isLoading: boolean
  currentSession: SchoolSessionItem | undefined
  currentTerm: SchoolSessionTermItem | undefined
  totalTerms: number
  onSetCurrentSession: (id: string) => void
  onCreateSession: () => void
  onEditSession: (session: SchoolSessionItem) => void
  onAddTerm: (session: SchoolSessionItem) => void
}

export default function SessionsTab({
  sessions,
  isLoading,
  currentSession,
  currentTerm,
  totalTerms,
  onSetCurrentSession,
  onCreateSession,
  onEditSession,
  onAddTerm,
}: SessionsTabProps) {
  const cards = [
    {
      label: "Total Sessions",
      value: isLoading ? "0" : String(sessions.length),
      icon: CalendarDays,
      color: "blue" as const,
    },
    {
      label: "Current Session",
      value: isLoading ? "0" : (currentSession?.SessionName ?? "—"),
      icon: Star,
      color: "amber" as const,
    },
    {
      label: "Total Terms",
      value: isLoading ? "0" : String(totalTerms),
      icon: BookOpen,
      color: "purple" as const,
    },
    {
      label: "Active Term",
      value: isLoading ? "0" : (currentTerm?.TermName ?? "—"),
      icon: CheckCircle2,
      color: "green" as const,
    },
  ]

  return (
    <TabsContent value="sessions" className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {cards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      <SessionsTable
        sessions={sessions}
        isLoading={isLoading}
        onSetCurrentSession={onSetCurrentSession}
        onCreateSession={onCreateSession}
        onEditSession={onEditSession}
        onAddTerm={onAddTerm}
      />
    </TabsContent>
  )
}
