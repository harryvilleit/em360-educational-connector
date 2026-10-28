import type { ChatRole } from "@/types/chat"

export function canChatWith(actor: ChatRole, peer: ChatRole): boolean {
  if (actor === "superadmin") return true
  if (actor === "parent") return peer === "superadmin"
  return peer !== "parent"
}

export function sharesClassOrSubject(
  a: { classNames?: string[]; subjects?: string[] },
  b: { classNames?: string[]; subjects?: string[] }
): boolean {
  const aClasses = new Set(a.classNames ?? [])
  const bClasses = new Set(b.classNames ?? [])
  for (const c of aClasses) {
    if (bClasses.has(c)) return true
  }
  const aSubjects = new Set(a.subjects ?? [])
  const bSubjects = new Set(b.subjects ?? [])
  for (const s of aSubjects) {
    if (bSubjects.has(s)) return true
  }
  return false
}

export function belongsToClassRoom(
  role: ChatRole,
  className: string,
  member: { classNames?: string[] }
): boolean {
  if (role !== "student" && role !== "teacher") return false
  return (member.classNames ?? []).includes(className)
}

/**
 * @deprecated Prefer {@link belongsToClassRoom}. Kept so existing imports keep
 * compiling; it now admits teachers as well as students.
 */
export function canAccessClassGroup(
  role: ChatRole,
  className: string,
  actor: { classNames?: string[] }
): boolean {
  return belongsToClassRoom(role, className, actor)
}

export function roleLabel(role: ChatRole): string {
  switch (role) {
    case "superadmin":
      return "Super Admin"
    case "admin":
      return "Admin"
    case "teacher":
      return "Teacher"
    case "student":
      return "Student"
    case "parent":
      return "Parent"
  }
}

export function roleBadgeClass(role: ChatRole): string {
  switch (role) {
    case "superadmin":
      return "bg-rose-100 text-rose-800"
    case "admin":
      return "bg-violet-100 text-violet-800"
    case "teacher":
      return "bg-sky-100 text-sky-800"
    case "student":
      return "bg-emerald-100 text-emerald-800"
    case "parent":
      return "bg-amber-100 text-amber-800"
  }
}
