import apiClient from "../api"
import { normalizeResponse } from "@/utils/apiResponse"
import type {
  GetHealthRecordOverviewParamsI,
  GetHealthRecordOverviewResponseI,
  GetAllSickBayLogsParamsI,
  GetAllSickBayLogsResponseI,
  GetSickBayLogByIdResponseI,
  LogSickBayVisitPayloadI,
  LogSickBayVisitResponseI,
  UpdateSickBayLogPayloadI,
  UpdateSickBayLogResponseI,
  VoidSickBayLogPayloadI,
  VoidSickBayLogResponseI,
  GetAllStudentHealthRecordsParamsI,
  GetAllStudentHealthRecordsResponseI,
  GetStudentHealthRecordByIdResponseI,
  UpsertStudentHealthRecordPayloadI,
  UpsertStudentHealthRecordResponseI,
  GetStudentHealthWorkspaceResponseI,
  SaveHealthCarePlanPayloadI,
  RecordHealthConsentPayloadI,
  CreateMedicationAuthorisationPayloadI,
  RecordMedicationAdministrationPayloadI,
  RecordHealthIncidentPayloadI,
  HealthApiResponseI,
  HealthCarePlanI,
  HealthConsentI,
  MedicationAuthorisationI,
  MedicationAdministrationI,
  HealthIncidentI,
  GetHealthAccessResponseI,
  GetHealthAccessGrantsResponseI,
  GrantHealthAccessPayloadI,
  HealthAccessGrantI,
  ActivateEmergencyHealthAccessPayloadI,
  ActivateEmergencyHealthAccessResponseI,
  GetHealthSecurityAlertsResponseI,
} from "./types"

export const getHealthRecordOverviewApi = async (
  params: GetHealthRecordOverviewParamsI
): Promise<GetHealthRecordOverviewResponseI> => {
  const res = await apiClient.get("/HealthRecord/Overview", { params })
  return normalizeResponse<GetHealthRecordOverviewResponseI>(res)
}

export const getAllSickBayLogsApi = async (
  params: GetAllSickBayLogsParamsI
): Promise<GetAllSickBayLogsResponseI> => {
  const res = await apiClient.get("/HealthRecord/SickBay/GetAll", { params })
  return normalizeResponse<GetAllSickBayLogsResponseI>(res)
}

export const getSickBayLogByIdApi = async (
  id: string,
  schoolId: string
): Promise<GetSickBayLogByIdResponseI> => {
  const res = await apiClient.get(`/HealthRecord/SickBay/${id}`, {
    params: { schoolId },
  })
  return normalizeResponse<GetSickBayLogByIdResponseI>(res)
}

export const logSickBayVisitApi = async (
  payload: LogSickBayVisitPayloadI
): Promise<LogSickBayVisitResponseI> => {
  const res = await apiClient.post("/HealthRecord/SickBay/Log", payload)
  return normalizeResponse<LogSickBayVisitResponseI>(res)
}

export const updateSickBayLogApi = async ({
  id,
  schoolId,
  ...payload
}: UpdateSickBayLogPayloadI): Promise<UpdateSickBayLogResponseI> => {
  const res = await apiClient.put(
    `/HealthRecord/SickBay/Update/${id}`,
    {
      id,
      ...payload,
    },
    {
      params: { schoolId },
    }
  )
  return normalizeResponse<UpdateSickBayLogResponseI>(res)
}

export const voidSickBayLogApi = async ({
  id,
  schoolId,
  reason,
}: VoidSickBayLogPayloadI): Promise<VoidSickBayLogResponseI> => {
  const res = await apiClient.post(
    `/HealthRecord/SickBay/${id}/void`,
    { reason },
    { params: { schoolId } }
  )
  return normalizeResponse<VoidSickBayLogResponseI>(res)
}

export const getAllStudentHealthRecordsApi = async (
  params: GetAllStudentHealthRecordsParamsI
): Promise<GetAllStudentHealthRecordsResponseI> => {
  const res = await apiClient.get("/HealthRecord/StudentRecords/GetAll", {
    params,
  })
  return normalizeResponse<GetAllStudentHealthRecordsResponseI>(res)
}

export const getStudentHealthRecordByIdApi = async (
  studentSchoolId: string,
  schoolId: string
): Promise<GetStudentHealthRecordByIdResponseI> => {
  const res = await apiClient.get(
    `/HealthRecord/StudentRecords/${studentSchoolId}`,
    { params: { schoolId } }
  )
  return normalizeResponse<GetStudentHealthRecordByIdResponseI>(res)
}

export const upsertStudentHealthRecordApi = async (
  payload: UpsertStudentHealthRecordPayloadI
): Promise<UpsertStudentHealthRecordResponseI> => {
  const res = await apiClient.post(
    "/HealthRecord/StudentRecords/Upsert",
    payload
  )
  return normalizeResponse<UpsertStudentHealthRecordResponseI>(res)
}

export const getStudentHealthWorkspaceApi = async (
  schoolId: string,
  studentSchoolId: string
): Promise<GetStudentHealthWorkspaceResponseI> => {
  const res = await apiClient.get(
    `/HealthRecord/schools/${schoolId}/students/${studentSchoolId}/workspace`
  )
  return normalizeResponse<GetStudentHealthWorkspaceResponseI>(res)
}

export const getMyHealthAccessApi = async (
  schoolId: string
): Promise<GetHealthAccessResponseI> => {
  const res = await apiClient.get(`/HealthRecord/schools/${schoolId}/access/me`)
  return normalizeResponse<GetHealthAccessResponseI>(res)
}

export const getHealthAccessGrantsApi = async (
  schoolId: string
): Promise<GetHealthAccessGrantsResponseI> => {
  const res = await apiClient.get(
    `/HealthRecord/schools/${schoolId}/access-grants`
  )
  return normalizeResponse<GetHealthAccessGrantsResponseI>(res)
}

export const grantHealthAccessApi = async ({
  schoolId,
  ...payload
}: GrantHealthAccessPayloadI): Promise<
  HealthApiResponseI<HealthAccessGrantI>
> => {
  const res = await apiClient.post(
    `/HealthRecord/schools/${schoolId}/access-grants`,
    payload
  )
  return normalizeResponse<HealthApiResponseI<HealthAccessGrantI>>(res)
}

export const activateEmergencyHealthAccessApi = async ({
  schoolId,
  studentSchoolId,
  reason,
}: ActivateEmergencyHealthAccessPayloadI): Promise<ActivateEmergencyHealthAccessResponseI> => {
  const res = await apiClient.post(
    `/HealthRecord/schools/${schoolId}/students/${studentSchoolId}/emergency-access`,
    { reason }
  )
  return normalizeResponse<ActivateEmergencyHealthAccessResponseI>(res)
}

export const getHealthSecurityAlertsApi = async (
  schoolId: string
): Promise<GetHealthSecurityAlertsResponseI> => {
  const res = await apiClient.get(
    `/HealthRecord/schools/${schoolId}/security-alerts`,
    { params: { unacknowledgedOnly: true } }
  )
  return normalizeResponse<GetHealthSecurityAlertsResponseI>(res)
}

export const acknowledgeHealthSecurityAlertApi = async (
  schoolId: string,
  alertId: string
): Promise<HealthApiResponseI<string>> => {
  const res = await apiClient.post(
    `/HealthRecord/schools/${schoolId}/security-alerts/${alertId}/acknowledge`
  )
  return normalizeResponse<HealthApiResponseI<string>>(res)
}

export const saveHealthCarePlanApi = async ({
  schoolId,
  studentSchoolId,
  ...payload
}: SaveHealthCarePlanPayloadI): Promise<
  HealthApiResponseI<HealthCarePlanI>
> => {
  const res = await apiClient.post(
    `/HealthRecord/schools/${schoolId}/students/${studentSchoolId}/care-plans`,
    payload
  )
  return normalizeResponse<HealthApiResponseI<HealthCarePlanI>>(res)
}

export const recordHealthConsentApi = async ({
  schoolId,
  studentSchoolId,
  ...payload
}: RecordHealthConsentPayloadI): Promise<
  HealthApiResponseI<HealthConsentI>
> => {
  const res = await apiClient.post(
    `/HealthRecord/schools/${schoolId}/students/${studentSchoolId}/consents`,
    payload
  )
  return normalizeResponse<HealthApiResponseI<HealthConsentI>>(res)
}

export const createMedicationAuthorisationApi = async ({
  schoolId,
  studentSchoolId,
  ...payload
}: CreateMedicationAuthorisationPayloadI): Promise<
  HealthApiResponseI<MedicationAuthorisationI>
> => {
  const res = await apiClient.post(
    `/HealthRecord/schools/${schoolId}/students/${studentSchoolId}/medications`,
    payload
  )
  return normalizeResponse<HealthApiResponseI<MedicationAuthorisationI>>(res)
}

export const recordMedicationAdministrationApi = async ({
  schoolId,
  medicationAuthorisationId,
  ...payload
}: RecordMedicationAdministrationPayloadI): Promise<
  HealthApiResponseI<MedicationAdministrationI>
> => {
  const res = await apiClient.post(
    `/HealthRecord/schools/${schoolId}/medications/${medicationAuthorisationId}/administrations`,
    payload
  )
  return normalizeResponse<HealthApiResponseI<MedicationAdministrationI>>(res)
}

export const recordHealthIncidentApi = async ({
  schoolId,
  studentSchoolId,
  ...payload
}: RecordHealthIncidentPayloadI): Promise<
  HealthApiResponseI<HealthIncidentI>
> => {
  const res = await apiClient.post(
    `/HealthRecord/schools/${schoolId}/students/${studentSchoolId}/incidents`,
    payload
  )
  return normalizeResponse<HealthApiResponseI<HealthIncidentI>>(res)
}
