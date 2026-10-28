export interface PeriodTypeI {
  id: string
  schoolId: string
  name: string
  description: string
  code: string
  isBuiltIn: boolean
  status: string
  statusName: string
  dateCreated: string
  dateModified: string
}

export interface CreatePeriodTypePayloadI {
  schoolId: string
  name: string
  description?: string
}

export interface CreatePeriodTypeResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: PeriodTypeI
}

export interface GetPeriodTypesBySchoolParamsI {
  schoolId: string
  status?: string
  pageNumber?: number
  pageSize?: number
}

export interface PaginatedPeriodTypesValueI {
  items: PeriodTypeI[]
  pageNumber: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export interface GetPeriodTypesBySchoolResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: PaginatedPeriodTypesValueI
}

export interface UpdatePeriodTypePayloadI {
  id: string
  schoolId: string
  name: string
  description?: string
}

export interface UpdatePeriodTypeResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: PeriodTypeI
}

export interface PeriodTypeIdPayloadI {
  id: string
  schoolId: string
}

export interface TogglePeriodTypeStatusResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: PeriodTypeI
}

export interface DeletePeriodTypeResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: string
}
