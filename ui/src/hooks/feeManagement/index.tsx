import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { formatCurrency } from "@/utils/currency"
import { queryKeys } from "@/utils/queryKeys"
import { getStudentByIdApi } from "@/api/studentPortal.api"
import { autoGenerateEnrollmentInvoice } from "@/utils/autoGenerateEnrollmentInvoice"
import {
  createSchoolPaymentItemsApi,
  getSchoolPaymentItemsApi,
  getSchoolPaymentItemDetailsApi,
  updateSchoolPaymentItemApi,
  deleteSchoolPaymentItemApi,
  createSchoolPaymentMethodsApi,
  getSchoolPaymentMethodsApi,
  getSchoolPaymentMethodDetailsApi,
  updateSchoolPaymentMethodApi,
  deleteSchoolPaymentMethodApi,
  createSchoolPaymentStructureApi,
  getSchoolPaymentStructuresApi,
  getSchoolPaymentStructureDetailsApi,
  updateSchoolPaymentStructureApi,
  deleteSchoolPaymentStructureApi,
  addSchoolPaymentItemsApi,
  getEligibleStudentsApi,
  getPaymentRemindersApi,
  getPaymentReminderDetailsApi,
  createSchoolTransactionApi,
  applyTransactionVatApi,
  applyTransactionDiscountApi,
  allocateTransactionApi,
  getSchoolTransactionsApi,
  getSchoolTransactionDetailsApi,
  getInvoiceBillItemsApi,
  generateInvoiceApi,
  getInvoicesApi,
  getInvoiceDetailsApi,
  updateInvoiceStatusApi,
  deleteInvoiceApi,
  createSchoolTransactionTypeApi,
  updateSchoolTransactionTypeApi,
  toggleSchoolTransactionTypeStatusApi,
  getSchoolTransactionTypesApi,
  getSchoolTransactionTypeDetailsApi,
  getStudentFeesByClassApi,
  paySchoolFeeFromWalletApi,
  customPaySchoolFeeFromWalletApi,
  bulkPayClassSchoolFeesFromWalletApi,
  bulkCustomPayClassSchoolFeesFromWalletApi,
  createSchoolBillApi,
  getSchoolBillsApi,
  getSchoolBillDetailsApi,
  updateSchoolBillStatusApi,
  deleteSchoolBillApi,
  getFeeManagementOverviewApi,
} from "@/api/feeManagement.api"
import type {
  CreateSchoolPaymentItemsPayloadI,
  CreateSchoolPaymentItemsResponseI,
  GetSchoolPaymentItemsResponseI,
  GetSchoolPaymentItemDetailsResponseI,
  UpdateSchoolPaymentItemPayloadI,
  UpdateSchoolPaymentItemResponseI,
  DeleteSchoolPaymentItemResponseI,
  CreateSchoolPaymentMethodsPayloadI,
  CreateSchoolPaymentMethodsResponseI,
  GetSchoolPaymentMethodsResponseI,
  GetSchoolPaymentMethodDetailsResponseI,
  UpdateSchoolPaymentMethodPayloadI,
  UpdateSchoolPaymentMethodResponseI,
  DeleteSchoolPaymentMethodResponseI,
  CreateSchoolPaymentStructurePayloadI,
  CreateSchoolPaymentStructureResponseI,
  GetSchoolPaymentStructuresResponseI,
  GetSchoolPaymentStructureDetailsResponseI,
  UpdateSchoolPaymentStructurePayloadI,
  UpdateSchoolPaymentStructureResponseI,
  DeleteSchoolPaymentStructureResponseI,
  AddSchoolPaymentItemsPayloadI,
  AddSchoolPaymentItemsResponseI,
  GetEligibleStudentsResponseI,
  GetPaymentRemindersParamsI,
  GetPaymentRemindersResponseI,
  GetPaymentReminderDetailsResponseI,
  CreateSchoolTransactionPayloadI,
  CreateSchoolTransactionResponseI,
  ApplyTransactionVatPayloadI,
  ApplyTransactionVatResponseI,
  ApplyTransactionDiscountPayloadI,
  ApplyTransactionDiscountResponseI,
  AllocateTransactionPayloadI,
  AllocateTransactionResponseI,
  GetSchoolTransactionsParamsI,
  GetSchoolTransactionsResponseI,
  GetSchoolTransactionDetailsResponseI,
  GetInvoiceBillItemsParamsI,
  GetInvoiceBillItemsResponseI,
  GenerateInvoicePayloadI,
  GenerateInvoiceResponseI,
  GetInvoicesParamsI,
  GetInvoicesResponseI,
  GetInvoiceDetailsResponseI,
  UpdateInvoiceStatusPayloadI,
  UpdateInvoiceStatusResponseI,
  DeleteInvoiceResponseI,
  CreateSchoolTransactionTypePayloadI,
  CreateSchoolTransactionTypeResponseI,
  UpdateSchoolTransactionTypePayloadI,
  UpdateSchoolTransactionTypeResponseI,
  ToggleSchoolTransactionTypeStatusPayloadI,
  ToggleSchoolTransactionTypeStatusResponseI,
  GetSchoolTransactionTypesParamsI,
  GetSchoolTransactionTypesResponseI,
  GetSchoolTransactionTypeDetailsResponseI,
  GetStudentFeesByClassParamsI,
  GetStudentFeesByClassResponseI,
  PaySchoolFeeFromWalletPayloadI,
  PaySchoolFeeFromWalletResponseI,
  CustomPaySchoolFeeFromWalletPayloadI,
  CustomPaySchoolFeeFromWalletResponseI,
  BulkPayClassSchoolFeesFromWalletPayloadI,
  BulkPayClassSchoolFeesFromWalletResponseI,
  BulkCustomPayClassSchoolFeesFromWalletPayloadI,
  BulkCustomPayClassSchoolFeesFromWalletResponseI,
  CreateSchoolBillPayloadI,
  CreateSchoolBillResponseI,
  GetSchoolBillsParamsI,
  GetSchoolBillsResponseI,
  GetSchoolBillDetailsResponseI,
  UpdateSchoolBillStatusPayloadI,
  UpdateSchoolBillStatusResponseI,
  DeleteSchoolBillResponseI,
  GetFeeManagementOverviewParamsI,
  GetFeeManagementOverviewResponseI,
} from "@/api/feeManagement.api/types"

interface UseCreateSchoolPaymentItemsOptions {
  onSuccess?: (data: CreateSchoolPaymentItemsResponseI) => void
  onError?: (error: Error) => void
}

export const useCreateSchoolPaymentItems = ({
  onSuccess,
  onError,
}: UseCreateSchoolPaymentItemsOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<
      CreateSchoolPaymentItemsResponseI,
      Error,
      CreateSchoolPaymentItemsPayloadI
    >({
      mutationFn: createSchoolPaymentItemsApi,
      onSuccess: (data) => {
        queryClient.invalidateQueries({
          queryKey: [queryKeys.schoolPaymentItems],
        })
        toast.success("Payment item(s) created successfully")
        onSuccess?.(data)
      },
      onError: (err) => {
        toast.error(err?.message ?? "Failed to create payment item(s)")
        onError?.(err)
      },
    })

  return {
    createSchoolPaymentItems: mutate,
    createSchoolPaymentItemsAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

export const useGetSchoolPaymentItems = (schoolId: string) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetSchoolPaymentItemsResponseI>({
      queryKey: [queryKeys.schoolPaymentItems, schoolId],
      queryFn: () => getSchoolPaymentItemsApi(schoolId),
      enabled: !!schoolId,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })

  return {
    paymentItems: data?.value ?? [],
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

export const useGetSchoolPaymentItemDetails = (id: string) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetSchoolPaymentItemDetailsResponseI>({
      queryKey: [queryKeys.schoolPaymentItemDetails, id],
      queryFn: () => getSchoolPaymentItemDetailsApi(id),
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })

  return {
    paymentItem: data?.value,
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

interface UseUpdateSchoolPaymentItemOptions {
  onSuccess?: (data: UpdateSchoolPaymentItemResponseI) => void
  onError?: (error: Error) => void
}

export const useUpdateSchoolPaymentItem = ({
  onSuccess,
  onError,
}: UseUpdateSchoolPaymentItemOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<
      UpdateSchoolPaymentItemResponseI,
      Error,
      UpdateSchoolPaymentItemPayloadI
    >({
      mutationFn: updateSchoolPaymentItemApi,
      onSuccess: (data) => {
        queryClient.invalidateQueries({
          queryKey: [queryKeys.schoolPaymentItems],
        })
        queryClient.invalidateQueries({
          queryKey: [queryKeys.schoolPaymentItemDetails],
        })
        toast.success("Payment item updated successfully")
        onSuccess?.(data)
      },
      onError: (err) => {
        toast.error(err?.message ?? "Failed to update payment item")
        onError?.(err)
      },
    })

  return {
    updateSchoolPaymentItem: mutate,
    updateSchoolPaymentItemAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

interface UseDeleteSchoolPaymentItemOptions {
  onSuccess?: (data: DeleteSchoolPaymentItemResponseI) => void
  onError?: (error: Error) => void
}

export const useDeleteSchoolPaymentItem = ({
  onSuccess,
  onError,
}: UseDeleteSchoolPaymentItemOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<DeleteSchoolPaymentItemResponseI, Error, string>({
      mutationFn: deleteSchoolPaymentItemApi,
      onSuccess: (data) => {
        queryClient.invalidateQueries({
          queryKey: [queryKeys.schoolPaymentItems],
        })
        toast.success("Payment item deleted successfully")
        onSuccess?.(data)
      },
      onError: (err) => {
        toast.error(err?.message ?? "Failed to delete payment item")
        onError?.(err)
      },
    })

  return {
    deleteSchoolPaymentItem: mutate,
    deleteSchoolPaymentItemAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

interface UseCreateSchoolPaymentMethodsOptions {
  onSuccess?: (data: CreateSchoolPaymentMethodsResponseI) => void
  onError?: (error: Error) => void
}

export const useCreateSchoolPaymentMethods = ({
  onSuccess,
  onError,
}: UseCreateSchoolPaymentMethodsOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<
      CreateSchoolPaymentMethodsResponseI,
      Error,
      CreateSchoolPaymentMethodsPayloadI
    >({
      mutationFn: createSchoolPaymentMethodsApi,
      onSuccess: (data) => {
        queryClient.invalidateQueries({
          queryKey: [queryKeys.schoolPaymentMethods],
        })
        toast.success("Payment method(s) created successfully")
        onSuccess?.(data)
      },
      onError: (err) => {
        toast.error(err?.message ?? "Failed to create payment method(s)")
        onError?.(err)
      },
    })

  return {
    createSchoolPaymentMethods: mutate,
    createSchoolPaymentMethodsAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

export const useGetSchoolPaymentMethods = (schoolId: string) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetSchoolPaymentMethodsResponseI>({
      queryKey: [queryKeys.schoolPaymentMethods, schoolId],
      queryFn: () => getSchoolPaymentMethodsApi(schoolId),
      enabled: !!schoolId,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })

  return {
    paymentMethods: data?.value ?? [],
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

export const useGetSchoolPaymentMethodDetails = (id: string) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetSchoolPaymentMethodDetailsResponseI>({
      queryKey: [queryKeys.schoolPaymentMethodDetails, id],
      queryFn: () => getSchoolPaymentMethodDetailsApi(id),
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })

  return {
    paymentMethod: data?.value,
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

interface UseUpdateSchoolPaymentMethodOptions {
  onSuccess?: (data: UpdateSchoolPaymentMethodResponseI) => void
  onError?: (error: Error) => void
}

export const useUpdateSchoolPaymentMethod = ({
  onSuccess,
  onError,
}: UseUpdateSchoolPaymentMethodOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<
      UpdateSchoolPaymentMethodResponseI,
      Error,
      UpdateSchoolPaymentMethodPayloadI
    >({
      mutationFn: updateSchoolPaymentMethodApi,
      onSuccess: (data) => {
        queryClient.invalidateQueries({
          queryKey: [queryKeys.schoolPaymentMethods],
        })
        queryClient.invalidateQueries({
          queryKey: [queryKeys.schoolPaymentMethodDetails],
        })
        toast.success("Payment method updated successfully")
        onSuccess?.(data)
      },
      onError: (err) => {
        toast.error(err?.message ?? "Failed to update payment method")
        onError?.(err)
      },
    })

  return {
    updateSchoolPaymentMethod: mutate,
    updateSchoolPaymentMethodAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

interface UseDeleteSchoolPaymentMethodOptions {
  onSuccess?: (data: DeleteSchoolPaymentMethodResponseI) => void
  onError?: (error: Error) => void
}

export const useDeleteSchoolPaymentMethod = ({
  onSuccess,
  onError,
}: UseDeleteSchoolPaymentMethodOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<DeleteSchoolPaymentMethodResponseI, Error, string>({
      mutationFn: deleteSchoolPaymentMethodApi,
      onSuccess: (data) => {
        queryClient.invalidateQueries({
          queryKey: [queryKeys.schoolPaymentMethods],
        })
        toast.success("Payment method deleted successfully")
        onSuccess?.(data)
      },
      onError: (err) => {
        toast.error(err?.message ?? "Failed to delete payment method")
        onError?.(err)
      },
    })

  return {
    deleteSchoolPaymentMethod: mutate,
    deleteSchoolPaymentMethodAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

interface UseCreateSchoolPaymentStructureOptions {
  onSuccess?: (data: CreateSchoolPaymentStructureResponseI) => void
  onError?: (error: Error) => void
}

export const useCreateSchoolPaymentStructure = ({
  onSuccess,
  onError,
}: UseCreateSchoolPaymentStructureOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<
      CreateSchoolPaymentStructureResponseI,
      Error,
      CreateSchoolPaymentStructurePayloadI
    >({
      mutationFn: createSchoolPaymentStructureApi,
      onSuccess: (data) => {
        queryClient.invalidateQueries({
          queryKey: [queryKeys.schoolPaymentStructures],
        })
        // A new structure changes the bill items Generate Invoice reads for
        // every student in that class/session/term, so its cached "no items"
        // result (if any) must be dropped too.
        queryClient.invalidateQueries({
          queryKey: [queryKeys.studentInvoiceBillItems],
        })
        toast.success("Payment structure created successfully")
        onSuccess?.(data)
      },
      onError: (err) => {
        toast.error(err?.message ?? "Failed to create payment structure")
        onError?.(err)
      },
    })

  return {
    createSchoolPaymentStructure: mutate,
    createSchoolPaymentStructureAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

export const useGetSchoolPaymentStructures = (schoolId: string) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetSchoolPaymentStructuresResponseI>({
      queryKey: [queryKeys.schoolPaymentStructures, schoolId],
      queryFn: () => getSchoolPaymentStructuresApi(schoolId),
      enabled: !!schoolId,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })

  return {
    paymentStructures: data?.value?.items ?? [],
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

export const useGetSchoolPaymentStructureDetails = (id: string) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetSchoolPaymentStructureDetailsResponseI>({
      queryKey: [queryKeys.schoolPaymentStructureDetails, id],
      queryFn: () => getSchoolPaymentStructureDetailsApi(id),
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })

  return {
    paymentStructure: data?.value,
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

interface UseUpdateSchoolPaymentStructureOptions {
  onSuccess?: (data: UpdateSchoolPaymentStructureResponseI) => void
  onError?: (error: Error) => void
}

export const useUpdateSchoolPaymentStructure = ({
  onSuccess,
  onError,
}: UseUpdateSchoolPaymentStructureOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<
      UpdateSchoolPaymentStructureResponseI,
      Error,
      UpdateSchoolPaymentStructurePayloadI
    >({
      mutationFn: updateSchoolPaymentStructureApi,
      onSuccess: (data) => {
        queryClient.invalidateQueries({
          queryKey: [queryKeys.schoolPaymentStructures],
        })
        queryClient.invalidateQueries({
          queryKey: [queryKeys.schoolPaymentStructureDetails],
        })
        queryClient.invalidateQueries({
          queryKey: [queryKeys.studentFeeBreakdown],
        })
        queryClient.invalidateQueries({
          queryKey: [queryKeys.guardianFeeManagement],
        })
        queryClient.invalidateQueries({
          queryKey: [queryKeys.launchSchoolPortal],
        })
        toast.success("Payment structure updated successfully")
        onSuccess?.(data)
      },
      onError: (err) => {
        toast.error(err?.message ?? "Failed to update payment structure")
        onError?.(err)
      },
    })

  return {
    updateSchoolPaymentStructure: mutate,
    updateSchoolPaymentStructureAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

interface UseAddSchoolPaymentItemsOptions {
  onSuccess?: (data: AddSchoolPaymentItemsResponseI) => void
  onError?: (error: Error) => void
}

export const useAddSchoolPaymentItems = ({
  onSuccess,
  onError,
}: UseAddSchoolPaymentItemsOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<
      AddSchoolPaymentItemsResponseI,
      Error,
      AddSchoolPaymentItemsPayloadI
    >({
      mutationFn: addSchoolPaymentItemsApi,
      onSuccess: (data) => {
        queryClient.invalidateQueries({
          queryKey: [queryKeys.schoolPaymentStructures],
        })
        queryClient.invalidateQueries({
          queryKey: [queryKeys.schoolPaymentStructureDetails],
        })
        queryClient.invalidateQueries({
          queryKey: [queryKeys.studentInvoiceBillItems],
        })
        toast.success("Payment item(s) added successfully")
        onSuccess?.(data)
      },
      onError: (err) => {
        toast.error(err?.message ?? "Failed to add payment item(s)")
        onError?.(err)
      },
    })

  return {
    addSchoolPaymentItems: mutate,
    addSchoolPaymentItemsAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

export const useGetEligibleStudents = (paymentStructureId: string) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetEligibleStudentsResponseI>({
      queryKey: [
        queryKeys.schoolPaymentStructureEligibleStudents,
        paymentStructureId,
      ],
      queryFn: () => getEligibleStudentsApi(paymentStructureId),
      enabled: !!paymentStructureId,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })

  return {
    eligibleStudents: data?.value ?? [],
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

interface SendPaymentTypeToGuardiansPayloadI {
  schoolId: string
  paymentStructureId: string
  schoolSessionId: string
  schoolSessionTermId: string
  schoolClassId: string
  dueDate: string
}

export interface SendPaymentTypeToGuardiansResultI {
  total: number
  sent: number
  alreadySent: number
  skipped: number
}

interface UseSendPaymentTypeToGuardiansOptions {
  onSuccess?: (data: SendPaymentTypeToGuardiansResultI) => void
}

/**
 * "Sending" an invoice means generating it — this app has no email/SMS
 * integration, so a guardian sees a fee the moment its invoice exists on
 * their parent portal. Per-student idempotency is handled inside
 * autoGenerateEnrollmentInvoice (skips a student who already has an
 * invoice for this session/term), so re-running this is always safe.
 */
export const useSendPaymentTypeToGuardians = ({
  onSuccess,
}: UseSendPaymentTypeToGuardiansOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutateAsync, isPending } = useMutation<
    SendPaymentTypeToGuardiansResultI,
    Error,
    SendPaymentTypeToGuardiansPayloadI
  >({
    mutationFn: async ({
      schoolId,
      paymentStructureId,
      schoolSessionId,
      schoolSessionTermId,
      schoolClassId,
      dueDate,
    }) => {
      const eligibleRes = await getEligibleStudentsApi(paymentStructureId)
      const eligibleStudents = eligibleRes.value ?? []

      const settled = await Promise.allSettled(
        eligibleStudents.map(async (s) => {
          const detail = await getStudentByIdApi({
            studentId: s.studentId,
            schoolId,
          })
          return autoGenerateEnrollmentInvoice({
            schoolId,
            studentId: s.studentId,
            guardianId: detail.value?.guardians?.[0]?.id,
            schoolSessionId,
            schoolSessionTermId,
            schoolClassId,
            dueDate,
          })
        })
      )

      let sent = 0
      let alreadySent = 0
      let skipped = 0
      settled.forEach((result) => {
        if (result.status !== "fulfilled") {
          skipped++
          return
        }
        if (result.value === "created") sent++
        else if (result.value === "skipped-existing-invoice") alreadySent++
        else skipped++
      })

      return { total: eligibleStudents.length, sent, alreadySent, skipped }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.studentInvoices] })

      if (result.total === 0) {
        toast.error("No students found in this class for this session/term")
      } else {
        if (result.sent > 0) {
          toast.success(
            `Sent ${result.sent} invoice${result.sent === 1 ? "" : "s"} to guardians`
          )
        }
        if (result.alreadySent > 0) {
          toast(
            `${result.alreadySent} student${result.alreadySent === 1 ? "" : "s"} already sent — skipped`
          )
        }
        if (result.skipped > 0) {
          toast.error(
            `${result.skipped} student${result.skipped === 1 ? "" : "s"} couldn't be sent (missing guardian or an error occurred)`
          )
        }
      }
      onSuccess?.(result)
    },
    onError: () => toast.error("Failed to send invoices to guardians"),
  })

  return { sendToGuardians: mutateAsync, isPending }
}

interface UseDeleteSchoolPaymentStructureOptions {
  onSuccess?: (data: DeleteSchoolPaymentStructureResponseI) => void
  onError?: (error: Error) => void
}

export const useDeleteSchoolPaymentStructure = ({
  onSuccess,
  onError,
}: UseDeleteSchoolPaymentStructureOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<DeleteSchoolPaymentStructureResponseI, Error, string>({
      mutationFn: deleteSchoolPaymentStructureApi,
      onSuccess: (data) => {
        queryClient.invalidateQueries({
          queryKey: [queryKeys.schoolPaymentStructures],
        })
        toast.success("Payment structure deleted successfully")
        onSuccess?.(data)
      },
      onError: (err) => {
        toast.error(err?.message ?? "Failed to delete payment structure")
        onError?.(err)
      },
    })

  return {
    deleteSchoolPaymentStructure: mutate,
    deleteSchoolPaymentStructureAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

export const useGetPaymentReminders = (params: GetPaymentRemindersParamsI) => {
  const { schoolId, sessionId, termId, classId } = params

  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetPaymentRemindersResponseI>({
      queryKey: [queryKeys.paymentReminders, params],
      queryFn: () => getPaymentRemindersApi(params),
      enabled: !!schoolId && !!sessionId && !!termId && !!classId,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })

  return {
    paymentReminders: data?.value?.items ?? [],
    pageNumber: data?.value?.pageNumber ?? 1,
    pageSize: data?.value?.pageSize ?? 10,
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

export const useGetPaymentReminderDetails = (studentBillId: string) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetPaymentReminderDetailsResponseI>({
      queryKey: [queryKeys.paymentReminderDetails, studentBillId],
      queryFn: () => getPaymentReminderDetailsApi(studentBillId),
      enabled: !!studentBillId,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })

  return {
    paymentReminderDetails: data?.value,
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

// ─── FeeManagement: class fee list + wallet payments ──────────────────────────

export const useGetStudentFeesByClass = (
  params: GetStudentFeesByClassParamsI
) => {
  const { schoolId, sessionId, termId, classId } = params

  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetStudentFeesByClassResponseI>({
      queryKey: [queryKeys.studentFeesByClass, params],
      queryFn: () => getStudentFeesByClassApi(params),
      enabled: !!schoolId && !!sessionId && !!termId && !!classId,
      staleTime: 2 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })

  return {
    studentFees: data?.value?.items ?? [],
    pageNumber: data?.value?.pageNumber ?? 1,
    pageSize: data?.value?.pageSize ?? 10,
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

interface UsePaySchoolFeeFromWalletOptions {
  onSuccess?: (data: PaySchoolFeeFromWalletResponseI) => void
  onError?: (error: Error) => void
  currencyCode?: string | null
}

export const usePaySchoolFeeFromWallet = ({
  onSuccess,
  onError,
  currencyCode,
}: UsePaySchoolFeeFromWalletOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<
      PaySchoolFeeFromWalletResponseI,
      Error,
      PaySchoolFeeFromWalletPayloadI
    >({
      mutationFn: paySchoolFeeFromWalletApi,
      onSuccess: (data) => {
        queryClient.invalidateQueries({
          queryKey: [queryKeys.studentFeesByClass],
        })
        toast.success(
          `${formatCurrency(data.value.paidAmount, currencyCode)} paid from wallet`
        )
        onSuccess?.(data)
      },
      onError: (err) => {
        toast.error(err?.message ?? "Failed to pay fee from wallet")
        onError?.(err)
      },
    })

  return {
    paySchoolFeeFromWallet: mutate,
    paySchoolFeeFromWalletAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

interface UseCustomPaySchoolFeeFromWalletOptions {
  onSuccess?: (data: CustomPaySchoolFeeFromWalletResponseI) => void
  onError?: (error: Error) => void
  currencyCode?: string | null
}

export const useCustomPaySchoolFeeFromWallet = ({
  onSuccess,
  onError,
  currencyCode,
}: UseCustomPaySchoolFeeFromWalletOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<
      CustomPaySchoolFeeFromWalletResponseI,
      Error,
      CustomPaySchoolFeeFromWalletPayloadI
    >({
      mutationFn: customPaySchoolFeeFromWalletApi,
      onSuccess: (data) => {
        queryClient.invalidateQueries({
          queryKey: [queryKeys.studentFeesByClass],
        })
        toast.success(
          `${formatCurrency(data.value.paidAmount, currencyCode)} paid from wallet`
        )
        onSuccess?.(data)
      },
      onError: (err) => {
        toast.error(err?.message ?? "Failed to pay fee from wallet")
        onError?.(err)
      },
    })

  return {
    customPaySchoolFeeFromWallet: mutate,
    customPaySchoolFeeFromWalletAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

interface UseBulkPayClassSchoolFeesFromWalletOptions {
  onSuccess?: (data: BulkPayClassSchoolFeesFromWalletResponseI) => void
  onError?: (error: Error) => void
  currencyCode?: string | null
}

export const useBulkPayClassSchoolFeesFromWallet = ({
  onSuccess,
  onError,
  currencyCode,
}: UseBulkPayClassSchoolFeesFromWalletOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<
      BulkPayClassSchoolFeesFromWalletResponseI,
      Error,
      BulkPayClassSchoolFeesFromWalletPayloadI
    >({
      mutationFn: bulkPayClassSchoolFeesFromWalletApi,
      onSuccess: (data) => {
        queryClient.invalidateQueries({
          queryKey: [queryKeys.studentFeesByClass],
        })
        toast.success(
          `${data.value.studentsPaidCount} of ${data.value.totalStudentsProcessed} students paid — ${formatCurrency(data.value.totalAmountDeducted, currencyCode)} deducted`
        )
        onSuccess?.(data)
      },
      onError: (err) => {
        toast.error(err?.message ?? "Failed to process class fee payments")
        onError?.(err)
      },
    })

  return {
    bulkPayClassSchoolFeesFromWallet: mutate,
    bulkPayClassSchoolFeesFromWalletAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

interface UseBulkCustomPayClassSchoolFeesFromWalletOptions {
  onSuccess?: (data: BulkCustomPayClassSchoolFeesFromWalletResponseI) => void
  onError?: (error: Error) => void
  currencyCode?: string | null
}

export const useBulkCustomPayClassSchoolFeesFromWallet = ({
  onSuccess,
  onError,
  currencyCode,
}: UseBulkCustomPayClassSchoolFeesFromWalletOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<
      BulkCustomPayClassSchoolFeesFromWalletResponseI,
      Error,
      BulkCustomPayClassSchoolFeesFromWalletPayloadI
    >({
      mutationFn: bulkCustomPayClassSchoolFeesFromWalletApi,
      onSuccess: (data) => {
        queryClient.invalidateQueries({
          queryKey: [queryKeys.studentFeesByClass],
        })
        toast.success(
          `${data.value.studentsPaidCount} of ${data.value.totalStudentsProcessed} students paid — ${formatCurrency(data.value.totalAmountDeducted, currencyCode)} deducted`
        )
        onSuccess?.(data)
      },
      onError: (err) => {
        toast.error(err?.message ?? "Failed to process class fee payments")
        onError?.(err)
      },
    })

  return {
    bulkCustomPayClassSchoolFeesFromWallet: mutate,
    bulkCustomPayClassSchoolFeesFromWalletAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

// ─── SchoolTransaction ───────────────────────────────────────────────────────

interface UseCreateSchoolTransactionOptions {
  onSuccess?: (data: CreateSchoolTransactionResponseI) => void
  onError?: (error: Error) => void
}

export const useCreateSchoolTransaction = ({
  onSuccess,
  onError,
}: UseCreateSchoolTransactionOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<
      CreateSchoolTransactionResponseI,
      Error,
      CreateSchoolTransactionPayloadI
    >({
      mutationFn: createSchoolTransactionApi,
      onSuccess: (data) => {
        queryClient.invalidateQueries({
          queryKey: [queryKeys.schoolTransactions],
        })
        toast.success("Transaction recorded successfully")
        onSuccess?.(data)
      },
      onError: (err) => {
        toast.error(err?.message ?? "Failed to record transaction")
        onError?.(err)
      },
    })

  return {
    createSchoolTransaction: mutate,
    createSchoolTransactionAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

interface UseApplyTransactionVatOptions {
  onSuccess?: (data: ApplyTransactionVatResponseI) => void
  onError?: (error: Error) => void
}

export const useApplyTransactionVat = ({
  onSuccess,
  onError,
}: UseApplyTransactionVatOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<
      ApplyTransactionVatResponseI,
      Error,
      ApplyTransactionVatPayloadI
    >({
      mutationFn: applyTransactionVatApi,
      onSuccess: (data) => {
        queryClient.invalidateQueries({
          queryKey: [queryKeys.schoolTransactions],
        })
        queryClient.invalidateQueries({
          queryKey: [queryKeys.schoolTransactionDetails],
        })
        toast.success("VAT applied successfully")
        onSuccess?.(data)
      },
      onError: (err) => {
        toast.error(err?.message ?? "Failed to apply VAT")
        onError?.(err)
      },
    })

  return {
    applyTransactionVat: mutate,
    applyTransactionVatAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

interface UseApplyTransactionDiscountOptions {
  onSuccess?: (data: ApplyTransactionDiscountResponseI) => void
  onError?: (error: Error) => void
}

export const useApplyTransactionDiscount = ({
  onSuccess,
  onError,
}: UseApplyTransactionDiscountOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<
      ApplyTransactionDiscountResponseI,
      Error,
      ApplyTransactionDiscountPayloadI
    >({
      mutationFn: applyTransactionDiscountApi,
      onSuccess: (data) => {
        queryClient.invalidateQueries({
          queryKey: [queryKeys.schoolTransactions],
        })
        queryClient.invalidateQueries({
          queryKey: [queryKeys.schoolTransactionDetails],
        })
        toast.success("Discount applied successfully")
        onSuccess?.(data)
      },
      onError: (err) => {
        toast.error(err?.message ?? "Failed to apply discount")
        onError?.(err)
      },
    })

  return {
    applyTransactionDiscount: mutate,
    applyTransactionDiscountAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

interface UseAllocateTransactionOptions {
  onSuccess?: (data: AllocateTransactionResponseI) => void
  onError?: (error: Error) => void
}

export const useAllocateTransaction = ({
  onSuccess,
  onError,
}: UseAllocateTransactionOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<
      AllocateTransactionResponseI,
      Error,
      AllocateTransactionPayloadI
    >({
      mutationFn: allocateTransactionApi,
      onSuccess: (data) => {
        queryClient.invalidateQueries({
          queryKey: [queryKeys.schoolTransactions],
        })
        queryClient.invalidateQueries({
          queryKey: [queryKeys.schoolTransactionDetails],
        })
        toast.success("Transaction allocated successfully")
        onSuccess?.(data)
      },
      onError: (err) => {
        toast.error(err?.message ?? "Failed to allocate transaction")
        onError?.(err)
      },
    })

  return {
    allocateTransaction: mutate,
    allocateTransactionAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

export const useGetSchoolTransactions = (
  params: GetSchoolTransactionsParamsI
) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetSchoolTransactionsResponseI>({
      queryKey: [queryKeys.schoolTransactions, params],
      queryFn: () => getSchoolTransactionsApi(params),
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })

  return {
    transactions: data?.value?.items ?? [],
    cashSummary: data?.value?.cashSummary,
    pageNumber: data?.value?.pageNumber ?? 1,
    pageSize: data?.value?.pageSize ?? 10,
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

export const useGetSchoolTransactionDetails = (id: string) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetSchoolTransactionDetailsResponseI>({
      queryKey: [queryKeys.schoolTransactionDetails, id],
      queryFn: () => getSchoolTransactionDetailsApi(id),
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })

  return {
    transactionDetails: data?.value,
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

// ─── SchoolTransactionType ───────────────────────────────────────────────────

interface UseCreateSchoolTransactionTypeOptions {
  onSuccess?: (data: CreateSchoolTransactionTypeResponseI) => void
  onError?: (error: Error) => void
}

export const useCreateSchoolTransactionType = ({
  onSuccess,
  onError,
}: UseCreateSchoolTransactionTypeOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<
      CreateSchoolTransactionTypeResponseI,
      Error,
      CreateSchoolTransactionTypePayloadI
    >({
      mutationFn: createSchoolTransactionTypeApi,
      onSuccess: (data) => {
        queryClient.invalidateQueries({
          queryKey: [queryKeys.schoolTransactionTypes],
        })
        toast.success("Transaction type created successfully")
        onSuccess?.(data)
      },
      onError: (err) => {
        toast.error(err?.message ?? "Failed to create transaction type")
        onError?.(err)
      },
    })

  return {
    createSchoolTransactionType: mutate,
    createSchoolTransactionTypeAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

interface UseUpdateSchoolTransactionTypeOptions {
  onSuccess?: (data: UpdateSchoolTransactionTypeResponseI) => void
  onError?: (error: Error) => void
}

export const useUpdateSchoolTransactionType = ({
  onSuccess,
  onError,
}: UseUpdateSchoolTransactionTypeOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<
      UpdateSchoolTransactionTypeResponseI,
      Error,
      UpdateSchoolTransactionTypePayloadI
    >({
      mutationFn: updateSchoolTransactionTypeApi,
      onSuccess: (data) => {
        queryClient.invalidateQueries({
          queryKey: [queryKeys.schoolTransactionTypes],
        })
        queryClient.invalidateQueries({
          queryKey: [queryKeys.schoolTransactionTypeDetails],
        })
        toast.success("Transaction type updated successfully")
        onSuccess?.(data)
      },
      onError: (err) => {
        toast.error(err?.message ?? "Failed to update transaction type")
        onError?.(err)
      },
    })

  return {
    updateSchoolTransactionType: mutate,
    updateSchoolTransactionTypeAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

interface UseToggleSchoolTransactionTypeStatusOptions {
  onSuccess?: (data: ToggleSchoolTransactionTypeStatusResponseI) => void
  onError?: (error: Error) => void
}

export const useToggleSchoolTransactionTypeStatus = ({
  onSuccess,
  onError,
}: UseToggleSchoolTransactionTypeStatusOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<
      ToggleSchoolTransactionTypeStatusResponseI,
      Error,
      ToggleSchoolTransactionTypeStatusPayloadI
    >({
      mutationFn: toggleSchoolTransactionTypeStatusApi,
      onSuccess: (data) => {
        queryClient.invalidateQueries({
          queryKey: [queryKeys.schoolTransactionTypes],
        })
        queryClient.invalidateQueries({
          queryKey: [queryKeys.schoolTransactionTypeDetails],
        })
        toast.success("Transaction type status updated successfully")
        onSuccess?.(data)
      },
      onError: (err) => {
        toast.error(err?.message ?? "Failed to update transaction type status")
        onError?.(err)
      },
    })

  return {
    toggleSchoolTransactionTypeStatus: mutate,
    toggleSchoolTransactionTypeStatusAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

export const useGetSchoolTransactionTypes = (
  params: GetSchoolTransactionTypesParamsI
) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetSchoolTransactionTypesResponseI>({
      queryKey: [queryKeys.schoolTransactionTypes, params],
      queryFn: () => getSchoolTransactionTypesApi(params),
      enabled: !!params.schoolId,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })

  return {
    transactionTypes: data?.value ?? [],
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

export const useGetSchoolTransactionTypeDetails = (
  id: string,
  schoolId: string
) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetSchoolTransactionTypeDetailsResponseI>({
      queryKey: [queryKeys.schoolTransactionTypeDetails, id, schoolId],
      queryFn: () => getSchoolTransactionTypeDetailsApi({ id, schoolId }),
      enabled: !!id && !!schoolId,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })

  return {
    transactionTypeDetails: data?.value,
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

// ─── StudentInvoice ──────────────────────────────────────────────────────────

export const useGetInvoiceBillItems = (params: GetInvoiceBillItemsParamsI) => {
  const {
    schoolId,
    studentId,
    schoolSessionId,
    schoolSessionTermId,
    schoolClassId,
  } = params

  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetInvoiceBillItemsResponseI>({
      queryKey: [queryKeys.studentInvoiceBillItems, params],
      queryFn: () => getInvoiceBillItemsApi(params),
      enabled:
        !!schoolId &&
        !!studentId &&
        !!schoolSessionId &&
        !!schoolSessionTermId &&
        !!schoolClassId,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })

  return {
    billId: data?.value?.billId,
    billItems: data?.value?.items ?? [],
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

interface UseGenerateInvoiceOptions {
  onSuccess?: (data: GenerateInvoiceResponseI) => void
  onError?: (error: Error) => void
}

export const useGenerateInvoice = ({
  onSuccess,
  onError,
}: UseGenerateInvoiceOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<GenerateInvoiceResponseI, Error, GenerateInvoicePayloadI>({
      mutationFn: generateInvoiceApi,
      onSuccess: (data) => {
        queryClient.invalidateQueries({
          queryKey: [queryKeys.studentInvoices],
        })
        toast.success("Invoice generated successfully")
        onSuccess?.(data)
      },
      onError: (err) => {
        toast.error(err?.message ?? "Failed to generate invoice")
        onError?.(err)
      },
    })

  return {
    generateInvoice: mutate,
    generateInvoiceAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

export const useGetInvoices = (params: GetInvoicesParamsI) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetInvoicesResponseI>({
      queryKey: [queryKeys.studentInvoices, params],
      queryFn: () => getInvoicesApi(params),
      // schoolSessionId is required by the API despite being documented as
      // optional in Swagger — confirmed live (400: "The SchoolSessionId
      // field is required"), so callers must always resolve one.
      enabled: !!params.schoolId && !!params.schoolSessionId,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })

  return {
    invoices: data?.value?.invoices?.items ?? [],
    pageNumber: data?.value?.invoices?.pageNumber ?? 1,
    pageSize: data?.value?.invoices?.pageSize ?? 10,
    totalItems: data?.value?.invoices?.totalItems ?? 0,
    totalPages: data?.value?.invoices?.totalPages ?? 0,
    totalInvoiced: data?.value?.totalInvoiced ?? 0,
    totalCollected: data?.value?.totalCollected ?? 0,
    outstandingBalance: data?.value?.outstandingBalance ?? 0,
    fullyPaidCount: data?.value?.fullyPaidCount ?? 0,
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

export const useGetInvoiceDetails = (invoiceId: string) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetInvoiceDetailsResponseI>({
      queryKey: [queryKeys.studentInvoiceDetails, invoiceId],
      queryFn: () => getInvoiceDetailsApi(invoiceId),
      enabled: !!invoiceId,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })

  return {
    invoiceDetails: data?.value,
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

interface UseUpdateInvoiceStatusOptions {
  onSuccess?: (data: UpdateInvoiceStatusResponseI) => void
  onError?: (error: Error) => void
}

export const useUpdateInvoiceStatus = ({
  onSuccess,
  onError,
}: UseUpdateInvoiceStatusOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<
      UpdateInvoiceStatusResponseI,
      Error,
      UpdateInvoiceStatusPayloadI
    >({
      mutationFn: updateInvoiceStatusApi,
      onSuccess: (data) => {
        queryClient.invalidateQueries({
          queryKey: [queryKeys.studentInvoices],
        })
        queryClient.invalidateQueries({
          queryKey: [queryKeys.studentInvoiceDetails],
        })
        toast.success("Invoice status updated successfully")
        onSuccess?.(data)
      },
      onError: (err) => {
        toast.error(err?.message ?? "Failed to update invoice status")
        onError?.(err)
      },
    })

  return {
    updateInvoiceStatus: mutate,
    updateInvoiceStatusAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

interface UseDeleteInvoiceOptions {
  onSuccess?: (data: DeleteInvoiceResponseI) => void
  onError?: (error: Error) => void
}

export const useDeleteInvoice = ({
  onSuccess,
  onError,
}: UseDeleteInvoiceOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<DeleteInvoiceResponseI, Error, string>({
      mutationFn: deleteInvoiceApi,
      onSuccess: (data) => {
        queryClient.invalidateQueries({
          queryKey: [queryKeys.studentInvoices],
        })
        toast.success("Invoice deleted successfully")
        onSuccess?.(data)
      },
      onError: (err) => {
        toast.error(err?.message ?? "Failed to delete invoice")
        onError?.(err)
      },
    })

  return {
    deleteInvoice: mutate,
    deleteInvoiceAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

interface UseCreateSchoolBillOptions {
  onSuccess?: (data: CreateSchoolBillResponseI) => void
  onError?: (error: Error) => void
}

export const useCreateSchoolBill = ({
  onSuccess,
  onError,
}: UseCreateSchoolBillOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<CreateSchoolBillResponseI, Error, CreateSchoolBillPayloadI>({
      mutationFn: createSchoolBillApi,
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: [queryKeys.schoolBills] })
        toast.success("Bill created successfully")
        onSuccess?.(data)
      },
      onError: (err) => {
        toast.error(err?.message ?? "Failed to create bill")
        onError?.(err)
      },
    })

  return {
    createSchoolBill: mutate,
    createSchoolBillAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

export const useGetSchoolBills = (params: GetSchoolBillsParamsI) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetSchoolBillsResponseI>({
      queryKey: [queryKeys.schoolBills, params],
      queryFn: () => getSchoolBillsApi(params),
      enabled: !!params.schoolId,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })

  return {
    bills: data?.value?.items ?? [],
    pageNumber: data?.value?.pageNumber ?? 1,
    pageSize: data?.value?.pageSize ?? 10,
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

export const useGetSchoolBillDetails = (billId: string) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetSchoolBillDetailsResponseI>({
      queryKey: [queryKeys.schoolBillDetails, billId],
      queryFn: () => getSchoolBillDetailsApi(billId),
      enabled: !!billId,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })

  return {
    billDetails: data?.value,
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

interface UseUpdateSchoolBillStatusOptions {
  onSuccess?: (data: UpdateSchoolBillStatusResponseI) => void
  onError?: (error: Error) => void
}

export const useUpdateSchoolBillStatus = ({
  onSuccess,
  onError,
}: UseUpdateSchoolBillStatusOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<
      UpdateSchoolBillStatusResponseI,
      Error,
      UpdateSchoolBillStatusPayloadI
    >({
      mutationFn: updateSchoolBillStatusApi,
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: [queryKeys.schoolBills] })
        queryClient.invalidateQueries({
          queryKey: [queryKeys.schoolBillDetails],
        })
        toast.success("Bill updated successfully")
        onSuccess?.(data)
      },
      onError: (err) => {
        toast.error(err?.message ?? "Failed to update bill")
        onError?.(err)
      },
    })

  return {
    updateSchoolBillStatus: mutate,
    updateSchoolBillStatusAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

interface UseDeleteSchoolBillOptions {
  onSuccess?: (data: DeleteSchoolBillResponseI) => void
  onError?: (error: Error) => void
}

export const useDeleteSchoolBill = ({
  onSuccess,
  onError,
}: UseDeleteSchoolBillOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<DeleteSchoolBillResponseI, Error, string>({
      mutationFn: deleteSchoolBillApi,
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: [queryKeys.schoolBills] })
        toast.success("Bill deleted successfully")
        onSuccess?.(data)
      },
      onError: (err) => {
        toast.error(err?.message ?? "Failed to delete bill")
        onError?.(err)
      },
    })

  return {
    deleteSchoolBill: mutate,
    deleteSchoolBillAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

export const useGetFeeManagementOverview = (
  params: GetFeeManagementOverviewParamsI
) => {
  const { data, isPending, isFetching, isError, error, isSuccess, refetch } =
    useQuery<GetFeeManagementOverviewResponseI>({
      queryKey: [queryKeys.feeManagementOverview, params],
      queryFn: ({ signal }) => getFeeManagementOverviewApi(params, signal),
      enabled: !!params.schoolId,
      placeholderData: (previous, previousQuery) => {
        const previousParams = previousQuery?.queryKey[1] as
          | GetFeeManagementOverviewParamsI
          | undefined
        return previousParams?.schoolId === params.schoolId
          ? previous
          : undefined
      },
      staleTime: 2 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })

  return {
    overview: data?.value,
    isLoading: isPending,
    isFetching,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}
