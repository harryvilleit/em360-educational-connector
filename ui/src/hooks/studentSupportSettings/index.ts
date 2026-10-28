import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  getStudentSupportSettingsApi,
  updateStudentSupportSettingsApi,
} from "@/api/studentSupportSettings.api"
import type { UpdateSchoolStudentSupportSettingsPayloadI } from "@/api/studentSupportSettings.api"
import { queryKeys } from "@/utils/queryKeys"

export function useStudentSupportSettings(schoolId: string) {
  const query = useQuery({
    queryKey: [queryKeys.studentSupportSettings, schoolId],
    queryFn: () => getStudentSupportSettingsApi(schoolId),
    enabled: !!schoolId,
    staleTime: 60_000,
  })
  return { ...query, settings: query.data?.value }
}

export function useUpdateStudentSupportSettings() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateSchoolStudentSupportSettingsPayloadI) =>
      updateStudentSupportSettingsApi(payload),
    onSuccess: () => {
      client.invalidateQueries({
        queryKey: [queryKeys.studentSupportSettings],
      })
      client.invalidateQueries({ queryKey: [queryKeys.learnerSupportDashboard] })
      client.invalidateQueries({ queryKey: [queryKeys.safeguardingDashboard] })
      toast.success("Local student-support settings saved")
    },
    onError: (error: Error) =>
      toast.error(error.message || "The settings could not be saved"),
  })
}
