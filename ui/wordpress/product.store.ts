import { create } from "zustand"
type State = ReturnType<
  typeof import("@/store/product.store").useProductStore.getState
>
export const useProductStore = create<State>((set) => ({
  selectedProductIds: [],
  productApiIds: {},
  schoolNames: {},
  slugToSchoolId: {},
  generalProductId: "",
  _hasHydrated: true,
  setSelectedProductId: (id) => set({ selectedProductIds: [id] }),
  clearSelectedProduct: (id) =>
    set((s) => ({
      selectedProductIds: s.selectedProductIds.filter((x) => x !== id),
    })),
  setProductApiId: (id, value) =>
    set((s) => ({ productApiIds: { ...s.productApiIds, [id]: value } })),
  setSchoolName: (id, name) =>
    set((s) => ({ schoolNames: { ...s.schoolNames, [id]: name } })),
  setSlugMapping: (slug, id) =>
    set((s) => ({ slugToSchoolId: { ...s.slugToSchoolId, [slug]: id } })),
  setGeneralProductId: (id) => set({ generalProductId: id }),
  setHasHydrated: (value) => set({ _hasHydrated: value }),
}))
