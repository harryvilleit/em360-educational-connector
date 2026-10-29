import apiClient from "./transport"
import { normalizeResponse } from "@/utils/apiResponse"
import type {
  GetHostelOverviewParamsI,
  GetHostelOverviewResponseI,
  CreateHostelsPayloadI,
  CreateHostelsResponseI,
  UpdateHostelPayloadI,
  UpdateHostelResponseI,
  DeleteHostelResponseI,
  GetAllHostelsParamsI,
  GetAllHostelsResponseI,
  GetHostelByIdResponseI,
  CreateHostelCategoriesPayloadI,
  CreateHostelCategoriesResponseI,
  UpdateHostelCategoryPayloadI,
  UpdateHostelCategoryResponseI,
  DeleteHostelCategoryResponseI,
  GetAllHostelCategoriesParamsI,
  GetAllHostelCategoriesResponseI,
  GetHostelCategoryByIdResponseI,
  CreateHostelRoomPayloadI,
  CreateHostelRoomResponseI,
  UpdateHostelRoomPayloadI,
  UpdateHostelRoomResponseI,
  DeleteHostelRoomResponseI,
  GetAllHostelRoomsParamsI,
  GetAllHostelRoomsResponseI,
  GetHostelRoomByIdResponseI,
  GetHostelRoomsByHostelTypeResponseI,
  GetAvailableHostelRoomsParamsI,
  GetAvailableHostelRoomsResponseI,
  GetRollCallSheetParamsI,
  GetRollCallSheetResponseI,
  SubmitHostelAttendancePayloadI,
  SubmitHostelAttendanceResponseI,
  GetHostelAttendanceHistoryParamsI,
  GetHostelAttendanceHistoryResponseI,
  GetHostelAttendanceSessionByIdResponseI,
  GetHostelReportOverviewParamsI,
  GetHostelReportOverviewResponseI,
  GetAllHostelReportsParamsI,
  GetAllHostelReportsResponseI,
  GetHostelReportByIdResponseI,
  FileHostelReportPayloadI,
  FileHostelReportResponseI,
  BillHostelReportPayloadI,
  BillHostelReportResponseI,
  WaiveHostelReportResponseI,
  DeleteHostelReportResponseI,
  AssignHostelSupervisorPayloadI,
  AssignHostelSupervisorResponseI,
  UnassignHostelSupervisorPayloadI,
  UnassignHostelSupervisorResponseI,
  GetAllHostelSupervisorsParamsI,
  GetAllHostelSupervisorsResponseI,
  GetHostelSupervisorProfileResponseI,
  RecordHostelVisitorPayloadI,
  RecordHostelVisitorResponseI,
  GetAllHostelVisitorsParamsI,
  GetAllHostelVisitorsResponseI,
  GetHostelVisitorByIdResponseI,
  UpdateHostelVisitorPayloadI,
  UpdateHostelVisitorResponseI,
  SignInOutHostelVisitorPayloadI,
  SignInOutHostelVisitorResponseI,
  DeleteHostelVisitorResponseI,
  CreateBedSpacePayloadI,
  CreateBedSpaceResponseI,
  UpdateBedSpacePayloadI,
  UpdateBedSpaceResponseI,
  DeleteBedSpaceResponseI,
  AssignBedSpacePayloadI,
  AssignBedSpaceResponseI,
  ReleaseBedSpaceResponseI,
  GetAllBedSpacesParamsI,
  GetAllBedSpacesResponseI,
  GetBedSpaceByIdResponseI,
  GetBedSpacesByRoomResponseI,
  GetAvailableBedSpacesParamsI,
  GetAvailableBedSpacesResponseI,
  GetBedSpacesByStudentResponseI,
} from "@/api/hostel.api/types"

export const getHostelOverviewApi = async (
  params: GetHostelOverviewParamsI
): Promise<GetHostelOverviewResponseI> => {
  const res = await apiClient.get("/Hostel/Overview", { params })
  return normalizeResponse<GetHostelOverviewResponseI>(res)
}

export const createHostelsApi = async (
  payload: CreateHostelsPayloadI
): Promise<CreateHostelsResponseI> => {
  const res = await apiClient.post("/Hostel/Create", payload)
  return normalizeResponse<CreateHostelsResponseI>(res)
}

export const updateHostelApi = async (
  payload: UpdateHostelPayloadI
): Promise<UpdateHostelResponseI> => {
  const res = await apiClient.put("/Hostel/Update", payload)
  return normalizeResponse<UpdateHostelResponseI>(res)
}

export const deleteHostelApi = async (
  id: string
): Promise<DeleteHostelResponseI> => {
  const res = await apiClient.delete(`/Hostel/Delete/${id}`)
  return normalizeResponse<DeleteHostelResponseI>(res)
}

export const getAllHostelsApi = async (
  params: GetAllHostelsParamsI
): Promise<GetAllHostelsResponseI> => {
  const res = await apiClient.get("/Hostel/GetAll", { params })
  return normalizeResponse<GetAllHostelsResponseI>(res)
}

export const getHostelByIdApi = async (
  id: string
): Promise<GetHostelByIdResponseI> => {
  const res = await apiClient.get(`/Hostel/GetById/${id}`)
  return normalizeResponse<GetHostelByIdResponseI>(res)
}

export const createHostelCategoriesApi = async (
  payload: CreateHostelCategoriesPayloadI
): Promise<CreateHostelCategoriesResponseI> => {
  const res = await apiClient.post("/HostelCategory/Create", payload)
  return normalizeResponse<CreateHostelCategoriesResponseI>(res)
}

export const updateHostelCategoryApi = async (
  payload: UpdateHostelCategoryPayloadI
): Promise<UpdateHostelCategoryResponseI> => {
  const res = await apiClient.put("/HostelCategory/Update", payload)
  return normalizeResponse<UpdateHostelCategoryResponseI>(res)
}

export const deleteHostelCategoryApi = async (
  id: string
): Promise<DeleteHostelCategoryResponseI> => {
  const res = await apiClient.delete(`/HostelCategory/Delete/${id}`)
  return normalizeResponse<DeleteHostelCategoryResponseI>(res)
}

export const getAllHostelCategoriesApi = async (
  params: GetAllHostelCategoriesParamsI
): Promise<GetAllHostelCategoriesResponseI> => {
  const res = await apiClient.get("/HostelCategory/GetAll", { params })
  return normalizeResponse<GetAllHostelCategoriesResponseI>(res)
}

export const getHostelCategoryByIdApi = async (
  id: string
): Promise<GetHostelCategoryByIdResponseI> => {
  const res = await apiClient.get(`/HostelCategory/GetById/${id}`)
  return normalizeResponse<GetHostelCategoryByIdResponseI>(res)
}

export const createHostelRoomApi = async (
  payload: CreateHostelRoomPayloadI
): Promise<CreateHostelRoomResponseI> => {
  const res = await apiClient.post("/HostelRoom/Create", payload)
  return normalizeResponse<CreateHostelRoomResponseI>(res)
}

export const updateHostelRoomApi = async (
  payload: UpdateHostelRoomPayloadI
): Promise<UpdateHostelRoomResponseI> => {
  const res = await apiClient.put("/HostelRoom/Update", payload)
  return normalizeResponse<UpdateHostelRoomResponseI>(res)
}

export const deleteHostelRoomApi = async (
  id: string
): Promise<DeleteHostelRoomResponseI> => {
  const res = await apiClient.delete(`/HostelRoom/Delete/${id}`)
  return normalizeResponse<DeleteHostelRoomResponseI>(res)
}

export const getAllHostelRoomsApi = async (
  params: GetAllHostelRoomsParamsI
): Promise<GetAllHostelRoomsResponseI> => {
  const res = await apiClient.get("/HostelRoom/GetAll", { params })
  return normalizeResponse<GetAllHostelRoomsResponseI>(res)
}

export const getHostelRoomByIdApi = async (
  id: string
): Promise<GetHostelRoomByIdResponseI> => {
  const res = await apiClient.get(`/HostelRoom/GetById/${id}`)
  return normalizeResponse<GetHostelRoomByIdResponseI>(res)
}

export const getHostelRoomsByHostelTypeApi = async (
  hostelId: string
): Promise<GetHostelRoomsByHostelTypeResponseI> => {
  const res = await apiClient.get(`/HostelRoom/GetByHostel/${hostelId}`)
  return normalizeResponse<GetHostelRoomsByHostelTypeResponseI>(res)
}

export const getAvailableHostelRoomsApi = async (
  params: GetAvailableHostelRoomsParamsI
): Promise<GetAvailableHostelRoomsResponseI> => {
  const res = await apiClient.get("/HostelRoom/GetAvailable", { params })
  return normalizeResponse<GetAvailableHostelRoomsResponseI>(res)
}

export const getRollCallSheetApi = async ({
  hostelId,
  date,
  period,
}: GetRollCallSheetParamsI): Promise<GetRollCallSheetResponseI> => {
  const res = await apiClient.get("/HostelAttendance/RollCallSheet", {
    params: { HostelId: hostelId, Date: date, Period: period },
  })
  return normalizeResponse<GetRollCallSheetResponseI>(res)
}

export const submitHostelAttendanceApi = async (
  payload: SubmitHostelAttendancePayloadI
): Promise<SubmitHostelAttendanceResponseI> => {
  const res = await apiClient.post("/HostelAttendance/Submit", payload)
  return normalizeResponse<SubmitHostelAttendanceResponseI>(res)
}

export const getHostelAttendanceHistoryApi = async ({
  schoolId,
  hostelId,
  period,
  date,
  pageNumber,
  pageSize,
}: GetHostelAttendanceHistoryParamsI): Promise<GetHostelAttendanceHistoryResponseI> => {
  const res = await apiClient.get("/HostelAttendance/History", {
    params: {
      SchoolId: schoolId,
      HostelId: hostelId,
      Period: period,
      Date: date,
      PageNumber: pageNumber,
      PageSize: pageSize,
    },
  })
  return normalizeResponse<GetHostelAttendanceHistoryResponseI>(res)
}

export const getHostelAttendanceSessionByIdApi = async (
  sessionId: string
): Promise<GetHostelAttendanceSessionByIdResponseI> => {
  const res = await apiClient.get(`/HostelAttendance/History/${sessionId}`)
  return normalizeResponse<GetHostelAttendanceSessionByIdResponseI>(res)
}

export const getHostelReportOverviewApi = async (
  params: GetHostelReportOverviewParamsI
): Promise<GetHostelReportOverviewResponseI> => {
  const res = await apiClient.get("/HostelReport/Overview", { params })
  return normalizeResponse<GetHostelReportOverviewResponseI>(res)
}

export const getAllHostelReportsApi = async (
  params: GetAllHostelReportsParamsI
): Promise<GetAllHostelReportsResponseI> => {
  const res = await apiClient.get("/HostelReport/GetAll", { params })
  return normalizeResponse<GetAllHostelReportsResponseI>(res)
}

export const getHostelReportByIdApi = async (
  id: string
): Promise<GetHostelReportByIdResponseI> => {
  const res = await apiClient.get(`/HostelReport/${id}`)
  return normalizeResponse<GetHostelReportByIdResponseI>(res)
}

export const fileHostelReportApi = async (
  payload: FileHostelReportPayloadI
): Promise<FileHostelReportResponseI> => {
  const res = await apiClient.post("/HostelReport/File", payload)
  return normalizeResponse<FileHostelReportResponseI>(res)
}

export const billHostelReportApi = async ({
  id,
  ...payload
}: BillHostelReportPayloadI & {
  id: string
}): Promise<BillHostelReportResponseI> => {
  const res = await apiClient.put(`/HostelReport/Bill/${id}`, payload)
  return normalizeResponse<BillHostelReportResponseI>(res)
}

export const waiveHostelReportApi = async (
  id: string
): Promise<WaiveHostelReportResponseI> => {
  const res = await apiClient.put(`/HostelReport/Waive/${id}`)
  return normalizeResponse<WaiveHostelReportResponseI>(res)
}

export const deleteHostelReportApi = async (
  id: string
): Promise<DeleteHostelReportResponseI> => {
  const res = await apiClient.delete(`/HostelReport/Delete/${id}`)
  return normalizeResponse<DeleteHostelReportResponseI>(res)
}

export const assignHostelSupervisorApi = async (
  payload: AssignHostelSupervisorPayloadI
): Promise<AssignHostelSupervisorResponseI> => {
  const res = await apiClient.post("/Hostel/AssignSupervisor", payload)
  return normalizeResponse<AssignHostelSupervisorResponseI>(res)
}

export const unassignHostelSupervisorApi = async (
  payload: UnassignHostelSupervisorPayloadI
): Promise<UnassignHostelSupervisorResponseI> => {
  const res = await apiClient.post("/Hostel/UnassignSupervisor", payload)
  return normalizeResponse<UnassignHostelSupervisorResponseI>(res)
}

export const getAllHostelSupervisorsApi = async (
  params: GetAllHostelSupervisorsParamsI
): Promise<GetAllHostelSupervisorsResponseI> => {
  const res = await apiClient.get("/Hostel/GetAllSupervisors", { params })
  return normalizeResponse<GetAllHostelSupervisorsResponseI>(res)
}

export const getHostelSupervisorProfileApi = async (
  supervisorId: string
): Promise<GetHostelSupervisorProfileResponseI> => {
  const res = await apiClient.get(
    `/WordPressHostel/Supervisors/${supervisorId}`
  )
  return normalizeResponse<GetHostelSupervisorProfileResponseI>(res)
}

export const recordHostelVisitorApi = async (
  payload: RecordHostelVisitorPayloadI
): Promise<RecordHostelVisitorResponseI> => {
  const res = await apiClient.post("/HostelVisitor/Record", payload)
  return normalizeResponse<RecordHostelVisitorResponseI>(res)
}

export const getAllHostelVisitorsApi = async (
  params: GetAllHostelVisitorsParamsI
): Promise<GetAllHostelVisitorsResponseI> => {
  const res = await apiClient.get("/HostelVisitor/GetAll", { params })
  return normalizeResponse<GetAllHostelVisitorsResponseI>(res)
}

export const getHostelVisitorByIdApi = async (
  id: string
): Promise<GetHostelVisitorByIdResponseI> => {
  const res = await apiClient.get(`/HostelVisitor/${id}`)
  return normalizeResponse<GetHostelVisitorByIdResponseI>(res)
}

export const updateHostelVisitorApi = async ({
  id,
  ...payload
}: UpdateHostelVisitorPayloadI): Promise<UpdateHostelVisitorResponseI> => {
  const res = await apiClient.put(`/HostelVisitor/Update/${id}`, {
    id,
    ...payload,
  })
  return normalizeResponse<UpdateHostelVisitorResponseI>(res)
}

export const signInOutHostelVisitorApi = async ({
  id,
  isSignIn,
}: SignInOutHostelVisitorPayloadI): Promise<SignInOutHostelVisitorResponseI> => {
  const res = await apiClient.patch(`/HostelVisitor/SignInOut/${id}`, {
    id,
    isSignIn,
  })
  return normalizeResponse<SignInOutHostelVisitorResponseI>(res)
}

export const deleteHostelVisitorApi = async (
  id: string
): Promise<DeleteHostelVisitorResponseI> => {
  const res = await apiClient.delete(`/HostelVisitor/Delete/${id}`)
  return normalizeResponse<DeleteHostelVisitorResponseI>(res)
}

export const createBedSpaceApi = async (
  payload: CreateBedSpacePayloadI
): Promise<CreateBedSpaceResponseI> => {
  const res = await apiClient.post("/BedSpace/Create", payload)
  return normalizeResponse<CreateBedSpaceResponseI>(res)
}

export const updateBedSpaceApi = async (
  payload: UpdateBedSpacePayloadI
): Promise<UpdateBedSpaceResponseI> => {
  const res = await apiClient.put("/BedSpace/Update", payload)
  return normalizeResponse<UpdateBedSpaceResponseI>(res)
}

export const deleteBedSpaceApi = async (
  id: string
): Promise<DeleteBedSpaceResponseI> => {
  const res = await apiClient.delete(`/BedSpace/Delete/${id}`)
  return normalizeResponse<DeleteBedSpaceResponseI>(res)
}

export const assignBedSpaceApi = async (
  payload: AssignBedSpacePayloadI
): Promise<AssignBedSpaceResponseI> => {
  const res = await apiClient.post("/WordPressHostel/AssignBed", payload)
  return normalizeResponse<AssignBedSpaceResponseI>(res)
}

export const releaseBedSpaceApi = async (
  bedSpaceId: string
): Promise<ReleaseBedSpaceResponseI> => {
  const res = await apiClient.post(`/WordPressHostel/ReleaseBed/${bedSpaceId}`)
  return normalizeResponse<ReleaseBedSpaceResponseI>(res)
}

export const getAllBedSpacesApi = async (
  params: GetAllBedSpacesParamsI
): Promise<GetAllBedSpacesResponseI> => {
  const res = await apiClient.get("/BedSpace/GetAll", { params })
  return normalizeResponse<GetAllBedSpacesResponseI>(res)
}

export const getBedSpaceByIdApi = async (
  id: string
): Promise<GetBedSpaceByIdResponseI> => {
  const res = await apiClient.get(`/BedSpace/GetById/${id}`)
  return normalizeResponse<GetBedSpaceByIdResponseI>(res)
}

export const getBedSpacesByRoomApi = async (
  roomId: string
): Promise<GetBedSpacesByRoomResponseI> => {
  const res = await apiClient.get(`/BedSpace/GetByRoom/${roomId}`)
  return normalizeResponse<GetBedSpacesByRoomResponseI>(res)
}

export const getAvailableBedSpacesApi = async (
  params: GetAvailableBedSpacesParamsI
): Promise<GetAvailableBedSpacesResponseI> => {
  const res = await apiClient.get("/BedSpace/GetAvailable", { params })
  return normalizeResponse<GetAvailableBedSpacesResponseI>(res)
}

export const getBedSpacesByStudentApi = async (
  studentId: string
): Promise<GetBedSpacesByStudentResponseI> => {
  const res = await apiClient.get(`/BedSpace/GetByStudent/${studentId}`)
  return normalizeResponse<GetBedSpacesByStudentResponseI>(res)
}
