import ParentHealthInbox from "@/pages/Dashboard/Health/workspace/ParentHealthInbox"
import { useSchoolId } from "@/contexts/SchoolContext"
import type { ReactNode } from "react"
import { useGuardianPortal } from "@/contexts/GuardianPortalContext"
import { DemoDataBanner } from "@/components/general/DemoDataBanner"
import type { LaunchSchoolPortalDataI } from "@/api/guardian.api/types"
import ParentFeesPage from "@/pages/Dashboard/Parent/ParentFees"
import ParentTimetablePage from "@/pages/Dashboard/Parent/ParentTimetable"
import ParentCalendarPage from "@/pages/Dashboard/Parent/ParentCalendar"
import ParentResultsPage from "@/pages/Dashboard/Parent/ParentResults"
import ParentAttendancePage from "@/pages/Dashboard/Parent/ParentAttendance"
import ParentElectivesPage from "@/pages/Dashboard/Parent/ParentElectives"
import ParentVisitationPage from "@/pages/Dashboard/Parent/ParentVisitation"
import ParentConsentPage from "@/pages/Dashboard/Parent/ParentConsent"
import ParentTranscriptRequestPage from "@/pages/Dashboard/Parent/ParentTranscriptRequest"
import ParentNotificationsPage from "@/pages/Dashboard/Parent/ParentNotifications"

function GuardianGate({
  children,
}: {
  children: (
    guardianId: string,
    isLinked: boolean,
    portal: LaunchSchoolPortalDataI | undefined
  ) => ReactNode
}) {
  const { guardianId, isLinked, isLoading, portal } = useGuardianPortal()

  if (isLoading) {
    return (
      <div className="p-6 text-center text-sm text-gray-400">Loading...</div>
    )
  }

  return (
    <>
      {!isLinked && (
        <DemoDataBanner message="Showing demo data — your account isn't linked to a guardian record at this school yet." />
      )}
      {children(guardianId, isLinked, portal)}
    </>
  )
}

export function ParentPortalFeesPage() {
  return (
    <GuardianGate>
      {(guardianId, _isLinked, portal) => (
        <ParentFeesPage parentIdOverride={guardianId} portalOverride={portal} />
      )}
    </GuardianGate>
  )
}

export function ParentPortalTimetablePage() {
  return (
    <GuardianGate>
      {(guardianId, _isLinked, portal) => (
        <ParentTimetablePage
          parentIdOverride={guardianId}
          portalOverride={portal}
        />
      )}
    </GuardianGate>
  )
}

export function ParentPortalCalendarPage() {
  return (
    <GuardianGate>
      {(guardianId, _isLinked, portal) => (
        <ParentCalendarPage
          parentIdOverride={guardianId}
          portalOverride={portal}
        />
      )}
    </GuardianGate>
  )
}

export function ParentPortalResultsPage() {
  return (
    <GuardianGate>
      {(guardianId, _isLinked, portal) => (
        <ParentResultsPage
          parentIdOverride={guardianId}
          portalOverride={portal}
        />
      )}
    </GuardianGate>
  )
}

export function ParentPortalAttendancePage() {
  return (
    <GuardianGate>
      {(guardianId, _isLinked, portal) => (
        <ParentAttendancePage
          parentIdOverride={guardianId}
          portalOverride={portal}
        />
      )}
    </GuardianGate>
  )
}

export function ParentPortalElectivesPage() {
  return (
    <GuardianGate>
      {(guardianId, _isLinked, portal) => (
        <ParentElectivesPage
          parentIdOverride={guardianId}
          portalOverride={portal}
        />
      )}
    </GuardianGate>
  )
}

export function ParentPortalVisitationPage() {
  return (
    <GuardianGate>
      {(guardianId, _isLinked, portal) => (
        <ParentVisitationPage
          parentIdOverride={guardianId}
          portalOverride={portal}
        />
      )}
    </GuardianGate>
  )
}

export function ParentPortalConsentPage() {
  return (
    <GuardianGate>
      {(guardianId, _isLinked, portal) => (
        <ParentConsentPage
          parentIdOverride={guardianId}
          portalOverride={portal}
        />
      )}
    </GuardianGate>
  )
}

export function ParentPortalTranscriptPage() {
  return (
    <GuardianGate>
      {(guardianId, _isLinked, portal) => (
        <ParentTranscriptRequestPage
          parentIdOverride={guardianId}
          portalOverride={portal}
        />
      )}
    </GuardianGate>
  )
}

export function ParentPortalNotificationsPage() {
  const schoolId = useSchoolId()
  return (
    <GuardianGate>
      {(guardianId, _isLinked, portal) => (
        <>
          <ParentHealthInbox schoolId={schoolId} />
          <ParentNotificationsPage
            parentIdOverride={guardianId}
            portalOverride={portal}
          />
        </>
      )}
    </GuardianGate>
  )
}
