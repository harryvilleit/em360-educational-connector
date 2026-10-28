import { useMemo } from "react"
import { useParams } from "react-router"
import { EMPTY_LAUNCH_MODULES, useAuthStore } from "@/store/auth.store"
import {
  canAccessRoute as canAccessRouteUtil,
  canCreate as canCreateUtil,
  canDelete as canDeleteUtil,
  canUpdate as canUpdateUtil,
  canView as canViewUtil,
  hasMenuAccess as hasMenuAccessUtil,
  hasModuleAccess as hasModuleAccessUtil,
} from "@/lib/permissions"

export function usePermissions() {
  const { productId } = useParams<{ productId: string }>()
  const resolvedProductId = productId ?? ""

  const modules = useAuthStore(
    (s) => s.permissionModulesByProduct[resolvedProductId] ?? EMPTY_LAUNCH_MODULES
  )
  const userRole = useAuthStore(
    (s) => s.userRoleByProduct[resolvedProductId] ?? ""
  )
  const isOwner = userRole === "Owner"

  return useMemo(
    () => ({
      modules,
      userRole,
      isOwner,
      hasModuleAccess: (moduleName: string) =>
        isOwner || hasModuleAccessUtil(modules, moduleName),
      hasMenuAccess: (menuUrl: string) =>
        isOwner || hasMenuAccessUtil(modules, menuUrl, resolvedProductId),
      // Prefix-matched — use this (not hasMenuAccess) to decide whether to
      // show a shortcut/quick-action card, since many link to a sub-action
      // of a listed menu rather than a menu URL itself.
      hasRouteAccess: (path: string) =>
        isOwner || canAccessRouteUtil(modules, path, resolvedProductId),
      canView: (menuUrl: string) =>
        canViewUtil(modules, menuUrl, resolvedProductId, isOwner),
      canCreate: (menuUrl: string) =>
        canCreateUtil(modules, menuUrl, resolvedProductId, isOwner),
      canUpdate: (menuUrl: string) =>
        canUpdateUtil(modules, menuUrl, resolvedProductId, isOwner),
      canDelete: (menuUrl: string) =>
        canDeleteUtil(modules, menuUrl, resolvedProductId, isOwner),
    }),
    [modules, userRole, isOwner, resolvedProductId]
  )
}
