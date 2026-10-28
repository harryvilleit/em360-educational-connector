import { useEffect, useMemo, useRef } from "react"
import {
  createSchoolApi,
  getAllProductsApi,
  getProductCatalogueApi,
  getProductModuleByIdApi,
  getSchoolPortalAccessApi,
  getTimeZonesApi,
  getUserAssginedDashboardApi,
  getUserAssignedModulesApi,
  getUserSubscribedProductApi,
  updateSchoolTimeZoneApi,
  updateSchoolProfileApi,
  deleteSchoolApi,
} from "@/api/products.api"
import type {
  GetUserProductsParams,
  ProductCatalogueItemI,
  ProductCatalogueResponseI,
  ProductSchoolI,
  TimeZoneOptionI,
  UserSubProductItem,
  UserSubProductsResponseI,
  UpdateSchoolProfilePayloadI,
} from "@/api/products.api/types"
import {
  SCHOOL_MANAGEMENT_PRODUCT_SLUG,
  toOwnedProductFallback,
  toProductCard,
} from "@/pages/Products/data/product"
import type { Product } from "@/pages/Products/data/product"
import { queryKeys } from "@/utils/queryKeys"
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { toast } from "sonner"
import { useAuthStore } from "@/store/auth.store"
import { useProductStore } from "@/store/product.store"

const PENDING_POLL_SCHEDULE = [
  { after: 0, interval: 15_000 },
  { after: 2 * 60 * 1000, interval: 30_000 },
  { after: 5 * 60 * 1000, interval: 60_000 },
] as const
const PENDING_POLL_MAX_DURATION = 10 * 60 * 1000

export const useGetUserSubProducts = (options?: { enabled?: boolean }) => {
  const canUseAuthenticatedApi = useAuthStore(
    (state) => !!state.token || state.hasRefreshSession
  )
  const enabled = (options?.enabled ?? true) && canUseAuthenticatedApi
  const pendingSinceRef = useRef<number | null>(null)

  const { data, isPending, isError, error, isLoading, isSuccess, refetch } =
    useQuery<UserSubProductsResponseI>({
      queryKey: [queryKeys.userProducts],
      queryFn: () => getUserSubscribedProductApi(),
      enabled,
      placeholderData: keepPreviousData,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,

      refetchInterval: (query) => {
        const value = query.state.data?.value
        if (!value) return false

        const schools: Array<{ status?: string }> = [
          ...(Array.isArray(value.products)
            ? value.products.flatMap((p) =>
                Array.isArray(p.schools) ? p.schools : []
              )
            : []),
          ...(Array.isArray(value.studentSchools) ? value.studentSchools : []),
          ...(Array.isArray(value.parentSchools) ? value.parentSchools : []),
        ]
        const hasPending = schools.some(
          (school) => school.status?.toLowerCase() !== "active"
        )

        if (!hasPending) {
          pendingSinceRef.current = null
          return false
        }

        pendingSinceRef.current ??= Date.now()
        const elapsed = Date.now() - pendingSinceRef.current
        if (elapsed >= PENDING_POLL_MAX_DURATION) return false

        const step = [...PENDING_POLL_SCHEDULE]
          .reverse()
          .find((s) => elapsed >= s.after)
        return step?.interval ?? PENDING_POLL_SCHEDULE[0].interval
      },
    })

  return {
    userProducts: data,
    isPending,
    isError,
    error,
    isLoading,
    isSuccess,
    refetch,
  }
}

export const useGetProductCatalogue = () => {
  const setProductApiId = useProductStore((state) => state.setProductApiId)
  const query = useQuery<ProductCatalogueResponseI>({
    queryKey: [queryKeys.productCatalogue],
    queryFn: () => getProductCatalogueApi(),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })

  useEffect(() => {
    for (const product of query.data?.value ?? []) {
      if (product.code && product.id) {
        setProductApiId(product.code, product.id)
      }
    }
  }, [query.data, setProductApiId])

  return {
    catalogue: query.data,
    catalogueItems: query.data?.value ?? [],
    isPending: query.isPending,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}

export type ProductSchoolEntry = {
  product: Product
  school: ProductSchoolI
  productUserId: string | null
  productId: string
}

function isOwnerEntry(entry: ProductSchoolEntry) {
  const roleName = entry.school.jobRoles[0]?.jobRoleName
  return !roleName || roleName.toLowerCase() === "owner"
}

export const useMyProductSchools = () => {
  const { userProducts, isLoading, isError, refetch } = useGetUserSubProducts()
  const { catalogueItems } = useGetProductCatalogue()
  const productApiIds = useProductStore((state) => state.productApiIds)

  const catalogueProducts = useMemo(
    () => catalogueItems.map(toProductCard),
    [catalogueItems]
  )

  const allEntries: ProductSchoolEntry[] = useMemo(() => {
    const serverItems: UserSubProductItem[] = Array.isArray(
      userProducts?.value?.products
    )
      ? userProducts.value.products
      : []

    return serverItems.flatMap((serverItem) => {
      const catalogueMatch =
        catalogueProducts.find(
          (product) => product.apiId === serverItem.productId
        ) ??
        catalogueProducts.find(
          (product) => product.id === serverItem.productCode
        ) ??
        catalogueProducts.find(
          (product) => productApiIds[product.id] === serverItem.productId
        ) ??
        toOwnedProductFallback(
          serverItem.productId,
          serverItem.productCode ||
            (serverItem.schools.length > 0
              ? SCHOOL_MANAGEMENT_PRODUCT_SLUG
              : ""),
          serverItem.productName
        )

      return serverItem.schools.map((school) => ({
        product: catalogueMatch,
        school,
        productUserId: serverItem.productUserId,
        productId: serverItem.productId,
      }))
    })
  }, [catalogueProducts, productApiIds, userProducts])

  const ownedSchools = useMemo(
    () => allEntries.filter(isOwnerEntry),
    [allEntries]
  )
  const assignedSchools = useMemo(
    () => allEntries.filter((entry) => !isOwnerEntry(entry)),
    [allEntries]
  )

  return {
    allEntries,
    ownedSchools,
    assignedSchools,
    isLoading,
    isError,
    refetch,
  }
}

export const useGetAllProducts = (params: GetUserProductsParams) => {
  const { data, isPending, isError, error, isLoading, isSuccess, refetch } =
    useQuery({
      queryKey: [queryKeys.allProducts, params],
      queryFn: () => getAllProductsApi(params),
      placeholderData: keepPreviousData,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })
  return {
    allProducts: data,
    isPending,
    isError,
    error,
    isLoading,
    isSuccess,
    refetch,
  }
}

/**
 * Resolves the backend GUID for a product independently of navigation history.
 * The persisted mapping makes repeat visits fast, while the product catalogue
 * repairs missing or stale browser state after reloads and direct URL visits.
 */
export const useResolvedProductApiId = (productSlug: string) => {
  const cachedProductId = useProductStore(
    (state) => state.productApiIds[productSlug]
  )
  const setProductApiId = useProductStore((state) => state.setProductApiId)
  const { catalogue, catalogueItems, isLoading, isError, error, refetch } =
    useGetProductCatalogue()

  const serverProduct = catalogueItems.find(
    (item: ProductCatalogueItemI) => item.code === productSlug
  )
  // A completed catalogue response is authoritative. Use persisted browser
  // state only while the catalogue is unavailable during a rolling deploy.
  const productId =
    serverProduct?.id ?? (catalogue ? undefined : cachedProductId)

  useEffect(() => {
    if (productId && productId !== cachedProductId) {
      setProductApiId(productSlug, productId)
    }
  }, [cachedProductId, productId, productSlug, setProductApiId])

  return {
    productId,
    isLoading: !productId && isLoading,
    isError: !productId && isError,
    error,
    refetch,
  }
}

export function useCreateSchool() {
  const { mutate: createSchool, isPending } = useMutation({
    mutationFn: createSchoolApi,
    mutationKey: [queryKeys.createSchool],

    onSuccess: (res) => {
      toast.success(res.message || "School created successfully")
    },
    retry: false,

    onError: (err: unknown) => {
      const message =
        err instanceof Error ? err.message : "Something went wrong"

      toast.error(message)
    },
  })

  return {
    createSchool,
    isLoading: isPending,
  }
}

export const useGetTimeZones = () => {
  const { data, isPending, isError, error, isLoading, isSuccess, refetch } =
    useQuery({
      queryKey: [queryKeys.timeZones],
      queryFn: () => getTimeZonesApi(),
      staleTime: Infinity,
      gcTime: Infinity,
    })

  const timeZones: TimeZoneOptionI[] = data?.Value ?? []

  return {
    timeZones,
    isPending,
    isLoading,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

export function useUpdateSchoolTimeZone() {
  const queryClient = useQueryClient()

  const { mutateAsync: updateSchoolTimeZoneAsync, isPending } = useMutation({
    mutationFn: updateSchoolTimeZoneApi,

    onSuccess: (res) => {
      if (!res || !res.IsSuccess) {
        toast.error(res?.Error || "Failed to update timezone")
        return
      }

      queryClient.invalidateQueries({ queryKey: [queryKeys.userDashboard] })

      toast.success(res.Message || "Timezone updated")
    },

    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : "Something went wrong")
    },
  })

  return {
    updateSchoolTimeZoneAsync,
    isLoading: isPending,
  }
}

export function useUpdateSchoolProfile() {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: (payload: UpdateSchoolProfilePayloadI) =>
      updateSchoolProfileApi(payload),
    onSuccess: (response) => {
      if (!response?.IsSuccess) {
        toast.error(response?.Error || "Failed to update school profile")
        return
      }
      queryClient.invalidateQueries({ queryKey: [queryKeys.userDashboard] })
      queryClient.invalidateQueries({ queryKey: [queryKeys.userProducts] })
      toast.success(response.Message || "School profile updated")
    },
    onError: (error: Error) => toast.error(error.message),
  })
  return {
    updateSchoolProfileAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
  }
}

export function useDeleteSchool() {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: deleteSchoolApi,
    onSuccess: (response) => {
      if (!response?.IsSuccess) {
        toast.error(response?.Error || "Failed to delete school")
        return
      }
      queryClient.removeQueries({ queryKey: [queryKeys.userDashboard] })
      queryClient.invalidateQueries({ queryKey: [queryKeys.userProducts] })
      toast.success("School deleted")
    },
    onError: (error: Error) => toast.error(error.message),
  })
  return {
    deleteSchoolAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
  }
}

export const useGetProductModuleById = (productId?: string) => {
  const { data, isPending, isError, error, isLoading, isSuccess, refetch } =
    useQuery({
      queryKey: [queryKeys.productModules, productId],
      queryFn: () => getProductModuleByIdApi(productId!),
      enabled: !!productId,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })
  return {
    productModules: data,
    isPending,
    isLoading,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

export const useGeUserAssignedModuleById = (productId?: string) => {
  const { data, isPending, isError, error, isLoading, isSuccess, refetch } =
    useQuery({
      queryKey: [queryKeys.assignedModules, productId],
      queryFn: () => getUserAssignedModulesApi(productId!),
      enabled: !!productId,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })
  return {
    userModules: data,
    isPending,
    isLoading,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

export const useGeUserAssignedDashboard = (schoolId: string) => {
  const { data, isPending, isError, error, isLoading, isSuccess, refetch } =
    useQuery({
      queryKey: [queryKeys.userDashboard, schoolId],
      queryFn: () => getUserAssginedDashboardApi(schoolId),
      enabled: !!schoolId,
      staleTime: 5 * 60 * 1000,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      gcTime: 10 * 60 * 1000,
    })
  return {
    userDashboard: data,
    isPending,
    isLoading,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

export const useGetSchoolPortalAccess = (
  schoolId: string,
  options?: { enabled?: boolean }
) => {
  const enabled = (options?.enabled ?? true) && !!schoolId
  const { data, isPending, isFetching, isError, error, refetch } = useQuery({
    queryKey: [queryKeys.schoolPortalAccess, schoolId],
    refetchInterval: 30_000,
    queryFn: () => getSchoolPortalAccessApi(schoolId),
    enabled,
    staleTime: 0,
    gcTime: 60 * 1000,
    refetchOnMount: "always",
    refetchOnWindowFocus: "always",
    refetchOnReconnect: "always",
    retry: false,
  })

  return {
    access: data?.value,
    isLoading: enabled && isPending,
    isFetching,
    isError,
    error,
    refetch,
  }
}
