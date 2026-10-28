export type Menu = {
  id: string
  name: string
  path: string
}

export type Module = {
  id: string
  name: string
  menus: Menu[]
}

export type User = {
  id: string
  name: string
  email: string
  phoneNumber: string
  jobTitle: string
  staffId: string
  status: "active" | "inactive"
  createdAt: string
}
