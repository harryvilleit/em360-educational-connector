import type { ReactNode } from "react"
import { usePermissions } from "@/hooks/usePermissions"
import type { PermissionAction } from "@/lib/permissions"

interface CanProps {
  menuUrl: string
  action?: PermissionAction
  fallback?: ReactNode
  children: ReactNode
}

export function Can({ menuUrl, action = "View", fallback = null, children }: CanProps) {
  const { canView, canCreate, canUpdate, canDelete } = usePermissions()

  const checkers: Record<PermissionAction, (menuUrl: string) => boolean> = {
    View: canView,
    Create: canCreate,
    Update: canUpdate,
    Delete: canDelete,
  }

  return checkers[action](menuUrl) ? <>{children}</> : <>{fallback}</>
}
