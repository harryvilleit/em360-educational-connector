import { useState, useEffect, useMemo } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { permissions as allPermissions } from "@/schema/user.schema"
import type { Permission as PermissionType } from "@/schema/user.schema"
import { useParams } from "react-router"
import { CheckCircle2, Loader2 } from "lucide-react"
import { permissionColors, permissionLabels } from "@/data"
import type {
  EditModulesModalProps,
  ModulePermission,
} from "@/types/user-management"
import { useGetSubUserAccessEdit, useUpdateSubUserAccess } from "@/hooks/userMgt"
import { useSchoolId } from "@/contexts/SchoolContext"
import type { SubUserAccessEditModule } from "@/api/userMgt.api/types"

export default function EditModulesModal({
  open,
  onClose,
  userName,
  subUserId,
  onSave,
}: EditModulesModalProps) {
  const { productId } = useParams<{ productId: string }>()
  const schoolId = useSchoolId()
  const { subUserAccessEdit, isLoading: isLoadingAccessEdit } = useGetSubUserAccessEdit({
    subUserId,
    schoolId: schoolId,
  })
  

  
  const { updateSubUserAccessAsync, isPending } = useUpdateSubUserAccess({
    onSuccess: () => {
      onSave([])
      onClose()
    },
  })

  const [permissions, setPermissions] = useState<ModulePermission[]>([])
  useEffect(() => {
    if (subUserAccessEdit?.Modules) {
      const initialPermissions = subUserAccessEdit.Modules
        .filter((module) => module.HasAccess)
        .map((module) => ({
          moduleId: module.ProductModuleId,
          menus: module.Menus
            .filter((menu) => menu.HasAccess)
            .map((menu) => ({
              menuId: menu.ProductModuleMenuId,
              permissions: menu.Permissions
                .filter((perm) => perm.HasAccess)
                .map((perm) => perm.Permission as PermissionType)
                .filter((p): p is PermissionType => p != null),
            })),
        }))
      setPermissions(initialPermissions as ModulePermission[])
    }
  }, [subUserAccessEdit])
 

  // O(1) lookup of the current selection state, built once per `permissions`
  // change instead of re-scanning the permissions/menus arrays on every
  // isXSelected()/areXSelected() call inside the modules/menus/permissions
  // render loops below.
  const permissionsByModule = useMemo(() => {
    const map = new Map<string, Map<string, Set<PermissionType>>>()
    for (const p of permissions) {
      const menuMap = new Map<string, Set<PermissionType>>()
      for (const m of p.menus) {
        menuMap.set(m.menuId, new Set(m.permissions))
      }
      map.set(p.moduleId, menuMap)
    }
    return map
  }, [permissions])

  const isModuleSelected = (moduleId: string) => permissionsByModule.has(moduleId)

  const isMenuSelected = (moduleId: string, menuId: string) =>
    permissionsByModule.get(moduleId)?.has(menuId) ?? false

  const getMenuEntry = (moduleId: string, menuId: string) =>
    permissionsByModule.get(moduleId)?.get(menuId)

  const isPermissionSelected = (
    moduleId: string,
    menuId: string,
    permission: PermissionType
  ) => getMenuEntry(moduleId, menuId)?.has(permission) ?? false

  const areAllMenusSelected = (
    moduleId: string,
    module: SubUserAccessEditModule
  ) => {
    const entry = permissionsByModule.get(moduleId)
    if (!entry || module.Menus.length === 0) return false
    return module.Menus.every((m) => entry.has(m.ProductModuleMenuId))
  }

  const areSomeMenusSelected = (
    moduleId: string,
    module: SubUserAccessEditModule
  ) => {
    const entry = permissionsByModule.get(moduleId)
    if (!entry) return false
    const count = module.Menus.filter((m) => entry.has(m.ProductModuleMenuId)).length
    return count > 0 && count < module.Menus.length
  }

  const areAllPermissionsSelected = (moduleId: string, menuId: string) => {
    const entry = getMenuEntry(moduleId, menuId)
    if (!entry) return false
    return allPermissions.every((p) => entry.has(p))
  }

  const areSomePermissionsSelected = (moduleId: string, menuId: string) => {
    const entry = getMenuEntry(moduleId, menuId)
    if (!entry) return false
    const count = allPermissions.filter((p) => entry.has(p)).length
    return count > 0 && count < allPermissions.length
  }

  const toggleAllMenus = (moduleId: string, module: SubUserAccessEditModule) => {
    const allSelected = areAllMenusSelected(moduleId, module)
    setPermissions((prev) =>
      prev.map((p) =>
        p.moduleId === moduleId
          ? {
              ...p,
              menus: allSelected
                ? []
                : module.Menus.map((m) => ({
                    menuId: m.ProductModuleMenuId,
                    permissions: [],
                  })),
            }
          : p
      )
    )
  }

  const toggleAllPermissions = (moduleId: string, menuId: string) => {
    const allSelected = areAllPermissionsSelected(moduleId, menuId)
    setPermissions((prev) =>
      prev.map((p) =>
        p.moduleId === moduleId
          ? {
              ...p,
              menus: p.menus.map((m) =>
                m.menuId === menuId
                  ? {
                      ...m,
                      permissions: allSelected ? [] : [...allPermissions],
                    }
                  : m
              ),
            }
          : p
      )
    )
  }

  const toggleModule = (moduleId: string) => {
    const exists = permissions.find((p) => p.moduleId === moduleId)
    if (exists) {
      setPermissions((prev) => prev.filter((p) => p.moduleId !== moduleId))
    } else {
      setPermissions((prev) => [...prev, { moduleId, menus: [] }])
    }
  }

  const toggleMenu = (moduleId: string, menuId: string) => {
    const modulePermission = permissions.find((p) => p.moduleId === moduleId)
    if (!modulePermission) return

    const menuSelected = modulePermission.menus.some((m) => m.menuId === menuId)

    setPermissions((prev) =>
      prev.map((p) =>
        p.moduleId === moduleId
          ? {
              ...p,
              menus: menuSelected
                ? p.menus.filter((m) => m.menuId !== menuId)
                : [...p.menus, { menuId, permissions: [] }],
            }
          : p
      )
    )
  }

  const togglePermission = (
    moduleId: string,
    menuId: string,
    permission: PermissionType
  ) => {
    setPermissions((prev) =>
      prev.map((p) =>
        p.moduleId === moduleId
          ? {
              ...p,
              menus: p.menus.map((m) =>
                m.menuId === menuId
                  ? {
                      ...m,
                      permissions: m.permissions.includes(permission)
                        ? m.permissions.filter((perm) => perm !== permission)
                        : [...m.permissions, permission],
                    }
                  : m
              ),
            }
          : p
      )
    )
  }

  const handleSave = async () => {
    await updateSubUserAccessAsync({
      subUserId,
      schoolId: schoolId,
      moduleMenuSelections: permissions.map((perm) => ({
        productModuleId: perm.moduleId,
        menuPermissions: perm.menus.map((menu) => ({
          productModuleMenuId: menu.menuId,
          permissions: menu.permissions,
        })),
      })),
    })
  }

  const handleClose = () => {
    setPermissions([])
    onClose()
  }

  const modules = subUserAccessEdit?.Modules ?? []

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl p-6 sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">
            Edit Module Access
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Update the modules, menus, and permissions for{" "}
            <span className="font-medium text-gray-700">{userName}</span>.
          </DialogDescription>
        </DialogHeader>

        {isLoadingAccessEdit ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-6 animate-spin text-blue-600" />
          </div>
        ) : (
          <>
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-3">
                <p className="text-xs text-blue-700">
                  <span className="font-semibold">{permissions.length}</span>{" "}
                  {permissions.length === 1 ? "module" : "modules"} currently
                  assigned
                </p>
              </div>

              {modules.length === 0 ? (
                <p className="rounded-xl border border-dashed border-gray-200 px-4 py-6 text-center text-sm text-muted-foreground">
                  No modules available.
                </p>
              ) : (
                <div className="space-y-2">
                  {modules.map((module) => {
                    const moduleSelected = isModuleSelected(module.ProductModuleId)
                    const moduleEntry = permissions.find(
                      (p) => p.moduleId === module.ProductModuleId
                    )
                    const selectedMenuCount = moduleEntry?.menus.length ?? 0
                    const allMenus = areAllMenusSelected(module.ProductModuleId, module)
                    const someMenus = areSomeMenusSelected(module.ProductModuleId, module)

                    return (
                      <div
                        key={module.ProductModuleId}
                        className={`overflow-hidden rounded-xl border transition-all duration-200 ${
                          moduleSelected
                            ? "border-blue-200 bg-blue-50/30"
                            : "border-gray-100 bg-gray-50/50"
                        }`}
                      >
                        {/* Module row */}
                        <div className="flex items-center gap-3 px-4 py-3">
                          <Checkbox
                            id={`edit-module-${module.ProductModuleId}`}
                            checked={moduleSelected}
                            onCheckedChange={() => toggleModule(module.ProductModuleId)}
                          />
                          <label
                            htmlFor={`edit-module-${module.ProductModuleId}`}
                            className="flex-1 cursor-pointer text-sm font-semibold text-gray-800"
                          >
                            {module.ModuleName}
                          </label>
                          {moduleSelected && module.Menus.length > 0 && (
                            <label className="flex cursor-pointer items-center gap-1.5 text-xs font-medium text-blue-600">
                              <Checkbox
                                checked={
                                  allMenus ? true : someMenus ? "indeterminate" : false
                                }
                                onCheckedChange={() =>
                                  toggleAllMenus(module.ProductModuleId, module)
                                }
                                className="size-3.5"
                              />
                              All menus
                              <span className="ml-1 text-[10px] font-normal text-gray-400">
                                ({selectedMenuCount}/{module.Menus.length})
                              </span>
                            </label>
                          )}
                        </div>

                        {/* Menu items + permissions */}
                        {moduleSelected && module.Menus.length > 0 && (
                          <div className="divide-y divide-gray-100 border-t border-blue-100 bg-white">
                            {module.Menus.map((menu) => {
                              const menuSelected = isMenuSelected(
                                module.ProductModuleId,
                                menu.ProductModuleMenuId
                              )
                              const allPerms = areAllPermissionsSelected(
                                module.ProductModuleId,
                                menu.ProductModuleMenuId
                              )
                              const somePerms = areSomePermissionsSelected(
                                module.ProductModuleId,
                                menu.ProductModuleMenuId
                              )
                              return (
                                <div key={menu.ProductModuleMenuId} className="px-4 py-3">
                                  {/* Menu checkbox */}
                                  <div className="flex items-center gap-2.5">
                                    <Checkbox
                                      id={`edit-${module.ProductModuleId}-${menu.ProductModuleMenuId}`}
                                      checked={menuSelected}
                                      onCheckedChange={() =>
                                        toggleMenu(module.ProductModuleId, menu.ProductModuleMenuId)
                                      }
                                    />
                                    <label
                                      htmlFor={`edit-${module.ProductModuleId}-${menu.ProductModuleMenuId}`}
                                      className="cursor-pointer text-xs font-medium text-gray-700"
                                    >
                                      {menu.MenuName}
                                    </label>
                                  </div>

                                 
                                  {menuSelected && (
                                    <div className="mt-2.5 ml-6 space-y-2">
                                      {/* "All permissions" checkbox */}
                                      <label className="flex cursor-pointer items-center gap-1.5 text-[11px] font-medium text-gray-500">
                                        <Checkbox
                                          checked={
                                            allPerms
                                              ? true
                                              : somePerms
                                                ? "indeterminate"
                                                : false
                                          }
                                          onCheckedChange={() =>
                                            toggleAllPermissions(
                                              module.ProductModuleId,
                                              menu.ProductModuleMenuId
                                            )
                                          }
                                          className="size-3.5"
                                        />
                                        All permissions
                                      </label>

                                      <div className="flex flex-wrap gap-2">
                                      {allPermissions.map((perm) => {
                                        const selected = isPermissionSelected(
                                          module.ProductModuleId,
                                          menu.ProductModuleMenuId,
                                          perm
                                        )
                                        return (
                                          <button
                                            key={perm}
                                            type="button"
                                            onClick={() =>
                                              togglePermission(
                                                module.ProductModuleId,
                                                menu.ProductModuleMenuId,
                                                perm
                                              )
                                            }
                                            className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all ${
                                              selected
                                                ? permissionColors[perm]
                                                : "border-gray-200 bg-gray-50 text-gray-400 hover:border-gray-300"
                                            }`}
                                          >
                                            {selected && (
                                              <CheckCircle2 className="size-3" />
                                            )}
                                            {permissionLabels[perm]}
                                          </button>
                                        )
                                      })}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 rounded-xl py-5"
                onClick={handleClose}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="flex-1 rounded-xl bg-blue-600 py-5 text-white hover:bg-blue-700 disabled:opacity-50"
                onClick={handleSave}
                disabled={permissions.length === 0 || isPending}
              >
                {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
                {isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
