import { useNavigate, useParams } from "react-router"
import { PageHeader } from "@/components/general/PageHeader"
import { ChatShell } from "@/pages/Dashboard/Chat/components/ChatShell"
import { HomeRoutes } from "@/routes"

export default function StudentChatPage() {
  const navigate = useNavigate()
  const { schoolId = "" } = useParams<{ schoolId: string }>()

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title="Chat"
        description="Message your teachers, classmates and the school office"
        className="mb-4"
      />

      <div className="-mx-6 -mb-6 flex h-[calc(100vh-14rem)] min-h-[520px] flex-col overflow-hidden border-t border-slate-200 bg-white">
        <ChatShell roleOverride="student" />
      </div>
    </div>
  )
}
