/**
 * Collects every page of a paginated list.
 *
 * List endpoints cap their page size (the staff directory rejects more than
 * 100, the student list silently truncates to 100 and the WordPress gateway
 * rejects more than 200), so screens that need a whole-school list must page
 * through it rather than ask for one large page.
 */
export const MAX_LIST_PAGE_SIZE = 100

export async function fetchAllPages<T>(
  fetchPage: (
    pageNumber: number,
    pageSize: number
  ) => Promise<{ items: T[]; totalPages: number }>,
  { pageSize = MAX_LIST_PAGE_SIZE, maxPages = 100 } = {}
): Promise<T[]> {
  const first = await fetchPage(1, pageSize)
  const total = Math.min(Math.max(first.totalPages || 1, 1), maxPages)
  if (total === 1) return first.items
  const rest = await Promise.all(
    Array.from({ length: total - 1 }, (_, i) => fetchPage(i + 2, pageSize))
  )
  return [first.items, ...rest.map((page) => page.items)].flat()
}
