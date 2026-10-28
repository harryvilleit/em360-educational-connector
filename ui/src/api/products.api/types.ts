/* eslint-disable @typescript-eslint/no-explicit-any */
export interface GetUserProductsParams {
  pageNumber?: number
  pageSize?: number
  keyword?: string
  productId?: string
}

export interface AllProductsResponseI {
  Value: Value
  IsSuccess: boolean
  Error: string
  Timestamp: any
  IsFailure: boolean
}

export interface Value {
  Items: Item[]
  PageNumber: number
  PageSize: number
  TotalItems: number
  TotalPages: number
}

export interface Item {
  Id: string
  Name: string
  Description: string
  DateCreated: string
  DateModified: string
}

export interface ProductCatalogueItemI {
  id: string
  code: string
  name: string
  description: string
  tagline: string
  badgeLabel: string
  iconKey: string
  themeKey: string
  displayOrder: number
  status: string
  benefits: string[]
  dateCreated: string
  dateModified: string
}

export interface ProductCatalogueResponseI {
  value: ProductCatalogueItemI[]
  isSuccess: boolean
  message?: string
  error?: string
  isFailure?: boolean
  statusCode: number
}

export interface CreateSchoolResponseI {
  isSuccess: boolean
  value?: { schoolId: string }
  message?: string
  error?: string
}

export interface CreateSchoolPayloadI {
  CountryCode: string
  EstablishedYear: number
  WebsiteUrl?: string
  Tagline?: string
  SchoolTypes: string[]
  OtherSchoolType?: string
  Ownership: string
  PublicPrograms: string[]
  Facilities: { name: string; imageFile?: File | null }[]
  Name: string
  Description: string
  Logo?: File
  RegistrationNumber: string
  Address: string
  State: string
  LGA: string
  City: string
  PhoneNumber: string
  Email: string
  TimeZoneId: string
  ProductId: string
  ProductModuleIds: string[]
}

export interface TimeZoneOptionI {
  Id: string
  DisplayName: string
  UtcOffset: string
  UtcOffsetMinutes: number
}

/** Body for PUT /School/{schoolId}/TimeZone. */
export interface UpdateSchoolTimeZonePayloadI {
  schoolId: string
  timeZoneId: string
}

export interface UpdateSchoolTimeZoneResponseI {
  IsSuccess: boolean
  Message: string
  Error: string
  IsFailure: boolean
  StatusCode: number
}

export interface UpdateSchoolProfilePayloadI {
  schoolId: string
  name: string
  description: string
  registrationNumber: string
  address: string
  state: string
  lga: string
  city: string
  phoneNumber: string
  email: string
  logo?: File | null
}

export interface GetTimeZonesResponseI {
  Value: TimeZoneOptionI[]
  IsSuccess: boolean
  Message: string
  Error: string
  IsFailure: boolean
  StatusCode: number
}

export interface GetModuleByIdResponseI {
  Value: ModuleValue[]
  IsSuccess: boolean
  Error: string
  Timestamp: any
  IsFailure: boolean
}

export interface ModuleValue {
  Id: string
  ProductId: string
  ProductName: string
  Name: string
  Description: string
  Status: string
  DateCreated: string
  DateModified: string
  Menus: any[]
}

export interface JobRole {
  UserJobRoleId: string
  SchoolJobRoleId: string
  JobRoleName: string
  JobRoleDescription: string
}

export interface LaunchPermission {
  Permission: string | number
  PermissionName?: string
}

export interface LaunchMenu {
  MenuName: string
  MenuUrl: string
  Permissions: LaunchPermission[]
}

export interface LaunchModule {
  ModuleName: string
  ModuleDescription: string
  Status: string
  Menus: LaunchMenu[]
}

export interface LaunchDashboardValue {
  School: Record<string, any>
  UserRole: string
  JobRoles: JobRole[]
  Modules: LaunchModule[]
}

export interface GetUserAssignedDashboardResponseI {
  Value: LaunchDashboardValue
  IsSuccess: boolean
  Error: string
  Timestamp: any
  IsFailure: boolean
}

export interface SchoolPortalAccessValueI {
  schoolId: string
  canLaunch: boolean
  isSchoolOwner: boolean
  canManageSubscription: boolean
  reason: "Trial" | "Paid" | "RenewalGrace" | "SubscriptionRequired" | "AdminBlocked" | "AwaitingApproval" | "SchoolNotFound"
  accessEndsAtUtc: string | null
}

export interface SchoolPortalAccessResponseI {
  value: SchoolPortalAccessValueI
  isSuccess: boolean
  message?: string
  error?: string
  isFailure: boolean
  statusCode: number
}

export interface UserProfileJobRoleI {
  userJobRoleId: string
  schoolJobRoleId: string
  jobRoleName: string
  jobRoleDescription: string
}

export interface ProductSchoolI {
  schoolId: string
  name: string
  description: string
  logoUrl: string
  registrationNumber: string
  status?: string
  dateCreated: string
  jobRoles: UserProfileJobRoleI[]
}

export interface UserSubProductItem {
  productCode?: string | null
  productUserId: string | null
  productId: string
  productName: string
  schools: ProductSchoolI[]
}

export interface PortalSchoolI {
  id: string
  name: string
  description: string
  logoUrl: string
  registrationNumber: string
  address: string | null
  state: string | null
  lga: string | null
  city: string | null
  phoneNumber: string | null
  email: string | null
  countryCode: string | null
  baseCurrency: string | null
  timeZoneId: string | null
  status?: string
  userId: string | null
  userName: string | null
  role?: string
  dateCreated: string
  dateModified: string
}

export interface UserSubProductsValue {
  guardianId: string | null
  studentId: string | null
  products: UserSubProductItem[]
  studentSchools: PortalSchoolI[]
  parentSchools: PortalSchoolI[]
}

export interface UserSubProductsResponseI {
  value: UserSubProductsValue
  isSuccess: boolean
  message: string
  error?: string
  isFailure?: boolean
  statusCode: number
}
