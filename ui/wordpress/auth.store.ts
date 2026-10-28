import { create } from "zustand"
import type { Module } from "@/types"
import type { LaunchModule } from "@/api/products.api/types"
import { relativePath } from "./navigation"
type State = ReturnType<
  typeof import("@/store/auth.store").useAuthStore.getState
>
export const EMPTY_MODULES: Module[] = []
export const EMPTY_LAUNCH_MODULES: LaunchModule[] = []
export async function requestAuthSessionFromOtherTab() {
  return false
}
// Portal identity and grants live only in memory. Central tokens never reach this application.
export const useAuthStore = create<State>((set, get) => ({
  token: null,
  user: null,
  modules: [],
  modulesByProduct: {},
  permissionModulesByProduct: {},
  userRoleByProduct: {},
  guardianIdBySchool: {},
  hasCreatedFirstUser: false,
  _hasHydrated: true,
  hasRefreshSession: true,
  tokenExpiresAt: null,
  setAuth: () => {},
  setAuthSession: () => {},
  setSessionTokens: () => {},
  updateUserEmail: (email) =>
    set((s) => ({ user: s.user ? { ...s.user, email } : null })),
  setModules: (modules) => set({ modules }),
  setModulesForProduct: (id, modules) =>
    set((s) => ({
      modulesByProduct: { ...s.modulesByProduct, [id]: modules },
    })),
  getModulesForProduct: (id) => get().modulesByProduct[id] ?? [],
  setPermissionsForProduct: (id, modules, role) =>
    set((s) => ({
      permissionModulesByProduct: {
        ...s.permissionModulesByProduct,
        [id]: modules.map((module) => ({
          ...module,
          Menus: module.Menus.map((menu) => ({
            ...menu,
            MenuUrl: relativePath(menu.MenuUrl, id) ?? menu.MenuUrl,
          })),
        })),
      },
      userRoleByProduct: { ...s.userRoleByProduct, [id]: role },
    })),
  getPermissionModulesForProduct: (id) =>
    get().permissionModulesByProduct[id] ?? [],
  setGuardianIdForSchool: (id, guardianId) =>
    set((s) => ({
      guardianIdBySchool: { ...s.guardianIdBySchool, [id]: guardianId },
    })),
  getGuardianIdForSchool: (id) => get().guardianIdBySchool[id],
  setHasCreatedFirstUser: (value) => set({ hasCreatedFirstUser: value }),
  setHasHydrated: (value) => set({ _hasHydrated: value }),
  clearAuth: () =>
    set({
      user: null,
      hasRefreshSession: false,
      modules: [],
      modulesByProduct: {},
      permissionModulesByProduct: {},
      userRoleByProduct: {},
      guardianIdBySchool: {},
    }),
}))
