import type { SafeguardingReferralAgency } from "@/api/safeguarding.api"

export type StudentSupportFrameworkProfile = "International" | "UnitedKingdom"

export interface StudentSupportReferralAgencyOptionI {
  value: SafeguardingReferralAgency
  label: string
}

export interface SchoolStudentSupportSettingsI {
  profile: StudentSupportFrameworkProfile
  countryCode: string
  jurisdictionCode: string
  learnerSupportName: string
  learnerSupportLeadTitle: string
  supportRegisterName: string
  formalAssessmentLabel: string
  formalPlanLabel: string
  safeguardingName: string
  safeguardingLeadTitle: string
  deputySafeguardingLeadTitle: string
  emergencyServicesName: string
  emergencyPhoneNumber?: string
  emergencyGuidance: string
  localPolicyReference?: string
  canConfigure: boolean
  referralAgencies: StudentSupportReferralAgencyOptionI[]
}

export type UpdateSchoolStudentSupportSettingsPayloadI = Omit<
  SchoolStudentSupportSettingsI,
  "canConfigure" | "referralAgencies"
> & { schoolId: string }

export interface ApiResult<T> {
  value: T
  isSuccess: boolean
  message?: string
  statusCode: number
}
