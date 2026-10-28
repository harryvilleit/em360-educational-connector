import apiClient from "../api"
import { normalizeResponse } from "@/utils/apiResponse"
import type {
  ApiResult,
  ResultViewModel,
  ElectionCategoryDto,
  CategoryStatus,
  ChangeCategoryStatusRequest,
  CreateElectionCategoryCommand,
  UpdateElectionCategoryCommand,
  VotingDashboardDto,
  GetVotingDashboardParamsI,
  CandidateStudentSearchResultDto,
  CreateElectionCommand,
  ElectionDetailDto,
  GetStudentElectionsParamsI,
  StudentElectionsDashboardDto,
  StudentBallotDto,
  CastElectionVoteCommand,
  CandidateSearchType,
  GetStaffElectionsParamsI,
  StaffElectionsDashboardDto,
  StaffBallotDto,
  CastStaffVoteCommand,
} from "./types"

export async function getElectionCategoriesApi(
  schoolId: string,
  status?: CategoryStatus | "All"
) {
  const res = await apiClient.get(`/Voting/GetCategories/${schoolId}`, {
    params: !status || status === "All" ? undefined : { status },
  })
  return normalizeResponse<ApiResult<ElectionCategoryDto[]>>(res)
}

export async function createElectionCategoryApi(
  payload: CreateElectionCategoryCommand
) {
  const res = await apiClient.post(`/Voting/CreateCategory`, payload)
  return normalizeResponse<ApiResult<ElectionCategoryDto>>(res)
}

export async function updateElectionCategoryApi(
  payload: UpdateElectionCategoryCommand
) {
  const res = await apiClient.put(`/Voting/UpdateCategory`, payload)
  return normalizeResponse<ApiResult<ElectionCategoryDto>>(res)
}

export async function changeCategoryStatusApi(
  payload: ChangeCategoryStatusRequest
) {
  const res = await apiClient.patch(`/Voting/ChangeCategoryStatus`, payload)
  return normalizeResponse<ApiResult<ElectionCategoryDto>>(res)
}

export async function getVotingDashboardApi(
  params: GetVotingDashboardParamsI
) {
  const { schoolId, ...query } = params
  const res = await apiClient.get(`/Voting/dashboard/${schoolId}`, {
    params: query,
  })
  return normalizeResponse<ApiResult<VotingDashboardDto>>(res)
}

export async function searchElectionCandidatesApi(
  schoolId: string,
  query: string,
  limit = 20,
  type?: CandidateSearchType
) {
  const res = await apiClient.get(`/Voting/SearchCandidates/${schoolId}`, {
    params: { query, limit, ...(type ? { type } : {}) },
  })
  return normalizeResponse<ApiResult<CandidateStudentSearchResultDto[]>>(res)
}

export async function createElectionApi(payload: CreateElectionCommand) {
  const res = await apiClient.post(`/Voting/CreateElection`, payload)
  return normalizeResponse<ApiResult<ElectionDetailDto>>(res)
}

export async function getElectionDetailsApi(
  electionId: string,
  schoolId: string
) {
  const res = await apiClient.get(
    `/Voting/GetElectionDetails/${electionId}/${schoolId}`
  )
  return normalizeResponse<ApiResult<ElectionDetailDto>>(res)
}

export async function closeElectionApi(electionId: string, schoolId: string) {
  const res = await apiClient.post(
    `/Voting/CloseElection/${electionId}/${schoolId}`
  )
  return normalizeResponse<ResultViewModel>(res)
}

export async function reopenElectionApi(electionId: string, schoolId: string) {
  const res = await apiClient.post(
    `/Voting/ReopenElection/${electionId}/${schoolId}`
  )
  return normalizeResponse<ResultViewModel>(res)
}

export async function activateElectionApi(
  electionId: string,
  schoolId: string
) {
  const res = await apiClient.post(
    `/Voting/ActivateElection/${electionId}/${schoolId}`
  )
  return normalizeResponse<ResultViewModel>(res)
}

export async function deleteElectionApi(
  electionId: string,
  schoolId: string
) {
  const res = await apiClient.delete(
    `/Voting/DeleteElection/${electionId}/${schoolId}`
  )
  return normalizeResponse<ResultViewModel>(res)
}

export async function getStudentElectionsApi(
  params: GetStudentElectionsParamsI
) {
  const { studentSchoolId, schoolId, ...query } = params
  const res = await apiClient.get(
    `/Voting/GetStudentElections/${studentSchoolId}/${schoolId}`,
    { params: query }
  )
  return normalizeResponse<ApiResult<StudentElectionsDashboardDto>>(res)
}

export async function getStudentBallotApi(
  electionId: string,
  studentSchoolId: string,
  schoolId: string
) {
  const res = await apiClient.get(
    `/Voting/GetStudentBallot/${electionId}/${studentSchoolId}/${schoolId}`
  )
  return normalizeResponse<ApiResult<StudentBallotDto>>(res)
}

export async function castStudentVoteApi(payload: CastElectionVoteCommand) {
  const res = await apiClient.post(`/Voting/CastVote`, payload)
  return normalizeResponse<ApiResult<StudentBallotDto>>(res)
}

export async function getStaffElectionsApi(params: GetStaffElectionsParamsI) {
  const { staffId, schoolId, ...query } = params
  const res = await apiClient.get(
    `/Voting/GetStaffElections/${staffId}/${schoolId}`,
    { params: query }
  )
  return normalizeResponse<ApiResult<StaffElectionsDashboardDto>>(res)
}

export async function getStaffBallotApi(
  electionId: string,
  staffId: string,
  schoolId: string
) {
  const res = await apiClient.get(
    `/Voting/GetStaffBallot/${electionId}/${staffId}/${schoolId}`
  )
  return normalizeResponse<ApiResult<StaffBallotDto>>(res)
}

export async function castStaffVoteApi(payload: CastStaffVoteCommand) {
  const res = await apiClient.post(`/Voting/CastStaffVote`, payload)
  return normalizeResponse<ApiResult<StaffBallotDto>>(res)
}
