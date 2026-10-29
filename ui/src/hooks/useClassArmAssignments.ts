import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  getClassArmAssignments,
  updateClassArms,
} from "@/api/classArmAssignments.api"
import { queryKeys } from "@/utils/queryKeys"
import { useAuthStore } from "@/store/auth.store"

export function useClassArmAssignments(schoolId: string, classId: string) {
  const userId = useAuthStore((state) => state.user?.id)
  return useQuery({
    queryKey: ["class-arm-assignments", userId, schoolId, classId],
    queryFn: ({ signal }) =>
      getClassArmAssignments({ schoolId, classId }, signal),
    enabled: Boolean(schoolId && classId),
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })
}

export function useUpdateClassArms() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateClassArms,
    onSuccess: async (result) => {
      toast.success(result.message || "Class arms updated successfully")
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: [queryKeys.schoolClasses] }),
        queryClient.invalidateQueries({
          queryKey: ["class-arm-assignments"],
          refetchType: "none",
        }),
      ])
    },
  })
}
