import { useMemo } from "react"
import { useParams } from "react-router"
import { useAuthStore } from "@/store/auth.store"
import type { ChatRole } from "@/types/chat"

/**
 * Maps the launch response's role string to a chat role, for DISPLAY ONLY.
 *
 * `productRole` is userRoleByProduct[productId], which Dashboard.layout populates from
 * `Value.UserRole` on GET /School/Dashboard/{schoolId}. That field is "Owner" for the
 * account that registered the school and the sub-user's job role name for everyone else —
 * the same discriminator usePermissions().isOwner keys off.
 *
 * Matched case-insensitively on purpose: the rest of the codebase is split between
 * `=== "Owner"` (Dashboard.layout, usePermissions, app-sidebar) and
 * `.toLowerCase() === "owner"` (Landing, MyRolesPage, hooks/products).
 *
 * ⚠️ This decides which helper text and badge to render. It does NOT decide who the user
 * can message — the server derives that from school ownership, staff membership, enrolment
 * and guardian links, and returns an already-filtered contact list. Changing this value in
 * devtools changes the wording on screen and nothing else.
 */
export function resolveChatRoleFromAuth(
  jobTitle: string | undefined,
  productRole: string | undefined
): ChatRole {
  const pr = (productRole ?? "").trim().toLowerCase()
  const title = (jobTitle ?? "").trim().toLowerCase()

  if (pr === "owner") {
    return "superadmin"
  }

  if (pr.includes("admin") || title.includes("admin")) {
    return "admin"
  }
  if (
    title.includes("teacher") ||
    title.includes("tutor") ||
    title.includes("instructor") ||
    pr.includes("teacher")
  ) {
    return "teacher"
  }
  if (title.includes("parent") || title.includes("guardian") || pr.includes("parent")) {
    return "parent"
  }
  if (title.includes("student") || pr.includes("student")) {
    return "student"
  }

  // Unrecognised role. "admin" is the safe display default: it is not the Super Admin and
  // not a parent, so no misleading copy is shown either way. Never default to "superadmin".
  return "admin"
}

/**
 * The signed-in user, as chat sees them.
 *
 * `actorId` is the real backend user id (`user.id`, populated from the profile endpoint's
 * `Value.UserId`) — the same id the API stamps on messages, so ownership comparisons in
 * ChatThread line up with what the server sent.
 */
export function useChatActor(roleOverride?: ChatRole) {
  const { productId } = useParams<{ productId: string }>()
  const user = useAuthStore((s) => s.user)
  const userRoleByProduct = useAuthStore((s) => s.userRoleByProduct)
  const hasHydrated = useAuthStore((s) => s._hasHydrated)

  const role = useMemo(() => {
    // The student and parent portals state their role outright, because the derivation below
    // cannot work there. It reads `userRoleByProduct[productId]`, and those routes are
    // `/student-home/:schoolId` and `/parent-home/:schoolId` — there is no `productId` param
    // to key on, so every student and parent would fall through to the "admin" default and be
    // shown staff copy about who they may message.
    //
    // The route is the honest discriminator here: a page rendered under the student portal
    // layout is only ever rendered for a student. And this value is display-only either way
    // (see the warning above), so the worst an override can do is change wording on screen.
    if (roleOverride) return roleOverride

    const productRole = productId ? userRoleByProduct[productId] : undefined
    return resolveChatRoleFromAuth(user?.jobTitle, productRole)
  }, [roleOverride, productId, user?.jobTitle, userRoleByProduct])

  return {
    role,
    actorId: user?.id ?? "",
    displayName: user?.name ?? "You",
    email: user?.email,
    // The persisted auth store rehydrates asynchronously; rendering the thread before then
    // would briefly compare messages against an empty actorId and align every bubble left.
    isResolving: !hasHydrated,
  }
}
