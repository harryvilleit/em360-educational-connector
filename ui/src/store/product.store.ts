import { create } from "zustand"
import { persist } from "zustand/middleware"

interface ProductState {
  selectedProductIds: string[]
  productApiIds: Record<string, string>
  schoolNames: Record<string, string>
  /** Maps a URL slug ("greenfield-academy") to the real UUID school ID */
  slugToSchoolId: Record<string, string>
  generalProductId: string
  _hasHydrated: boolean

  setSelectedProductId: (id: string) => void
  clearSelectedProduct: (id: string) => void
  setProductApiId: (slug: string, apiId: string) => void
  setSchoolName: (schoolId: string, name: string) => void
  setSlugMapping: (slug: string, schoolId: string) => void
  setGeneralProductId: (id: string) => void
  setHasHydrated: (state: boolean) => void
}

export const useProductStore = create<ProductState>()(
  persist(
    (set) => ({
      selectedProductIds: [],
      productApiIds: {},
      schoolNames: {},
      slugToSchoolId: {},
      generalProductId: "",
      _hasHydrated: false,

      setSelectedProductId: (id) =>
        // Product setup is a single-product flow. Replacing the active
        // selection prevents a previously visited product (for example LMS)
        // from remaining at index 0 and driving School Management API calls.
        set({ selectedProductIds: [id] }),

      clearSelectedProduct: (id) =>
        set((state) => ({
          selectedProductIds: state.selectedProductIds.filter((p) => p !== id),
        })),

      setProductApiId: (slug, apiId) =>
        set((state) => ({
          productApiIds: { ...state.productApiIds, [slug]: apiId },
        })),

      setSchoolName: (schoolId, name) =>
        set((state) => ({
          schoolNames: { ...state.schoolNames, [schoolId]: name },
        })),

      setSlugMapping: (slug, schoolId) =>
        set((state) => ({
          slugToSchoolId: { ...state.slugToSchoolId, [slug]: schoolId },
        })),

      setGeneralProductId: (id) => set({ generalProductId: id }),

      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: "em360-product-store",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)
