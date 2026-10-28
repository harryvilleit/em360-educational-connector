/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react"
import { useAuthStore } from "@/store/auth.store"

export function useHydration() {
  //  local state starts false regardless of store value
  //  this ensures the component always renders at least once with
  //  isHydrated=false, giving PageLoader a guaranteed frame to paint
  const [isHydrated, setIsHydrated] = useState(false)
  const storeHydrated = useAuthStore((s) => s._hasHydrated)

  useEffect(() => {
    //  if store already hydrated by the time this effect runs,
    //   flip immediately — otherwise wait for the store subscription to fire
    if (storeHydrated) {
      setIsHydrated(true)
    }
  }, [storeHydrated])

  return isHydrated
}
