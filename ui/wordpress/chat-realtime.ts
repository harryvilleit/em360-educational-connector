import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/utils/queryKeys"
// The connector keeps authentication server-side. Refresh active chat queries over its scoped HTTP transport.
export function useChatRealtime(schoolId: string, enabled = true) {
  const queryClient = useQueryClient()
  useEffect(() => {
    if (!enabled || !schoolId) return
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void queryClient.invalidateQueries({
          queryKey: [queryKeys.chatMessages, schoolId],
          refetchType: "active",
        })
        void queryClient.invalidateQueries({
          queryKey: [queryKeys.chatConversations, schoolId],
          refetchType: "active",
        })
      }
    }, 10000)
    return () => window.clearInterval(timer)
  }, [schoolId, enabled, queryClient])
  return { connected: false, polling: true }
}

export function resolveChatHubUrl() {
  return ""
}
