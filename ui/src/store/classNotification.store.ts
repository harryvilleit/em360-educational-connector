import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { ClassNotificationState } from "@/types/classNotification"

export const useClassNotificationStore = create<ClassNotificationState>()(
  persist(
    (set) => ({
      notifications: [],

      notifyClassCreated: (data) =>
        set((state) => ({
          notifications: [
            {
              ...data,
              id: crypto.randomUUID(),
              read: false,
              createdAt: new Date().toISOString(),
            },
            ...state.notifications,
          ],
        })),

      markAllRead: (className) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.className === className ? { ...n, read: true } : n
          ),
        })),
    }),
    { name: "em360-class-notifications" }
  )
)
