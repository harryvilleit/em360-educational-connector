export function toProductPath(backendPath: string, productId: string): string {
  const stripped = backendPath.replace(/^\/dashboard/, "")
  return `/dashboard/${productId}${stripped}`
}

export function isMenuActive(
  backendPath: string,
  productId: string,
  currentPathname: string
): boolean {
  const fullPath = toProductPath(backendPath, productId)
  return (
    currentPathname === fullPath || currentPathname.startsWith(fullPath + "/")
  )
}
