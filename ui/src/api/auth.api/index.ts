/* eslint-disable @typescript-eslint/no-explicit-any */
import apiClient from "../api"
import type {
  ForgotPasswordI,
  GetStartedI,
  GetStartedResponseI,
  LoginI,
  LoginResponseI,
  NewPasswordI,
  ResendMfaOtpPayload,
  ResendMfaOtpResponseI,
  StudentChangePasswordI,
  StudentChangePasswordResponseI,
  UserProfileResponseI,
  VerifyEmailResponseI,
  VerifyMfaOtpPayload,
  VerifyMfaOtpResponseI,
  UserSessionsResponseI,
  UpdateUserProfileI,
} from "./types"

export const getStartedApi = async (
  payload: GetStartedI
): Promise<GetStartedResponseI | any> => {
  const res = await apiClient.post("/SystemUser/CreateUser", payload)

  return res
}

export const verifyEmailApi = async (
  token: string
): Promise<VerifyEmailResponseI | any> => {
  const data = await apiClient.get("/Users/verify-email", {
    params: { Token: token },
    headers: {
      accept: "text/plain",
    },
  })

  return data
}

export const loginApi = async (
  payload: LoginI
): Promise<LoginResponseI | any> => {
  return apiClient.post("/Users/authenticate", payload)
}

export const forgotPasswordApi = async (
  payload: ForgotPasswordI
): Promise<GetStartedResponseI | any> => {
  const data = await apiClient.post("/Users/forgot-password", {
    email: payload.email,
  })
  return data
}

export const resetPasswordApi = async (payload: NewPasswordI): Promise<any> => {
  const res = await apiClient.post("/Users/reset-password", payload)
  return res
}

export const logoutApi = async () => {
  const res = await apiClient.post(`/Users/logout`)

  return res
}

export const getUserSessionsApi = async (): Promise<UserSessionsResponseI> =>
  apiClient.get("/Users/sessions")

export const revokeUserSessionApi = async (sessionId: string) =>
  apiClient.delete(`/Users/sessions/${encodeURIComponent(sessionId)}`)

export const getUserProfileApi = async (): Promise<
  UserProfileResponseI | any
> => {
  const data = await apiClient.get(`/Users/my-profile`)

  return data
}

export const updateUserProfileApi = async (payload: UpdateUserProfileI) =>
  apiClient.put("/SystemUser/ModifyUserProfile", payload)

export const studentChangePasswordApi = async (
  payload: StudentChangePasswordI
): Promise<StudentChangePasswordResponseI | any> => {
  const res = await apiClient.post("/Users/student-change-password", payload)
  return res
}

export const verifyMfaOtpApi = async (
  payload: VerifyMfaOtpPayload
): Promise<VerifyMfaOtpResponseI | any> => {
  const res = await apiClient.post("/Users/VerifyMfaOtp", payload)
  return res
}

export const resendMfaOtpApi = async (
  payload: ResendMfaOtpPayload
): Promise<ResendMfaOtpResponseI | any> => {
  const res = await apiClient.post("/Users/ResendMfaOtp", payload)
  return res
}
