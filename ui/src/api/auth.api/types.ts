/* eslint-disable @typescript-eslint/no-explicit-any */
export interface GetStartedI {
  firstName: string
  lastName: string
  phoneNumber: string
  email: string
  address: string
  password: string
  confirmPassword: string
  status: number
}

export interface GetStartedResponseI {
  Value: string
  IsSuccess: boolean
  Error: string
  Timestamp: any
  IsFailure: boolean
}

export interface VerifyEmailResponseI {
  IsSuccess: boolean
  Error: string
  Timestamp: any
  IsFailure: boolean
}
export interface LoginI {
  username: string
  password: string
}
export interface LoginResponseI {
  Value: Value
  IsSuccess: boolean
  Message?: string
  Error: string
  Timestamp: any
  IsFailure: boolean
}

export interface Value {
  Token_Type: string
  Access_Token: string | null
  Expires_In: number
  Refresh_Token?: string | null
  Csrf_Token: string | null
  Refresh_Expires_In?: number
  PasswordChangeToken?: string
  PasswordChangeExpiresAtUtc?: string
  RequiresMfa?: boolean
  Email?: string
  DestinationEmail?: string
  IsStudent?: boolean
  UserId?: string
  MfaExpiresAtUtc?: string
  MfaResendAvailableAtUtc?: string
}

export interface ForgotPasswordI {
  email: string
}

export interface UserSessionI {
  SessionId: string
  Device: string
  IpAddress?: string | null
  SignedInUtc: string
  LastSeenUtc: string
  IsCurrent: boolean
}

export interface UserSessionsResponseI {
  Value: UserSessionI[]
  IsSuccess: boolean
  Error?: string
  Message?: string
}

export interface NewPasswordI {
  token: string
  newPassword: string
}

export interface UserProfileResponseI {
  Value: UserValue
  IsSuccess: boolean
  Error: string
  Timestamp: any
  IsFailure: boolean
}

export interface UserValue {
  UserId: string
  FirstName: string
  LastName: string
  Email: string
  PhoneNumber: string
  Address: string
  Status: string
  Enabled: boolean
  Roles: string[]
}

export interface UpdateUserProfileI {
  FirstName: string
  LastName: string
  Address: string
  Phone: string
}

export interface StudentChangePasswordI {
  userId: string
  passwordChangeToken: string
  newPassword: string
}

export interface StudentChangePasswordResponseI {
  IsSuccess: boolean
  Message?: string
  Error?: string
}

export interface VerifyMfaOtpPayload {
  email: string
  otpCode: string
}

export interface ResendMfaOtpPayload {
  email: string
}

export type VerifyMfaOtpResponseI = LoginResponseI

export interface ResendMfaOtpResponseI {
  Value: {
    DestinationEmail: string
    MfaExpiresAtUtc: string
    MfaResendAvailableAtUtc: string
  }
  IsSuccess: boolean
  Message?: string
  Error: string
  Timestamp: any
  IsFailure: boolean
}
