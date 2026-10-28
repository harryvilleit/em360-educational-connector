/* eslint-disable @typescript-eslint/no-explicit-any */
export interface CreateJobRoleI {
  name: string
  description: string
  schoolId: string
}

export interface CreateJobRoleResponseI {
  Value: string
  IsSuccess: boolean
  Error: string
  Timestamp: any
  IsFailure: boolean
}

export interface JobRoleItem {
  Id: string
  Name: string
  Description: string
  SchoolId: string
  DateCreated: string
  DateModified: string
}

export interface UpdateJobRoleI {
  id: string
  name: string
  description: string
  schoolId: string
}

export interface GetAllJobRolesResponseI {
  Value: JobRoleItem[]
  IsSuccess: boolean
  Error: string
  Timestamp: any
  IsFailure: boolean
}

export interface GetSingleJobRoleResponseI {
  Value: JobRoleItem
  IsSuccess: boolean
  Error: string
  Timestamp: any
  IsFailure: boolean
}

export interface GetPaginatedJobRolesParams {
  schoolId: string
  pageNumber?: number
  pageSize?: number
  keyword?: string
}

export interface PaginatedJobRolesValue {
  Items: JobRoleItem[]
  TotalItems: number
  PageNumber: number
  PageSize: number
  TotalPages: number
}

export interface GetPaginatedJobRolesResponseI {
  Value: PaginatedJobRolesValue
  IsSuccess: boolean
  Error: string
  Timestamp: any
  IsFailure: boolean
}

export interface CreateSubUserPayloadI {
  firstName: string
  lastName: string
  phoneNumber: string
  email: string
  address: string
  productId: string
  schoolId: string
  jobRoleIds: string[]
  staffId: string
  qualification?: string
  employmentType?: string
  dateOfBirth?: string
  gender?: number
}
export interface CreateSubUserResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
}

export interface ModuleMenuSelection {
  productModuleId: string
  menuPermissions: MenuPermission[]
}

export interface MenuPermission {
  productModuleMenuId: string
  permissions: number[]
}

export interface RoleAccessMenuI {
  productModuleMenuId: string
  menuName: string
  menuUrl: string
  permissions: Array<string | number>
}

export interface RoleAccessModuleI {
  productModuleId: string
  moduleName: string
  moduleDescription: string
  menus: RoleAccessMenuI[]
}

export interface RoleAccessI {
  schoolJobRoleId: string
  roleName: string
  roleDescription: string
  modules: RoleAccessModuleI[]
}

export interface GetRoleAccessResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: RoleAccessI
}

export interface UpdateRoleAccessPayloadI {
  schoolJobRoleId: string
  schoolId: string
  moduleMenuSelections: ModuleMenuSelection[]
}

export interface UpdateRoleAccessResponseI {
  Value: boolean
  IsSuccess: boolean
  Error: string
  Timestamp: any
  IsFailure: boolean
}

export interface LegacyBackfillI {
  SubUsersScanned: number
  SubUsersBackfilled: number
  RolesCreated: number
  SkippedAlreadyHasRole: number
  SkippedNoGrants: number
}

export interface BackfillLegacyAccessResponseI {
  Value: LegacyBackfillI
  IsSuccess: boolean
  Error: string
  Timestamp: any
  IsFailure: boolean
}

export interface SchoolModuleMenu {
  ProductModuleMenuId: string
  MenuName: string
  MenuUrl: string
}

export interface SchoolModule {
  ProductModuleId: string
  ModuleName: string
  ModuleDescription: string
  Status: string
  Menus: SchoolModuleMenu[]
}

export interface SchoolModulesValue {
  SchoolId: string
  SchoolName: string
  Modules: SchoolModule[]
}

export interface GetSchoolModulesResponseI {
  Value: SchoolModulesValue
  IsSuccess: boolean
  Error: string
  Timestamp: any
  IsFailure: boolean
}

export interface GetMySubUsersParams {
  keyword?: string
  subUserId?: string
  schoolId: string
  schoolJobRoleId?: string
  status?: string
  pageNumber?: number
  pageSize?: number
}

export interface SubUserJobRole {
  UserJobRoleId: string
  SchoolJobRoleId: string
  JobRoleName: string
}

export interface SubUserModuleMenu {
  ProductModuleMenuId: string
  MenuName: string
  MenuUrl: string
}

export interface SubUserModule {
  ProductModuleId: string
  ModuleName: string
  Menus: SubUserModuleMenu[]
}

export interface SubUserItem {
  status?: string
  Status?: string
  CanResendRegistrationEmail?: boolean
  canResendRegistrationEmail?: boolean
  SubUserId: string
  ProductUserSubUserId: string
  Email: string | null
  email?: string | null
  FirstName: string
  LastName: string
  PhoneNumber: string
  JobRoles: SubUserJobRole[]
  Modules: SubUserModule[]
  DateCreated: string
}

export interface GetMySubUsersPaginatedValue {
  Items: SubUserItem[]
  TotalItems: number
  PageNumber: number
  PageSize: number
  TotalPages: number
}

export interface GetSubUserAccessParams {
  subUserId: string
  productId: string
}

export interface SubUserAccessMenu {
  ProductModuleMenuId?: string
  productModuleMenuId?: string
  MenuName?: string
  menuName?: string
  MenuUrl?: string
  menuUrl?: string
  Permissions: number[]
}

export interface SubUserAccessModule {
  ProductModuleId?: string
  productModuleId?: string
  ModuleName?: string
  moduleName?: string
  ModuleDescription?: string
  Menus?: SubUserAccessMenu[]
  menus?: SubUserAccessMenu[]
}

export interface SubUserAccessValue {
  SubUserId?: string
  subUserId?: string
  Email?: string | null
  email?: string | null
  FirstName?: string
  firstName?: string
  LastName?: string
  lastName?: string
  ProductId?: string
  productId?: string
  ModuleAccess?: SubUserAccessModule[]
  moduleAccess?: SubUserAccessModule[]
}

export interface GetSubUserAccessResponseI {
  Value: SubUserAccessValue
  IsSuccess: boolean
  Error: string
  Timestamp: any
  IsFailure: boolean
}

export interface DeleteSubUserPayloadI {
  subUserId: string
  productId: string
  schoolId: string
}

export interface GetMySubUsersResponseI {
  Value: GetMySubUsersPaginatedValue
  IsSuccess: boolean
  Error: string
  Timestamp: any
  IsFailure: boolean
}

export interface UpdateModulesPayloadI {
  subUserId: string
  productId: string
  schoolId: string
  productModuleIds: string[]
}

export interface UpdateModulesResponseI {
  IsSuccess: boolean
  Error: string
  Timestamp: any
  IsFailure: boolean
}

export interface GetSubUserAccessEditParams {
  subUserId: string
  schoolId: string
}

export interface PermissionDetail {
  Permission: number
  PermissionName: string
  HasAccess: boolean
}

export interface SubUserAccessEditMenu {
  ProductModuleMenuId: string
  MenuName: string
  MenuUrl: string
  HasAccess: boolean
  Permissions: PermissionDetail[]
}

export interface SubUserAccessEditModule {
  ProductModuleId: string
  ModuleName: string
  ModuleDescription: string
  HasAccess: boolean
  Menus: SubUserAccessEditMenu[]
}

export interface SubUserAccessEditValue {
  SubUserId: string
  SubUserEmail: string
  SubUserFirstName: string
  SubUserLastName: string
  SchoolId: string
  Modules: SubUserAccessEditModule[]
}

export interface GetSubUserAccessEditResponseI {
  Value: SubUserAccessEditValue
  IsSuccess: boolean
  Error: string
  Timestamp: any
  IsFailure: boolean
}

export interface UpdateSubUserAccessPayloadI {
  subUserId: string
  schoolId: string
  moduleMenuSelections: ModuleMenuSelection[]
}

export interface UpdateSubUserAccessResponseI {
  IsSuccess: boolean
  Error: string
  Timestamp: any
  IsFailure: boolean
}

export interface AssignMultipleRolesPayloadI {
  subUserId: string
  schoolId: string
  schoolJobRoleIds: string[]
}

export interface ActivateDeactivatePayloadI {
  subUserId: string
  schoolId: string
}

export interface ActivateDeactivateResponseI {
  IsSuccess: boolean
  Error: string
  Timestamp: any
  IsFailure: boolean
}

export interface ResendRegistrationEmailPayloadI {
  subUserId: string
  schoolId: string
}

export interface ResendRegistrationEmailResponseI {
  isSuccess: boolean
  message: string
  error?: string
  isFailure?: boolean
  statusCode: number
}

// NOTE: unlike ActivateDeactivateResponseI above (raw PascalCase from the
// SubUser controller), this response is normalized to camelCase via
// `normalizeResponse` at the API boundary — see adminResetUserPasswordApi.
export interface AdminResetUserPasswordPayloadI {
  userId: string
  newPassword?: string
  schoolId: string
}

export interface AdminResetUserPasswordResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
}

export interface ManagementDashboardParams {
  schoolId: string
}

export interface SubUserStatistics {
  ActiveCount: number
  InactiveCount: number
  PendingCount: number
  TotalCount: number
}

export interface ModuleAccessSummary {
  ModuleId: string
  ModuleName: string
  TotalUsersWithAccess: number
  TotalSubUsers: number
  AccessPercentage: number
}

export interface JobRoleDistribution {
  JobRoleId: string
  JobRoleName: string
  UserCount: number
}

export interface ManagementDashboardValue {
  SchoolId: string
  SchoolName: string
  SubUserStatistics: SubUserStatistics
  ModuleAccessSummary: ModuleAccessSummary[]
  JobRoleDistribution: JobRoleDistribution[]
}

export interface GetManagementDashboardResponseI {
  Value: ManagementDashboardValue
  IsSuccess: boolean
  Error: string
  Timestamp: any
  IsFailure: boolean
}

export interface CreateSchoolSessionTermI {
  schoolTermId: string
  startDate: string
  endDate: string
}

export interface CreateSchoolSessionPayloadI {
  sessionName: string
  schoolId: string
  terms: CreateSchoolSessionTermI[]
}

export interface UpdateSchoolSessionTermI {
  /** Omit when adding a term that doesn't yet have a session-term id. */
  id?: string
  schoolTermId: string
  startDate: string
  endDate: string
}

export interface UpdateSchoolSessionPayloadI {
  id: string
  sessionName: string
  schoolId: string
  terms: UpdateSchoolSessionTermI[]
}

export interface GetAllSchoolSessionsParams {
  pageNumber?: number
  pageSize?: number
  keyword?: string
  schoolId?: string
}

export interface SchoolSessionTermItem {
  Id: string
  SchoolSessionId: string
  SchoolTermId: string
  TermName: string
  IsCurrent: boolean
  StartDate: string
  EndDate: string
  DateCreated: string
}

export interface SchoolSessionItem {
  Id: string
  SessionName: string
  SchoolId: string
  SchoolName: string
  DateCreated: string
  /** "Active" when this is the current session */
  Status?: string
  /** Convenience — true when Status === "Active" */
  IsCurrent?: boolean
  Terms: SchoolSessionTermItem[]
}

export interface GetAllSchoolSessionsValue {
  Items: SchoolSessionItem[]
  PageNumber: number
  PageSize: number
  TotalItems: number
  TotalPages: number
}

export interface GetAllSchoolSessionsResponseI {
  IsSuccess: boolean
  Error: string
  Timestamp: any
  IsFailure: boolean
  Value: GetAllSchoolSessionsValue
}

export interface GetSchoolSessionByIdResponseI {
  IsSuccess: boolean
  Error: string
  Timestamp: any
  IsFailure: boolean
  Value: SchoolSessionItem
}

export interface BaseSchoolSessionResponseI {
  IsSuccess: boolean
  Error: string
  Timestamp: any
  IsFailure: boolean
}

export interface SetCurrentSessionPayloadI {
  schoolSessionId: string
}

export interface SetCurrentTermPayloadI {
  schoolSessionTermId: string
}

// ─── School Term ───────────────────────────────────────────────────────────────

export interface CreateSchoolTermPayloadI {
  termName: string
  schoolId: string
}

export interface UpdateSchoolTermPayloadI {
  id: string
  termName: string
  schoolId: string
}

export interface GetAllSchoolTermsParams {
  pageNumber?: number
  pageSize?: number
  keyword?: string
  schoolId?: string
}

export interface SchoolTermItem {
  Id: string
  TermName: string
  SchoolId: string
  SchoolName: string
  DateCreated: string
}

// ─── ManageTeachers ───────────────────────────────────────────────────────────

export interface ManageTeachersParams {
  schoolId: string
  status?: string
  pageNumber?: number
  pageSize?: number
}

export interface ManageTeacherJobRoleI {
  userJobRoleId: string
  schoolJobRoleId: string
  jobRoleName: string
}

export interface ManageTeacherModuleMenuI {
  productModuleMenuId: string
  menuName: string
  menuUrl: string
}

export interface ManageTeacherModuleI {
  productModuleId: string
  moduleName: string
  menus: ManageTeacherModuleMenuI[]
}

export interface ManageTeacherItemI {
  subUserId: string
  productUserSubUserId: string
  email: string | null
  firstName: string
  lastName: string
  phoneNumber: string
  status: string
  jobRoles: ManageTeacherJobRoleI[]
  modules: ManageTeacherModuleI[]
  dateCreated: string
}

export interface ManageTeachersPaginatedValueI {
  items: ManageTeacherItemI[]
  pageNumber: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export interface GetManageTeachersResponseI {
  isSuccess: boolean
  error: string
  timestamp: string
  isFailure: boolean
  value: ManageTeachersPaginatedValueI
}

// ─── RemoveJobRoles ───────────────────────────────────────────────────────────

export interface RemoveJobRolesPayloadI {
  subUserId: string
  schoolId: string
  schoolJobRoleIds: string[]
}

export interface RemoveJobRolesResponseI {
  IsSuccess: boolean
  Error: string
  Timestamp: any
  IsFailure: boolean
}

export interface GetAllSchoolTermsValue {
  Items: SchoolTermItem[]
  PageNumber: number
  PageSize: number
  TotalItems: number
  TotalPages: number
}

export interface GetAllSchoolTermsResponseI {
  IsSuccess: boolean
  Error: string
  Timestamp: any
  IsFailure: boolean
  Value: GetAllSchoolTermsValue
}

export interface GetSchoolTermByIdResponseI {
  IsSuccess: boolean
  Error: string
  Timestamp: any
  IsFailure: boolean
  Value: SchoolTermItem
}

export interface BaseSchoolTermResponseI {
  IsSuccess: boolean
  Error: string
  Timestamp: any
  IsFailure: boolean
}
