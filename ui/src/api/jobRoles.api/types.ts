/* eslint-disable @typescript-eslint/no-explicit-any */
export interface SystemJobRoleItem {
  Value: number
  Name: string
  Description: string
}

export interface GetSystemJobRolesResponseI {
  Value: SystemJobRoleItem[]
  IsSuccess: boolean
  Error: string
  Timestamp: any
  IsFailure: boolean
}

export interface CreateJobRolePayloadI {
  name: string
  description: string
  systemJobRole: number
  schoolId: string
}

export interface CreateJobRoleResponseI {
  IsSuccess: boolean
  Error: string
  Timestamp: any
  IsFailure: boolean
}


export interface UpdateJobRolePayloadI {
  id: string
  name: string
  description: string
  systemJobRole?: number
}

export interface UpdateJobRoleResponseI {
  IsSuccess: boolean
  Error: string
  Timestamp: any
  IsFailure: boolean
}


export interface DeleteJobRoleResponseI {
  IsSuccess: boolean
  Error: string
  Timestamp: any
  IsFailure: boolean
}


export interface JobRoleItem {
  Id: string
  Name: string
  Description: string
  SystemJobRole: string | number
  SystemJobRoleName: string
  DateCreated: string
  DateModified: string
}


export interface GetBySchoolResponseI {
  Value: JobRoleItem[]
  IsSuccess: boolean
  Error: string
  Timestamp: any
  IsFailure: boolean
}


export interface GetBySchoolPaginatedParams {
  schoolId: string
  pageNumber?: number
  pageSize?: number
  keyword?: string
}

export interface PaginatedJobRolesValue {
  Items: JobRoleItem[]
  PageNumber: number
  PageSize: number
  TotalItems: number
  TotalPages: number
}

export interface GetBySchoolPaginatedResponseI {
  Value: PaginatedJobRolesValue
  IsSuccess: boolean
  Error: string
  Timestamp: any
  IsFailure: boolean
}


export interface GetByIdResponseI {
  Value: JobRoleItem
  IsSuccess: boolean
  Error: string
  Timestamp: any
  IsFailure: boolean
}
