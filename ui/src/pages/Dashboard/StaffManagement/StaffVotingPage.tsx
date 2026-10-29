import { useAuthStore } from "@/store/auth.store"
import { useSchoolId } from "@/contexts/SchoolContext"
import StaffElections from "./StaffElections"

export default function StaffVotingPage() {
  const user = useAuthStore((state) => state.user)
  const schoolId = useSchoolId()

  if (!user)
    return (
      <p role="alert" className="p-6 text-sm">
        Sign in to vote in school elections.
      </p>
    )

  return (
    <div className="space-y-4 py-6">
      <StaffElections staffId={user.id} schoolId={schoolId} />
    </div>
  )
}
