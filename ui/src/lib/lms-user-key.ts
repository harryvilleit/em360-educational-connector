import { useAuthStore } from "@/store/auth.store"
import { useGetUserProfile } from "@/hooks/auth"

export function resolveLmsUserKey(
  authUser: { id?: string; email?: string } | null,
  profileEmail?: string
): string {
  const key = profileEmail ?? authUser?.email ?? authUser?.id

  return key?.trim() || `anon-${authUser?.id ?? "session"}`
}

export function useLmsUserKey(): string {
  const authUser = useAuthStore((s) => s.user)
  const { userData } = useGetUserProfile()
  const profile = userData?.Value
  const profileEmail = profile?.Email
  const profileId = profile?.UserId

  return resolveLmsUserKey(
    authUser ?? (profileId ? { id: profileId, email: profileEmail } : null),
    profileEmail
  )
}
