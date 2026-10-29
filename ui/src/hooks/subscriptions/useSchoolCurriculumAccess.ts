import { useSchoolSubscription } from "./index"

// Curriculum authoring is part of the school LMS entitlement, not Essential.
export function useSchoolCurriculumAccess(schoolId: string) {
  const subscription = useSchoolSubscription(schoolId)
  const current = subscription.overview?.currentSubscription
  const code = current?.plan.code.toUpperCase()
  const periodIsCurrent =
    !current?.currentPeriodEndUtc ||
    new Date(current.currentPeriodEndUtc).getTime() > Date.now()

  return {
    canManageCurriculum:
      current?.status === "Active" &&
      periodIsCurrent &&
      (code === "COMPLETE" ||
        (code === "PROFESSIONAL" &&
          current.plan.features.some((feature) => feature.code.toUpperCase() === "LMS"))),
    isLoading: subscription.isLoading,
    isError: subscription.isError,
  }
}
