import { useMemo } from "react"
import { useGetGuardianById, useGetGuardianDetails } from "@/hooks/guardian"

import {
  mapGuardianDetailsChildToLinkedChild,
  mapGuardianToParent,
  mapLaunchPortalToParent,
} from "@/utils/guardianAdapter"
import type { LaunchSchoolPortalDataI } from "@/api/guardian.api/types"
import type { Parent } from "@/types/parent"

export function useResolvedParent(
  parentId: string | undefined,
  portal?: LaunchSchoolPortalDataI
): {
  parent: Parent | undefined
  isLoading: boolean
  isError: boolean
  error: Error | null
  refetch: () => void
} {
  const isPortalDriven = !!portal && portal.guardianId === parentId
  const realId = isPortalDriven ? "" : (parentId ?? "")
  const basic = useGetGuardianById({ id: realId })
  const { guardian, isLoading } = basic
  const details = useGetGuardianDetails({ guardianId: realId })
  const { guardian: guardianDetails, isLoading: isDetailsLoading } = details

  const parent = useMemo<Parent | undefined>(() => {
    if (isPortalDriven) return mapLaunchPortalToParent(portal!)
    if (!guardian) return undefined
    return {
      ...mapGuardianToParent(guardian),
      children:
        guardianDetails?.children.map(mapGuardianDetailsChildToLinkedChild) ??
        [],
    }
  }, [isPortalDriven, portal, guardian, guardianDetails])

  return {
    parent,
    isError: !!realId && (basic.isError || details.isError),
    error: basic.error ?? details.error,
    refetch: () => {
      void basic.refetch()
      void details.refetch()
    },
    isLoading: !!realId && (isLoading || isDetailsLoading),
  }
}
