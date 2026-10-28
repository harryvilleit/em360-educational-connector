import { Gamepad2, GraduationCap, HandCoins, Package, Video } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type { ProductCatalogueItemI } from "@/api/products.api/types"
import { HomeRoutes, SetupRoutes } from "@/routes"
import { LENDING_PRODUCT_SLUG, LendingRoutes } from "@/products/lending/routes"

import { LIFELAB_PRODUCT_SLUG, LifeLabRoutes } from "@/products/lifelab/routes"

// This code remains stable even though its database display name is now
// "Digital School". Existing URLs and persisted browser state therefore keep
// working after a marketing rename.
export const SCHOOL_MANAGEMENT_PRODUCT_SLUG = "school-management"
export const LMS_PRODUCT_SLUG = "e-learning-lms"

export type Product = {
  /** Stable database product code used as the frontend workspace key. */
  id: string
  /** Database GUID used by EM360 API commands. */
  apiId: string
  name: string
  tagline: string
  description: string
  perks: string[]
  icon: LucideIcon
  iconBg: string
  iconColorDark: string
  iconColor: string
  accentColor: string
  badgeLabel: string
  setupRoute: string
}

type ProductTheme = Pick<
  Product,
  "iconBg" | "iconColor" | "iconColorDark" | "accentColor"
>

const iconRegistry: Record<string, LucideIcon> = {
  "graduation-cap": GraduationCap,
  video: Video,
  "hand-coins": HandCoins,
  box: Package,
  "gamepad-2": Gamepad2,
}

const themeRegistry: Record<string, ProductTheme> = {
  blue: {
    iconBg: "bg-blue-50",
    iconColor: "text-blue-200",
    iconColorDark: "text-blue-600",
    accentColor: "border-blue-500",
  },
  teal: {
    iconBg: "bg-teal-50",
    iconColor: "text-teal-200",
    iconColorDark: "text-teal-600",
    accentColor: "border-teal-500",
  },
}

const setupRouteRegistry: Record<string, string> = {
  [LENDING_PRODUCT_SLUG]: LendingRoutes.start,
  [LIFELAB_PRODUCT_SLUG]: LifeLabRoutes.hub,
  [SCHOOL_MANAGEMENT_PRODUCT_SLUG]: SetupRoutes.schoolMgt,
  [LMS_PRODUCT_SLUG]: SetupRoutes.eLearningLms,
}

const defaultTheme = themeRegistry.blue


export function toProductCard(item: ProductCatalogueItemI): Product {
  const code = item.code.trim().toLowerCase()
  const theme =
    themeRegistry[item.themeKey.trim().toLowerCase()] ?? defaultTheme

  return {
    id: code,
    apiId: item.id,
    name: item.name,
    tagline: item.tagline,
    description: item.description,
    perks: Array.isArray(item.benefits) ? item.benefits : [],
    icon: iconRegistry[item.iconKey.trim().toLowerCase()] ?? Package,
    ...theme,
    badgeLabel: item.badgeLabel,
    setupRoute: setupRouteRegistry[code] ?? HomeRoutes.products,
  }
}


export function toOwnedProductFallback(
  productId: string,
  productCode: string | null | undefined,
  productName: string
): Product {
  const code =
    productCode?.trim().toLowerCase() || SCHOOL_MANAGEMENT_PRODUCT_SLUG

  return toProductCard({
    id: productId,
    code,
    name: productName || "Digital School",
    description: "",
    tagline: "",
    badgeLabel: "",
    iconKey: code === LMS_PRODUCT_SLUG ? "video" : "graduation-cap",
    themeKey: code === LMS_PRODUCT_SLUG ? "teal" : "blue",
    displayOrder: 0,
    status: "Active",
    benefits: [],
    dateCreated: "",
    dateModified: "",
  })
}
