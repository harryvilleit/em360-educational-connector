/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, type ReactNode } from "react"
import { useSchoolId } from "@/contexts/SchoolContext"
import { useCurrentGuardianId } from "@/hooks/useCurrentGuardianId"
import type { LaunchSchoolPortalDataI } from "@/api/guardian.api/types"

interface GuardianPortalContextValue {
  guardianId: string
  isLinked: boolean
  isLoading: boolean
  portal: LaunchSchoolPortalDataI | undefined
}

const GuardianPortalContext = createContext<GuardianPortalContextValue | null>(
  null
)

export function GuardianPortalProvider({ children }: { children: ReactNode }) {
  const schoolId = useSchoolId()
  const value = useCurrentGuardianId(schoolId)

  return (
    <GuardianPortalContext.Provider value={value}>
      {children}
    </GuardianPortalContext.Provider>
  )
}

export function useGuardianPortal(): GuardianPortalContextValue {
  const ctx = useContext(GuardianPortalContext)
  if (!ctx) {
    throw new Error(
      "useGuardianPortal must be used within GuardianPortalProvider"
    )
  }
  return ctx
}
