import { useAuthStore } from "@/store/auth.store"
import {
  bulkCreateSubjectsApi,
  createSubjectApi,
  updateSubjectApi,
  deleteSubjectApi,
  getSubjectByIdApi,
  getAllSubjectsApi,
  createClassApi,
  updateClassApi,
  deleteClassApi,
  getClassArmsApi,
  assignClassArmsApi,
  getAllClassesApi,
  getClassByIdApi,
  getSecondaryClassesApi,
  createCategoryApi,
  updateCategoryApi,
  deleteCategoryApi,
  getAllCategoriesApi,
  getCategoryByIdApi,
  createSchoolArmApi,
  updateSchoolArmApi,
  deleteSchoolArmApi,
  getSchoolArmByIdApi,
  getAllSchoolArmsApi,
  createDepartmentApi,
  updateDepartmentApi,
  deleteDepartmentApi,
  getDepartmentsBySchoolApi,
  getDepartmentsBySchoolPaginatedApi,
  getDepartmentByIdApi,
  createSchoolGradeApi,
  updateSchoolGradeApi,
  deleteSchoolGradeApi,
  getSchoolGradesBySchoolApi,
  getSchoolGradesBySchoolPaginatedApi,
  getSchoolGradeByIdApi,
  createSchoolAssessmentApi,
  updateSchoolAssessmentApi,
  deleteSchoolAssessmentApi,
  getSchoolAssessmentsBySchoolApi,
  getSchoolAssessmentsBySchoolPaginatedApi,
  getSchoolAssessmentByIdApi,
  assignClassSubjectApi,
  removeClassSubjectApi,
  getSubjectsByClassApi,
  getClassesBySubjectApi,
  getMyGradeClassesApi,
  getMyGradeSubjectsApi,
  getGradeWorksheetApi,
  submitGradeWorksheetApi,
  saveGradeWorksheetDraftApi,
  getAllGradeWorksheetsApi,
  getGradeWorksheetByIdApi,
  approveGradeWorksheetApi,
  rejectGradeWorksheetApi,
  lookupStudentResultApi,
  assignSubUserClassApi,
  removeSubUserClassApi,
  getSubUserClassesBySubUserApi,
  getSubUserClassesByClassApi,
  getSubUserSubjectsBySubUserApi,
  getTeacherDetailsApi,
  assignSubUserSubjectApi,
  removeSubUserSubjectApi,
  getSubUserSubjectsBySubjectApi,
  assignSubUserDepartmentApi,
  removeSubUserDepartmentApi,
  getSubUserDepartmentsByDepartmentApi,
  getSubUserDepartmentsBySubUserApi,
  getClassDashboardApi,
  getClassResultDetailsApi,
  getStudentResultDetailsApi,
  publishClassResultApi,
  publishStudentResultApi,
  getClassStudentsForGradingApi,
  getStudentSubjectScoresApi,
  saveStudentScoresDraftApi,
  getExamRecordsOverviewApi,
  getAutomatedScoreContributionsApi,
} from "@/api/examAndRecords.api"
import {
  getBroadsheetApi,
  saveBroadsheetDraftApi,
  submitBroadsheetApi,
} from "@/api/examAndRecords.api/broadsheet.api"
import type {
  BulkCreateSubjectsPayloadI,
  BulkCreateSubjectsResponseI,
  CreateSubjectPayloadI,
  CreateSubjectResponseI,
  UpdateSubjectPayloadI,
  UpdateSubjectResponseI,
  DeleteSubjectPayloadI,
  DeleteSubjectResponseI,
  GetSubjectByIdResponseI,
  GetAllSubjectsParams,
  GetAllSubjectsPaginatedResponseI,
  SubjectItem,
  SubjectListItemI,
  CreateClassPayloadI,
  CreateClassResponseI,
  UpdateClassPayloadI,
  UpdateClassResponseI,
  DeleteClassResponseI,
  GetClassArmsResponseI,
  AssignClassArmsPayloadI,
  AssignClassArmsResponseI,
  GetAllClassesParams,
  GetAllClassesResponseI,
  GetClassByIdResponseI,
  GetSecondaryClassesResponseI,
  CreateCategoryPayloadI,
  CreateCategoryResponseI,
  UpdateCategoryPayloadI,
  UpdateCategoryResponseI,
  DeleteCategoryResponseI,
  GetAllCategoriesParams,
  GetAllCategoriesResponseI,
  GetCategoryByIdResponseI,
  CreateSchoolArmPayloadI,
  CreateSchoolArmResponseI,
  UpdateSchoolArmPayloadI,
  UpdateSchoolArmResponseI,
  DeleteSchoolArmPayloadI,
  DeleteSchoolArmResponseI,
  GetSchoolArmByIdResponseI,
  GetAllSchoolArmsResponseI,
  CreateDepartmentPayloadI,
  CreateDepartmentResponseI,
  UpdateDepartmentPayloadI,
  UpdateDepartmentResponseI,
  DeleteDepartmentResponseI,
  GetDepartmentsBySchoolResponseI,
  GetDepartmentsBySchoolPaginatedParams,
  GetDepartmentsBySchoolPaginatedResponseI,
  GetDepartmentByIdResponseI,
  CreateSchoolGradePayloadI,
  CreateSchoolGradeResponseI,
  UpdateSchoolGradePayloadI,
  UpdateSchoolGradeResponseI,
  DeleteSchoolGradeResponseI,
  GetSchoolGradesBySchoolResponseI,
  GetSchoolGradesBySchoolPaginatedParams,
  GetSchoolGradesBySchoolPaginatedResponseI,
  GetSchoolGradeByIdResponseI,
  CreateSchoolAssessmentPayloadI,
  CreateSchoolAssessmentResponseI,
  UpdateSchoolAssessmentPayloadI,
  UpdateSchoolAssessmentResponseI,
  DeleteSchoolAssessmentResponseI,
  GetSchoolAssessmentsBySchoolParams,
  GetSchoolAssessmentsBySchoolResponseI,
  GetSchoolAssessmentsBySchoolPaginatedParams,
  GetSchoolAssessmentsBySchoolPaginatedResponseI,
  GetSchoolAssessmentByIdResponseI,
  AssignClassSubjectPayloadI,
  AssignClassSubjectResponseI,
  RemoveClassSubjectResponseI,
  GetSubjectsByClassParams,
  GetSubjectsByClassResponseI,
  GetClassesBySubjectParams,
  GetClassesBySubjectResponseI,
  GetGradeMyClassesParamsI,
  GetGradeMyClassesResponseI,
  GetGradeMySubjectsParamsI,
  GetGradeMySubjectsResponseI,
  GetGradeWorksheetParamsI,
  GetGradeWorksheetResponseI,
  SubmitGradeWorksheetPayloadI,
  SubmitGradeWorksheetResponseI,
  SaveGradeWorksheetDraftResponseI,
  GetAllGradeWorksheetsParamsI,
  GetAllGradeWorksheetsResponseI,
  GetGradeWorksheetByIdResponseI,
  ApproveGradeWorksheetResponseI,
  RejectGradeWorksheetPayloadI,
  RejectGradeWorksheetResponseI,
  LookupStudentResultPayloadI,
  LookupStudentResultResponseI,
  AssignSubUserClassPayloadI,
  AssignSubUserClassResponseI,
  RemoveSubUserClassResponseI,
  GetSubUserClassesBySubUserResponseI,
  GetSubUserClassesByClassParamsI,
  GetSubUserClassesByClassResponseI,
  GetSubUserSubjectsBySubUserResponseI,
  GetTeacherDetailsParamsI,
  TeacherDetailsResponseI,
  AssignSubUserSubjectPayloadI,
  AssignSubUserSubjectResponseI,
  RemoveSubUserSubjectResponseI,
  GetSubUserSubjectsBySubjectParamsI,
  GetSubUserSubjectsBySubjectResponseI,
  AssignSubUserDepartmentPayloadI,
  AssignSubUserDepartmentResponseI,
  RemoveSubUserDepartmentResponseI,
  GetSubUserDepartmentsByDepartmentResponseI,
  GetSubUserDepartmentsBySubUserResponseI,
  ClassDashboardParamsI,
  ClassDashboardResponseI,
  ClassResultDetailsParamsI,
  ClassResultDetailsResponseI,
  StudentResultDetailsResponseI,
  PublishClassResultResponseI,
  PublishStudentResultResponseI,
  ExamRecordsOverviewParamsI,
  ExamRecordsOverviewResponseI,
  GetClassStudentsForGradingParamsI,
  GetClassStudentsForGradingResponseI,
  GetStudentSubjectScoresParamsI,
  GetStudentSubjectScoresResponseI,
  SaveStudentScoresDraftPayloadI,
  SaveStudentScoresDraftResponseI,
  BroadsheetResponseDto,
  SaveBroadsheetDraftCommand,
  SaveBroadsheetDraftResponseI,
  SubmitBroadsheetCommand,
  SubmitBroadsheetResponseDto,
  AutomatedScoreContributionAuditParamsI,
  AutomatedScoreContributionAuditResponseI,
} from "@/api/examAndRecords.api/types"
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { queryKeys } from "@/utils/queryKeys"
import { toast } from "sonner"
import { ApiError } from "@/api/api"

interface UseBulkCreateSubjectsOptions {
  onSuccess?: (data: BulkCreateSubjectsResponseI) => void
  onError?: (error: Error) => void
}

export const useBulkCreateSubjects = ({
  onSuccess,
  onError,
}: UseBulkCreateSubjectsOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<BulkCreateSubjectsResponseI, Error, BulkCreateSubjectsPayloadI>(
      {
        mutationFn: bulkCreateSubjectsApi,
        onSuccess: (data) => {
          queryClient.invalidateQueries({
            queryKey: [queryKeys.schoolSubjects],
          })
          queryClient.invalidateQueries({ queryKey: ["public-schools"] })
          toast.success("Subjects created successfully")
          onSuccess?.(data)
        },
        onError,
      }
    )

  return {
    bulkCreateSubjects: mutate,
    bulkCreateSubjectsAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

interface UseCreateSubjectOptions {
  onSuccess?: (data: CreateSubjectResponseI) => void
  onError?: (error: Error) => void
}

export const useCreateSubject = ({
  onSuccess,
  onError,
}: UseCreateSubjectOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<CreateSubjectResponseI, Error, CreateSubjectPayloadI>({
      mutationFn: createSubjectApi,
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: [queryKeys.schoolSubjects] })
        queryClient.invalidateQueries({ queryKey: ["public-schools"] })
        toast.success("Subject created successfully")
        onSuccess?.(data)
      },
      onError,
    })

  return {
    createSubject: mutate,
    createSubjectAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

interface UseUpdateSubjectOptions {
  onSuccess?: (data: UpdateSubjectResponseI) => void
  onError?: (error: Error) => void
}

export const useUpdateSubject = ({
  onSuccess,
  onError,
}: UseUpdateSubjectOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<UpdateSubjectResponseI, Error, UpdateSubjectPayloadI>({
      mutationFn: updateSubjectApi,
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: [queryKeys.schoolSubjects] })
        queryClient.invalidateQueries({ queryKey: ["public-schools"] })
        toast.success("Subject updated successfully")
        onSuccess?.(data)
      },
      onError,
    })

  return {
    updateSubject: mutate,
    updateSubjectAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

interface UseDeleteSubjectOptions {
  onSuccess?: (data: DeleteSubjectResponseI) => void
  onError?: (error: Error) => void
}

export const useDeleteSubject = ({
  onSuccess,
  onError,
}: UseDeleteSubjectOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<DeleteSubjectResponseI, Error, DeleteSubjectPayloadI>({
      mutationFn: deleteSubjectApi,
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: [queryKeys.schoolSubjects] })
        queryClient.invalidateQueries({ queryKey: ["public-schools"] })
        toast.success("Subject deleted successfully")
        onSuccess?.(data)
      },
      onError,
    })

  return {
    deleteSubject: mutate,
    deleteSubjectAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

export const useGetSubjectById = (id: string) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetSubjectByIdResponseI>({
      queryKey: [queryKeys.schoolSubjects, id],
      queryFn: () => getSubjectByIdApi(id),
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })

  return {
    subject: data?.Value,
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

function toSubjectItem(item: SubjectListItemI): SubjectItem {
  return { Id: item.id, SchoolId: item.schoolId, Name: item.name, Description: item.description, IsPublic: item.isPublic }
}

export const useGetAllSubjects = (schoolId: string) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetAllSubjectsPaginatedResponseI>({
      queryKey: [queryKeys.schoolSubjects, schoolId, "all"],
      queryFn: () => getAllSubjectsApi({ schoolId, pageSize: 1000 }),
      enabled: !!schoolId,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })

  return {
    subjects: (data?.value?.items ?? []).map(toSubjectItem),
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

export const useGetAllSubjectsPaginated = (params: GetAllSubjectsParams) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetAllSubjectsPaginatedResponseI>({
      queryKey: [queryKeys.schoolSubjects, "paginated", params],
      queryFn: () => getAllSubjectsApi(params),
      enabled: !!params.schoolId,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })

  return {
    subjects: (data?.value?.items ?? []).map(toSubjectItem),
    pagination: data?.value
      ? {
          totalItems: data.value.totalItems,
          pageNumber: data.value.pageNumber,
          pageSize: data.value.pageSize,
          totalPages: data.value.totalPages,
        }
      : null,
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

interface UseCreateClassOptions {
  onSuccess?: (data: CreateClassResponseI) => void
  onError?: (error: Error) => void
}

export const useCreateClass = ({
  onSuccess,
  onError,
}: UseCreateClassOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<CreateClassResponseI, Error, CreateClassPayloadI>({
      mutationFn: createClassApi,
      onSuccess: (data) => {
        if (!data?.IsSuccess) {
          toast.error(data?.Error ?? "Failed to create class")
          return
        }
        queryClient.invalidateQueries({ queryKey: [queryKeys.schoolClasses] })
        toast.success("Class created successfully")
        onSuccess?.(data)
      },
      onError: (err) => {
        toast.error(err?.message ?? "An unexpected error occurred")
        onError?.(err)
      },
    })

  return {
    createClass: mutate,
    createClassAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

interface UseUpdateClassOptions {
  onSuccess?: (data: UpdateClassResponseI) => void
  onError?: (error: Error) => void
}

export const useUpdateClass = ({
  onSuccess,
  onError,
}: UseUpdateClassOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<UpdateClassResponseI, Error, UpdateClassPayloadI>({
      mutationFn: updateClassApi,
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: [queryKeys.schoolClasses] })
        toast.success("Class updated successfully")
        onSuccess?.(data)
      },
      onError,
    })

  return {
    updateClass: mutate,
    updateClassAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

interface UseDeleteClassOptions {
  onSuccess?: (data: DeleteClassResponseI) => void
  onError?: (error: Error) => void
}

export const useDeleteClass = ({
  onSuccess,
  onError,
}: UseDeleteClassOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<DeleteClassResponseI, Error, string>({
      mutationFn: deleteClassApi,
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: [queryKeys.schoolClasses] })
        toast.success("Class deleted successfully")
        onSuccess?.(data)
      },
      onError,
    })

  return {
    deleteClass: mutate,
    deleteClassAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

export const useGetClassArms = (classId: string) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetClassArmsResponseI>({
      queryKey: [queryKeys.schoolClasses, "arms", classId],
      queryFn: () => getClassArmsApi(classId),
      enabled: !!classId,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })

  return {
    classArms: data?.Value ?? [],
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

export const useAssignClassArms = () => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<AssignClassArmsResponseI, Error, AssignClassArmsPayloadI>({
      mutationFn: assignClassArmsApi,
      onSuccess: (data) => {
        if (!data?.isSuccess) {
          toast.error(data?.error ?? "Failed to assign arms")
          return
        }
        queryClient.invalidateQueries({ queryKey: [queryKeys.schoolClasses] })
        toast.success("Arms assigned successfully")
      },
      onError: () => toast.error("An unexpected error occurred"),
    })

  return {
    assignClassArms: mutate,
    assignClassArmsAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

export const useGetAllClasses = (params: GetAllClassesParams) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetAllClassesResponseI>({
      queryKey: [queryKeys.schoolClasses, params],
      queryFn: () => getAllClassesApi(params),
      enabled: !!(params.schoolId || params.categoryId),
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })

  return {
    classes: data?.Value?.Items ?? [],
    pagination: data?.Value
      ? {
          totalItems: data.Value.TotalItems,
          pageNumber: data.Value.PageNumber,
          pageSize: data.Value.PageSize,
          totalPages: data.Value.TotalPages,
        }
      : null,
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

export const useGetClassById = (id: string) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetClassByIdResponseI>({
      queryKey: [queryKeys.schoolClasses, id],
      queryFn: () => getClassByIdApi(id),
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })

  return {
    schoolClass: data?.Value,
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

export const useGetSecondaryClasses = (schoolId: string) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetSecondaryClassesResponseI>({
      queryKey: [queryKeys.schoolClasses, "secondary", schoolId],
      queryFn: () => getSecondaryClassesApi(schoolId),
      enabled: !!schoolId,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })

  return {
    secondaryClasses: data?.value ?? [],
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

interface UseCreateCategoryOptions {
  onSuccess?: (data: CreateCategoryResponseI) => void
  onError?: (error: Error) => void
}

export const useCreateCategory = ({
  onSuccess,
  onError,
}: UseCreateCategoryOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<CreateCategoryResponseI, Error, CreateCategoryPayloadI>({
      mutationFn: createCategoryApi,
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: [queryKeys.classCategories] })
        toast.success("Category created successfully")
        onSuccess?.(data)
      },
      onError,
    })

  return {
    createCategory: mutate,
    createCategoryAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

interface UseUpdateCategoryOptions {
  onSuccess?: (data: UpdateCategoryResponseI) => void
  onError?: (error: Error) => void
}

export const useUpdateCategory = ({
  onSuccess,
  onError,
}: UseUpdateCategoryOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<UpdateCategoryResponseI, Error, UpdateCategoryPayloadI>({
      mutationFn: updateCategoryApi,
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: [queryKeys.classCategories] })
        toast.success("Category updated successfully")
        onSuccess?.(data)
      },
      onError,
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

interface UseDeleteCategoryOptions {
  onSuccess?: (data: DeleteCategoryResponseI) => void
  onError?: (error: Error) => void
}

export const useDeleteCategory = ({
  onSuccess,
  onError,
}: UseDeleteCategoryOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<DeleteCategoryResponseI, Error, string>({
      mutationFn: deleteCategoryApi,
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: [queryKeys.classCategories] })
        toast.success("Category deleted successfully")
        onSuccess?.(data)
      },
      onError,
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

export const useGetAllCategories = (params: GetAllCategoriesParams) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetAllCategoriesResponseI>({
      queryKey: [queryKeys.classCategories, params],
      queryFn: () => getAllCategoriesApi(params),
      enabled: !!params.schoolId,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })

  return {
    categories: data?.Value?.Items ?? [],
    pagination: data?.Value
      ? {
          totalItems: data.Value.TotalItems,
          pageNumber: data.Value.PageNumber,
          pageSize: data.Value.PageSize,
          totalPages: data.Value.TotalPages,
        }
      : null,
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

export const useGetCategoryById = (id: string) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetCategoryByIdResponseI>({
      queryKey: [queryKeys.classCategories, id],
      queryFn: () => getCategoryByIdApi(id),
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })

  return {
    category: data?.Value,
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

interface UseCreateSchoolArmOptions {
  onSuccess?: (data: CreateSchoolArmResponseI) => void
  onError?: (error: Error) => void
}

export const useCreateSchoolArm = ({
  onSuccess,
  onError,
}: UseCreateSchoolArmOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<CreateSchoolArmResponseI, Error, CreateSchoolArmPayloadI>({
      mutationFn: createSchoolArmApi,
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: [queryKeys.schoolArms] })
        toast.success("Arm created successfully")
        onSuccess?.(data)
      },
      onError,
    })

  return {
    createSchoolArm: mutate,
    createSchoolArmAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

interface UseUpdateSchoolArmOptions {
  onSuccess?: (data: UpdateSchoolArmResponseI) => void
  onError?: (error: Error) => void
}

export const useUpdateSchoolArm = ({
  onSuccess,
  onError,
}: UseUpdateSchoolArmOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<UpdateSchoolArmResponseI, Error, UpdateSchoolArmPayloadI>({
      mutationFn: updateSchoolArmApi,
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: [queryKeys.schoolArms] })
        toast.success("Arm updated successfully")
        onSuccess?.(data)
      },
      onError,
    })

  return {
    updateSchoolArm: mutate,
    updateSchoolArmAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

interface UseDeleteSchoolArmOptions {
  onSuccess?: (data: DeleteSchoolArmResponseI) => void
  onError?: (error: Error) => void
}

export const useDeleteSchoolArm = ({
  onSuccess,
  onError,
}: UseDeleteSchoolArmOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<DeleteSchoolArmResponseI, Error, DeleteSchoolArmPayloadI>({
      mutationFn: deleteSchoolArmApi,
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: [queryKeys.schoolArms] })
        toast.success("Arm deleted successfully")
        onSuccess?.(data)
      },
      onError,
    })

  return {
    deleteSchoolArm: mutate,
    deleteSchoolArmAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

export const useGetSchoolArmById = (id: string) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetSchoolArmByIdResponseI>({
      queryKey: [queryKeys.schoolArms, id],
      queryFn: () => getSchoolArmByIdApi(id),
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })

  return {
    schoolArm: data?.Value,
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

export const useGetAllSchoolArms = (schoolId: string) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetAllSchoolArmsResponseI>({
      queryKey: [queryKeys.schoolArms, schoolId],
      queryFn: () => getAllSchoolArmsApi(schoolId),
      enabled: !!schoolId,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })

  return {
    schoolArms: data?.Value ?? [],
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

interface UseCreateDepartmentOptions {
  onSuccess?: (data: CreateDepartmentResponseI) => void
  onError?: (error: Error) => void
}

export const useCreateDepartment = ({
  onSuccess,
  onError,
}: UseCreateDepartmentOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<CreateDepartmentResponseI, Error, CreateDepartmentPayloadI>({
      mutationFn: createDepartmentApi,
      onSuccess: (data) => {
        queryClient.invalidateQueries({
          queryKey: [queryKeys.schoolDepartments],
        })
        toast.success("Department created successfully")
        onSuccess?.(data)
      },
      onError,
    })

  return {
    createDepartment: mutate,
    createDepartmentAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

interface UseUpdateDepartmentOptions {
  onSuccess?: (data: UpdateDepartmentResponseI) => void
  onError?: (error: Error) => void
}

export const useUpdateDepartment = ({
  onSuccess,
  onError,
}: UseUpdateDepartmentOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<UpdateDepartmentResponseI, Error, UpdateDepartmentPayloadI>({
      mutationFn: updateDepartmentApi,
      onSuccess: (data) => {
        queryClient.invalidateQueries({
          queryKey: [queryKeys.schoolDepartments],
        })
        toast.success("Department updated successfully")
        onSuccess?.(data)
      },
      onError,
    })

  return {
    updateDepartment: mutate,
    updateDepartmentAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

interface UseDeleteDepartmentOptions {
  onSuccess?: (data: DeleteDepartmentResponseI) => void
  onError?: (error: Error) => void
}

export const useDeleteDepartment = ({
  onSuccess,
  onError,
}: UseDeleteDepartmentOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<DeleteDepartmentResponseI, Error, string>({
      mutationFn: deleteDepartmentApi,
      onSuccess: (data) => {
        queryClient.invalidateQueries({
          queryKey: [queryKeys.schoolDepartments],
        })
        toast.success("Department deleted successfully")
        onSuccess?.(data)
      },
      onError,
    })

  return {
    deleteDepartment: mutate,
    deleteDepartmentAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

export const useGetDepartmentsBySchool = (schoolId: string) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetDepartmentsBySchoolResponseI>({
      queryKey: [queryKeys.schoolDepartments, schoolId],
      queryFn: () => getDepartmentsBySchoolApi(schoolId),
      enabled: !!schoolId,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })

  return {
    departments: data?.Value ?? [],
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

export const useGetDepartmentsBySchoolPaginated = (
  params: GetDepartmentsBySchoolPaginatedParams
) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetDepartmentsBySchoolPaginatedResponseI>({
      queryKey: [queryKeys.schoolDepartments, "paginated", params],
      queryFn: () => getDepartmentsBySchoolPaginatedApi(params),
      enabled: !!params.schoolId,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })

  return {
    departments: data?.Value?.Items ?? [],
    pagination: data?.Value
      ? {
          totalItems: data.Value.TotalItems,
          pageNumber: data.Value.PageNumber,
          pageSize: data.Value.PageSize,
          totalPages: data.Value.TotalPages,
        }
      : null,
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

export const useGetDepartmentById = (id: string) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetDepartmentByIdResponseI>({
      queryKey: [queryKeys.schoolDepartments, id],
      queryFn: () => getDepartmentByIdApi(id),
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })

  return {
    department: data?.Value,
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

interface UseCreateSchoolGradeOptions {
  onSuccess?: (data: CreateSchoolGradeResponseI) => void
  onError?: (error: Error) => void
}

export const useCreateSchoolGrade = ({
  onSuccess,
  onError,
}: UseCreateSchoolGradeOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<CreateSchoolGradeResponseI, Error, CreateSchoolGradePayloadI>({
      mutationFn: createSchoolGradeApi,
      onSuccess: (data) => {
        if (!data?.IsSuccess) {
          toast.error(data?.Error ?? "Failed to create grade")
          return
        }
        queryClient.invalidateQueries({ queryKey: [queryKeys.schoolGrades] })
        toast.success("Grade created successfully")
        onSuccess?.(data)
      },
      onError: (err) => {
        toast.error(err?.message ?? "An unexpected error occurred")
        onError?.(err)
      },
    })

  return {
    createSchoolGrade: mutate,
    createSchoolGradeAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

interface UseUpdateSchoolGradeOptions {
  onSuccess?: (data: UpdateSchoolGradeResponseI) => void
  onError?: (error: Error) => void
}

export const useUpdateSchoolGrade = ({
  onSuccess,
  onError,
}: UseUpdateSchoolGradeOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<UpdateSchoolGradeResponseI, Error, UpdateSchoolGradePayloadI>({
      mutationFn: updateSchoolGradeApi,
      onSuccess: (data) => {
        if (!data?.IsSuccess) {
          toast.error(data?.Error ?? "Failed to update grade")
          return
        }
        queryClient.invalidateQueries({ queryKey: [queryKeys.schoolGrades] })
        toast.success("Grade updated successfully")
        onSuccess?.(data)
      },
      onError: (err) => {
        toast.error(err?.message ?? "An unexpected error occurred")
        onError?.(err)
      },
    })

  return {
    updateSchoolGrade: mutate,
    updateSchoolGradeAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

interface UseDeleteSchoolGradeOptions {
  onSuccess?: (data: DeleteSchoolGradeResponseI) => void
  onError?: (error: Error) => void
}

export const useDeleteSchoolGrade = ({
  onSuccess,
  onError,
}: UseDeleteSchoolGradeOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<DeleteSchoolGradeResponseI, Error, string>({
      mutationFn: deleteSchoolGradeApi,
      onSuccess: (data) => {
        if (!data?.IsSuccess) {
          toast.error(data?.Error ?? "Failed to delete grade")
          return
        }
        queryClient.invalidateQueries({ queryKey: [queryKeys.schoolGrades] })
        toast.success("Grade deleted successfully")
        onSuccess?.(data)
      },
      onError: (err) => {
        toast.error(err?.message ?? "An unexpected error occurred")
        onError?.(err)
      },
    })

  return {
    deleteSchoolGrade: mutate,
    deleteSchoolGradeAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

export const useGetSchoolGradesBySchool = (schoolId: string) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetSchoolGradesBySchoolResponseI>({
      queryKey: [queryKeys.schoolGrades, "all", schoolId],
      queryFn: () => getSchoolGradesBySchoolApi(schoolId),
      enabled: !!schoolId,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })

  return {
    grades: data?.Value ?? [],
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

export const useGetSchoolGradesBySchoolPaginated = (
  params: GetSchoolGradesBySchoolPaginatedParams
) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetSchoolGradesBySchoolPaginatedResponseI>({
      queryKey: [queryKeys.schoolGrades, "paginated", params],
      queryFn: () => getSchoolGradesBySchoolPaginatedApi(params),
      enabled: !!params.schoolId,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })

  return {
    grades: data?.Value?.Items ?? [],
    pagination: data?.Value
      ? {
          totalItems: data.Value.TotalItems,
          pageNumber: data.Value.PageNumber,
          pageSize: data.Value.PageSize,
          totalPages: data.Value.TotalPages,
        }
      : null,
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

export const useGetSchoolGradeById = (id: string) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetSchoolGradeByIdResponseI>({
      queryKey: [queryKeys.schoolGrades, id],
      queryFn: () => getSchoolGradeByIdApi(id),
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })

  return {
    grade: data?.Value,
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

// ─── SchoolAssessment hooks ───────────────────────────────────────────────────

interface UseCreateSchoolAssessmentOptions {
  onSuccess?: (data: CreateSchoolAssessmentResponseI) => void
  onError?: (error: Error) => void
}

export const useCreateSchoolAssessment = ({
  onSuccess,
  onError,
}: UseCreateSchoolAssessmentOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<
      CreateSchoolAssessmentResponseI,
      Error,
      CreateSchoolAssessmentPayloadI
    >({
      mutationFn: createSchoolAssessmentApi,
      onSuccess: (data) => {
        if (!data?.IsSuccess) {
          toast.error(data?.Error ?? "Failed to create assessment structure")
          return
        }
        queryClient.invalidateQueries({
          queryKey: [queryKeys.schoolAssessments],
        })
        toast.success("Assessment structure created successfully")
        onSuccess?.(data)
      },
      onError: (err) => {
        toast.error(err?.message ?? "An unexpected error occurred")
        onError?.(err)
      },
    })

  return {
    createSchoolAssessment: mutate,
    createSchoolAssessmentAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

interface UseUpdateSchoolAssessmentOptions {
  onSuccess?: (data: UpdateSchoolAssessmentResponseI) => void
  onError?: (error: Error) => void
}

export const useUpdateSchoolAssessment = ({
  onSuccess,
  onError,
}: UseUpdateSchoolAssessmentOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<
      UpdateSchoolAssessmentResponseI,
      Error,
      UpdateSchoolAssessmentPayloadI
    >({
      mutationFn: updateSchoolAssessmentApi,
      onSuccess: (data) => {
        if (!data?.IsSuccess) {
          toast.error(data?.Error ?? "Failed to update assessment structure")
          return
        }
        queryClient.invalidateQueries({
          queryKey: [queryKeys.schoolAssessments],
        })
        toast.success("Assessment structure updated successfully")
        onSuccess?.(data)
      },
      onError: (err) => {
        toast.error(err?.message ?? "An unexpected error occurred")
        onError?.(err)
      },
    })

  return {
    updateSchoolAssessment: mutate,
    updateSchoolAssessmentAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

interface UseDeleteSchoolAssessmentOptions {
  onSuccess?: (data: DeleteSchoolAssessmentResponseI) => void
  onError?: (error: Error) => void
}

export const useDeleteSchoolAssessment = ({
  onSuccess,
  onError,
}: UseDeleteSchoolAssessmentOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<DeleteSchoolAssessmentResponseI, Error, string>({
      mutationFn: deleteSchoolAssessmentApi,
      onSuccess: (data) => {
        if (!data?.IsSuccess) {
          toast.error(data?.Error ?? "Failed to delete assessment structure")
          return
        }
        queryClient.invalidateQueries({
          queryKey: [queryKeys.schoolAssessments],
        })
        toast.success("Assessment structure deleted successfully")
        onSuccess?.(data)
      },
      onError: (err) => {
        toast.error(err?.message ?? "An unexpected error occurred")
        onError?.(err)
      },
    })

  return {
    deleteSchoolAssessment: mutate,
    deleteSchoolAssessmentAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

export const useGetSchoolAssessmentsBySchool = (
  params: GetSchoolAssessmentsBySchoolParams
) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetSchoolAssessmentsBySchoolResponseI>({
      queryKey: [queryKeys.schoolAssessments, "all", params],
      queryFn: () => getSchoolAssessmentsBySchoolApi(params),
      enabled: !!params.schoolId,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })

  return {
    assessments: data?.Value ?? [],
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

export const useGetSchoolAssessmentsBySchoolPaginated = (
  params: GetSchoolAssessmentsBySchoolPaginatedParams
) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetSchoolAssessmentsBySchoolPaginatedResponseI>({
      queryKey: [queryKeys.schoolAssessments, "paginated", params],
      queryFn: () => getSchoolAssessmentsBySchoolPaginatedApi(params),
      enabled: !!params.schoolId,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })

  return {
    assessments: data?.Value?.Items ?? [],
    pagination: data?.Value
      ? {
          totalItems: data.Value.TotalItems,
          pageNumber: data.Value.PageNumber,
          pageSize: data.Value.PageSize,
          totalPages: data.Value.TotalPages,
        }
      : null,
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

export const useGetSchoolAssessmentById = (id: string) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetSchoolAssessmentByIdResponseI>({
      queryKey: [queryKeys.schoolAssessments, id],
      queryFn: () => getSchoolAssessmentByIdApi(id),
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })

  return {
    assessment: data?.Value,
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

// ─── ClassSubject hooks ──────────────────────────────────────────────────────

export const useAssignClassSubject = () => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<AssignClassSubjectResponseI, Error, AssignClassSubjectPayloadI>(
      {
        mutationFn: assignClassSubjectApi,
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: [queryKeys.classSubjects] })
          toast.success("Subject assigned successfully")
        },
        onError: (err) =>
          toast.error(err?.message ?? "Failed to assign subject"),
      }
    )

  return {
    assignClassSubject: mutate,
    assignClassSubjectAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

export const useRemoveClassSubject = () => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<RemoveClassSubjectResponseI, Error, string>({
      mutationFn: removeClassSubjectApi,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [queryKeys.classSubjects] })
        toast.success("Subject removed from class")
      },
      onError: (err) => toast.error(err?.message ?? "Failed to remove subject"),
    })

  return {
    removeClassSubject: mutate,
    removeClassSubjectAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

export const useGetSubjectsByClass = (params: GetSubjectsByClassParams) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetSubjectsByClassResponseI>({
      queryKey: [
        queryKeys.classSubjects,
        "by-class",
        params.classId,
        params.schoolId,
      ],
      queryFn: () => getSubjectsByClassApi(params),
      enabled: !!(params.classId && params.schoolId),
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })

  return {
    classSubjects: data?.value ?? [],
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

export const useGetClassesBySubject = (params: GetClassesBySubjectParams) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetClassesBySubjectResponseI>({
      queryKey: [
        queryKeys.classSubjects,
        "by-subject",
        params.subjectId,
        params.schoolId,
      ],
      queryFn: () => getClassesBySubjectApi(params),
      enabled: !!(params.subjectId && params.schoolId),
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })

  return {
    subjectClasses: data?.value ?? [],
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

// ─── Grade (Teacher Worksheets) ────────────────────────────────────────────────

export const useGetMyGradeClasses = (params: GetGradeMyClassesParamsI) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetGradeMyClassesResponseI>({
      queryKey: [queryKeys.gradeMyClasses, params],
      queryFn: () => getMyGradeClassesApi(params),
      enabled: !!params.schoolId,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })

  return {
    classes: data?.value ?? [],
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

export const useGetMyGradeSubjects = (params: GetGradeMySubjectsParamsI) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetGradeMySubjectsResponseI>({
      queryKey: [queryKeys.gradeMySubjects, params],
      queryFn: () => getMyGradeSubjectsApi(params),
      enabled: !!(params.classId && params.schoolId),
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })

  return {
    subjects: data?.value ?? [],
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

export const useGetGradeWorksheet = (params: GetGradeWorksheetParamsI) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetGradeWorksheetResponseI>({
      queryKey: [queryKeys.gradeWorksheet, params],
      queryFn: () => getGradeWorksheetApi(params),
      enabled: !!(
        params.schoolId &&
        params.sessionId &&
        params.schoolSessionTermId &&
        params.classId &&
        params.subjectId
      ),
      staleTime: 60 * 1000,
      gcTime: 5 * 60 * 1000,
    })

  return {
    worksheet: data?.value,
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

export const useGetAutomatedScoreContributions = (
  params: AutomatedScoreContributionAuditParamsI
) => {
  const query = useQuery<AutomatedScoreContributionAuditResponseI>({
    queryKey: ["automated-score-contributions", params],
    queryFn: () => getAutomatedScoreContributionsApi(params),
    enabled: !!params.schoolId,
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  })

  return {
    audit: query.data?.value,
    isLoading: query.isPending,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}

interface UseSubmitGradeWorksheetOptions {
  onSuccess?: (data: SubmitGradeWorksheetResponseI) => void
  onError?: (error: Error) => void
}

export const useSubmitGradeWorksheet = ({
  onSuccess,
  onError,
}: UseSubmitGradeWorksheetOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<
      SubmitGradeWorksheetResponseI,
      Error,
      SubmitGradeWorksheetPayloadI
    >({
      mutationFn: submitGradeWorksheetApi,
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: [queryKeys.gradeWorksheet] })
        queryClient.invalidateQueries({ queryKey: [queryKeys.gradeWorksheets] })
        toast.success("Worksheet submitted successfully")
        onSuccess?.(data)
      },
      onError: (err) => {
        toast.error(err?.message ?? "An unexpected error occurred")
        onError?.(err)
      },
    })

  return {
    submitGradeWorksheet: mutate,
    submitGradeWorksheetAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

interface UseSaveGradeWorksheetDraftOptions {
  onSuccess?: (data: SaveGradeWorksheetDraftResponseI) => void
  onError?: (error: Error) => void
}


export const useSaveGradeWorksheetDraft = ({
  onSuccess,
  onError,
}: UseSaveGradeWorksheetDraftOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<
      SaveGradeWorksheetDraftResponseI,
      Error,
      SubmitGradeWorksheetPayloadI
    >({
      mutationFn: saveGradeWorksheetDraftApi,
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: [queryKeys.gradeWorksheet] })
        queryClient.invalidateQueries({ queryKey: [queryKeys.gradeWorksheets] })
        toast.success("Worksheet draft saved successfully")
        onSuccess?.(data)
      },
      onError: (err) => {
        toast.error(err?.message ?? "An unexpected error occurred")
        onError?.(err)
      },
    })

  return {
    saveGradeWorksheetDraft: mutate,
    saveGradeWorksheetDraftAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

export const useGetAllGradeWorksheets = (
  params: GetAllGradeWorksheetsParamsI
) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetAllGradeWorksheetsResponseI>({
      queryKey: [queryKeys.gradeWorksheets, params],
      queryFn: () => getAllGradeWorksheetsApi(params),
      enabled: !!params.schoolId,
      staleTime: 60 * 1000,
      gcTime: 5 * 60 * 1000,
    })

  return {
    worksheets: data?.value ?? [],
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

export const useGetGradeWorksheetById = (worksheetId: string) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetGradeWorksheetByIdResponseI>({
      queryKey: [queryKeys.gradeWorksheetById, worksheetId],
      queryFn: () => getGradeWorksheetByIdApi(worksheetId),
      enabled: !!worksheetId,
      staleTime: 60 * 1000,
      gcTime: 5 * 60 * 1000,
    })

  return {
    worksheet: data?.value,
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

interface UseApproveGradeWorksheetOptions {
  onSuccess?: (data: ApproveGradeWorksheetResponseI) => void
  onError?: (error: Error) => void
}

export const useApproveGradeWorksheet = ({
  onSuccess,
  onError,
}: UseApproveGradeWorksheetOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<ApproveGradeWorksheetResponseI, Error, string>({
      mutationFn: approveGradeWorksheetApi,
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: [queryKeys.gradeWorksheets] })
        queryClient.invalidateQueries({
          queryKey: [queryKeys.gradeWorksheetById],
        })
        toast.success("Worksheet approved successfully")
        onSuccess?.(data)
      },
      onError: (err) => {
        toast.error(err?.message ?? "An unexpected error occurred")
        onError?.(err)
      },
    })

  return {
    approveGradeWorksheet: mutate,
    approveGradeWorksheetAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

interface UseRejectGradeWorksheetOptions {
  onSuccess?: (data: RejectGradeWorksheetResponseI) => void
  onError?: (error: Error) => void
}

export const useRejectGradeWorksheet = ({
  onSuccess,
  onError,
}: UseRejectGradeWorksheetOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<
      RejectGradeWorksheetResponseI,
      Error,
      RejectGradeWorksheetPayloadI
    >({
      mutationFn: rejectGradeWorksheetApi,
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: [queryKeys.gradeWorksheets] })
        queryClient.invalidateQueries({
          queryKey: [queryKeys.gradeWorksheetById],
        })
        toast.success("Worksheet rejected")
        onSuccess?.(data)
      },
      onError: (err) => {
        toast.error(err?.message ?? "An unexpected error occurred")
        onError?.(err)
      },
    })

  return {
    rejectGradeWorksheet: mutate,
    rejectGradeWorksheetAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

// ─── LookupStudentResult ──────────────────────────────────────────────────────

export const useLookupStudentResult = () => {
  const {
    mutate,
    mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
    data,
  } = useMutation<
    LookupStudentResultResponseI,
    Error,
    LookupStudentResultPayloadI
  >({
    mutationFn: lookupStudentResultApi,
    onError: (err) =>
      toast.error(
        (err as unknown as string) ||
          "An unexpected error occurred. Please check the student details and try again."
      ),
  })

  return {
    lookupStudentResult: mutate,
    lookupStudentResultAsync: mutateAsync,
    result: data?.value ?? null,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

interface UseAssignTeacherToClassOptions {
  onSuccess?: (data: AssignSubUserClassResponseI) => void
  onError?: (error: Error) => void
  silent?: boolean
}

export const useAssignTeacherToClass = ({
  onSuccess,
  onError,
  silent = false,
}: UseAssignTeacherToClassOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<AssignSubUserClassResponseI, Error, AssignSubUserClassPayloadI>(
      {
        mutationFn: assignSubUserClassApi,
        onSuccess: (data) => {
          if (!silent) {
            queryClient.invalidateQueries({
              queryKey: [queryKeys.classTeachers],
            })
            queryClient.invalidateQueries({
              queryKey: [queryKeys.teacherClasses],
            })
            toast.success("Teacher assigned successfully")
          }
          onSuccess?.(data)
        },
        onError: (err) => {
          if (!silent)
            toast.error(err?.message ?? "An unexpected error occurred")
          onError?.(err)
        },
      }
    )

  return {
    assignTeacherToClass: mutate,
    assignTeacherToClassAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

interface UseRemoveTeacherFromClassOptions {
  onSuccess?: (data: RemoveSubUserClassResponseI) => void
  onError?: (error: Error) => void
  silent?: boolean
}

export const useRemoveTeacherFromClass = ({
  onSuccess,
  onError,
  silent = false,
}: UseRemoveTeacherFromClassOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<RemoveSubUserClassResponseI, Error, string>({
      mutationFn: removeSubUserClassApi,
      onSuccess: (data) => {
        if (!silent) {
          queryClient.invalidateQueries({ queryKey: [queryKeys.classTeachers] })
          queryClient.invalidateQueries({
            queryKey: [queryKeys.teacherClasses],
          })
          toast.success("Teacher removed from class")
        }
        onSuccess?.(data)
      },
      onError: (err) => {
        if (!silent) toast.error(err?.message ?? "An unexpected error occurred")
        onError?.(err)
      },
    })

  return {
    removeTeacherFromClass: mutate,
    removeTeacherFromClassAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

export const useGetClassTeachers = (
  params: GetSubUserClassesByClassParamsI
) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetSubUserClassesByClassResponseI>({
      queryKey: [queryKeys.classTeachers, params],
      queryFn: () => getSubUserClassesByClassApi(params),
      enabled: !!(params.classId && params.schoolId),
      staleTime: 60 * 1000,
      gcTime: 5 * 60 * 1000,
    })

  return {
    classTeachers: data?.value ?? [],
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

export const useGetTeacherClasses = (subUserId: string) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetSubUserClassesBySubUserResponseI>({
      queryKey: [queryKeys.teacherClasses, subUserId],
      queryFn: () => getSubUserClassesBySubUserApi(subUserId),
      enabled: !!subUserId,
      staleTime: 60 * 1000,
      gcTime: 5 * 60 * 1000,
    })

  return {
    teacherClasses: data?.value ?? [],
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

export const useGetTeacherSubjects = (subUserId: string) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetSubUserSubjectsBySubUserResponseI>({
    
      queryKey: [queryKeys.teacherSubjects, subUserId],
      queryFn: () => getSubUserSubjectsBySubUserApi(subUserId),
      enabled: !!subUserId,
      staleTime: 60 * 1000,
      gcTime: 5 * 60 * 1000,
    })

  return {
    teacherSubjects: data?.value ?? [],
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

export const useGetTeacherDetails = (params: GetTeacherDetailsParamsI) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<TeacherDetailsResponseI>({
      queryKey: [queryKeys.teacherDetails, params.subUserId, params.schoolId],
      queryFn: () => getTeacherDetailsApi(params),
      enabled: !!(params.subUserId && params.schoolId),
      staleTime: 60 * 1000,
      gcTime: 5 * 60 * 1000,
    })

  return {
    teacher: data?.value ?? null,
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

// ─── SubUserSubject mutations ─────────────────────────────────────────────────

export const useAssignTeacherSubjects = ({
  silent = false,
}: { silent?: boolean } = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<
      AssignSubUserSubjectResponseI,
      Error,
      AssignSubUserSubjectPayloadI
    >({
      mutationFn: assignSubUserSubjectApi,
      onSuccess: (data) => {
        if (!data?.isSuccess) {
          toast.error(data?.error ?? "Failed to assign subjects")
          return
        }
        if (!silent) {
          queryClient.invalidateQueries({
            queryKey: [queryKeys.teacherSubjects],
          })
          queryClient.invalidateQueries({
            queryKey: [queryKeys.subjectTeachers],
          })
          toast.success("Subjects assigned successfully")
        }
      },
      onError: (err) => {
        if (!silent) toast.error(err?.message ?? "An unexpected error occurred")
      },
    })

  return {
    assignTeacherSubjects: mutate,
    assignTeacherSubjectsAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

export const useRemoveTeacherSubject = ({
  silent = false,
}: { silent?: boolean } = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<RemoveSubUserSubjectResponseI, Error, string>({
      mutationFn: removeSubUserSubjectApi,
      onSuccess: () => {
        if (!silent) {
          queryClient.invalidateQueries({
            queryKey: [queryKeys.teacherSubjects],
          })
          queryClient.invalidateQueries({
            queryKey: [queryKeys.subjectTeachers],
          })
          toast.success("Subject removed from teacher")
        }
      },
      onError: (err) => {
        if (!silent) toast.error(err?.message ?? "An unexpected error occurred")
      },
    })

  return {
    removeTeacherSubject: mutate,
    removeTeacherSubjectAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

export const useGetSubjectTeachers = (
  params: GetSubUserSubjectsBySubjectParamsI
) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetSubUserSubjectsBySubjectResponseI>({
      queryKey: [queryKeys.subjectTeachers, params.subjectId, params.schoolId],
      queryFn: () => getSubUserSubjectsBySubjectApi(params),
      enabled: !!(params.subjectId && params.schoolId),
      staleTime: 60 * 1000,
      gcTime: 5 * 60 * 1000,
    })

  return {
    subjectTeachers: data?.value ?? [],
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

// ─── SubUserDepartment hooks ──────────────────────────────────────────────────

export const useAssignTeacherDepartment = () => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<
      AssignSubUserDepartmentResponseI,
      Error,
      AssignSubUserDepartmentPayloadI
    >({
      mutationFn: assignSubUserDepartmentApi,
      onSuccess: (data) => {
        if (!data?.isSuccess) {
          toast.error(data?.error ?? "Failed to assign department")
          return
        }
        queryClient.invalidateQueries({
          queryKey: [queryKeys.teacherDepartments],
        })
        queryClient.invalidateQueries({
          queryKey: [queryKeys.departmentTeachers],
        })
        toast.success("Department assigned successfully")
      },
      onError: (err) => {
        toast.error(err?.message ?? "An unexpected error occurred")
      },
    })

  return {
    assignTeacherDepartment: mutate,
    assignTeacherDepartmentAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

export const useRemoveTeacherDepartment = () => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<RemoveSubUserDepartmentResponseI, Error, string>({
      mutationFn: removeSubUserDepartmentApi,
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [queryKeys.teacherDepartments],
        })
        queryClient.invalidateQueries({
          queryKey: [queryKeys.departmentTeachers],
        })
        toast.success("Teacher removed from department")
      },
      onError: (err) => {
        toast.error(err?.message ?? "An unexpected error occurred")
      },
    })

  return {
    removeTeacherDepartment: mutate,
    removeTeacherDepartmentAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

export const useGetDepartmentTeachers = (departmentId: string) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetSubUserDepartmentsByDepartmentResponseI>({
      queryKey: [queryKeys.departmentTeachers, departmentId],
      queryFn: () => getSubUserDepartmentsByDepartmentApi(departmentId),
      enabled: !!departmentId,
      staleTime: 60 * 1000,
      gcTime: 5 * 60 * 1000,
    })

  return {
    departmentTeachers: data?.value ?? [],
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

export const useGetTeacherDepartments = (subUserId: string) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetSubUserDepartmentsBySubUserResponseI>({
      queryKey: [queryKeys.teacherDepartments, subUserId],
      queryFn: () => getSubUserDepartmentsBySubUserApi(subUserId),
      enabled: !!subUserId,
      staleTime: 60 * 1000,
      gcTime: 5 * 60 * 1000,
    })

  return {
    teacherDepartments: data?.value ?? [],
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

// ─── Grade: Class Results & Overview ───────────────────────────────────────────

export const useGetClassDashboard = (params: ClassDashboardParamsI) => {
  const { data, isPending, isFetching, isError, error, isSuccess, refetch } =
    useQuery<ClassDashboardResponseI>({
      queryKey: [queryKeys.classDashboard, params],
      queryFn: () => getClassDashboardApi(params),
      enabled: !!params.schoolId,

      placeholderData: keepPreviousData,
      staleTime: 60 * 1000,
      gcTime: 5 * 60 * 1000,
    })

  return {
    summary: data?.value
      ? {
          totalClasses: data.value.totalClasses,
          submittedCount: data.value.submittedCount,
          publishedCount: data.value.publishedCount,
        }
      : null,
    results: data?.value?.results?.items ?? [],
    pagination: data?.value?.results
      ? {
          totalItems: data.value.results.totalItems,
          pageNumber: data.value.results.pageNumber,
          pageSize: data.value.results.pageSize,
          totalPages: data.value.results.totalPages,
        }
      : null,
    isLoading: isPending,
    isPending,
    isFetching,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

export const useGetClassResultDetails = (params: ClassResultDetailsParamsI) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<ClassResultDetailsResponseI>({
      queryKey: [queryKeys.classResultDetails, params],
      queryFn: () => getClassResultDetailsApi(params),
      enabled: !!params.classCummaltiveResultId,
      staleTime: 60 * 1000,
      gcTime: 5 * 60 * 1000,
    })

  return {
    header: data?.value?.header,
    students: data?.value?.students?.items ?? [],
    pagination: data?.value?.students
      ? {
          totalItems: data.value.students.totalItems,
          pageNumber: data.value.students.pageNumber,
          pageSize: data.value.students.pageSize,
          totalPages: data.value.students.totalPages,
        }
      : null,
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

export const useGetStudentResultDetails = (
  studentCummulativeResultId: string
) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<StudentResultDetailsResponseI>({
      queryKey: [queryKeys.studentResultDetails, studentCummulativeResultId],
      queryFn: () => getStudentResultDetailsApi(studentCummulativeResultId),
      enabled: !!studentCummulativeResultId,
      staleTime: 60 * 1000,
      gcTime: 5 * 60 * 1000,
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

interface UsePublishClassResultOptions {
  onSuccess?: (data: PublishClassResultResponseI) => void
  onError?: (error: Error) => void
}

export const usePublishClassResult = ({
  onSuccess,
  onError,
}: UsePublishClassResultOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<PublishClassResultResponseI, Error, string>({
      mutationFn: publishClassResultApi,
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: [queryKeys.classDashboard] })
        queryClient.invalidateQueries({
          queryKey: [queryKeys.classResultDetails],
        })
        toast.success("Results published successfully")
        onSuccess?.(data)
      },
      onError: (err) => {
        toast.error(err?.message ?? "Failed to publish results")
        onError?.(err)
      },
    })

  return {
    publishClassResult: mutate,
    publishClassResultAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

interface UsePublishStudentResultOptions {
  onSuccess?: (data: PublishStudentResultResponseI) => void
  onError?: (error: Error) => void
}

export const usePublishStudentResult = ({
  onSuccess,
  onError,
}: UsePublishStudentResultOptions = {}) => {
  const queryClient = useQueryClient()

  const invalidateResultQueries = () => {
    queryClient.invalidateQueries({ queryKey: [queryKeys.classResultDetails] })
    queryClient.invalidateQueries({
      queryKey: [queryKeys.studentResultDetails],
    })
  }

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<PublishStudentResultResponseI, Error, string>({
      mutationFn: publishStudentResultApi,
      onSuccess: (data) => {
        invalidateResultQueries()
        toast.success(data.message || "Student result published successfully")
        onSuccess?.(data)
      },
      onError: (err) => {
        if (err instanceof ApiError && err.status === 409) {
          invalidateResultQueries()
        }
        toast.error(err?.message ?? "Failed to publish student result")
        onError?.(err)
      },
    })

  return {
    publishStudentResult: mutate,
    publishStudentResultAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

export const useGetExamRecordsOverview = (
  params: ExamRecordsOverviewParamsI
) => {
  const userId = useAuthStore((state) => state.user?.id)
  const schoolId = params.schoolId?.trim()
  const hasValidSchoolId =
    !!schoolId && !["undefined", "null"].includes(schoolId.toLowerCase())
  const {
    data,
    isPending,
    isFetching,
    isError,
    error,
    errorUpdatedAt,
    isSuccess,
    refetch,
  } = useQuery<ExamRecordsOverviewResponseI>({
    queryKey: [queryKeys.examRecordsOverview, userId, { ...params, schoolId }],
    queryFn: ({ signal }) =>
      getExamRecordsOverviewApi({ ...params, schoolId }, signal),
    enabled: hasValidSchoolId && !!userId,
    placeholderData: (previous, previousQuery) => {
      const previousParams = previousQuery?.queryKey[2] as
        ExamRecordsOverviewParamsI | undefined
      return previousQuery?.queryKey[1] === userId &&
        previousParams?.schoolId === schoolId
        ? previous
        : undefined
    },
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  })

  return {
    overview: data?.value,
    isLoading: isPending,
    isFetching,
    isPending,
    isError,
    error,
    errorUpdatedAt,
    isSuccess,
    refetch,
  }
}

export const useGetClassStudentsForGrading = (
  params: GetClassStudentsForGradingParamsI
) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetClassStudentsForGradingResponseI>({
      queryKey: [queryKeys.classStudentsForGrading, params],
      queryFn: () => getClassStudentsForGradingApi(params),
      enabled: !!(
        params.schoolId &&
        params.classId &&
        params.sessionId &&
        params.schoolSessionTermId
      ),
      staleTime: 60 * 1000,
      gcTime: 5 * 60 * 1000,
    })

  return {
    students: data?.value ?? [],
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

export const useGetStudentSubjectScores = (
  params: GetStudentSubjectScoresParamsI
) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetStudentSubjectScoresResponseI>({
      queryKey: [queryKeys.studentSubjectScores, params],
      queryFn: () => getStudentSubjectScoresApi(params),
      enabled: !!(
        params.schoolId &&
        params.sessionId &&
        params.schoolSessionTermId &&
        params.classId &&
        params.studentId
      ),
      staleTime: 30 * 1000,
      gcTime: 5 * 60 * 1000,
    })

  return {
    scores: data?.value,
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

interface UseSaveStudentScoresDraftOptions {
  onSuccess?: (data: SaveStudentScoresDraftResponseI) => void
  onError?: (error: Error) => void
}

export const useSaveStudentScoresDraft = ({
  onSuccess,
  onError,
}: UseSaveStudentScoresDraftOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<
      SaveStudentScoresDraftResponseI,
      Error,
      SaveStudentScoresDraftPayloadI
    >({
      mutationFn: saveStudentScoresDraftApi,
      onSuccess: (data) => {
        queryClient.invalidateQueries({
          queryKey: [queryKeys.studentSubjectScores],
        })
        toast.success(
          data.message || "Student subject scores saved as draft successfully."
        )
        onSuccess?.(data)
      },
      onError: (err) => {
        if (err instanceof ApiError && err.status === 409) {
          queryClient.invalidateQueries({
            queryKey: [queryKeys.studentSubjectScores],
          })
        }
        toast.error(err?.message ?? "Failed to save scores as draft")
        onError?.(err)
      },
    })

  return {
    saveStudentScoresDraft: mutate,
    saveStudentScoresDraftAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

export interface GetBroadsheetParamsI {
  schoolId: string
  classId: string
  sessionId: string
  schoolSessionTermId: string
}

export const useGetBroadsheet = (params: GetBroadsheetParamsI) => {
  const enabled = !!(
    params.schoolId &&
    params.classId &&
    params.sessionId &&
    params.schoolSessionTermId
  )

  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<BroadsheetResponseDto>({
      queryKey: [queryKeys.broadsheet, params],
      queryFn: () =>
        getBroadsheetApi(
          params.schoolId,
          params.classId,
          params.sessionId,
          params.schoolSessionTermId
        ),
      enabled,
      staleTime: 60 * 1000,
      gcTime: 5 * 60 * 1000,
    })

  return {
    broadsheet: data,
    isLoading: isPending && enabled,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

interface UseSaveBroadsheetDraftOptions {
  onSuccess?: (data: SaveBroadsheetDraftResponseI) => void
  onError?: (error: Error) => void
}

export const useSaveBroadsheetDraft = ({
  onSuccess,
  onError,
}: UseSaveBroadsheetDraftOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<
      SaveBroadsheetDraftResponseI,
      Error,
      SaveBroadsheetDraftCommand
    >({
      mutationFn: saveBroadsheetDraftApi,
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: [queryKeys.broadsheet] })
        onSuccess?.(data)
      },
      onError: (err) => {
        toast.error(err?.message ?? "Failed to save broadsheet draft")
        onError?.(err)
      },
    })

  return {
    saveBroadsheetDraft: mutate,
    saveBroadsheetDraftAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

interface UseSubmitBroadsheetOptions {
  onSuccess?: (data: SubmitBroadsheetResponseDto) => void
  onError?: (error: Error) => void
}

export const useSubmitBroadsheet = ({
  onSuccess,
  onError,
}: UseSubmitBroadsheetOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<SubmitBroadsheetResponseDto, Error, SubmitBroadsheetCommand>({
      mutationFn: submitBroadsheetApi,
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: [queryKeys.broadsheet] })
        onSuccess?.(data)
      },
      onError: (err) => {
        toast.error(err?.message ?? "Failed to submit broadsheet")
        onError?.(err)
      },
    })

  return {
    submitBroadsheet: mutate,
    submitBroadsheetAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}
