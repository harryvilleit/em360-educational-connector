import { create } from "zustand"
import type { ClassNotificationState } from "@/types/classNotification"
// UI session state only. Do not reuse notifications left by another signed-in user.
export const useClassNotificationStore = create<ClassNotificationState>(() => ({
  notifications: [],
  notifyClassCreated: () => {},
  markAllRead: () => {},
}))
