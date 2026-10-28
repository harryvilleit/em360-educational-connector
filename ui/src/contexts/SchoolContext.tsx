import { createContext, useContext } from "react"
import { useParams } from "react-router"
import { useProductStore } from "@/store/product.store"
import { isUUID } from "@/utils/slug"

export const SchoolIdContext = createContext<string>("")
export const SchoolTimeZoneContext = createContext<string>("UTC")
export const SchoolCurrencyContext = createContext<string>("NGN")
/**
 * False when the school has not chosen its base currency (Settings › Billing).
 * SchoolCurrencyContext then holds only a formatting fallback, which screens
 * must not present as the school's currency.
 */
export const SchoolCurrencyConfiguredContext = createContext<boolean>(true)

export function useSchoolCurrency(): string {
  return useContext(SchoolCurrencyContext)
}

export function useSchoolCurrencyConfigured(): boolean {
  return useContext(SchoolCurrencyConfiguredContext)
}

export function useSchoolTimeZone(): string {
  return useContext(SchoolTimeZoneContext)
}

export function useSchoolId(): string {
  const ctx = useContext(SchoolIdContext)
  const { productId } = useParams<{ productId?: string }>()
  const slugToSchoolId = useProductStore((s) => s.slugToSchoolId)

  if (isUUID(ctx)) return ctx

  const resolved = slugToSchoolId[productId ?? ""]
  if (resolved && isUUID(resolved)) return resolved

  return ctx
}
