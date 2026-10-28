import { useState } from "react"
import { useNavigate } from "react-router"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { QueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  forgotPasswordApi,
  getUserSessionsApi,
  getStartedApi,
  getUserProfileApi,
  loginApi,
  logoutApi,
  resendMfaOtpApi,
  resetPasswordApi,
  revokeUserSessionApi,
  studentChangePasswordApi,
  updateUserProfileApi,
  verifyEmailApi,
  verifyMfaOtpApi,
} from "@/api/auth.api"
import type {
  GetStartedI,
  GetStartedResponseI,
  LoginI,
  NewPasswordI,
  ResendMfaOtpPayload,
  StudentChangePasswordI,
  VerifyEmailResponseI,
  VerifyMfaOtpPayload,
  UpdateUserProfileI,
} from "@/api/auth.api/types"
import { ApiError } from "@/api/api"
import { AuthRoutes, HomeRoutes } from "@/routes"
import { useAuthStore } from "@/store/auth.store"
import { queryKeys } from "@/utils/queryKeys"
import { computeTokenExpiresAt } from "@/lib/tokenExpiry"
import type { Module, User } from "@/types"

export function readField<T = unknown>(
  obj: unknown,
  ...keys: string[]
): T | undefined {
  if (!obj || typeof obj !== "object") return undefined
  const record = obj as Record<string, unknown>
  for (const key of keys) {
    if (record[key] !== undefined && record[key] !== null) {
      return record[key] as T
    }
  }
  return undefined
}

function buildUserFromProfile(
  profile: Record<string, unknown>,
  fallbackEmail: string
): User {
  const roles = readField<string[]>(profile, "Roles", "roles")
  return {
    id: readField<string>(profile, "UserId", "userId") ?? "",
    name: `${readField<string>(profile, "FirstName", "firstName") ?? ""} ${
      readField<string>(profile, "LastName", "lastName") ?? ""
    }`.trim(),
    email: readField<string>(profile, "Email", "email") ?? fallbackEmail,
    phoneNumber: readField<string>(profile, "PhoneNumber", "phoneNumber") ?? "",
    jobTitle: roles?.[0] ?? "",
    staffId: "",
    status: readField<boolean>(profile, "Enabled", "enabled")
      ? "active"
      : "inactive",
    createdAt: new Date().toISOString().split("T")[0],
  }
}

function establishAuthSession(
  res: unknown,
  fallbackEmail: string,
  setAuth: (token: string, user: User, modules: Module[]) => void,
  setAuthSession: (
    token: string,
    expiresAt: number,
    csrfToken: string,
    user: User,
    modules: Module[]
  ) => void,
  queryClient: QueryClient
) {
  const value = readField<Record<string, unknown>>(res, "Value", "value") ?? {}
  const accessToken =
    readField<string>(value, "Access_Token", "access_Token") ?? ""
  const csrfToken = readField<string>(value, "Csrf_Token", "csrf_Token") ?? ""
  const expiresIn = readField<number>(value, "Expires_In", "expires_In") ?? 0

  const fallbackUser: User = {
    id: "",
    name: "",
    email: fallbackEmail,
    phoneNumber: "",
    jobTitle: "",
    staffId: "",
    status: "active",
    createdAt: new Date().toISOString().split("T")[0],
  }

  setAuthSession(
    accessToken,
    computeTokenExpiresAt(expiresIn),
    csrfToken,
    fallbackUser,
    []
  )

  getUserProfileApi()
    .then((profileRes) => {
      queryClient.setQueryData([queryKeys.userProfile], profileRes)
      const profile = readField<Record<string, unknown>>(
        profileRes,
        "Value",
        "value"
      )
      if (!profile) return
      setAuth(accessToken, buildUserFromProfile(profile, fallbackEmail), [])
    })
    .catch(() => {
      // keep the fallback user set above
    })
}

function readForcePasswordChangeInfo(raw: unknown): {
  isStudent: boolean
  userId?: string
  email?: string
  passwordChangeToken?: string
  expiresAtUtc?: string
} {
  const value = readField<Record<string, unknown>>(raw, "Value", "value") ?? raw
  return {
    isStudent: !!readField<boolean>(value, "IsStudent", "isStudent"),
    userId: readField<string>(value, "UserId", "userId"),
    email: readField<string>(value, "Email", "email"),
    passwordChangeToken: readField<string>(value, "PasswordChangeToken", "passwordChangeToken"),
    expiresAtUtc: readField<string>(value, "PasswordChangeExpiresAtUtc", "passwordChangeExpiresAtUtc"),
  }
}

export interface MfaChallenge {
  email: string
  destinationEmail?: string
  isStudent: boolean
  mfaExpiresAtUtc?: string
  mfaResendAvailableAtUtc?: string
  message?: string
}

function readMfaChallenge(
  res: unknown,
  fallbackEmail: string
): MfaChallenge | null {
  const value = readField<Record<string, unknown>>(res, "Value", "value") ?? res
  const requiresMfa = readField<boolean>(value, "RequiresMfa", "requiresMfa")
  if (!requiresMfa) return null

  return {
    email: fallbackEmail,
    destinationEmail: readField<string>(
      value,
      "DestinationEmail",
      "destinationEmail"
    ),
    isStudent: !!readField<boolean>(value, "IsStudent", "isStudent"),
    mfaExpiresAtUtc: readField<string>(
      value,
      "MfaExpiresAtUtc",
      "mfaExpiresAtUtc"
    ),
    mfaResendAvailableAtUtc: readField<string>(
      value,
      "MfaResendAvailableAtUtc",
      "mfaResendAvailableAtUtc"
    ),
    message: readField<string>(res, "Message", "message"),
  }
}

interface UseGetStartedOptions {
  onSuccess?: (data: GetStartedResponseI) => void
  onError?: (error: Error) => void
}

interface UseVerifyEmailOptions {
  onSuccess?: (data: VerifyEmailResponseI) => void
  onError?: (error: Error) => void
}

export const useGetStarted = ({
  onSuccess,
  onError,
}: UseGetStartedOptions = {}) => {
  const {
    mutate,
    mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    data,
    reset,
  } = useMutation<GetStartedResponseI, Error, GetStartedI>({
    mutationFn: getStartedApi,
    onSuccess,
    onError,
  })

  return {
    getStarted: mutate,
    getStartedAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    data,
    reset,
  }
}

export const useVerifyEmail = ({
  onSuccess,
  onError,
}: UseVerifyEmailOptions = {}) => {
  const { mutate, isPending, error, data, status } = useMutation<
    VerifyEmailResponseI,
    Error,
    string
  >({
    mutationFn: verifyEmailApi,
    onSuccess,
    onError,
  })

  const backendSuccess = readField<boolean>(data, "IsSuccess", "isSuccess")
  const backendError = readField<string>(
    data,
    "Error",
    "error",
    "Message",
    "message"
  )

  const isSuccess = status === "success" && !!backendSuccess
  const isError =
    status === "error" || (status === "success" && !backendSuccess)
  const resolvedError =
    status === "success" && !backendSuccess
      ? new Error(
          backendError ||
            "This verification link is no longer valid or has expired."
        )
      : error

  return {
    verifyEmail: mutate,
    isPending,
    isSuccess,
    isError,
    error: resolvedError,
    data,
    status,
  }
}

export interface StudentChangePasswordPrompt {
  userId: string
  email: string
  passwordChangeToken: string
  expiresAtUtc?: string
}

export function useLogin(options?: { redirectTo?: string }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const setAuth = useAuthStore((s) => s.setAuth)
  const setAuthSession = useAuthStore((s) => s.setAuthSession)

  const [activationModalOpen, setActivationModalOpen] = useState(false)
  const [passwordResetModalOpen, setPasswordResetModalOpen] = useState(false)
  const [changePasswordPrompt, setChangePasswordPrompt] =
    useState<StudentChangePasswordPrompt | null>(null)
  const [mfaChallenge, setMfaChallenge] = useState<MfaChallenge | null>(null)

  // Shared by both direct login and post-OTP verification so the two flows
  // converge on the exact same token-storage / session-init / redirect path.
  const completeAuthentication = (res: unknown, fallbackEmail: string) => {
    establishAuthSession(
      res,
      fallbackEmail,
      setAuth,
      setAuthSession,
      queryClient
    )
    setMfaChallenge(null)
    toast.success("Login successful")
    navigate(options?.redirectTo ?? HomeRoutes.home, { replace: true })
  }

  // A forced-password-change 406 can in principle come back from either the
  // primary login call or the OTP verification call — route both to the
  // same existing modals rather than duplicating the branching.
  const routeForcePasswordChange406 = (err: ApiError) => {
    const info = readForcePasswordChangeInfo(err.data)
    setMfaChallenge(null)
    if (info.isStudent && info.userId && info.email) {
      setChangePasswordPrompt({ userId: info.userId, email: info.email,
        passwordChangeToken: info.passwordChangeToken ?? "", expiresAtUtc: info.expiresAtUtc })
    } else {
      setPasswordResetModalOpen(true)
    }
  }

  const {
    mutate: login,
    isPending,
    error,
  } = useMutation({
    mutationFn: (payload: LoginI) => loginApi(payload),

    onSuccess: (res, variables) => {
      const isSuccess = readField<boolean>(res, "IsSuccess", "isSuccess")
      if (!res || !isSuccess) {
        const message =
          readField<string>(res, "Error", "error", "Message", "message") ||
          "Login failed"

        toast.error(message)
        return
      }

      const challenge = readMfaChallenge(res, variables.username)
      if (challenge) {
        // Credentials were valid but tokens are withheld until OTP verifies —
        // do not store anything or treat this as an authenticated session.
        setMfaChallenge(challenge)
        return
      }

      completeAuthentication(res, variables.username)
    },

    onError: (err: unknown) => {
      if (err instanceof ApiError) {
        if (err.status === 400) {
          toast.error(err.message || "Username or password is incorrect")
          return
        }

        if (err.status === 401) {
          if (err.message.toLowerCase().includes("disabled")) {
            toast.error(err.message)
            return
          }
          setActivationModalOpen(true)
          return
        }

        if (err.status === 406) {
          routeForcePasswordChange406(err)
          return
        }
      }

      const message =
        err instanceof Error ? err.message : "Something went wrong"
      toast.error(message)
    },
  })

  const { mutateAsync: verifyMfaOtpMutateAsync, isPending: isVerifyingMfa } =
    useMutation({
      mutationFn: (payload: VerifyMfaOtpPayload) => verifyMfaOtpApi(payload),
    })

  const { mutateAsync: resendMfaOtpMutateAsync, isPending: isResendingMfa } =
    useMutation({
      mutationFn: (payload: ResendMfaOtpPayload) => resendMfaOtpApi(payload),
    })

  // Rejects on any failure so the OTP screen can clear its boxes and
  // refocus without needing to know why — toasting/routing happens here.
  const verifyMfaOtp = async (otpCode: string) => {
    if (!mfaChallenge) return
    const email = mfaChallenge.email

    try {
      const res = await verifyMfaOtpMutateAsync({ email, otpCode })
      const isSuccess = readField<boolean>(res, "IsSuccess", "isSuccess")
      if (!res || !isSuccess) {
        throw new Error(
          readField<string>(res, "Error", "error", "Message", "message") ||
            "Invalid or expired verification code"
        )
      }
      completeAuthentication(res, email)
    } catch (err) {
      if (err instanceof ApiError && err.status === 406) {
        routeForcePasswordChange406(err)
      } else {
        const message =
          err instanceof Error ? err.message : "Something went wrong"
        toast.error(message)
      }
      throw err
    }
  }

  const resendMfaOtp = async () => {
    if (!mfaChallenge) return

    try {
      const res = await resendMfaOtpMutateAsync({ email: mfaChallenge.email })
      const isSuccess = readField<boolean>(res, "IsSuccess", "isSuccess")
      if (!res || !isSuccess) {
        throw new Error(
          readField<string>(res, "Error", "error", "Message", "message") ||
            "Failed to resend verification code"
        )
      }
      const value = readField<Record<string, unknown>>(res, "Value", "value")
      setMfaChallenge((current) =>
        current
          ? {
              ...current,
              destinationEmail:
                readField<string>(
                  value,
                  "DestinationEmail",
                  "destinationEmail"
                ) ?? current.destinationEmail,
              mfaExpiresAtUtc: readField<string>(
                value,
                "MfaExpiresAtUtc",
                "mfaExpiresAtUtc"
              ),
              mfaResendAvailableAtUtc: readField<string>(
                value,
                "MfaResendAvailableAtUtc",
                "mfaResendAvailableAtUtc"
              ),
              message: readField<string>(res, "Message", "message"),
            }
          : current
      )
      const successMessage = readField<string>(res, "Message", "message")
      toast.success(
        successMessage || "A new verification code has been sent to your email."
      )
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong"
      toast.error(message)
      throw err
    }
  }

  const backToLogin = () => {
    setMfaChallenge(null)
    setChangePasswordPrompt(null)
  }

  return {
    login,
    isLoading: isPending,
    error: error instanceof Error ? error.message : null,
    activationModalOpen,
    closeActivationModal: () => setActivationModalOpen(false),
    passwordResetModalOpen,
    closePasswordResetModal: () => setPasswordResetModalOpen(false),
    changePasswordPrompt,
    closeChangePasswordPrompt: () => setChangePasswordPrompt(null),
    continueAfterPasswordChange: (username: string, password: string) => {
      setChangePasswordPrompt(null)
      login({ username, password })
    },
    mfaChallenge,
    verifyMfaOtp,
    isVerifyingMfa,
    resendMfaOtp,
    isResendingMfa,
    backToLogin,
  }
}

export function useStudentChangePassword(onSaved: (password: string) => void) {
  const { mutate, isPending, error, reset } = useMutation({
    mutationFn: async (payload: StudentChangePasswordI) => {
      const res = await studentChangePasswordApi(payload)
      if (!readField<boolean>(res, "IsSuccess", "isSuccess")) {
        throw new Error(readField<string>(res, "Message", "message", "Error", "error") || "Unable to save your password.")
      }
      return res
    },
    onSuccess: (_res, variables) => {
      toast.success("Password saved. Continue with login verification.")
      onSaved(variables.newPassword)
      reset()
    },
  })
  return {
    changePassword: mutate,
    isLoading: isPending,
    error: error instanceof Error ? error.message : null,
    sessionExpired: error instanceof ApiError && [401, 403, 409, 410].includes(error.status),
    reset,
  }
}

export function useForgotPassword() {
  const { mutate: forgotPassword, isPending } = useMutation({
    mutationFn: forgotPasswordApi,

    onSuccess: (res) => {
      if (!res || !res.IsSuccess) {
        const message = res?.Error || "Failed to send reset email"
        toast.error(message)
        return
      }

      toast.success("Verification link sent to your email")
    },

    onError: (err: unknown) => {
      const message =
        err instanceof Error ? err.message : "Something went wrong"

      toast.error(message)
    },
  })

  return {
    forgotPassword,
    isLoading: isPending,
  }
}

export function useNewPassword() {
  const { mutate, isPending, error } = useMutation({
    mutationFn: (payload: NewPasswordI) => resetPasswordApi(payload),
  })

  const resetPassword = (
    payload: NewPasswordI,
    options?: {
      onSuccess?: () => void
      onError?: (error: Error) => void
    }
  ) => {
    mutate(payload, {
      onSuccess: (res) => {
        const isSuccess = readField<boolean>(res, "IsSuccess", "isSuccess")
        if (!res || !isSuccess) {
          const message =
            readField<string>(res, "Error", "error", "Message", "message") ||
            "This reset link is no longer valid or has expired."
          options?.onError?.(new Error(message))
          return
        }
        options?.onSuccess?.()
      },
      onError: (err) => {
        const message =
          err instanceof Error ? err.message : "Something went wrong"
        options?.onError?.(new Error(message))
      },
    })
  }

  return {
    resetPassword,
    isLoading: isPending,
    error: error instanceof Error ? error.message : null,
  }
}

export function useLogout() {
  const navigate = useNavigate()
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const queryClient = useQueryClient()

  const { mutate: logout, isPending } = useMutation({
    mutationFn: logoutApi,

    onSuccess: () => {
      queryClient.clear()
      clearAuth()
      toast.success("Logged out successfully.")
      navigate(AuthRoutes.login, { replace: true })
    },

    onError: () => {
      queryClient.clear()
      clearAuth()
      navigate(AuthRoutes.login, { replace: true })
    },
  })

  return {
    logout,
    isLoading: isPending,
  }
}

export function useUserSessions() {
  const query = useQuery({
    queryKey: ["auth", "sessions"],
    queryFn: getUserSessionsApi,
    staleTime: 30_000,
  })
  return {
    sessions: query.data?.Value ?? [],
    isLoading: query.isPending,
    isError: query.isError,
  }
}

export function useRevokeUserSession() {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: revokeUserSessionApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth", "sessions"] })
      toast.success("Session signed out.")
    },
    onError: (error: Error) => toast.error(error.message),
  })
  return {
    revokeSessionAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    revokingSessionId: mutation.isPending ? mutation.variables : undefined,
  }
}

export const useGetUserProfile = (enabled = true) => {
  const canUseAuthenticatedApi = useAuthStore(
    (state) => !!state.token || state.hasRefreshSession
  )
  const { data, isPending, isError, error, isLoading, isSuccess, refetch } =
    useQuery({
      queryKey: [queryKeys.userProfile],
      queryFn: () => getUserProfileApi(),
      enabled: enabled && canUseAuthenticatedApi,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: false,
    })

  return {
    userData: data,
    isPending,
    isError,
    error,
    isLoading,
    isSuccess,
    refetch,
  }
}

export function useUpdateUserProfile() {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: (payload: UpdateUserProfileI) => updateUserProfileApi(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [queryKeys.userProfile] })
      toast.success("Profile updated successfully.")
    },
    onError: (error: Error) => toast.error(error.message),
  })

  return {
    updateProfileAsync: mutation.mutateAsync,
    isUpdating: mutation.isPending,
  }
}
