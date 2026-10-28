import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { toast } from "sonner"
import { queryKeys } from "@/utils/queryKeys"
import {
  createStudentApi,
  updateStudentApi,
  deleteStudentApi,
  enrollStudentApi,
  enrollToAdditionalClassApi,
  searchStudentsApi,
  getSchoolStudentsApi,
  getStudentByIdApi,
  getStudentDetailApi,
  getStudentDashboardOverviewApi,
  adminResetStudentPasswordApi,
  getStudentPortalOverviewApi,
  getStudentPortalTimetableApi,
  getStudentPortalResultsApi,
  getStudentPortalHostelApi,
  getStudentPortalHealthRecordApi,
  getStudentPortalLaunchApi,
  getStudentPortalTimetableByWeekApi,
  getMyAttendanceApi,
  getStudentCoursesApi,
  type GetStudentCoursesResponseI,
} from "@/api/studentPortal.api"
import type {
  CreateStudentPayloadI,
  CreateStudentResponseI,
  UpdateStudentPayloadI,
  UpdateStudentResponseI,
  DeleteStudentParamsI,
  DeleteStudentResponseI,
  EnrollStudentPayloadI,
  EnrollStudentResponseI,
  EnrollToAdditionalClassPayloadI,
  EnrollToAdditionalClassResponseI,
  SearchStudentsParamsI,
  SearchStudentsResponseI,
  GetSchoolStudentsParamsI,
  GetSchoolStudentsResponseI,
  GetStudentByIdParamsI,
  GetStudentByIdResponseI,
  StudentDetailDataI,
  GetStudentDashboardOverviewResponseI,
  AdminResetStudentPasswordPayloadI,
  AdminResetStudentPasswordResponseI,
  GetStudentPortalOverviewParamsI,
  GetStudentPortalOverviewResponseI,
  GetStudentPortalTimetableParamsI,
  GetStudentPortalTimetableResponseI,
  GetStudentPortalResultsParamsI,
  GetStudentPortalResultsResponseI,
  GetStudentPortalHostelParamsI,
  GetStudentPortalHostelResponseI,
  GetStudentPortalHealthRecordParamsI,
  GetStudentPortalHealthRecordResponseI,
  StudentPortalSickBayVisitI,
  GetStudentPortalLaunchResponseI,
  GetStudentPortalTimetableByWeekResponseI,
  GetMyAttendanceParamsI,
  GetMyAttendanceResponseI,
} from "@/api/studentPortal.api/types"
import {
  getStudentsForPromotionApi,
  promoteStudentsApi,
} from "@/api/studentPromotion.api"
import type {
  GetStudentsForPromotionParamsI,
  GetStudentsForPromotionResponseI,
  PromoteStudentsResponseI,
} from "@/api/studentPromotion.api/types"
import { statusFromApi } from "@/utils/studentEnums"
import type { EnrollmentStatus } from "@/types/student"
import { autoGenerateEnrollmentInvoice } from "@/utils/autoGenerateEnrollmentInvoice"

interface UseCreateStudentOptions {
  onSuccess?: (data: CreateStudentResponseI) => void
  onError?: (error: Error) => void
}

export const useCreateStudent = ({
  onSuccess,
  onError,
}: UseCreateStudentOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<CreateStudentResponseI, Error, CreateStudentPayloadI>({
      mutationFn: createStudentApi,
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: [queryKeys.schoolStudents] })
        queryClient.invalidateQueries({
          queryKey: [queryKeys.studentDashboardOverview],
        })
        toast.success("Student created successfully")
        onSuccess?.(data)
      },
      onError,
    })

  return {
    createStudent: mutate,
    createStudentAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

interface UseUpdateStudentOptions {
  onSuccess?: (data: UpdateStudentResponseI) => void
  onError?: (error: Error) => void
}

export const useUpdateStudent = ({
  onSuccess,
  onError,
}: UseUpdateStudentOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<UpdateStudentResponseI, Error, UpdateStudentPayloadI>({
      mutationFn: updateStudentApi,
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: [queryKeys.schoolStudents] })
        queryClient.invalidateQueries({ queryKey: [queryKeys.studentById] })
        queryClient.invalidateQueries({ queryKey: [queryKeys.studentDetail] })
        queryClient.invalidateQueries({ queryKey: [queryKeys.studentDashboardOverview] })
        toast.success("Student updated successfully")
        onSuccess?.(data)
      },
      onError,
    })

  return {
    updateStudent: mutate,
    updateStudentAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

interface UseDeleteStudentOptions {
  onSuccess?: (data: DeleteStudentResponseI) => void
  onError?: (error: Error) => void
}

export const useDeleteStudent = ({
  onSuccess,
  onError,
}: UseDeleteStudentOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<DeleteStudentResponseI, Error, DeleteStudentParamsI>({
      mutationFn: deleteStudentApi,
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: [queryKeys.schoolStudents] })
        queryClient.invalidateQueries({
          queryKey: [queryKeys.studentDashboardOverview],
        })
        toast.success("Student removed successfully")
        onSuccess?.(data)
      },
      onError,
    })

  return {
    deleteStudent: mutate,
    deleteStudentAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

interface UseEnrollStudentOptions {
  onSuccess?: (data: EnrollStudentResponseI) => void
  onError?: (error: Error) => void
}

export const useEnrollStudent = ({
  onSuccess,
  onError,
}: UseEnrollStudentOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<EnrollStudentResponseI, Error, EnrollStudentPayloadI>({
      mutationFn: enrollStudentApi,
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: [queryKeys.schoolStudents] })
        queryClient.invalidateQueries({ queryKey: [queryKeys.studentById] })
        queryClient.invalidateQueries({ queryKey: [queryKeys.studentDetail] })
        queryClient.invalidateQueries({ queryKey: [queryKeys.studentDashboardOverview] })
        toast.success("Student enrolled successfully")
        onSuccess?.(data)
      },
      onError,
    })

  return {
    enrollStudent: mutate,
    enrollStudentAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

interface UseEnrollToAdditionalClassOptions {
  onSuccess?: (data: EnrollToAdditionalClassResponseI) => void
  onError?: (error: Error) => void
}

export const useEnrollToAdditionalClass = ({
  onSuccess,
  onError,
}: UseEnrollToAdditionalClassOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<
      EnrollToAdditionalClassResponseI,
      Error,
      EnrollToAdditionalClassPayloadI
    >({
      mutationFn: enrollToAdditionalClassApi,
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: [queryKeys.schoolStudents] })
        queryClient.invalidateQueries({ queryKey: [queryKeys.studentById] })
        queryClient.invalidateQueries({ queryKey: [queryKeys.studentDetail] })
        queryClient.invalidateQueries({ queryKey: [queryKeys.studentDashboardOverview] })
        toast.success("Student enrolled into the additional class")
        onSuccess?.(data)
      },
      onError,
    })

  return {
    enrollToAdditionalClass: mutate,
    enrollToAdditionalClassAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

export interface PromoteStudentsPayloadI {
  studentIds: string[]
  schoolId: string
  sourceSessionId: string
  sourceTermId: string
  sourceClassId: string
  targetSchoolClassId: string
  targetSchoolArmId?: string
  targetSchoolSessionId: string
  targetSchoolSessionTermId: string
  // When provided, a best-effort attempt is made to auto-generate each
  // promoted student's invoice for this session/term (see
  // autoGenerateEnrollmentInvoice) so fees appear on the parent portal
  // without a separate Generate Invoice step. The Promote endpoint itself
  // only validates that a payment structure exists for the target class —
  // it doesn't create invoices.
  invoiceDueDate?: string
}

interface UsePromoteStudentsOptions {
  onSuccess?: (data: PromoteStudentsResponseI) => void
}

export const usePromoteStudents = ({
  onSuccess,
}: UsePromoteStudentsOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutateAsync, isPending } = useMutation<
    PromoteStudentsResponseI,
    Error,
    PromoteStudentsPayloadI
  >({
    mutationFn: async ({
      studentIds,
      schoolId,
      sourceSessionId,
      sourceTermId,
      sourceClassId,
      targetSchoolClassId,
      targetSchoolArmId,
      targetSchoolSessionId,
      targetSchoolSessionTermId,
      invoiceDueDate,
    }) => {
      const result = await promoteStudentsApi({
        schoolId,
        sourceSessionId,
        sourceTermId,
        sourceClassId,
        studentIds,
        targetSchoolSessionId,
        targetSchoolSessionTermId,
        targetSchoolClassId,
        targetSchoolArmId,
      })

      // Best-effort: for each promoted student, generate their invoice if a
      // Payment Type already covers the destination class/session/term.
      // Never blocks or fails the promotion itself.
      if (invoiceDueDate) {
        await Promise.allSettled(
          studentIds.map(async (studentId) => {
            const detail = await getStudentByIdApi({ studentId, schoolId })
            return autoGenerateEnrollmentInvoice({
              schoolId,
              studentId,
              guardianId: detail.value?.guardians?.[0]?.id,
              schoolSessionId: targetSchoolSessionId,
              schoolSessionTermId: targetSchoolSessionTermId,
              schoolClassId: targetSchoolClassId,
              dueDate: invoiceDueDate,
            })
          })
        )
      }

      return result
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.schoolStudents] })
      queryClient.invalidateQueries({ queryKey: [queryKeys.studentById] })
        queryClient.invalidateQueries({ queryKey: [queryKeys.studentDetail] })
        queryClient.invalidateQueries({ queryKey: [queryKeys.studentDashboardOverview] })
      queryClient.invalidateQueries({
        queryKey: [queryKeys.studentsForPromotion],
      })

      const count = variables.studentIds.length
      toast.success(
        data.message ||
          `${count} student${count === 1 ? "" : "s"} promoted successfully`
      )
      onSuccess?.(data)
    },
    onError: (err) => toast.error(err?.message ?? "Failed to promote students"),
  })

  return { promoteStudents: mutateAsync, isPending }
}

export const useGetStudentsForPromotion = (
  params: GetStudentsForPromotionParamsI
) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetStudentsForPromotionResponseI>({
      queryKey: [queryKeys.studentsForPromotion, params],
      queryFn: () => getStudentsForPromotionApi(params),
      enabled:
        !!params.schoolId &&
        !!params.sessionId &&
        !!params.termId &&
        !!params.classId,
      staleTime: 60 * 1000,
      gcTime: 5 * 60 * 1000,
    })

  return {
    students: data?.value?.items ?? [],
    pagination: {
      pageNumber: data?.value?.pageNumber ?? 1,
      pageSize: data?.value?.pageSize ?? 10,
      totalItems: data?.value?.totalItems ?? 0,
      totalPages: data?.value?.totalPages ?? 0,
    },
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

export const useSearchStudents = (params: SearchStudentsParamsI) => {
  const { data, isPending, isFetching, isError, error, isSuccess, refetch } =
    useQuery<SearchStudentsResponseI>({
      queryKey: [queryKeys.studentSearch, params],
      queryFn: () => searchStudentsApi(params),
      enabled: (params.keyword?.trim().length ?? 0) >= 3 && !!params.schoolId,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })

  return {
    results: data?.value ?? [],
    isLoading: isFetching,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

export const useGetSchoolStudents = (params: GetSchoolStudentsParamsI) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetSchoolStudentsResponseI>({
      queryKey: [queryKeys.schoolStudents, params],
      queryFn: () => getSchoolStudentsApi(params),
      enabled: !!params.schoolId,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })

  return {
    students: data?.value?.items ?? [],
    pagination: {
      pageNumber: data?.value?.pageNumber ?? 1,
      pageSize: data?.value?.pageSize ?? 10,
      totalItems: data?.value?.totalItems ?? 0,
      totalPages: data?.value?.totalPages ?? 0,
    },
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

export interface SchoolStudentWithClassI {
  id: string
  studentId?: string
  firstName: string
  lastName: string
  class: string
  arm?: string
  isEnrolled: boolean
  enrollmentStatus: EnrollmentStatus
}

/**
 * Lightweight school roster. Class information is intentionally not expanded
 * with one detail request per student; class-aware screens should use their
 * class roster/session endpoint instead.
 */
export const useGetSchoolStudentsWithClass = (schoolId: string) => {
  const { students: baseStudents, isLoading } = useGetSchoolStudents({
    schoolId,
    pageSize: 500,
  })

  const students: SchoolStudentWithClassI[] = baseStudents.map((base) => ({
    id: base.studentId,
    studentId: base.studentGivenId,
    firstName: base.firstname,
    lastName: base.lastname,
    class: "",
    isEnrolled: base.isEnrolled,
    enrollmentStatus: statusFromApi(base.status),
  }))

  return { students, isLoading }
}

export const useGetStudentById = (params: GetStudentByIdParamsI) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetStudentByIdResponseI>({
      queryKey: [queryKeys.studentById, params],
      queryFn: () => getStudentByIdApi(params),
      enabled: !!params.studentId && !!params.schoolId,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })

  return {
    student: data?.value,
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

// Admin Student Details page — full profile (guardians, feeStatus, subjects,
// classTimetable, medicalInformation) from the single GetById call, so the
// page never needs to fetch any of that separately. See getStudentDetailApi.
export const useGetStudentDetail = (params: GetStudentByIdParamsI) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<StudentDetailDataI>({
      queryKey: [queryKeys.studentDetail, params],
      queryFn: () => getStudentDetailApi(params),
      enabled: !!params.studentId && !!params.schoolId,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })

  return {
    student: data,
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

interface UseAdminResetStudentPasswordOptions {
  onSuccess?: (data: AdminResetStudentPasswordResponseI) => void
  onError?: (error: Error) => void
}

export const useAdminResetStudentPassword = ({
  onSuccess,
  onError,
}: UseAdminResetStudentPasswordOptions = {}) => {
  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<
      AdminResetStudentPasswordResponseI,
      Error,
      AdminResetStudentPasswordPayloadI
    >({
      mutationFn: adminResetStudentPasswordApi,
      onSuccess: (data) => {
        toast.success("Student password reset successfully.")
        onSuccess?.(data)
      },
      onError: (err) => {
        toast.error(err?.message ?? "Failed to reset student password")
        onError?.(err)
      },
    })

  return {
    adminResetStudentPassword: mutate,
    adminResetStudentPasswordAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

export const useGetStudentDashboardOverview = (schoolId: string) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetStudentDashboardOverviewResponseI>({
      queryKey: [queryKeys.studentDashboardOverview, schoolId],
      queryFn: () => getStudentDashboardOverviewApi(schoolId),
      enabled: !!schoolId,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })

  return {
    overview: data?.value,
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

// ─── Student courses (E-Learning) ─────────────────────────────────────────────

export const useGetStudentCourses = (params: {
  studentId?: string
  schoolId?: string
}) => {
  const { studentId, schoolId } = params
  const { data, isPending, isError, error, refetch } =
    useQuery<GetStudentCoursesResponseI>({
      queryKey: ["student-courses", studentId, schoolId],
      queryFn: () => getStudentCoursesApi(studentId!, schoolId!),
      enabled: !!studentId && !!schoolId,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })
  return {
    courses: data?.value ?? [],
    isLoading: isPending,
    isError,
    error,
    refetch,
  }
}

// ─── Student Self-Service Portal (StudentPortalController) ──────────────────

export const useGetStudentPortalOverview = (
  params: GetStudentPortalOverviewParamsI
) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetStudentPortalOverviewResponseI>({
      queryKey: [queryKeys.studentPortalOverview, params],
      queryFn: () => getStudentPortalOverviewApi(params),
      enabled: !!params.studentId && !!params.schoolId,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })

  return {
    overview: data?.value,
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

export const useGetStudentPortalTimetable = (
  params: GetStudentPortalTimetableParamsI
) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetStudentPortalTimetableResponseI>({
      queryKey: [queryKeys.studentPortalTimetable, params],
      queryFn: () => getStudentPortalTimetableApi(params),
      enabled: !!params.studentId && !!params.schoolId,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })

  return {
    timetable: data?.value,
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

export const useGetStudentPortalResults = (
  params: GetStudentPortalResultsParamsI
) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetStudentPortalResultsResponseI>({
      queryKey: [queryKeys.studentPortalResults, params],
      queryFn: () => getStudentPortalResultsApi(params),
      enabled: !!params.studentId && !!params.schoolId,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      // "Not published yet" (404 + a clear message) is a well-defined
      // outcome, not a transient failure — retrying it just repeats the
      // same response.
      retry: false,
    })

  return {
    result: data?.value,
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

export const useGetStudentPortalHostel = (
  params: GetStudentPortalHostelParamsI
) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetStudentPortalHostelResponseI>({
      queryKey: [queryKeys.studentPortalHostel, params],
      queryFn: () => getStudentPortalHostelApi(params),
      enabled: !!params.studentId && !!params.schoolId,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })

  return {
    assignment: data?.value,
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

export const useGetStudentPortalHealthRecord = (
  params: GetStudentPortalHealthRecordParamsI
) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetStudentPortalHealthRecordResponseI>({
      queryKey: [queryKeys.studentPortalHealthRecord, params],
      queryFn: () => getStudentPortalHealthRecordApi(params),
      enabled: !!params.studentId && !!params.schoolId,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })

  return {
    record: data?.value,
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

export interface StudentPortalSickBayVisitForStudentI extends StudentPortalSickBayVisitI {
  studentId: string
}

export const useGetStudentPortalHealthRecordsForChildren = (
  schoolId: string,
  studentIds: string[]
) => {
  const queries = useQueries({
    queries: studentIds.map((studentId) => ({
      queryKey: [queryKeys.studentPortalHealthRecord, { studentId, schoolId }],
      queryFn: () => getStudentPortalHealthRecordApi({ studentId, schoolId }),
      enabled: !!schoolId && !!studentId,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })),
  })

  const sickBayVisits: StudentPortalSickBayVisitForStudentI[] =
    studentIds.flatMap((studentId, i) =>
      (queries[i]?.data?.value?.sickBayVisits ?? []).map((v) => ({
        ...v,
        studentId,
      }))
    )

  return {
    sickBayVisits,
    isLoading: queries.some((q) => q.isPending),
  }
}

// ─── Student Portal bootstrap ────────────────────────────────────────────────

export const useGetStudentPortalLaunch = (
  studentId?: string,
  schoolId?: string
) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetStudentPortalLaunchResponseI>({
      queryKey: [queryKeys.studentPortalLaunch, studentId, schoolId],
      queryFn: () =>
        getStudentPortalLaunchApi({
          studentId: studentId!,
          schoolId: schoolId!,
        }),
      enabled: !!studentId && !!schoolId,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })

  return {
    launch: data?.value,
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

export const useGetStudentPortalTimetableByWeek = (
  studentId?: string,
  schoolId?: string,
  schoolClassId?: string,
  weekStartDate?: string
) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetStudentPortalTimetableByWeekResponseI>({
      queryKey: [
        queryKeys.studentPortalTimetableByWeek,
        studentId,
        schoolId,
        schoolClassId,
        weekStartDate,
      ],
      queryFn: () =>
        getStudentPortalTimetableByWeekApi({
          studentId: studentId!,
          schoolId: schoolId!,
          schoolClassId,
          weekStartDate,
        }),
      enabled: !!studentId && !!schoolId,
      staleTime: 2 * 60 * 1000,
      gcTime: 5 * 60 * 1000,
    })

  return {
    timetable: data?.value,
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

export const useGetMyAttendance = (params: GetMyAttendanceParamsI) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetMyAttendanceResponseI>({
      // Class, session, term and date range all live in the key so a stale
      // filter combination's cached response can never be shown.
      queryKey: [queryKeys.studentMyAttendance, params],
      queryFn: () => getMyAttendanceApi(params),
      enabled:
        !!params.studentId &&
        !!params.schoolId &&
        // Never fire with an invalid range — validated once here rather
        // than by every caller.
        !(
          params.startDate &&
          params.endDate &&
          params.startDate > params.endDate
        ),
      staleTime: 60 * 1000,
      gcTime: 5 * 60 * 1000,
    })

  return {
    attendance: data?.value,
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}
