import type { LaunchMenu, LaunchModule } from "@/api/products.api/types"
import { permissionLabels } from "@/data"
import { toProductPath } from "@/utils/path"

export type PermissionAction = "View" | "Create" | "Update" | "Delete"

function normalizePermissionName(p: {
  Permission: string | number
  PermissionName?: string
}): string {
  if (p.PermissionName) return p.PermissionName.toLowerCase().trim()
  if (typeof p.Permission === "number") {
    const label = permissionLabels[p.Permission as 1 | 2 | 3 | 4]
    if (label) return label.toLowerCase()
  }
  return String(p.Permission).toLowerCase().trim()
}

export function menuPermissionNames(
  menu: LaunchMenu | null | undefined
): Set<string> {
  return new Set((menu?.Permissions ?? []).map(normalizePermissionName))
}

export function toCanonicalMenuPath(url: string, productId: string): string {
  const trimmed = url.trim().replace(/\/+$/, "")
  const resolved =
    productId && trimmed.startsWith(`/dashboard/${productId}`)
      ? trimmed
      : toProductPath(trimmed, productId)
  return resolved.toLowerCase()
}

export function hasModuleAccess(
  modules: LaunchModule[],
  moduleName: string
): boolean {
  const target = moduleName.toLowerCase().trim()
  return modules.some((m) => m.ModuleName?.toLowerCase().trim() === target)
}

export function findMenuByUrl(
  modules: LaunchModule[],
  menuUrl: string,
  productId: string
): LaunchMenu | null {
  const target = toCanonicalMenuPath(menuUrl, productId)
  for (const mod of modules) {
    for (const menu of mod.Menus ?? []) {
      if (!menu.MenuUrl) continue
      if (toCanonicalMenuPath(menu.MenuUrl, productId) === target) return menu
    }
  }
  return null
}

export function findMenuForPathname(
  modules: LaunchModule[],
  pathname: string,
  productId: string
): LaunchMenu | null {
  let best: LaunchMenu | null = null
  let bestLen = -1
  const target = pathname.toLowerCase().replace(/\/+$/, "")

  for (const mod of modules) {
    for (const menu of mod.Menus ?? []) {
      if (!menu.MenuUrl) continue
      const resolved = toCanonicalMenuPath(menu.MenuUrl, productId)
      const matches = target === resolved || target.startsWith(resolved + "/")
      if (matches && resolved.length > bestLen) {
        best = menu
        bestLen = resolved.length
      }
    }
  }
  return best
}

/**
 * Same longest-prefix match as findMenuForPathname, but returns the owning
 * module rather than the menu — used to resolve which single module the
 * sidebar should treat as "active" for the current URL.
 */
export function findModuleForPathname(
  modules: LaunchModule[],
  pathname: string,
  productId: string
): LaunchModule | null {
  let best: LaunchModule | null = null
  let bestLen = -1
  const target = pathname.toLowerCase().replace(/\/+$/, "")

  for (const mod of modules) {
    for (const menu of mod.Menus ?? []) {
      if (!menu.MenuUrl) continue
      const resolved = toCanonicalMenuPath(menu.MenuUrl, productId)
      const matches = target === resolved || target.startsWith(resolved + "/")
      if (matches && resolved.length > bestLen) {
        best = mod
        bestLen = resolved.length
      }
    }
  }
  return best
}

export function hasMenuAccess(
  modules: LaunchModule[],
  menuUrl: string,
  productId: string
): boolean {
  return !!findMenuByUrl(modules, menuUrl, productId)
}

/**
 * Prefix-based access check — mirrors the actual page-level route guard in
 * Dashboard.layout.tsx (which matches via findMenuForPathname), not the
 * exact-match findMenuByUrl that hasMenuAccess/<Can> use. Many shortcut
 * cards link to a sub-action of a listed menu (e.g. "/hostel/rooms/create"
 * under the "Rooms" menu) that has no menu entry of its own — exact
 * matching would hide those even when the user genuinely has access, so
 * this uses the same longest-prefix match the real guard checks against.
 */
export function canAccessRoute(
  modules: LaunchModule[],
  pathname: string,
  productId: string
): boolean {
  const menu = findMenuForPathname(modules, pathname, productId)
  if (!menu) return false
  return menuPermissionNames(menu).has("view")
}

export function hasPermission(
  modules: LaunchModule[],
  menuUrl: string,
  action: PermissionAction,
  productId: string,
  isOwner = false
): boolean {
  if (isOwner) return true
  const menu = findMenuByUrl(modules, menuUrl, productId)
  return menuPermissionNames(menu).has(action.toLowerCase())
}

export const canView = (
  modules: LaunchModule[],
  menuUrl: string,
  productId: string,
  isOwner = false
) => hasPermission(modules, menuUrl, "View", productId, isOwner)

export const canCreate = (
  modules: LaunchModule[],
  menuUrl: string,
  productId: string,
  isOwner = false
) => hasPermission(modules, menuUrl, "Create", productId, isOwner)

export const canUpdate = (
  modules: LaunchModule[],
  menuUrl: string,
  productId: string,
  isOwner = false
) => hasPermission(modules, menuUrl, "Update", productId, isOwner)

export const canDelete = (
  modules: LaunchModule[],
  menuUrl: string,
  productId: string,
  isOwner = false
) => hasPermission(modules, menuUrl, "Delete", productId, isOwner)
