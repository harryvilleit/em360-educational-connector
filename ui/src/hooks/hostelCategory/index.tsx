import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { queryKeys } from "@/utils/queryKeys"
import {
  createHostelCategoriesApi,
  updateHostelCategoryApi,
  deleteHostelCategoryApi,
  getAllHostelCategoriesApi,
} from "@/api/hostel.api"
import type {
  HostelCategoryItemI,
  CreateHostelCategoriesPayloadI,
  CreateHostelCategoriesResponseI,
  UpdateHostelCategoryPayloadI,
  UpdateHostelCategoryResponseI,
  DeleteHostelCategoryResponseI,
} from "@/api/hostel.api/types"

export const useGetAllHostelCategories = (schoolId?: string) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery({
      queryKey: [queryKeys.hostelCategories, schoolId],
      queryFn: () =>
        getAllHostelCategoriesApi({ schoolId, pageSize: 200 }),
      enabled: !!schoolId,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })

  return {
    categories: data?.value?.items ?? [],
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

interface UseCreateHostelCategoriesOptions {
  onSuccess?: (categories: HostelCategoryItemI[]) => void
  onError?: (error: Error) => void
}

export const useCreateHostelCategories = ({
  onSuccess,
  onError,
}: UseCreateHostelCategoriesOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<
      CreateHostelCategoriesResponseI,
      Error,
      CreateHostelCategoriesPayloadI
    >({
      mutationFn: createHostelCategoriesApi,
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: [queryKeys.hostelCategories] })
        toast.success(
          data.value.length > 1
            ? `${data.value.length} hostel categories created successfully`
            : "Hostel category created successfully"
        )
        onSuccess?.(data.value)
      },
      onError: (err) => {
        toast.error(err?.message ?? "Failed to create hostel category")
        onError?.(err)
      },
    })

  return {
    createCategories: mutate,
    createCategoriesAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

interface UseUpdateHostelCategoryOptions {
  onSuccess?: (data: UpdateHostelCategoryResponseI) => void
  onError?: (error: Error) => void
}

export const useUpdateHostelCategory = ({
  onSuccess,
  onError,
}: UseUpdateHostelCategoryOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<
      UpdateHostelCategoryResponseI,
      Error,
      UpdateHostelCategoryPayloadI
    >({
      mutationFn: updateHostelCategoryApi,
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: [queryKeys.hostelCategories] })
        toast.success("Hostel category updated successfully")
        onSuccess?.(data)
      },
      onError: (err) => {
        toast.error(err?.message ?? "Failed to update hostel category")
        onError?.(err)
      },
    })

  return {
    updateCategory: mutate,
    updateCategoryAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

interface UseDeleteHostelCategoryOptions {
  onSuccess?: (data: DeleteHostelCategoryResponseI) => void
  onError?: (error: Error) => void
}

export const useDeleteHostelCategory = ({
  onSuccess,
  onError,
}: UseDeleteHostelCategoryOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<DeleteHostelCategoryResponseI, Error, string>({
      mutationFn: deleteHostelCategoryApi,
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: [queryKeys.hostelCategories] })
        toast.success("Hostel category deleted successfully")
        onSuccess?.(data)
      },
      onError: (err) => {
        toast.error(err?.message ?? "Failed to delete hostel category")
        onError?.(err)
      },
    })

  return {
    deleteCategory: mutate,
    deleteCategoryAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}
