import type { Permission } from "@/schema/user.schema"
import type { SubUserItem } from "@/api/userMgt.api/types"

export interface EditModulesModalProps {
  open: boolean
  onClose: () => void
  userName: string
  subUserId: string
  currentPermissions: ModulePermission[]
  onSave: (permissions: ModulePermission[]) => void
}

export type ModulePermission = {
  moduleId: string
  menus: { menuId: string; permissions: Permission[] }[]
}

export interface CreatedUserCredentials {
  name: string
  email: string
  password: string
}

export interface CreatedUserCredentials {
  name: string
  email: string
  password: string
}

export interface CreateUserModalProps {
  open: boolean
  onClose: () => void
  onSuccess?: (credentials: CreatedUserCredentials) => void
}

export interface PasswordModalProps {
  open: boolean
  onClose: () => void
  userName: string
  email: string
  password: string
}

export type StatCard = {
  title: string
  value: string
  meta: string
  metaType: "up" | "down" | "neutral"
  icon: React.ElementType
  iconBg: string
  iconColor: string
}

export interface UserStatsCardsProps {
  users: SubUserItem[]
}

export interface UserTableProps {
  users: SubUserItem[]
  hasFilters: boolean
  isLoading: boolean
  onViewDetails: (user: SubUserItem) => void
  onEditModules: (user: SubUserItem) => void
  onAddMultipleRoles?: (user: SubUserItem) => void
  onChangePassword?: (user: SubUserItem) => void
  onResendRegistrationEmail?: (user: SubUserItem) => void
  onActivate?: (id: string) => Promise<void>
  onDeactivate?: (id: string) => Promise<void>
  selected: string[]
  allPageSelected: boolean
  onToggleSelect: (id: string) => void
  onToggleSelectAll: () => void
  page: number
  totalItems: number
  pageSize: number
  onPageChange: (page: number) => void
}
