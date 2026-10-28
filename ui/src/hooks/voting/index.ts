import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { isAxiosError } from "axios"
import { toast } from "sonner"
import { queryKeys } from "@/utils/queryKeys"
import {
  getElectionCategoriesApi,
  createElectionCategoryApi,
  updateElectionCategoryApi,
  changeCategoryStatusApi,
  getVotingDashboardApi,
  searchElectionCandidatesApi,
  createElectionApi,
  getElectionDetailsApi,
  closeElectionApi,
  activateElectionApi,
  reopenElectionApi,
  deleteElectionApi,
  getStudentElectionsApi,
  getStudentBallotApi,
  castStudentVoteApi,
  getStaffElectionsApi,
  getStaffBallotApi,
  castStaffVoteApi,
} from "@/api/voting.api"
import type {
  ElectionCategoryDto,
  ElectionListItemDto,
  VotingDashboardDto,
  CategoryStatus,
  ChangeCategoryStatusRequest,
  CreateElectionCategoryCommand,
  UpdateElectionCategoryCommand,
  GetVotingDashboardParamsI,
  CreateElectionCommand,
  GetStudentElectionsParamsI,
  CastElectionVoteCommand,
  CandidateSearchType,
  GetStaffElectionsParamsI,
  CastStaffVoteCommand,
} from "@/api/voting.api/types"

const FRESH_FOR = 60_000

// Backend envelopes vary between `data` and `value`
function unwrap<T>(res: { data?: T } | undefined): T | undefined {
  return res?.data ?? (res as { value?: T } | undefined)?.value
}

export function useElectionCategories(schoolId: string, status?: CategoryStatus | "All") {
  const query = useQuery({
    queryKey: [queryKeys.votingCategories, schoolId, status ?? "All"],
    queryFn: () => getElectionCategoriesApi(schoolId, status),
    enabled: !!schoolId,
    staleTime: FRESH_FOR,
  })
  // Backend envelopes vary between `data` and `value`; the list may be nested in `items`
  const raw = query.data as
    | { data?: unknown; value?: unknown }
    | undefined
  const payload = raw?.data ?? raw?.value
  const list = Array.isArray(payload)
    ? payload
    : ((payload as { items?: unknown } | undefined)?.items ?? [])
  return { ...query, categories: list as ElectionCategoryDto[] }
}

export function useCreateElectionCategory() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateElectionCategoryCommand) =>
      createElectionCategoryApi(payload),
    onSuccess: (result) => {
      client.invalidateQueries({ queryKey: [queryKeys.votingCategories] })
      toast.success(result.message || "Category created")
    },
    onError: (error: Error) =>
      toast.error(error.message || "Could not create category."),
  })
}

export function useUpdateElectionCategory() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateElectionCategoryCommand) =>
      updateElectionCategoryApi(payload),
    onSuccess: (result) => {
      client.invalidateQueries({ queryKey: [queryKeys.votingCategories] })
      toast.success(result.message || "Category updated")
    },
    onError: (error: Error) =>
      toast.error(error.message || "Could not update category."),
  })
}

export function useChangeCategoryStatus() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (payload: ChangeCategoryStatusRequest) =>
      changeCategoryStatusApi(payload),
    onSuccess: (result) => {
      client.invalidateQueries({ queryKey: [queryKeys.votingCategories] })
      toast.success(result.message || "Category status updated")
    },
    onError: (error: Error) =>
      toast.error(error.message || "Could not change category status."),
  })
}

export function useVotingDashboard(params: GetVotingDashboardParamsI) {
  const query = useQuery({
    queryKey: [queryKeys.votingDashboard, params],
    queryFn: () => getVotingDashboardApi(params),
    enabled: !!params.schoolId,
    staleTime: FRESH_FOR,
    placeholderData: keepPreviousData,
  })
  const raw = unwrap(query.data)
  // Accept both the paged `elections` object and a flat list with totalCount
  const dashboard = raw && {
    ...raw,
    elections: Array.isArray(raw.elections)
      ? {
          items: raw.elections as ElectionListItemDto[],
          pageIndex: (raw as { pageNumber?: number }).pageNumber ?? 1,
          totalCount:
            (raw as { totalCount?: number }).totalCount ?? raw.elections.length,
        }
      : raw.elections,
  }
  return { ...query, dashboard: dashboard as VotingDashboardDto | undefined }
}

export function useSearchElectionCandidates(
  schoolId: string,
  query: string,
  limit = 20,
  type?: CandidateSearchType
) {
  const search = useQuery({
    queryKey: [queryKeys.votingCandidateSearch, schoolId, query, limit, type],
    queryFn: () => searchElectionCandidatesApi(schoolId, query, limit, type),
    enabled: !!schoolId && query.trim().length >= 2,
    staleTime: 30_000,
  })
  return { ...search, results: unwrap(search.data) ?? [] }
}

export function useCreateElection() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateElectionCommand) => createElectionApi(payload),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: [queryKeys.votingDashboard] })
    },
    onError: (error: Error) =>
      toast.error(error.message || "Could not create this election."),
  })
}

export function useElectionDetails(
  electionId: string,
  schoolId: string,
  enabled = true
) {
  const query = useQuery({
    queryKey: [queryKeys.electionDetails, electionId, schoolId],
    queryFn: () => getElectionDetailsApi(electionId, schoolId),
    enabled: !!electionId && !!schoolId && enabled,
    staleTime: 15_000,
  })
  return { ...query, election: unwrap(query.data) }
}

export function useCloseElection() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({
      electionId,
      schoolId,
    }: {
      electionId: string
      schoolId: string
    }) => closeElectionApi(electionId, schoolId),
    onSuccess: (result) => {
      client.invalidateQueries({ queryKey: [queryKeys.votingDashboard] })
      client.invalidateQueries({ queryKey: [queryKeys.electionDetails] })
      toast.success(result.message || "Election closed")
    },
    onError: (error: Error) =>
      toast.error(error.message || "Could not close this election."),
  })
}

export function useActivateElection() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({
      electionId,
      schoolId,
      reopen,
    }: {
      electionId: string
      schoolId: string
      reopen?: boolean
    }) =>
      reopen
        ? reopenElectionApi(electionId, schoolId)
        : activateElectionApi(electionId, schoolId),
    onSuccess: (result) => {
      client.invalidateQueries({ queryKey: [queryKeys.votingDashboard] })
      client.invalidateQueries({ queryKey: [queryKeys.electionDetails] })
      toast.success(result.message || "Election is now open for voting")
    },
    onError: (error: Error) =>
      toast.error(
        (isAxiosError<{ message?: string }>(error) &&
          error.response?.data?.message) ||
          error.message ||
          "Could not open this election."
      ),
  })
}

export function useStudentElections(
  params: GetStudentElectionsParamsI,
  enabled = true
) {
  const query = useQuery({
    queryKey: [queryKeys.studentElections, params],
    queryFn: () => getStudentElectionsApi(params),
    enabled: !!params.studentSchoolId && !!params.schoolId && enabled,
    staleTime: 30_000,
  })
  return { ...query, dashboard: unwrap(query.data) }
}

export function useStudentBallot(
  electionId: string,
  studentSchoolId: string,
  schoolId: string,
  enabled = true
) {
  const query = useQuery({
    queryKey: [queryKeys.studentBallot, electionId, studentSchoolId, schoolId],
    queryFn: () => getStudentBallotApi(electionId, studentSchoolId, schoolId),
    enabled: !!electionId && !!studentSchoolId && !!schoolId && enabled,
    staleTime: 15_000,
  })
  return { ...query, ballot: unwrap(query.data) }
}

export function useCastStudentVote() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (payload: CastElectionVoteCommand) =>
      castStudentVoteApi(payload),
    onSuccess: (result, variables) => {
      const ballotKey = [
        queryKeys.studentBallot,
        variables.electionId,
        variables.studentSchoolId,
        variables.schoolId,
      ]
      const ballot = unwrap(result)
      // The response is the updated ballot; fall back to a refetch if it is missing
      if (ballot)
        client.setQueryData(ballotKey, (old: object | undefined) => ({
          ...old,
          data: ballot,
        }))
      else client.invalidateQueries({ queryKey: ballotKey })
      client.invalidateQueries({ queryKey: [queryKeys.studentElections] })
      toast.success(result.message || "Vote recorded")
    },
    onError: (error: Error) =>
      toast.error(error.message || "Could not record your vote."),
  })
}

export function useDeleteElection() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({
      electionId,
      schoolId,
    }: {
      electionId: string
      schoolId: string
    }) => deleteElectionApi(electionId, schoolId),
    onSuccess: (result) => {
      client.invalidateQueries({ queryKey: [queryKeys.votingDashboard] })
      toast.success(result.message || "Election deleted")
    },
    onError: (error: Error) =>
      toast.error(error.message || "Could not delete this election."),
  })
}

export function useStaffElections(params: GetStaffElectionsParamsI) {
  const query = useQuery({
    queryKey: [queryKeys.staffElections, params],
    queryFn: () => getStaffElectionsApi(params),
    enabled: !!params.staffId && !!params.schoolId,
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  })
  return { ...query, dashboard: unwrap(query.data) }
}

export function useStaffBallot(
  electionId: string,
  staffId: string,
  schoolId: string
) {
  const query = useQuery({
    queryKey: [queryKeys.staffBallot, electionId, staffId, schoolId],
    queryFn: () => getStaffBallotApi(electionId, staffId, schoolId),
    enabled: !!electionId && !!staffId && !!schoolId,
    staleTime: 15_000,
  })
  return { ...query, ballot: unwrap(query.data) }
}

export function useCastStaffVote() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (payload: CastStaffVoteCommand) => castStaffVoteApi(payload),
    onSuccess: (result, variables) => {
      const ballot = unwrap(result)
      // The response is the updated ballot, so voted positions move to completed at once
      if (ballot)
        client.setQueryData(
          [
            queryKeys.staffBallot,
            variables.electionId,
            variables.staffId,
            variables.schoolId,
          ],
          { ...result, data: ballot }
        )
      client.invalidateQueries({ queryKey: [queryKeys.staffElections] })
      toast.success(result.message || "Vote recorded")
    },
    onError: (error: Error) =>
      toast.error(
        (isAxiosError<{ message?: string }>(error) &&
          error.response?.data?.message) ||
          error.message ||
          "Could not record your vote."
      ),
  })
}
