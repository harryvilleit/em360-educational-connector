import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { queryKeys } from "@/utils/queryKeys"
import {
  createConsentRequestApi,
  getConsentRequestsApi,
  getConsentResponsesApi,
} from "@/api/consent.api"
import type {
  CreateConsentRequestPayloadI,
  CreateConsentRequestResponseI,
  GetConsentRequestsParamsI,
  GetConsentRequestsResponseI,
  GetConsentResponsesParamsI,
  GetConsentResponsesResponseI,
} from "@/api/consent.api/types"

interface UseCreateConsentRequestOptions {
  onSuccess?: (data: CreateConsentRequestResponseI) => void
  onError?: (error: Error) => void
}

export const useCreateConsentRequest = ({
  onSuccess,
  onError,
}: UseCreateConsentRequestOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<
      CreateConsentRequestResponseI,
      Error,
      CreateConsentRequestPayloadI
    >({
      mutationFn: createConsentRequestApi,
      onSuccess: (data) => {
        queryClient.invalidateQueries({
          queryKey: [queryKeys.consentRequests],
        })
        queryClient.invalidateQueries({ queryKey: ["parent-overview"] })
        toast.success("Consent request sent")
        onSuccess?.(data)
      },
      onError: (err) => {
        toast.error(err?.message ?? "Failed to send consent request")
        onError?.(err)
      },
    })

  return {
    createConsentRequest: mutate,
    createConsentRequestAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

export const useGetConsentRequests = (
  params: GetConsentRequestsParamsI,
  enabled = true
) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetConsentRequestsResponseI>({
      queryKey: [queryKeys.consentRequests, params],
      queryFn: () => getConsentRequestsApi(params),
      enabled: enabled && !!params.schoolId,
      staleTime: 2 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })

  return {
    requests: data?.value?.items ?? [],
    summary: data?.value?.summary,
    pageNumber: data?.value?.pageNumber ?? 1,
    pageSize: data?.value?.pageSize ?? 20,
    totalItems: data?.value?.totalItems ?? 0,
    totalPages: data?.value?.totalPages ?? 0,
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

export const useGetConsentResponses = (params: GetConsentResponsesParamsI) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetConsentResponsesResponseI>({
      queryKey: [queryKeys.consentResponses, params],
      queryFn: () => getConsentResponsesApi(params),
      enabled: !!params.consentRequestId,
      staleTime: 2 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })

  return {
    responses: data?.value?.items ?? [],
    pageNumber: data?.value?.pageNumber ?? 1,
    pageSize: data?.value?.pageSize ?? 20,
    totalItems: data?.value?.totalItems ?? 0,
    totalPages: data?.value?.totalPages ?? 0,
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}
