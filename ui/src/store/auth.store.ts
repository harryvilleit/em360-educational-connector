import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { User, Module } from "@/types"
import type { LaunchModule } from "@/api/products.api/types"
import { clearAllFormDrafts } from "@/utils/formDraftStorage"
import { readCsrfToken, writeCsrfToken } from "@/lib/csrfSession"

type AuthChannelMessage =
  | {
      type: "session"
      token: string
      csrfToken: string
      tokenExpiresAt: number
    }
  | { type: "session-request"; requestId: string }
  | {
      type: "session-response"
      requestId: string
      token: string
      csrfToken: string
      tokenExpiresAt: number
    }
  | { type: "logout" }

let authChannel: BroadcastChannel | null = null

function postAuthMessage(message: AuthChannelMessage) {
  if (typeof BroadcastChannel === "undefined") return
  authChannel ??= new BroadcastChannel("em360-auth-session")
  authChannel.postMessage(message)
}

/**
 * Access tokens deliberately stay out of localStorage. When a school is opened
 * in a new tab, ask an already authenticated same-origin tab for a one-time
 * in-memory hand-off. If that tab is suspended, the new tab can
 * still use the browser-wide CSRF value with the HttpOnly refresh cookie.
 */
export function requestAuthSessionFromOtherTab(timeoutMs = 1_500): Promise<boolean> {
  const current = useAuthStore.getState()
  if (current.token && readCsrfToken()) return Promise.resolve(true)
  if (typeof BroadcastChannel === "undefined") return Promise.resolve(false)

  authChannel ??= new BroadcastChannel("em360-auth-session")
  const channel = authChannel
  const requestId = crypto.randomUUID()

  return new Promise((resolve) => {
    const finish = (restored: boolean) => {
      globalThis.clearTimeout(timeout)
      channel.removeEventListener("message", handleMessage)
      resolve(restored)
    }
    const handleMessage = (event: MessageEvent<AuthChannelMessage>) => {
      if (event.data.type !== "session-response" || event.data.requestId !== requestId) return

      writeCsrfToken(event.data.csrfToken)
      useAuthStore.setState({
        token: event.data.token,
        hasRefreshSession: true,
        tokenExpiresAt: event.data.tokenExpiresAt,
      })
      finish(true)
    }
    const timeout = globalThis.setTimeout(() => finish(false), timeoutMs)

    channel.addEventListener("message", handleMessage)
    channel.postMessage({ type: "session-request", requestId })
  })
}

// Stable references for selectors' `?? []` fallback — a fresh array literal
// there would make useSyncExternalStore see a "new" value on every render
// for a productId with no entry yet, causing an infinite update loop.
export const EMPTY_MODULES: Module[] = []
export const EMPTY_LAUNCH_MODULES: LaunchModule[] = []

interface AuthState {
  token: string | null
  user: User | null
  modules: Module[]
  modulesByProduct: Record<string, Module[]>
  permissionModulesByProduct: Record<string, LaunchModule[]>
  userRoleByProduct: Record<string, string>
  guardianIdBySchool: Record<string, string>
  hasCreatedFirstUser: boolean
  _hasHydrated: boolean
  hasRefreshSession: boolean
  tokenExpiresAt: number | null

  setAuth: (token: string, user: User, modules: Module[]) => void
  updateUserEmail: (email: string) => void
  setAuthSession: (
    token: string,
    expiresAt: number,
    csrfToken: string,
    user: User,
    modules: Module[]
  ) => void
  setModules: (modules: Module[]) => void
  setModulesForProduct: (productId: string, modules: Module[]) => void
  getModulesForProduct: (productId: string) => Module[]
  setPermissionsForProduct: (productId: string, modules: LaunchModule[], userRole: string) => void
  getPermissionModulesForProduct: (productId: string) => LaunchModule[]
  setGuardianIdForSchool: (schoolId: string, guardianId: string) => void
  getGuardianIdForSchool: (schoolId: string) => string | undefined
  setHasCreatedFirstUser: (value: boolean) => void
  setSessionTokens: (token: string, expiresAt: number, csrfToken: string) => void
  clearAuth: () => void
  setHasHydrated: (state: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      modules: [],
      modulesByProduct: {},
      permissionModulesByProduct: {},
      userRoleByProduct: {},
      guardianIdBySchool: {},
      hasCreatedFirstUser: false,
      _hasHydrated: false,
      hasRefreshSession: false,
      tokenExpiresAt: null,

      setAuth: (token, user, modules) => {
        set({ token, user, modules })
      },

      updateUserEmail: (email) =>
        set((state) => (state.user ? { user: { ...state.user, email } } : state)),

      setAuthSession: (token, expiresAt, csrfToken, user, modules) => {
        writeCsrfToken(csrfToken)
        set({
          token,
          hasRefreshSession: true,
          tokenExpiresAt: expiresAt,
          user,
          modules,
        })
        postAuthMessage({
          type: "session",
          token,
          csrfToken,
          tokenExpiresAt: expiresAt,
        })
      },

      setModules: (modules) => set({ modules }),

      setModulesForProduct: (productId, modules) =>
        set((state) => ({
          modulesByProduct: { ...state.modulesByProduct, [productId]: modules },
        })),

      getModulesForProduct: (productId) => get().modulesByProduct[productId] ?? [],

      setPermissionsForProduct: (productId, modules, userRole) =>
        set((state) => ({
          permissionModulesByProduct: {
            ...state.permissionModulesByProduct,
            [productId]: modules,
          },
          userRoleByProduct: {
            ...state.userRoleByProduct,
            [productId]: userRole,
          },
        })),

      getPermissionModulesForProduct: (productId) =>
        get().permissionModulesByProduct[productId] ?? [],

      setGuardianIdForSchool: (schoolId, guardianId) =>
        set((state) => ({
          guardianIdBySchool: {
            ...state.guardianIdBySchool,
            [schoolId]: guardianId,
          },
        })),

      getGuardianIdForSchool: (schoolId) => get().guardianIdBySchool[schoolId],

      setHasCreatedFirstUser: (value) => set({ hasCreatedFirstUser: value }),

      // The refresh credential remains in an HttpOnly cookie. The short-lived
      // access token is broadcast in memory; the non-secret CSRF value is shared
      // through localStorage so a new tab can use the same browser session.
      setSessionTokens: (token, expiresAt, csrfToken) => {
        writeCsrfToken(csrfToken)
        set({ token, hasRefreshSession: true, tokenExpiresAt: expiresAt })
        postAuthMessage({
          type: "session",
          token,
          csrfToken,
          tokenExpiresAt: expiresAt,
        })
      },

      clearAuth: () => {
        clearAllFormDrafts()

        writeCsrfToken(null)
        set({
          token: null,
          user: null,
          modules: [],
          modulesByProduct: {},
          permissionModulesByProduct: {},
          userRoleByProduct: {},
          guardianIdBySchool: {},
          hasRefreshSession: false,
          tokenExpiresAt: null,
        })
        postAuthMessage({ type: "logout" })
      },

      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: "Em360-auth",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
      partialize: (state) => ({
        user: state.user,
        modules: state.modules,
        modulesByProduct: state.modulesByProduct,
        permissionModulesByProduct: state.permissionModulesByProduct,
        userRoleByProduct: state.userRoleByProduct,
        guardianIdBySchool: state.guardianIdBySchool,
        hasCreatedFirstUser: state.hasCreatedFirstUser,
        hasRefreshSession: state.hasRefreshSession,
        tokenExpiresAt: state.tokenExpiresAt,
      }),
      merge: (persistedState, currentState) => {
        const persisted = {
          ...(persistedState as Partial<AuthState> & {
            refreshToken?: unknown
          }),
        }
        // One-time cleanup for installations that previously persisted the raw
        // refresh token. It must never be restored into live JavaScript state.
        delete persisted.refreshToken
        delete persisted.token

        // Per-productId/schoolId records are merged key-by-key rather than
        // replaced outright. `rehydrate()` re-runs this on every cross-tab
        // "storage" event (see the listener below) — a full overwrite meant
        // that another tab's write (e.g. just its own token refresh) would
        // stomp this tab's live modulesByProduct with whatever that OTHER
        // tab happened to have, which for a school it never launched is
        // nothing — wiping the sidebar's just-loaded modules out from under
        // it. Merging keeps that tab's data for products it doesn't know
        // about while still picking up anything newly persisted.
        const mergeRecord = <T>(
          current: Record<string, T> | undefined,
          incoming: Record<string, T> | undefined
        ): Record<string, T> => ({
          ...(typeof incoming === "object" && incoming !== null ? incoming : {}),
          ...(current ?? {}),
        })

        return {
          ...currentState,
          ...persisted,
          modules: Array.isArray(persisted?.modules) ? persisted.modules : currentState.modules,
          modulesByProduct: mergeRecord(currentState.modulesByProduct, persisted?.modulesByProduct),
          permissionModulesByProduct: mergeRecord(
            currentState.permissionModulesByProduct,
            persisted?.permissionModulesByProduct
          ),
          userRoleByProduct: mergeRecord(
            currentState.userRoleByProduct,
            persisted?.userRoleByProduct
          ),
          guardianIdBySchool: mergeRecord(
            currentState.guardianIdBySchool,
            persisted?.guardianIdBySchool
          ),
          hasCreatedFirstUser: persisted?.hasCreatedFirstUser ?? false,
          hasRefreshSession: persisted?.hasRefreshSession ?? false,
          tokenExpiresAt: persisted?.tokenExpiresAt ?? null,
        }
      },
    }
  )
)

if (typeof window !== "undefined") {
  // Remove credentials left by the previous version; never restore them.
  try {
    sessionStorage.removeItem("em360-session-access-token")
  } catch {
    /* Storage may be disabled. */
  }
  localStorage.removeItem("auth_token")
  localStorage.removeItem("auth_uid")

  window.addEventListener("storage", (event) => {
    if (event.key === "Em360-auth") {
      void useAuthStore.persist.rehydrate()
    }
  })

  if (typeof BroadcastChannel !== "undefined") {
    authChannel ??= new BroadcastChannel("em360-auth-session")
    authChannel.addEventListener("message", (event: MessageEvent<AuthChannelMessage>) => {
      if (event.data.type === "session") {
        writeCsrfToken(event.data.csrfToken)
        useAuthStore.setState({
          token: event.data.token,
          hasRefreshSession: true,
          tokenExpiresAt: event.data.tokenExpiresAt,
        })
      } else if (event.data.type === "session-request") {
        const state = useAuthStore.getState()
        const csrfToken = readCsrfToken()
        if (state.token && csrfToken && state.hasRefreshSession && state.tokenExpiresAt) {
          authChannel?.postMessage({
            type: "session-response",
            requestId: event.data.requestId,
            token: state.token,
            csrfToken,
            tokenExpiresAt: state.tokenExpiresAt,
          })
        }
      } else if (event.data.type === "session-response") {
        writeCsrfToken(event.data.csrfToken)
        useAuthStore.setState({
          token: event.data.token,
          hasRefreshSession: true,
          tokenExpiresAt: event.data.tokenExpiresAt,
        })
      } else if (event.data.type === "logout") {
        clearAllFormDrafts()

        writeCsrfToken(null)
        useAuthStore.setState({
          token: null,
          user: null,
          modules: [],
          modulesByProduct: {},
          permissionModulesByProduct: {},
          userRoleByProduct: {},
          guardianIdBySchool: {},
          hasRefreshSession: false,
          tokenExpiresAt: null,
        })
      }
    })
  }
}
